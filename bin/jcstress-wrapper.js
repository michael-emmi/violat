var path = require('path');
var cp = require('child_process');

const EventEmitter = require('events');

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

function test(jarFile) {
  const proc = cp.spawn('java', ['-jar', jarFile, '-v', '-f', '1', '-iters', '1', '-jvmArgs', '-server']);
  const good = cp.spawn('grep', ['iteration #', '--line-buffered']);
  const bad = cp.spawn('grep', ['FORBIDDEN', '-B', '10', '--line-buffered']);

  var events = new EventEmitter();

  splitStream(proc.stdout, good.stdin, bad.stdin);

  good.stdout.on('data', (data) => {
    events.emit('passed');
  });

  bad.stdout.on('data', (data) => {
    var m = data.toString().match(/\[FAILED\] ([^ ]*)/);

    if (Array.isArray(m)) {
      events.emit('failed', m[1]);
      grep.kill();
      proc.kill();
    }
  });

  process.on('exit', _ => {
    events.emit('finish');
  });

  return events;
}

module.exports = (jcstressPath) => {
  return {
    testsPath: () => path.resolve(jcstressPath, 'src/main/java'),
    compile: () => compile(jcstressPath),
    count: () => count(path.resolve(jcstressPath, 'target/jcstress.jar')),
    test: () => test(path.resolve(jcstressPath, 'target/jcstress.jar')),
  };
};

if (require.main === module) {
  events = test('jcstress/target/jcstress.jar');
  var total = count('jcstress/target/jcstress.jar');
  var count = 0;
  events.on('passed', () => process.stdout.write(`${++count} of ${total}\r`));
  events.on('finish', () => console.log("Testing complete."));
  events.on('failed', t => console.log(`test ${t} failed.`));
}
