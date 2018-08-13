import * as assert from 'assert';
import * as Debug from 'debug';
const debug = Debug('testing');

import { OutcomePredictor } from '../search/prediction';
import { JCStressTester } from '../java/jcstress';
import { TestResult } from './violation';

export class StaticOutcomesTester {
  predictor: OutcomePredictor;
  jars: string[];
  limits: {};

  constructor({ server, jars, generator, limits }) {
    this.predictor = new OutcomePredictor({ server, generator });
    this.jars = jars;
    this.limits = limits;
  }

  async * getViolations(programs) {

    debug(`computing expected outcomes for ${programs.length} programs`);
    for (let program of programs) {
      program.outcomes = [];
      for await (let outcome of this.predictor.outcomes(program)) {
        program.outcomes.push(outcome);
      }
    }

    debug(`initializing test framework`);
    let limits = this.limits;
    let tester = new JCStressTester(programs, this.jars, { limits });

    debug(`running test framework`);
    for await (let r of tester.getResults()) {
      let result = new TestResult(r);
      debug(`got result:\n%s`, result);

      if (!r.status)
        yield result;
    }
  }
}
