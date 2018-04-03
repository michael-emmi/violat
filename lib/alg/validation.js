const debug = require('debug')('validation');
const assert = require('assert');

const { batch } = require('../enumeration/batch.js');
const { RandomProgramGenerator } = require('../enumeration/random.js');
const { StaticOutcomesTester } = require('./testing.js');

class TestingBasedValidator {
  constructor({ server, generator, limits: { maxPrograms, ...limits } }) {
    this.tester = new StaticOutcomesTester({ server, generator, limits });
    this.batchSize = 100;
    this.maxPrograms = maxPrograms;
  }

  async * getViolations(spec) {
    let batches = batch(this.getPrograms(spec), { size: this.batchSize, max: this.maxPrograms });
    for await (let programs of batches)
      for await (let violation of this.tester.getViolations(programs))
        yield violation;
  }
}

class RandomTestValidator extends TestingBasedValidator {
  constructor({ server, generator, limits }) {
    super({ server, generator, limits });
    this.limits = limits;
  }

  * getPrograms(spec) {
    let limits = this.limits;
    let programGenerator = new RandomProgramGenerator({ spec, limits });
    for (let program of programGenerator.getPrograms())
      yield program;
  }
}

class SingleProgramValidator extends TestingBasedValidator {
  constructor({ server, generator, limits, program }) {
    super({ server, generator, limits });
    this.program = program;
  }

  * getPrograms(spec) {
    yield this.program;
  }
}

module.exports = {
  SingleProgramValidator,
  RandomTestValidator
};
