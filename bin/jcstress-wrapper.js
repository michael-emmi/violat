var path = require('path');
var cp = require('child_process');

function compile(jcstressPath) {
  cp.execSync(`mvn clean install`, {cwd: jcstressPath});
}

function countTests(jarFile) {
  return parseInt(
    cp.execSync(`tar tf ${jarFile} | grep '\$T[0-9]*.class' | wc -l`)
    .toString()
    .trim()
  );
}

function splitStream(src, dst1, dst2) {
  var PassThrough = require('stream').PassThrough;
  var fork = PassThrough();
  var fst = PassThrough();
  var snd = PassThrough();
  src.pipe(fork);
  fork.pipe(fst);
  fork.pipe(snd);
  fst.pipe(dst1);
  snd.pipe(dst2);
}

function test(jarFile, callback) {
  const proc = cp.spawn('java', ['-jar', jarFile, '-v', '-f', '1', '-iters', '1', '-jvmArgs', '-server']);
  const good = cp.spawn('grep', ['iteration #', '--line-buffered']);
  const bad = cp.spawn('grep', ['FORBIDDEN', '-B', '10', '--line-buffered']);

  var failed = {};

  splitStream(proc.stdout, good.stdin, bad.stdin);

  good.stdout.on('data', (data) => {

  });

  bad.stdout.on('data', (data) => {
    var m = data.toString().match(/\[FAILED\] ([^ ]*)/);

    if (Array.isArray(m)) {
      failed['name'] =  m[1];
      grep.kill();
      proc.kill();
    }
  });

  process.on('exit', _ => {
    callback(failed);
  });
}

module.exports = (jcstressPath) => {
  return {
    testsPath: () => path.resolve(jcstressPath, 'src/main/java'),
    compile: () => compile(jcstressPath),
    test: (fn) => test(path.resolve(jcstressPath, 'target/jcstress.jar'), fn),
  };
};

if (require.main === module)
  test('jcstress/target/jcstress.jar', failed => {
    if (failed.hasOwnProperty('name'))
      console.log(`failure: ${failed.name}`);
    else
      console.log("All tests passed.")
  });
