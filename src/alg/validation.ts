import * as assert from 'assert';
import * as Debug from 'debug';
const debug = Debug('validation');

import { batch } from '../enumeration/batch';
import { Schema } from '../schema';
import { RandomProgramGenerator, Filter } from '../enumeration/random';
import { StaticOutcomesTester, Tester } from './testing';
import { SpecStrengthener } from '../spec/strengthener';

export interface SpecValidator {
  getViolations(spec): AsyncIterable<any>;
  getFirstViolation(spec): Promise<any>;
}

abstract class AbstractValidator implements SpecValidator {
  abstract async getViolations(spec);
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
}

abstract class TestingBasedValidator extends AbstractValidator {
  tester: StaticOutcomesTester;
  batchSize: number;
  maxPrograms: number;

  constructor({ server, jars, javaHome, generator, limits: { maxPrograms, ...limits }, tester }) {
    super();
    this.tester = new StaticOutcomesTester({ server, jars, javaHome, generator, limits, tester });
    this.batchSize = 100;
    this.maxPrograms = maxPrograms;
  }

  async * getViolations(spec) {
    let batches = batch(this.getPrograms(spec), { size: this.batchSize, max: this.maxPrograms });
    for await (let programs of batches) {
      debug(`testing ${programs.length} programs`);
      for await (let violation of this.tester.getViolations(programs))
        yield violation;
    }
  }

  abstract getPrograms(spec);
}

export class RandomTestValidator extends TestingBasedValidator {
  filter: Filter;
  limits: {};

  constructor({ server, jars, javaHome, generator, filter = _ => true, limits, tester }) {
    super({ server, jars, javaHome, generator, limits, tester });
    this.filter = filter;
    this.limits = limits;
  }

  * getPrograms(spec) {
    let filter = this.filter;
    let limits = this.limits;
    let programGenerator = new RandomProgramGenerator({ spec, limits });
    for (let program of programGenerator.getPrograms(this.filter))
      yield program;
  }
}

export class ProgramValidator extends TestingBasedValidator {
  programs: Schema[];

  constructor({ server, jars, javaHome, generator, limits, programs, tester }) {
    super({ server, jars, javaHome, generator, limits, tester });
    this.programs = programs;
  }

  * getPrograms(spec) {
    for (let program of this.programs)
      yield program;
  }
}

export class SpecStrengthValidator extends AbstractValidator {
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

  async * getViolations(spec) {
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
