const debug = require('debug')('server');
const assert = require('assert');

const cp = require('child_process');
const split = require('split');

class Server {
  constructor(jarFile, useCache) {
    this.useCache = useCache;
    this.resolves = [];
    this.closed = false;
    this.proc = this._spawn(jarFile);
  }

  query(request) {
    return new Promise((resolve, reject) => {
      this._send(request, {resolve: resolve, reject: reject});
    });
  }

  close() {
    this._close();
  }

  _spawn(jar) {
    debug(`spawning server: ${jar}`);
    let proc = cp.spawn('java', ['-Djava.awt.headless=true', '-ea', '-jar', jar]);
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
    assert.ok(this.resolves.length > 0);
    let resolver = this.resolves.shift();
    resolver.resolve(JSON.parse(line));
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

    assert.ok(this.resolves.length > 0);
    let resolver = this.resolves.shift();
    resolver.reject(`server process ${proc.pid} exited unexpectedly`);
  }

}

module.exports = Server;
