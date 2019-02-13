import * as assert from 'assert';
import * as Debug from 'debug';
const debug = Debug('violat:utils:deps');

import * as fs from 'fs-extra';

export async function targetsOutdated(targets: string[], sources: string[]): Promise<boolean> {
  debug(`checking outdated`);
  debug(`sources: %o`, sources);
  debug(`targets: %o`, targets);

  if (targets.some(f => !fs.existsSync(f))) {
    debug(`targets do not exist`);
    return true;
  }

  let t0 = Math.max(...sources.map(f => fs.statSync(f).mtime.getTime()))
  let t = Math.min(...targets.map(f => fs.statSync(f).mtime.getTime()));
  let outdated = t0 > t;

  debug(`targets ${outdated ? `out of` : `up to` } date`);
  debug(`targets compiled at: ${t}`);
  debug(`sources modified at: ${t0}`);
  return outdated;
}
