import * as assert from 'assert';
import * as Debug from 'debug';
const debug = Debug('server');

import * as cp from 'child_process';

const split = require('split');

export class Server {
  resolves: {resolve: any, reject: any}[];
  closed: boolean;
  ready: Promise<boolean>;
  proc: cp.ChildProcess;

  constructor(jarProvider, main: string) {
    this.resolves = [];
    this.closed = false;
    this.ready = new Promise(async (resolve, reject) => {
      let jars = await jarProvider();
      this.proc = this._spawn(jars, main);
      await this.query({});
      resolve(true);
    });
  }

  async isReady() {
    return await this.ready;
  }

  query(request) {
    return new Promise((resolve, reject) => {
      this._send(request, {resolve: resolve, reject: reject});
    });
  }

  close() {
    this._close();
  }

  _spawn(jars: string[], main: string) {
    const classpath = jars.join(":");
    const args = ['-Djava.awt.headless=true', '-ea', '-cp', classpath, main];
    debug(`spawning server with args: %o`, args);
    let proc = cp.spawn('java', args);
    proc.stdout.pipe(split()).on('data', this._recv.bind(this));
    proc.stderr.pipe(split()).on('data', this._err.bind(this));
    proc.on('exit', this._exit.bind(this));
    debug(`spawned server process ${proc.pid}`);
    return proc;
  }

  _send(request, resolver) {
    if (this.closed) {
      resolver.reject();
      return;
    }
    let data = JSON.stringify(request);
    this.resolves.push(resolver);
    debug(`sending data: %s`, data);
    this.proc.stdin.write(data + '\n');
  }

  _close() {
    debug(`closing server process ${this.proc.pid}`);
    this.closed = true;
    this.proc.stdin.end();
  }

  _recv(line) {
    if (this.closed)
      return;

    debug(`received stdout data: %s`, line);
    let resolver = this.resolves.shift();
    if (resolver)
      resolver.resolve(JSON.parse(line));
    else
      assert.fail("Expected resolver");
  }

  _err(line) {
    if (this.closed)
      return;

    debug(`received stderr data: %s`, line);
    debug(`ignoring stderr data`);
    return;

    // assert.ok(this.resolves.length > 0);
    // let resolver = resolves.shift();
    // resolver.reject(line);
  }

  _exit(code, signal) {
    debug(`server process ${this.proc.pid} exited with code '${code}' signal '${signal}'`);
    if (this.closed)
      return;

    let resolver = this.resolves.shift();
    if (resolver)
      resolver.reject(`server process ${this.proc.pid} exited unexpectedly`);
    else
      assert.fail("Expected resolver");
  }

}

// class CachingServer extends Server {
//   ...
// }
