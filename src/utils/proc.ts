import * as assert from 'assert';
import * as Debug from 'debug';
const debug = Debug('violat:utils:proc');

import * as cp from 'child_process';
import * as es from 'event-stream';

function transparentPromise() {
  let resolve;
  let reject;
  let promise = new Promise((rs, rj) => {
    resolve = rs;
    reject = rj;
  });
  return { promise, resolve, reject };
}

export async function * getOutputLines(command, args, options) {
  debug(`spawning process %s %s with options %o`, command, args.join(' '), options);

  let proc = cp.spawn(command, args, options);
  let lines = proc.stdout.pipe(es.split());
  let promises = [transparentPromise()];

  proc.on('error', err => {
    debug(`got proc error event: %s`, err);

    let { reject } = promises[promises.length-1];
    reject(err.toString());
  });

  proc.on('exit', rc => {
    debug(`got proc exit event: %s`, rc);

    let info = proc.stderr.read();
    debug(`stderr: %s`, info);

    let { resolve, reject } = promises[promises.length-1];

    if (rc === 0)
      resolve(undefined);
    else
      reject(`${command} returned ${rc} with ${info}`);

  });

  lines.on('data', line => {
    debug(`got stdout data event: %s`, line);

    let { resolve } = promises[promises.length-1];
    resolve(line);
    promises.push(transparentPromise());
  });

  lines.on('end', () => {
    debug('got stdout end event');

    // XXX this may fire before proc exit;
    // XXX returning now will mask exit failures.
    // promises[promises.length-1].resolve(undefined);
  });

  while (true) {
    let { promise } = promises[0];
    let line = await promise;
    if (line === undefined)
      break;

    debug(`emitting line: %s`, line);
    yield line;
    promises.shift();
  }
}
