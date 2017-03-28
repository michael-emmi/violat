var path = require('path');
var cp = require('child_process');
var fs = require('fs');
var es = require('event-stream');

function compile(jcstressPath) {
  cp.execSync(`mvn clean install`, {cwd: jcstressPath});
}

function count(jarFile) {
  return parseInt(
    cp.execSync(`tar tf ${jarFile} | grep '\$T[0-9]*.class' | wc -l`)
    .toString()
    .trim()
  );
}

function runJar(jarFile, ...extras) {
  return cp.spawn('java', [
    '-jar', jarFile,
    '-v',
    '-f', '1',
    '-iters', '1',
    '-jvmArgs', '-server',
    ... extras
  ]);
}

function getResult(jarFile, name) {
  return new Promise((resolve, reject) => {
    let lines = runJar(jarFile, '-t', name).stdout.pipe(es.split());

    lines.on('data', data => {
      if (data.match(/FORBIDDEN/))
        resolve(data.toString().replace(/([^0-9]*).*/, '$1').trim());
    });
    lines.on('end', () => {
      reject('unable to reproduce failure');
    });
  });
}

function getHarness(testsPath, name) {
  return new Promise((resolve, reject) => {
    let harnessFile = path.resolve(
      testsPath,
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

function test(jarFile, onTick) {
  return new Promise((resolve, reject) => {
    let tester = runJar(jarFile);
    let lines = tester.stdout.pipe(es.split());

    let get = p => b => b.toString().match(p) || [];
    let getName = b => get(/\[FAILED\][ ]*([^ ]*)[ ]*$/)(b)[1];
    let getResult = b => (get(/^\s+(.*)\s+([0-9,]+)\s+FORBIDDEN\b/)(b)[1] || '').trim();

    let lastFailedName;

    lines.on('data', data => {
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
          resolve({ status: 'failure', name: lastFailedName,  values: result });

      } else if (data.match(/iteration #/))
        onTick();
    });
    lines.on('end', () => {
      resolve({ status: 'success' });
    });
  });
}

module.exports = jcstressPath => {
  let testsPath = path.resolve(jcstressPath, 'src/main/java');
  let jarPath = path.resolve(jcstressPath, 'target/jcstress.jar');
  return {
    testsPath: () => testsPath,
    compile: () => compile(jcstressPath),
    count: () => count(jarPath),
    test: onTick => test(jarPath, onTick),
    getResult: name => getResult(jarPath, name),
    getHarness: name => getHarness(testsPath, name)
  };
};

if (require.main === module) {
  (async () => {
    try {
      let jcstress = module.exports('jcstress');
      let total = jcstress.count();
      let n = 0;
      console.log(`Running ${total} tests.`);
      let results = await jcstress.test(() => {
        process.stdout.write(`${++n} of ${total}\r`);
      });
      if (results.status == 'failure') {
        console.log(`Test ${results.name} failed.`);
        console.log(`Found values [${results.values}] for harness:`)
        console.log(await jcstress.getHarness(results.name));

      } else
        console.log(`All tests passed.`);
    } catch (e) {
      console.log(`caught: ${e}`)
    }
  })();
}
