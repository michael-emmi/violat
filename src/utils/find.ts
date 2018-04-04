import * as assert from 'assert';
import * as Debug from 'debug';
const debug = Debug('violat:utils:find');

import * as cp from 'child_process';

export function findFiles(path, pattern) {
  return cp.execSync(`find ${path} ${pattern}`)
    .toString().split('\n').filter(f => f);
}
