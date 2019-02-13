import * as assert from 'assert';
import * as Debug from 'debug';
const debug = Debug('build');

import * as fs from 'fs-extra';
import * as path from 'path';
import * as cp from 'child_process';

import { lines } from '../utils/lines';
import { findFiles } from '../utils/find';
import { targetsOutdated } from '../utils/deps';

type Parameters = {
  sourcePath: string;
  workPath: string;
  name: string;
  javaHome?: string;
};

export async function maven(jcstressPath: string) {
  const cmd = 'mvn clean install';
  const [ exe, ...args ] = cmd.split(' ');
  const cwd = jcstressPath;

  debug(`running command: %s`, cmd);
  const proc = cp.spawn(exe, args, { cwd });

  for await (const line of lines(proc.stdout)) {
    debug(`maven: %s`, line);
  }
}

export async function gradle(parameters: Parameters): Promise<string> {
  const { sourcePath, workPath, name, javaHome } = parameters;
  debug(`build ${name}.jar in ${workPath} from ${sourcePath}`);
  debug(`checking whether ${name} needs compiling`);

  let sources = await findFiles(sourcePath, `-name "*.java"`);
  let jarFile = path.resolve(workPath, `build/libs/${name}.jar`);
  let outdated = await targetsOutdated([jarFile], sources);

  if (!outdated) {
    debug(`${name} has already been compiled`);
    return jarFile;
  }
  debug(`recompiling ${name}`);
  await fs.copy(sourcePath, workPath);
  const args: string[] = [];
  const cwd = workPath;
  if (javaHome !== undefined)
    args.push(`-Dorg.gradle.java.home=${javaHome}`);
  const proc = cp.spawn(`gradle`, args, { cwd });
  for await (const line of lines(proc.stdout))
    debug(`gradle: %s`, line);

  return jarFile;
}
