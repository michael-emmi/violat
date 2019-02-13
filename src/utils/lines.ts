import { Readable, PassThrough } from 'stream';
import { createInterface } from 'readline';

export function lines(input: Readable): AsyncIterable<string> {
  const output = new PassThrough({ objectMode: true });
  const readline = createInterface({ input });
  readline.on('line', line => output.write(line));
  readline.on('close', () => output.end());
  return output;
}
