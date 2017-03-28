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
    lines.on('data', data => {
      let m = data.toString().match(/\[FAILED\][ ]*([^ ]*)[ ]*$/);
      if (Array.isArray(m)) {
        tester.kill();
        resolve(m[1]);

      } else if (data.match(/iteration #/)) {
        onTick();
      }
    });
    lines.on('end', () => {
      resolve();
    });
  });
}

module.exports = (jcstressPath) => {
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
    var jarFile = 'jcstress/target/jcstress.jar';
    var total = count(jarFile);
    var n = 0;

    console.log(`Running ${total} tests.`)

    var result = await test(jarFile,
     () => process.stdout.write(`${++n} of ${total}\r`));

    if (result == null)
      console.log(`All tests passed.`);
    else
      console.log(`Test ${result} failed.`)
  })();
}
