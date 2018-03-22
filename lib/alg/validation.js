const debug = require('debug')('validation');
const assert = require('assert');

const { batch } = require('../enumeration/batch.js');
const { RandomProgramGenerator } = require('../enumeration/random.js');
const { StaticOutcomesTester } = require('./testing.js');

class RandomTestingBasedValidator {
  constructor(collector, limits) {
    this.limits = limits;
    this.tester = new StaticOutcomesTester(collector);
  }

  async * getViolations(spec) {
    let limits = this.limits;
    let programGenerator = new RandomProgramGenerator({ spec, limits });
    let count = 0;

    for (let programs of batch(programGenerator.getPrograms(), 100)) {
      programs.splice(limits.programs - count, programs.length);

      if (programs.length == 0)
        break;

      count += programs.length;

      for await (let violation of this.tester.getViolations(programs))
        yield violation;
    }
  }
}

module.exports = {
  RandomTestingBasedValidator
};
