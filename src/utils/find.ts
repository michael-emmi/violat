import * as assert from 'assert';
import * as Debug from 'debug';
const debug = Debug('violat:utils:find');

import * as cp from 'child_process';
import { lines } from './lines';

export async function findFiles(path: string, pattern: string): Promise<string[]> {
  const proc = cp.spawn(`find`, [path, pattern]);
  const files: string[] = [];
  for await (const line of lines(proc.stdout))
    files.push(line);
  return files;
}
