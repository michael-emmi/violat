import * as assert from 'assert';
import * as Debug from 'debug';
const debug = Debug('violat:java:build');

const path = require('path');
const cp = require('child_process');
const ncp = require('ncp');

const { findFiles } = require('../utils/find.js');
const { targetsOutdated } = require('../utils/deps.js');

export function gradleBuildJar({ sourcePath, workPath, name, javaHome }): Promise<string> {
  debug(`build ${name}.jar in ${workPath} from ${sourcePath}`);

  return new Promise((resolve, reject) => {
    debug(`checking whether ${name} needs compiling`);

    let sources = findFiles(sourcePath, `-name "*.java"`);
    let jarFile = path.resolve(workPath, `build/libs/${name}.jar`);
    let outdated = targetsOutdated([jarFile], sources);

    if (!outdated) {
      debug(`${name} has already been compiled`);
      resolve(jarFile);

    } else {
      debug(`recompiling ${name}`);
      ncp(sourcePath, workPath, err => {
        if (err) {
          debug(`unable to copy ${name}: ${err}`);
          reject(err);
        } else {
          let cmd = [`gradle`];
          if (javaHome)
            cmd.push(`-Dorg.gradle.java.home=${javaHome}`);
          cp.exec(cmd.join(' '), {cwd: workPath}, (rc, out, err) => {
            if (rc) {
              debug(`unable to build ${name}: ${err}`);
              reject(err);
            } else {
              resolve(jarFile);
            }
          });
        }
      });
    }
  });
}
