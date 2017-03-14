
function main() {
  const cp = require('child_process');
  const proc = cp.spawn('java', ['-jar', 'jcstress/target/jcstress.jar', '-v', '-f', '1', '-iters', '1', '-jvmArgs', '-server']);
  const grep = cp.spawn('grep', ['FORBIDDEN', '-B', '10', '--line-buffered']);

  var failed = false;

  proc.stdout.pipe(grep.stdin);

  proc.stdout.on('data', (data) => {
    console.log(".");
  });

  grep.stdout.on('data', (data) => {
    failed = true;
    var m = data.toString().match(/\[FAILED\] ([^ ]*)/);

    if (Array.isArray(m)) {
      console.log(`test failed: ${m[1]}`)
      grep.kill();
      proc.kill();
    }
  });

  process.on('exit', _ => {
    if (!failed)
      console.log("All tests passed.")
  });
}

main();
