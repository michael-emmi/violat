const debug = require('debug')('prediction');
const assert = require('assert');

class OutcomePredictor {
  constructor(collector) {
    this.collector = collector;
  }

  async outcomes(schema) {
    for await (let result of this.collector.collect(schema)) {
      // XXX TODO convert results to outcomes
    }

    return [];
  }

}

module.exports = {
  OutcomePredictor
};
