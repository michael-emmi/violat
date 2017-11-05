var path = require('path');
var cp = require('child_process');
var fs = require('fs');
var mkdirp = require('mkdirp');
var es = require('event-stream');
var ncp = require('ncp');

var config = require("./config.js");
const utils = require("./utils.js");
const debug = require('debug')('testing');
const translate = require('./translation.js');
const Outcome = require('./outcome.js');

function testsPath(jcstressPath) {
  return path.resolve(jcstressPath, 'src/main/java');
}

function jarFile(jcstressPath) {
  return path.resolve(jcstressPath, 'target/jcstress.jar');
}

function needsCompile(jcstressPath) {
  let jar = jarFile(jcstressPath);
  let sources = utils.findFiles(testsPath(jcstressPath), `-name "*.java"`);
  return utils.targetsOutdated([jar], sources);
}

function compile(jcstressPath) {
  return new Promise((resolve, reject) => {
    cp.exec(`mvn clean install`, {cwd: jcstressPath}, (rc, stdout, stderr) => {
      if (rc) {
        let message = stdout.split('\n')
          .filter(l => l.match(/ERROR/))
          .slice(0,5)
          .join('\n');
        reject(message || stderr);
      } else
        resolve();
    });
  });
}

function count(jcstressPath) {
  return parseInt(
    cp.execSync(`tar tf ${jarFile(jcstressPath)} | grep '\$T[0-9]*.class' | wc -l`)
    .toString()
    .trim()
  );
}

function runJar(jcstressPath, ...extras) {
  const ARGS = [
    '-Djava.awt.headless=true',
    '-jar', jarFile(jcstressPath),
    '-v',
    '-f', '1',
    '-iters', '1',
    '-jvmArgs', '-server',
    ... extras
  ];
  debug(`running tests: java ${ARGS.join(' ')}`);
  return cp.spawn('java', ARGS, {cwd: jcstressPath});
}

function getResult(jcstressPath, name) {
  return new Promise((resolve, reject) => {
    let lines = runJar(jarFile(jcstressPath), '-t', name).stdout.pipe(es.split());

    lines.on('data', data => {
      if (data.match(/FORBIDDEN/))
        resolve(data.toString().replace(/([^0-9]*).*/, '$1').trim());
    });
    lines.on('end', () => {
      reject('unable to reproduce failure');
    });
  });
}

function getHarness(jcstressPath, name) {
  return new Promise((resolve, reject) => {
    let harnessFile = path.resolve(
      testsPath(jcstressPath),
      name.replace(/[.]T[0-9]*$/, '').replace(/[.]/g, '/') + '.java'
    );
    fs.readFile(harnessFile, (err, data) => {
      if (err)
        reject(err);
      else
        resolve(data.toString());
    });
  });
}

function matchResult(result, predictedResults, schema) {
  let observedResults = result.split(', ');
  for (let seq of schema.sequences) {
    for (let inv of seq.invocations) {
      let idx = inv.index;
      let pos = inv.resultPosition;
      if (pos != null && observedResults[pos] !== predictedResults[idx]) {
        return false;
      }
    }
  }
  return true;
}

function createOutcome(result, schema) {
  let map = {};
  let observedResults = result.split(', ');
  for (let seq of schema.sequences) {
    for (let inv of seq.invocations) {
      let idx = inv.index;
      let pos = inv.resultPosition;
      map[idx] = (pos != null) ? observedResults[pos] : 'null';
    }
  }
  return new Outcome({results: map, consistency: undefined});
}

function getOutcome(result, schema) {
  for (let outcome of schema.outcomes)
    if (matchResult(result, outcome.results, schema))
      return outcome;

  return createOutcome(result, schema);
}

function copyTemplate(dstPath) {
  return new Promise((resolve, reject) => {
    let templateDir = path.join(config.resourcesPath, 'jcstress');
    ncp(templateDir, dstPath, err => err ? reject(err) : resolve());
  });
}

module.exports = function(schemas, testName, onTick, maxViolations = 1) {
  return new Promise(async (resolve, reject) => {

    debug(`initiating testing; maxViolations: ${maxViolations}`);

    let workPath = path.join(config.outputPath, 'tests');

    await copyTemplate(workPath);

    cp.execSync(`find ${workPath} -name "*Test*.java" | xargs rm`);

    let harnesses = await translate(schemas, testName);
    debug(`got ${harnesses.length} translated schemas`);

    for (let harness of harnesses) {
      let pkg = harness.match(/^package (.*);/m)[1];
      let cls = harness.match(/^public class (\S+)\b/m)[1];
      let dstFile = path.join(testsPath(workPath), ...pkg.split('.'), `${cls}.java`);
      mkdirp.sync(path.dirname(dstFile));
      fs.writeFileSync(dstFile, harness);
    }

    if (needsCompile(workPath)) {
      try {
        debug(`compiling test harnesses`);
        await compile(workPath);
        debug(`test harnesses compiled`);
      } catch (e) {
        reject(`test-harness compilation failed: ${e}`);
        return;
      }
    }

    let tester = runJar(workPath);
    let lines = tester.stdout.pipe(es.split());

    let get = p => b => (b.toString().match(p) || []).slice(1).map(s => s.trim());
    let done = false;

    let results = [];

    tester.on('error', err => { reject(`jcstress error: ${err}`); });
    tester.on('exit', rc => { if (rc) reject(`jcstress returned ${rc}`); });

    lines.on('data', async data => {
      if (done)
        return;

      let [status, name, idxS] = get(/\[(OK|FAILED)\]\s+([A-Za-z_$.]+([0-9]+))\s*$/)(data);
      let idx = parseInt(idxS);
      if (status) {
        results.push({
          name: name,
          schema: schemas.find(s => s.id === idx),
          status: status == 'OK',
          outcomes: [],
          harness: undefined
        });
        return;
      }

      let [result, countS, expectation, description] =
        get(/^\s+(.*)\s+([0-9,]+)\s+([A-Z_]+)\s+(.*)\s*$/)(data);
      if (result) {
        let count = parseInt(countS.replace(/,/g,''))
        let last = results.pop();
        results.push(last);
        last.outcomes.push(getOutcome(result, last.schema).observe(count));
        return;
      }

      if (!data.toString().trim() && results.length > 0) {
        let last = results.pop();
        results.push(last);
        last.total = last.outcomes.map(o => o.count).reduce((a,b) => a+b, 0);
        last.harness = await getHarness(workPath, last.name);
        debug(`test result:`);
        debug(last);
        onTick && onTick(last);
        if (maxViolations && !last.status &&
            results.filter(r => !r.status).length >= maxViolations) {
          tester.kill();
          done = true;
        }
        return;
      }

      let [complete] = get(/RUN (COMPLETE)\./)(data);
      if (complete) {
        tester.kill();
        done = true;
        return;
      }
    });
    lines.on('end', () => {
      debug(`returning ${results.length} results`);
      resolve(results);
    });
  });
}

if (require.main === module) {
  (async () => {
    try {
      let total;
      let n = 0;
      let results = await test(JSON.parse(process.argv[2]), () => {
        // process.stdout.write(`${++n} of ${total || (total = count())}\r`);
      });
      console.log(JSON.stringify(results, null, 2));
    } catch (e) {
      console.log(`caught: ${e}`)
    }
  })();
}
