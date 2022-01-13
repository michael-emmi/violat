import * as assert from 'assert';
import * as Debug from 'debug';
const debug = Debug('testing');

import { Schema } from '../schema';
import { OutcomePredictor } from '../search/prediction';
import { JCStressTester, JCStressLimits } from '../java/jcstress/executor';
import { TestResult } from './violation';
import * as JpfChecker from '../java/jpf/checker';
import { Server } from '../java/server';
import { ExecutionGenerator } from '../core/execution';

export type Tester = 'JCStress' | 'Java Pathfinder';

export interface StaticOutcomesTesterInputs {
  server: Server;
  jars: string[];
  javaHome?: string;
  generator: ExecutionGenerator;
  tester: string;
  limits: Partial<JCStressLimits>;
}

export class StaticOutcomesTester {
  predictor: OutcomePredictor;
  jars: string[];
  javaHome?: string;
  limits: Partial<JCStressLimits>;
  tester: string;

  constructor(inputs: StaticOutcomesTesterInputs) {
    const { server, jars, javaHome, generator, limits, tester } = inputs;
    this.predictor = new OutcomePredictor({ server, generator });
    this.jars = jars;
    this.javaHome = javaHome;
    this.limits = limits;
    this.tester = tester;
  }

  async * getViolations(programs: Schema[]) {

    debug(`computing expected outcomes for ${programs.length} programs`);
    for (let program of programs) {
      program.outcomes = [];
      for await (let outcome of this.predictor.outcomes(program)) {
        program.outcomes.push(outcome);
      }
    }

    debug(`running test framework`);
    for await (let r of this.getResultIterable(programs)) {
      let result = new TestResult(r);
      debug(`got result:\n%s`, result);

      if (!r.status)
        yield result;
    }
  }

  getResultIterable(schemas: Iterable<Schema>)  {
    let limits = this.limits;

    switch (this.tester) {

      case 'JCStress':
        debug(`initializing test framework`);
        let tester = new JCStressTester(schemas, this.jars, this.javaHome, { limits })
        return tester.getResults();

      case 'Java Pathfinder':
        return JpfChecker.check(schemas, this.jars, this.javaHome);

      default:
        throw new Error(`unexpected tester: ${this.tester}`);
    }
  }
}
