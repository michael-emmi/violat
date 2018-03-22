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
    let count = 0;

    for await (let results of this.collector.collect(schema)) {

      for (let sequence of schema.sequences)
        for (let invocation of sequence.invocations)
          if (invocation.method.void)
            results[invocation.id] = undefined;

      let outcome = new Outcome({ results, consistency: Consistency.top() });
      debug(`%s`, outcome);

      yield outcome;
      count++;
    }
    debug(`predicated ${count} outcomes`);
  }

}

module.exports = {
  OutcomePredictor
};
