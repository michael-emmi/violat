var path = require('path');
var cp = require('child_process');

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

function test(jarFile, onTick) {
  const proc = cp.spawn('java', ['-jar', jarFile, '-v', '-f', '1', '-iters', '1', '-jvmArgs', '-server']);
  const good = cp.spawn('grep', ['iteration #', '--line-buffered']);
  const bad = cp.spawn('grep', ['FORBIDDEN', '-B', '10', '--line-buffered']);
  splitStream(proc.stdout, good.stdin, bad.stdin);

  return new Promise((resolve, reject) => {
    good.stdout.on('data', _ => { onTick(); });
    bad.stdout.on('data', data => {
      var m = data.toString().match(/\[FAILED\] ([^ ]*)/);
      if (Array.isArray(m)) {
        resolve(m[1]);
        [proc, good, bad].map(p => p.kill());
      }
    });
    process.on('exit', _ => resolve(null));
  });
}

module.exports = (jcstressPath) => {
  return {
    testsPath: () => path.resolve(jcstressPath, 'src/main/java'),
    compile: () => compile(jcstressPath),
    count: () => count(path.resolve(jcstressPath, 'target/jcstress.jar')),
    test: onTick => test(path.resolve(jcstressPath, 'target/jcstress.jar'), onTick),
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
