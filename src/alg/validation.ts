import * as assert from 'assert';
import * as Debug from 'debug';
const debug = Debug('validation');

import { batch } from '../enumeration/batch';
import { Schema } from '../schema';
import { RandomProgramGenerator, Filter } from '../enumeration/random';
import { StaticOutcomesTester, Tester, StaticOutcomesTesterInputs } from './testing';
import { SpecStrengthener } from '../spec/strengthener';
import { Server } from '../java/server';
import { RelaxedExecutionGenerator } from '../core/execution';
import { JCStressLimits } from '../java/jcstress/executor';
import { Spec, Method } from '../spec/spec';
import { TestResult } from './violation';

export interface SpecValidator<T> {
  getViolations(spec): AsyncIterable<T>;
  getFirstViolation(spec): Promise<T>;
}

abstract class AbstractValidator<T> implements SpecValidator<T> {
  abstract getViolations(spec: Spec): AsyncIterable<T>;
  async getFirstViolation(spec: Spec) {
    let first: T;
    for await (let violation of this.getViolations(spec)) {

      // NOTE: supposedly breaking here ensures that the generator’s
      // return method is called before exiting.
      first = violation;
      break;
    }
    // TODO: consider checking this
    return first!;
  }
}

export interface TestingBasedValidatorLimits extends Partial<JCStressLimits> {
  maxPrograms: number;
}

export interface TestingBasedValidatorInputs extends StaticOutcomesTesterInputs {
  limits: TestingBasedValidatorLimits;
}

abstract class TestingBasedValidator extends AbstractValidator<TestResult> {
  tester: StaticOutcomesTester;
  batchSize: number;
  maxPrograms: number;

  constructor(inputs: TestingBasedValidatorInputs) {
    super();
    const { server, jars, javaHome, generator, limits, tester } = inputs;
    const { maxPrograms } = limits;
    this.tester = new StaticOutcomesTester({ server, jars, javaHome, generator, limits, tester });
    this.batchSize = 100;
    this.maxPrograms = maxPrograms;
  }

  async * getViolations(spec: Spec) {
    let batches = batch(this.getPrograms(spec), { size: this.batchSize, max: this.maxPrograms });
    for await (let programs of batches) {
      debug(`testing ${programs.length} programs`);
      for await (let violation of this.tester.getViolations(programs))
        yield violation;
    }
  }

  abstract getPrograms(spec: Spec): Iterable<Schema>;
}

export class RandomTestValidator extends TestingBasedValidator {
  filter: Filter;
  limits: {};

  constructor({ server, jars, javaHome, generator, filter = _ => true, limits, tester }) {
    super({ server, jars, javaHome, generator, limits, tester });
    this.filter = filter;
    this.limits = limits;
  }

  * getPrograms(spec: Spec): Iterable<Schema> {
    let filter = this.filter;
    let limits = this.limits;
    let programGenerator = new RandomProgramGenerator({ spec, limits });
    for (let program of programGenerator.getPrograms(this.filter))
      yield program;
  }
}


interface ProgramValidatorInputs extends TestingBasedValidatorInputs {
  programs: Schema[];
}

export class ProgramValidator extends TestingBasedValidator {
  programs: Schema[];

  constructor(inputs: ProgramValidatorInputs) {
    super(inputs);
    const { programs } = inputs;
    this.programs = programs;
  }

  * getPrograms(spec) {
    for (let program of this.programs)
      yield program;
  }
}

export interface Strengthening {
  method: Method;
  attribute: string;
}

export type StrengtheningResult = TestResult | Strengthening;

export class SpecStrengthValidator extends AbstractValidator<StrengtheningResult> {
  server: any;
  jars: string[];
  javaHome?: string;
  generator: any;
  limits: {};
  strengthener: SpecStrengthener;
  tester: Tester;

  constructor({ server, jars, javaHome, generator, limits, strengthener, tester }) {
    super();
    this.server = server;
    this.jars = jars;
    this.javaHome = javaHome;
    this.generator = generator;
    this.limits = limits;
    this.strengthener = strengthener;
    this.tester = tester;
  }

  async * getViolations(spec: Spec) {
    for (let method of spec.methods) {
      let { server, jars, javaHome, generator, limits, tester } = this;
      let filter: Filter = program => program.sequences.some(s => s.invocations.some(i => i.method.name === method.name));

      let validator = new RandomTestValidator({ server, jars, javaHome, generator, filter, limits, tester });

      for (let { newSpec, attribute } of this.strengthener.getStrengthenings({ spec, method })) {
        debug(`trying %s: %s`, method.name, attribute);

        let violation = await validator.getFirstViolation(newSpec);

        if (violation) {
          debug(`found violation to stronger spec:\n%s`, violation);

        } else {
          debug(`found stronger spec; reporting maximality violation`);
          yield { method, attribute };
        }
      }
    }
  }
}
