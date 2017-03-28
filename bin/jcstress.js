var path = require('path');
var cp = require('child_process');
var fs = require('fs');
var es = require('event-stream');

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
  cp.execSync(`mvn clean install`, {cwd: jcstressPath});
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
    '-jar', jarFile(jcstressPath),
    '-v',
    '-f', '1',
    '-iters', '1',
    '-jvmArgs', '-server',
    ... extras
  ]);
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

function test(jcstressPath, onTick) {
  return new Promise((resolve, reject) => {

    if (needsCompile(jcstressPath))
      compile(jcstressPath);

    let tester = runJar(jcstressPath);
    let lines = tester.stdout.pipe(es.split());

    let get = p => b => b.toString().match(p) || [];
    let getName = b => get(/\[FAILED\][ ]*([^ ]*)[ ]*$/)(b)[1];
    let getResult = b => (get(/^\s+(.*)\s+([0-9,]+)\s+FORBIDDEN\b/)(b)[1] || '').trim();

    let lastFailedName;

    lines.on('data', async data => {
      let name = getName(data);
      let result = getResult(data);

      if (name) {
        if (lastFailedName) {
          tester.kill();
          reject(`Missing result for failed test ${lastFailedName}.`);
        } else {
          lastFailedName = name;
        }

      } else if (result) {
        tester.kill();
        if (!lastFailedName)
          reject(`Missing name for failed test result ${result}.`);
        else
          resolve({
            status: 'fail',
            name: lastFailedName,
            harness: await getHarness(jcstressPath, lastFailedName),
            values: result
          });

      } else if (data.match(/iteration #/))
        onTick();
    });
    lines.on('end', () => {
      resolve({ status: 'success' });
    });
  });
}

module.exports = jcstressPath => {
  return {
    testsPath: () => testsPath(jcstressPath),
    count: () => count(jcstressPath),
    test: onTick => test(jcstressPath, onTick)
  };
};

if (require.main === module) {
  (async () => {
    try {
      let jcstress = module.exports('jcstress');
      let total;
      let n = 0;
      let results = await jcstress.test(() => {
        process.stdout.write(`${++n} of ${total || (total = jcstress.count())}\r`);
      });
      if (results.status == 'fail') {
        console.log(`Test ${results.name} failed.`);
        console.log(`Found values [${results.values}] for harness:`)
        console.log(results.harness);

      } else
        console.log(`All tests passed.`);
    } catch (e) {
      console.log(`caught: ${e}`)
    }
  })();
}
