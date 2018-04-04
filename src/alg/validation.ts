import * as assert from 'assert';
import * as Debug from 'debug';
const debug = Debug('validation');

import { batch } from '../enumeration/batch';
import { Schema } from '../schema';
import { RandomProgramGenerator } from '../enumeration/random';
import { StaticOutcomesTester } from './testing';
import { SpecStrengthener } from '../spec/strengthener';

export interface SpecValidator {
  getViolations(spec): AsyncIterable<{}>;
  getFirstViolation(spec): Promise<{}>;
}

abstract class TestingBasedValidator implements SpecValidator {
  tester: StaticOutcomesTester;
  batchSize: number;
  maxPrograms: number;

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

  abstract getPrograms(spec);
}

export class RandomTestValidator extends TestingBasedValidator {
  limits: {};

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

export class SingleProgramValidator extends TestingBasedValidator {
  program: Schema;

  constructor({ server, generator, limits, program }) {
    super({ server, generator, limits });
    this.program = program;
  }

  * getPrograms(spec) {
    yield this.program;
  }
}

export class SpecStrengthValidator {
  limits: {};
  strengthener: SpecStrengthener;
  validator: SpecValidator;

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
