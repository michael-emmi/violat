const path = require('path');
const cp = require('child_process');
const fs = require('fs');
const ncp = require('ncp');
const mkdirp = require('mkdirp');
const debug = require('debug')('violat:utils');

exports.targetsOutdated = function(targets, sources) {
  debug(`checking outdated`);
  debug(`sources: %o`, sources);
  debug(`targets: %o`, targets);

  if (targets.some(f => !fs.existsSync(f))) {
    debug(`targets do not exist`);
    return true;
  }

  let t0 = Math.max(...sources.map(f => fs.statSync(f).mtime))
  let t = Math.min(...targets.map(f => fs.statSync(f).mtime));
  let outdated = t0 > t;

  debug(`targets ${outdated ? `out of` : `up to` } date`);
  debug(`targets compiled at: ${t}`);
  debug(`sources modified at: ${t0}`);
  return outdated;
}

exports.findFiles = function(path, pattern) {
  return cp.execSync(`find ${path} ${pattern}`)
    .toString().split('\n').filter(f => f);
}

exports.buildJar = function(sourcePath, workPath, name) {
  return new Promise((resolve, reject) => {
    debug(`checking whether ${name} needs compiling`);

    let sources = module.exports.findFiles(sourcePath, `-name "*.java"`);
    let object = path.resolve(workPath, `build/libs/${name}.jar`);
    let outdated = module.exports.targetsOutdated([object], sources);

    if (!outdated) {
      debug(`${name} has already been compiled`);
      resolve();

    } else {
      debug(`recompiling ${name}`);
      ncp(sourcePath, workPath, err => {
        if (err) {
          debug(`unable to copy ${name}: ${err}`);
          reject(err);
        } else {
          cp.exec(`gradle`, {cwd: workPath}, (rc, out, err) => {
            if (rc) {
              debug(`unable to build ${name}: ${err}`);
              reject(err);
            } else {
              resolve();
            }
          });
        }
      });
    }
  });
}
