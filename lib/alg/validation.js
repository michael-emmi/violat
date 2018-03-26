const debug = require('debug')('validation');
const assert = require('assert');

const { batch } = require('../enumeration/batch.js');
const { RandomProgramGenerator } = require('../enumeration/random.js');
const { StaticOutcomesTester } = require('./testing.js');

class Validator {
  constructor({ server, generator }) {
    this.tester = new StaticOutcomesTester({ server, generator });
  }
}

class RandomTestingBasedValidator extends Validator {
  constructor({ server, generator, limits }) {
    super({ server, generator });
    this.limits = limits;
  }

  async * getViolations(spec) {
    let limits = this.limits;
    let programGenerator = new RandomProgramGenerator({ spec, limits });

    for (let programs of batch(programGenerator.getPrograms(), { size: 100, max: limits.programs }))
      for await (let violation of this.tester.getViolations(programs))
        yield violation;
  }
}

class SingleProgramValidator extends Validator {
  constructor({ server, generator, program }) {
    super({ server, generator });
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
