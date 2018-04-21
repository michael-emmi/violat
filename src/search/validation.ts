import * as assert from 'assert';
import * as Debug from 'debug';
const debug = Debug('history-validation');

import { Invocation } from '../schema';
import { Executor } from '../java/executor';

export abstract class Validator {
  abstract async validate(args: {}): Promise<boolean>;
}

export class TrivialValidator implements Validator {
  async validate({}) {
    return true;
  }
}

export class LinearizationValidator extends TrivialValidator {
  executor: Executor;

  constructor(executor) {
    super();
    this.executor = executor;
  }

  async validate({ lin, pos }) {
    let schema = pos.getSchema();

    // TODO avoid re-retieval of the invocations each time.
    let invocations: Invocation[] = [].concat(...schema.sequences.map(s => s.invocations));
    let sequence = lin.getSequence().map(id => invocations.find(i => i.id == id));

    let response = await this.executor.execute(sequence, schema);
    let actual = lin.getSequence().map(id => pos.getValue(id));
    let expected = Object.values(response).map((val,idx) => actual[idx] !== undefined ? val : undefined);
    let result = actual.every((val, idx) => val == expected[idx]);

    debug(`validate(%o, %o): %s`, lin, pos, result);
    debug(`response: %s`, response);
    debug(`values: %o`, pos.values);
    debug(`expected: %o`, expected);
    debug(`actual: %o`, actual);
    return result;
  }
}

export class ConsistencyValidator extends LinearizationValidator {
  constructor(executor) {
    super(executor);
  }

  async validate({ lin, vis, pos }) {
    let result = true;
    let schema = pos.getSchema();
    let sequence = lin.getSequence();

    // TODO avoid re-retieval of the invocations each time.
    let invocations: Invocation[] = [].concat(...schema.sequences.map(s => s.invocations));

    let prefix: Invocation[] = [];
    for (let op of sequence) {
      prefix.push(op);
      let projection = this._projection(prefix, vis).map(id => invocations.find(i => i.id == id));
      let response = await this.executor.execute(projection, schema);
      let actual = sequence.filter(id => projection.includes(id)).map(id => pos.getValue(id));
      let expected = Object.values(response).map((val,idx) => actual[idx] !== undefined ? val : undefined);
      result = result && actual.every((val, idx) => val == expected[idx]);

      debug(`response: %s`, response);
      debug(`values: %o`, pos.values);
      debug(`expected: %o`, expected);
      debug(`actual: %o`, actual);
      debug(`validate-prefix(%o): %s`, projection, result);

      if (!result)
        break;
    }

    debug(`validate(%o): %s`, lin, result);
    return result;
  }

  _projection(seq, vis) {
    let op = seq[seq.length-1];
    return seq.filter(id => id === op || vis.has(op, id));
  }
}
