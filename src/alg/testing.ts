import * as assert from 'assert';
import * as Debug from 'debug';
const debug = Debug('testing');

import { OutcomePredictor } from '../search/prediction';
import { JCStressTester } from '../java/jcstress';

export class StaticOutcomesTester {
  predictor: OutcomePredictor;
  limits: {};

  constructor({ server, generator, limits }) {
    this.predictor = new OutcomePredictor({ server, generator });
    this.limits = limits;
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
    let limits = this.limits;
    let tester = new JCStressTester(programs, { limits });

    debug(`running test framework`);
    for await (let result of tester.getResults()) {
      debug(`got result: %o`, result);

      if (!result.status)
        yield result;
    }
  }
}
