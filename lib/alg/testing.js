const debug = require('debug')('testing');
const assert = require('assert');

const { OutcomePredictor } = require('../search/prediction.js');
const { JCStressTester } = require('../java/jcstress.js');

class StaticOutcomesTester {
  constructor(collector) {
    this.predictor = new OutcomePredictor(collector);
  }

  async * getViolations(programs) {

    debug(`computing expected outcomes`);
    for (let program of programs) {
      program.outcomes = [];
      for await (let outcome of this.predictor.outcomes(program)) {
        program.outcomes.push(outcome);
      }
    }

    debug(`initializing test framework`);
    let tester = new JCStressTester(programs, '');

    debug(`running test framework`);
    for await (let result of tester.getResults()) {
      debug(`got result: %o`, result);

      if (!result.status)
        yield result;
    }
  }
}

module.exports = {
  StaticOutcomesTester
};
