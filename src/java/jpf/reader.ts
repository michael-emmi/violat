import * as Debug from 'debug';
const debug = Debug('jpf:reader');

import { Outcome } from '../../outcome';
import { Readable, PassThrough } from 'stream';
import { createInterface } from 'readline';

export async function * getOutcomes(readable: Readable, outcomes: Iterable<Outcome>): AsyncIterable<Outcome> {
  const resultMap = new Map<string,number>();
  const expected = new Map<string,Outcome>();

  for (const outcome of outcomes)
    expected.set(outcome.valueString(), outcome);

  for await (const line of lines(readable)) {
    debug(line);
    const result = line;
    resultMap.set(result, (resultMap.get(result) || 0) + 1);
  }
  debug(`got outcomes: %o`, resultMap);

  for (const [result, count] of resultMap.entries()) {
    const predicted = expected.get(result);

    if (predicted !== undefined)
      yield predicted.observe(count);

    else {
      const consistency = undefined;
      const results = {};
      for (const [idx,value] of result.split(', ').entries())
        results[idx] = value;
      const outcome = new Outcome({ consistency, results, count });
      yield outcome;
    }
  }
}

export function lines(input: Readable): AsyncIterable<string> {
  const output = new PassThrough({ objectMode: true });
  const readline = createInterface({ input });
  readline.on('line', line => output.write(line));
  readline.on('close', () => output.end());
  return output;
}
