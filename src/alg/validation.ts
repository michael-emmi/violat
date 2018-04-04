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

  async getFirstViolation(spec) {
    let first;
    for await (let violation of this.getViolations(spec)) {

      // NOTE: supposedly breaking here ensures that the generator’s
      // return method is called before exiting.
      first = violation;
      break;
    }
    return first;
  }

  async * getViolations(spec) {
    let batches = batch(this.getPrograms(spec), { size: this.batchSize, max: this.maxPrograms });
    for await (let programs of batches) {
      debug(`testing ${programs.length} programs`);
      for await (let violation of this.tester.getViolations(programs))
        yield violation;
    }
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

class SpecStrengthValidator {
  constructor({ server, generator, limits, strengthener }) {
    this.limits = limits;
    this.strengthener = strengthener;
    this.validator = new RandomTestValidator({ server, generator, limits });
  }

  async * getViolations(spec) {
    for (let method of spec.methods) {
      for (let { newSpec, attribute } of this.strengthener.getStrengthenings({ spec, method })) {
        debug(`trying %s: %s`, method.name, attribute);

        let valid = ! await this.validator.getFirstViolation(newSpec);
        debug(`validity: %s`, valid);

        if (valid) {
          yield { method, attribute };
        }
      }
    }
  }
}

module.exports = {
  SingleProgramValidator,
  RandomTestValidator,
  SpecStrengthValidator
};
