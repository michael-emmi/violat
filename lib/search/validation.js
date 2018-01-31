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
    let query = this._getQuery(lin.getSequence(), pos.getSchema());
    let response = await this.executor.query(query);
    let actual = lin.getSequence().map(id => pos.getValue(id));
    let expected = response.map((val,idx) => actual[idx] !== undefined ? val : undefined);
    let result = actual.every((val, idx) => val == expected[idx]);

    debug(`validate(%o, %o): %s`, lin, pos, result);
    debug(`sequence: %s`, query.invocations.join('; '));
    debug(`response: %s`, response);
    debug(`values: %o`, pos.values);
    debug(`expected: %o`, expected);
    debug(`actual: %o`, actual);
    return result;
  }

  _getQuery(seq, schema) {
    let invocations = [].concat(...schema.sequences.map(s => s.invocations));
    return ({
      class: schema.class,
      constructor: {
        parameters: schema.parameters || []
      },
      arguments: schema.arguments || [],
      invocations: seq.map(id => invocations.find(i => i.id === id))
    });
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
      let query = this._getQuery(projection, schema);
      let response = await this.executor.query(query);
      let actual = sequence.filter(id => projection.includes(id)).map(id => pos.getValue(id));
      let expected = response.map((val,idx) => actual[idx] !== undefined ? val : undefined);
      result = result && actual.every((val, idx) => val == expected[idx]);

      debug(`sequence: %s`, query.invocations.join('; '));
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
