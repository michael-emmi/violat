const debug = require('debug')('history-validation');
const assert = require('assert');

class TrivialValidator {
  constructor() {

  }
  validate() {
    return true;
  }
}

class LinearizationValidator {
  constructor(executor) {
    this.executor = executor;
  }

  async validate(lin, pos) {
    let response = await this.executor.run(lin.getSequence(), pos.getSchema());
    let actual = lin.getSequence().map(id => pos.getValue(id));
    let expected = response.map((val,idx) => actual[idx] !== undefined ? val : undefined);
    let result = actual.every((val, idx) => val == expected[idx]);

    debug(`validate(%o, %o): %s`, lin, pos, result);
    debug(`response: %s`, response);
    debug(`values: %o`, pos.values);
    debug(`expected: %o`, expected);
    debug(`actual: %o`, actual);
    return result;
  }
}

class ConsistencyValidator extends LinearizationValidator {
  constructor(executor) {
    super(executor);
  }

  async validate(lin, vis, pos) {
    let result = true;
    let schema = pos.getSchema();
    let sequence = lin.getSequence();
    let prefix = [];
    for (let op of sequence) {
      prefix.push(op);
      let projection = this._projection(prefix, vis);
      let response = await this.executor.run(projection, schema);
      let actual = sequence.filter(id => projection.includes(id)).map(id => pos.getValue(id));
      let expected = response.map((val,idx) => actual[idx] !== undefined ? val : undefined);
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

module.exports = {
  TrivialValidator,
  LinearizationValidator,
  ConsistencyValidator
};
