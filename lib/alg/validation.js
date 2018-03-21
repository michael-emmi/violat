const debug = require('debug')('executor');
const assert = require('assert');

const { batch } = require('../enumeration/batch.js');
const { JCStressTester } = require('../jcstress.js');
const { RandomProgramGenerator } = require('../enumeration/random.js');
const { OutcomePredictor } = require('../search/prediction.js');

class RandomTestBasedValidator {
  constructor(collector, limits) {
    this.limits = limits;
    this.predictor = new OutcomePredictor(collector);
  }

  async validate(spec) {
    let limits = this.limits;
    let programGenerator = new RandomProgramGenerator({ spec, limits });
    let count = 0;

    for (let programs of batch(programGenerator.getPrograms(), 100)) {
      programs.splice(limits.programs - count, programs.length);

      if (programs.length == 0)
        break;

      count += programs.length;

      for (let program of programs)
        program.outcomes = await this.predictor.outcomes(program);

      let tester = new JCStressTester(programs, '');

      // TODO evaluate the tests
    }
  }
}

module.exports = {
  RandomTestBasedValidator
};
