const debug = require('debug')('server');
const assert = require('assert');

const cp = require('child_process');
const split = require('split');

module.exports = function(jar) {
  debug(`spawning server: ${jar}`);

  let executor = cp.spawn('java', ['-Djava.awt.headless=true', '-ea', '-jar', jar]);
  debug(`spawned server process ${executor.pid}`);

  let resolves = [];
  let closed = false;

  executor.stderr.pipe(split()).on('data', (line) => {
    if (closed)
      return;
    debug(`received stderr data:`);
    debug(line);

    debug(`ignoring stderr data`);
    return;

    assert.ok(resolves.length > 0);
    let resolver = resolves.shift();
    resolver.reject(line);
  });

  executor.stdout.pipe(split()).on('data', (line) => {
    if (closed)
      return;
    debug(`received stdout data:`);
    debug(line);
    assert.ok(resolves.length > 0);
    let resolver = resolves.shift();
    resolver.resolve(JSON.parse(line));
  });

  executor.on('exit', (code, signal) => {
    debug(`server process ${executor.pid} exited with code '${code}' signal '${signal}'`);
    if (closed)
      return;
    assert.ok(resolves.length > 0);
    let resolver = resolves.shift();
    resolver.reject(`server process ${executor.pid} exited unexpectedly`);
  });

  return ({
    query(request) {
      return new Promise((resolve, reject) => {
        if (closed)
          reject();
        resolves.push({resolve: resolve, reject: reject});
        let data = JSON.stringify(request);
        debug(`sending data:`);
        debug(data);
        executor.stdin.write(data + '\n');
      });
    },
    close() {
      debug(`closing server process ${executor.pid}`);
      closed = true;
      executor.stdin.end();
    }
  });
}
