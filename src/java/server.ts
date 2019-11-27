import * as assert from 'assert';
import * as Debug from 'debug';
const debug = Debug('server');

import * as cp from 'child_process';
import { ChildProcess } from 'child_process';
import { lines } from '../utils/lines';
import { Query } from './executor';

type Resolver<T> = (value?: T | PromiseLike<T> | undefined) => void;
type Rejector = (reason?: any) => void;
type PromiseArgs<T> = { resolve: Resolver<T>, reject: Rejector };

type JarProvider = () => Promise<string[]>;

function getServerProcess(jars: string[], main: string, javaHome?: string): ChildProcess {
  const cmd = javaHome ? `${javaHome}/bin/java` : 'java';
  const args = ['-Djava.awt.headless=true', '-ea'];
  if (javaHome) {
    jars.unshift(`${javaHome}/jre/lib/rt.jar`);
    args.push(`-Xbootclasspath:${jars.join(':')}`);
  } else {
    args.push(`-classpath`, jars.join(':'));
  }
  args.push(main);
  debug(`spawning server cmd %s with args: %o`, cmd, args);
  let proc = cp.spawn(cmd, args);
  debug(`spawned server process ${proc.pid}`);
  return proc;
}

export type Response = Array<string>;

export class Server {
  resolves: PromiseArgs<Response>[];
  process: ChildProcess;
  closed: Promise<void>;

  static async create(jarProvider: JarProvider, main: string, javaHome?: string) {
    const server = new Server();
    const jars = await jarProvider();
    const proc = getServerProcess(jars, main, javaHome);
    server.resolves = [];
    server.process = proc;
    server.closed = new Promise(server.loop.bind(server));
    return server;
  }

  query(request: Partial<Query>): Promise<Response> {
    return new Promise((resolve, reject) => {
      debug(`query: %o`, request);
      const data = JSON.stringify(request);
      this.process.stdin.write(data + '\n');
      this.resolves.push({ resolve, reject });
    });
  }

  async loop(resolve: Resolver<void>) {
    for await (const line of lines(this.process.stdout)) {
      debug(`received: %s`, line);
      const last = this.resolves.pop();
      if (last === undefined)
        throw new Error(`expected pending query`);
      const { resolve } = last;
      const result = JSON.parse(line) as Response;
      debug(`result: %o`, result);
      resolve(result);
    }

    if (this.resolves.length > 0)
      throw new Error(`server terminated with pending requests`);

    resolve();
  }

  close() {
    this.process.stdin.end();
    debug(`closed server process %d`, this.process.pid);
  }

  async isReady() {
    await this.query({});
  }

}
