const path = require('path');
const cp = require('child_process');
const fs = require('fs');
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
