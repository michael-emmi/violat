const debug = require('debug')('prediction');
const assert = require('assert');

const Outcome = require('../outcome.js');
const { Consistency } = require('../consistency.js');

class OutcomePredictor {
  constructor(collector) {
    this.collector = collector;
  }

  async * outcomes(schema) {
    debug(`predicting outcomes for schema %s`, schema);

    for await (let results of this.collector.collect(schema)) {

      for (let sequence of schema.sequences)
        for (let invocation of sequence.invocations)
          if (invocation.method.void)
            results[invocation.id] = undefined;

      debug(`got result: %o`, results);

      yield new Outcome({ results, consistency: Consistency.top() });
    }
  }

}

module.exports = {
  OutcomePredictor
};
