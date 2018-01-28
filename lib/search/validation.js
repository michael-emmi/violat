const debug = require('debug')('history-validation');
const assert = require('assert');

class LinearizationValidator {
  constructor(executor) {
    this.executor = executor;
  }

  async validate(lin, pos) {
    let query = this._getQuery(lin, pos.getSchema());
    let response = await this.executor.query(query);
    let result = response.every((val,idx) => pos.getValue(idx) === 'void' || pos.getValue(idx) == val);
    debug(`validate(%o, %o): %s`, lin, pos, result);
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
  LinearizationValidator,
  ConsistencyValidator
};
