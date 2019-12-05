import * as assert from 'assert';
import * as Debug from 'debug';
const debug = Debug('jpf:executor');

import * as tmp from 'tmp-promise';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as cp from 'child_process';
import { Readable } from 'stream';

export type Source = {
  name: string,
  code: string
};

export interface Output {
  stdout: Readable;
  stderr: Readable;
  returnCode: Promise<number>;
}

export async function runJpf({ name, code }: Source,
    jars: string[] = [],
    javaHome: string | undefined): Promise<Output> {

  const { path: cwd } = await tmp.dir();

  const sourceFile = path.join(cwd, `${name}.java`);
  const propertiesFile = path.join(cwd, `${name}.jpf`);

  debug(`writing source file: ${sourceFile}`);
  await fs.writeFile(sourceFile, code);

  debug(`writing properties file: ${propertiesFile}`);
  await fs.writeFile(propertiesFile, getProperties(name, jars));

  try {
    debug(`compiling test harness`);
    debug(`javaHome: %o`, javaHome);
    debug(`jars: %o`, jars);
    const command = getCompiler(javaHome);
    const classpath = [".", jars.map((jar) => path.resolve(jar))].join(":");
    const args = [`-cp`, classpath, sourceFile]

    debug(`running %o with args %o in %o`, command, args, cwd);
    const { status, stdout, stderr } = cp.spawnSync(command, args, { cwd });

    debug(`javac: %s\n%s`, stdout, stderr);

    if (status !== 0)
      throw stderr.toString();

  } catch (e) {
    throw new Error(`test compilation failed: ${e}`);
  }

  try {
    debug(`invoking Java Pathfinder`);

    // TODO: figure out how to use the runtime dictated by javaHome
    const command = `jpf`;

    const args = [propertiesFile];
    debug(`running %o with args %o in %o`, command, args, cwd);
    const proc = cp.spawn(command, args, { cwd });
    const { stdout, stderr } = proc;
    const returnCode = new Promise<number>((resolve, _) => proc.on("close", resolve));
    return { stdout, stderr, returnCode };

  } catch (e) {
    throw Error(`JPF failed: ${e}`);
  }
}

function getProperties(target: string, jars: string[]): string {
  return `target = ${target}
classpath = ${[".", ...jars.map((p) => path.resolve(p))].join(":")}
sourcepath = .
report.console.property_violation =
report.console.start =
report.console.finished =
search.multiple_errors = true
`;
}

function getCompiler(javaHome?: string): string {
  return path.join(javaHome ? path.join(javaHome, "bin") : "", "javac");
}
