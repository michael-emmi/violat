
function main() {
  const cp = require('child_process');
  const proc = cp.spawn('java', ['-jar', 'jcstress/target/jcstress.jar', '-v', '-f', '1', '-iters', '1', '-jvmArgs', '-server']);
  const grep = cp.spawn('grep', ['FORBIDDEN', '-B', '10', '--line-buffered']);

  proc.stdout.pipe(grep.stdin);

  proc.stdout.on('data', (data) => {
    console.log(".");
  });

  grep.stdout.on('data', (data) => {
    var m = data.toString().match(/\[FAILED\] ([^ ]*)/);

    if (Array.isArray(m)) {
      console.log(`failed: ${m[1]}`)
      grep.kill();
      proc.kill();
    }
  });
}

main();
