const debug = require('debug')('validation');
const assert = require('assert');

const { batch } = require('../enumeration/batch.js');
const { RandomProgramGenerator } = require('../enumeration/random.js');
const { StaticOutcomesTester } = require('./testing.js');

class Validator {
  constructor(collector) {
    this.tester = new StaticOutcomesTester(collector);
  }
}

class RandomTestingBasedValidator extends Validator {
  constructor(collector, limits) {
    super(collector);
    this.limits = limits;
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

class SingleProgramValidator extends Validator {
  constructor(collector, program) {
    super(collector);
    this.program = program;
  }

  async * getViolations(spec) {
    for await (let violation of this.tester.getViolations([this.program]))
      yield violation;
  }
}

module.exports = {
  SingleProgramValidator,
  RandomTestingBasedValidator
};
