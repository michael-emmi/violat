var path = require('path');
var cp = require('child_process');
var fs = require('fs');
var mkdirp = require('mkdirp');
var es = require('event-stream');
var ncp = require('ncp');

var config = require("./config.js");

function testsPath(jcstressPath) {
  return path.resolve(jcstressPath, 'src/main/java');
}

function jarFile(jcstressPath) {
  return path.resolve(jcstressPath, 'target/jcstress.jar');
}

function needsCompile(jcstressPath) {
  if (!fs.existsSync(jarFile(jcstressPath)))
    return true;

  let t0 = cp.execSync(`find ${testsPath(jcstressPath)} -name "*.java"`)
    .toString().split('\n').filter(f => f)
    .map(f => fs.statSync(f).mtime)
    .reduce((x,y) => x > y ? x : y);
  let t = fs.statSync(jarFile(jcstressPath)).mtime;
  return t0 > t;
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
  return cp.spawn('java', [
    '-Djava.awt.headless=true',
    '-jar', jarFile(jcstressPath),
    '-v',
    '-f', '1',
    '-iters', '1',
    '-jvmArgs', '-server',
    ... extras
  ], {cwd: jcstressPath});
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

function test(harnesses, onTick) {
  return new Promise(async (resolve, reject) => {

    let workPath = path.join(config.outputPath, 'tests');

    await copyTemplate(workPath);

    cp.execSync(`find ${workPath} -name "*Test*.java" | xargs rm`);

    for (let harness of harnesses) {
      let dstFile = path.join(testsPath(workPath), harness.relativePath);
      mkdirp.sync(path.dirname(dstFile));
      fs.linkSync(harness.absolutePath, dstFile);
    }

    if (needsCompile(workPath))
      try {
        await compile(workPath);
      } catch (e) {
        reject(e);
      }

    let tester = runJar(workPath);
    let lines = tester.stdout.pipe(es.split());

    let get = p => b => (b.toString().match(p) || []).slice(1).map(s => s.trim());
    let getFailed = get(/\[FAILED\][ ]*([^ ]*)[ ]*$/);
    let getForbidden = get(/^\s+(.*)\s+([0-9,]+)\s+FORBIDDEN\b/);
    let getAcceptable = get(/^\s+(.*)\s+([0-9,]+)\s+ACCEPTABLE\b/);

    let lastFailedName;
    let forbiddenResults = [];
    let counts = 0;

    tester.on('error', err => { reject(`jcstress error: ${err}`); });
    tester.on('exit', rc => { if (rc) reject(`jcstress returned ${rc}`); });

    lines.on('data', async data => {
      let [failedName] = getFailed(data);
      let [forbiddenResult, forbiddenCount] = getForbidden(data);
      let [_, acceptableCount] = getAcceptable(data);
      let ending = !data.toString().trim();

      if (failedName) {
        if (lastFailedName) {
          tester.kill();
          reject(`Missing result for failed test ${lastFailedName}.`);
        } else {
          lastFailedName = failedName;
        }

      } else if (forbiddenResult) {
        if (!lastFailedName) {
          tester.kill();
          reject(`Missing name for failed test result ${forbiddenResult}.`);
        } else {
          forbiddenResults.push({
            outcome: forbiddenResult,
            count: forbiddenCount
          });
          counts += parseInt(forbiddenCount.replace(/,/g,''));
        }

      } else if (acceptableCount && lastFailedName) {
        counts += parseInt(acceptableCount.replace(/,/g,''));

      } else if (ending && lastFailedName) {
        tester.kill();
        if (forbiddenResults.length < 1)
          reject(`Missing result for failed test ${lastFailedName}.`);
        else
          resolve({
            failedHarness: lastFailedName,
            harnessCode: await getHarness(workPath, lastFailedName),
            forbiddenResults: forbiddenResults,
            numExecutions: counts
          });

      } else if (data.match(/iteration #/) && onTick)
        onTick({
          status: 'ok'
        });
    });
    lines.on('end', () => {
      resolve({});
    });
  });
}

exports.test = test;

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
