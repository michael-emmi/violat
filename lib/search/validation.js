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
    let query = this._getQuery(lin, pos.getSchema());
    let response = await this.executor.query(query);
    let actual = lin.sequence.map(id => pos.getValue(id));
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

  _getQuery(lin, schema) {
    let invocations = [].concat(...schema.sequences.map(s => s.invocations));
    return ({
      class: schema.class,
      constructor: {
        parameters: schema.parameters || []
      },
      arguments: schema.arguments || [],
      invocations: lin.sequence.map(id => invocations.find(i => i.id === id))
    });
  }
}

class ConsistencyValidator extends LinearizationValidator {
  constructor(executor) {
    super(executor);
  }

  async validate(lin, vis, pos) {
    assert.fail("TODO implement consistency validation");
  }
}

module.exports = {
  TrivialValidator,
  LinearizationValidator,
  ConsistencyValidator
};
