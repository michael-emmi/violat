var path = require('path');
var cp = require('child_process');
var fs = require('fs');
var mkdirp = require('mkdirp');
var es = require('event-stream');
var ncp = require('ncp');

var config = require("./config.js");
const debug = require('debug')('testing');

function testsPath(jcstressPath) {
  return path.resolve(jcstressPath, 'src/main/java');
}

function jarFile(jcstressPath) {
  return path.resolve(jcstressPath, 'target/jcstress.jar');
}

function needsCompile(jcstressPath) {
  if (!fs.existsSync(jarFile(jcstressPath))) {
    debug(`compilation required: jar does not exist`);
    return true;
  }

  let t0 = cp.execSync(`find ${testsPath(jcstressPath)} -name "*.java"`)
    .toString().split('\n').filter(f => f)
    .map(f => fs.statSync(f).mtime)
    .reduce((x,y) => x > y ? x : y);
  let t = fs.statSync(jarFile(jcstressPath)).mtime;

  if (t0 > t) {
    debug(`compilation required: jar is out of date`);
    debug(`jar compiled at: ${t}`);
    debug(`src modified at: ${t0}`);
    return true;

  } else {
    debug(`copmilation not required`);
    return false;
  }
}

function compile(jcstressPath) {
  return new Promise((resolve, reject) => {
    cp.exec(`mvn clean install`, {cwd: jcstressPath}, (rc, stdout, _) => {
      if (rc)
        reject(stdout.split('\n')
          .filter(l => l.match(/ERROR/))
          .slice(0,5)
          .join('\n'));
      else
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

function copyTemplate(dstPath) {
  return new Promise((resolve, reject) => {
    let templateDir = path.join(config.resourcesPath, 'jcstress');
    ncp(templateDir, dstPath, err => err ? reject(err) : resolve());
  });
}

module.exports = function(harnesses, onTick, maxViolations = 1) {
  return new Promise(async (resolve, reject) => {

    debug(`initiating testing; maxViolations: ${maxViolations}`);

    let workPath = path.join(config.outputPath, 'tests');

    await copyTemplate(workPath);

    cp.execSync(`find ${workPath} -name "*Test*.java" | xargs rm`);

    for (let harness of harnesses) {
      let pkg = harness.match(/^package (.*);/m)[1];
      let cls = harness.match(/^public class (\S+)\b/m)[1];
      let dstFile = path.join(testsPath(workPath), ...pkg.split('.'), `${cls}.java`);
      mkdirp.sync(path.dirname(dstFile));
      fs.writeFileSync(dstFile, harness);
    }

    if (needsCompile(workPath))
      try {
        debug(`compiling test harnesses`);
        await compile(workPath);
        debug(`test harnesses compiled`);
      } catch (e) {
        reject(e);
      }

    let tester = runJar(workPath);
    let lines = tester.stdout.pipe(es.split());

    let get = p => b => (b.toString().match(p) || []).slice(1).map(s => s.trim());
    let getComplete = get(/RUN (COMPLETE)\./);
    let getFailed = get(/\[FAILED\][ ]*([^ ]*)[ ]*$/);
    let getForbidden = get(/^\s+(.*)\s+([0-9,]+)\s+FORBIDDEN\b/);
    let getAcceptable = get(/^\s+(.*)\s+([0-9,]+)\s+ACCEPTABLE\b/);

    let lastFailedName;
    let forbiddenResults = [];
    let counts = 0;
    let done = false;
    let failedTests = [];

    tester.on('error', err => { reject(`jcstress error: ${err}`); });
    tester.on('exit', rc => { if (rc) reject(`jcstress returned ${rc}`); });

    lines.on('data', async data => {
      if (done)
        return;

      let [complete] = getComplete(data);
      let [failedName] = getFailed(data);
      let [forbiddenResult, forbiddenCount] = getForbidden(data);
      let [_, acceptableCount] = getAcceptable(data);
      let ending = !data.toString().trim();

      if (complete) {
        tester.kill();
        done = true;

      } if (failedName) {
        debug(`encountered a failing test`);
        if (lastFailedName) {
          tester.kill();
          reject(`Missing result for failed test ${lastFailedName}.`);
        } else {
          lastFailedName = failedName;
        }

      } else if (forbiddenResult) {
        debug(`encountered a failing test result`);
        if (!lastFailedName) {
          tester.kill();
          reject(`Missing name for failed test result ${forbiddenResult}.`);
        } else {
          forbiddenCount = parseInt(forbiddenCount.replace(/,/g,''))
          forbiddenResults.push({
            outcome: forbiddenResult,
            count: forbiddenCount
          });
          counts += forbiddenCount;
        }

      } else if (acceptableCount && lastFailedName) {
        counts += parseInt(acceptableCount.replace(/,/g,''));

      } else if (ending && lastFailedName) {
        debug(`returning failed test results`);
        if (forbiddenResults.length < 1)
          reject(`Missing result for failed test ${lastFailedName}.`);

        failedTests.push({
          failedHarness: lastFailedName,
          harnessCode: await getHarness(workPath, lastFailedName),
          forbiddenResults: forbiddenResults,
          numExecutions: counts
        });

        counts = 0;
        forbiddenResults = [];
        lastFailedName = undefined;

        if (maxViolations && failedTests.length >= maxViolations) {
          tester.kill();
          done = true;
        }

      } else if (data.match(/iteration #/) && onTick) {
        debug(`test passed`);
        onTick({
          status: 'ok'
        });
      }
    });
    lines.on('end', () => {
      resolve(failedTests);
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
