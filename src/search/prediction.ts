const debug = require('debug')('prediction');
const assert = require('assert');

const { CachingExecutor } = require('../java/executor.js');

const Outcome = require('../outcome.js');
const { Consistency } = require('../consistency.js');

class OutcomePredictor {
  constructor({ server, generator }) {
    this.server = server;
    this.generator = generator;
  }

  async * outcomes(schema) {
    debug(`predicting outcomes for schema %s`, schema);
    let unique = new Set();
    let executor = new CachingExecutor(this.server);

    for await (let execution of this.generator.getExecutions(schema)) {
      let results = await execution.execute(executor);
      let string = JSON.stringify(results);

      if (!unique.has(string))
        yield this._resultsToOutcome(results, schema);

      unique.add(string);
    }
    debug(`predicated ${unique.size} outcomes`);
  }

  _resultsToOutcome(results, schema) {
    for (let sequence of schema.sequences)
      for (let invocation of sequence.invocations)
        if (invocation.method.void)
          results[invocation.id] = undefined;

    let outcome = new Outcome({ results, consistency: Consistency.top() });
    debug(`got %s`, outcome);
    return outcome;
  }

}

module.exports = {
  OutcomePredictor
};
