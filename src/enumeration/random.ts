const debug = require('debug')('enum:random');
const trace = require('debug')('enum:random:trace');
const assert = require('assert');
const os = require('os');

const Chance = require('chance');
const { Schema } = require('../schema.js');

class RandomProgramGenerator {
  constructor({ spec, limits: {
    minThreads = 2,
    maxThreads = os.cpus().length,
    minInvocations = 3,
    maxInvocations = 6,
    minValues = 1,
    maxValues = Math.ceil(Math.log(maxInvocations))
  }}) {
    this.spec = spec;
    this.limits = {
      threads: { min: minThreads, max: maxThreads },
      invocations: { min: minInvocations, max: maxInvocations },
      values: { min: minValues, max: maxValues }
    };
    this.chance = new Chance(1234567889);
    this.programId = 0;
    this.weights = this.getMethodWeights();
  }

  * getPrograms() {
    while (true)
      yield this.getProgram();
  }

  getProgram() {
    let id = this.programId++;
    let generator = new SingleUseRandomProgramGenerator({ id, ...this });
    let program = new Schema(generator.getProgram());
    debug(`generated program: %s`, program);
    return program;
  }

  getMethodWeights() {
    return this.spec.methods.map(method => {
      if (method.trusted)
        return 2;
      else
        return 1;
    });
  }
}

class SingleUseRandomProgramGenerator {
  constructor({ spec, weights, chance, limits, id }) {
    this.spec = spec;
    this.weights = weights;

    this.numSequences = chance.integer(limits.threads);
    this.numInvocations = chance.integer({
      min: Math.max(this.numSequences, limits.invocations.min),
      max: limits.invocations.max
    });
    this.numValues = chance.integer(limits.values);

    this.chance = chance;
    this.id = id;

    this.sequences = [];
    this.invocations = [];
  }

  getProgram() {
    let id = this.id;
    let _class = this.spec.class;
    let parameters = this.spec.parameters || [];
    let _arguments = this.spec.default_parameters || [];
    let sequences = [...Array(this.numSequences)].map(_ => this.getSequence());
    let order = [];
    return { id, class: _class, parameters, arguments: _arguments, sequences, order };
  }

  getSequence() {
    let numInvocations;
    if (this.sequences.length < this.numSequences - 1)
      numInvocations = Math.round(this.chance.normal({
        mean: this.numInvocations / this.numSequences,
        dev: 1
      }));
    else
      numInvocations = this.numInvocations - this.invocations.length;

    let id = this.sequences.length;
    let invocations = [...Array(Math.max(1, numInvocations))].map(_ => this.getInvocation());
    let sequence = { id, invocations };
    this.sequences.push(sequence);
    return sequence;
  }

  getInvocation() {
    let id = this.invocations.length;
    let method = this.getMethod();
    let _arguments = method.parameters.map(p => this.getValue(p.type));
    let invocation = { id, method, arguments: _arguments };
    this.invocations.push(invocation);
    return invocation;
  }

  getMethod() {
    return this.chance.weighted(this.spec.methods, this.getWeights());
  }

  getWeights() {
    let multiplier = this.getMultiplier();
    return this.spec.methods.map((method,i) => this.weights[i] * multiplier(method));
  }

  getMultiplier() {
    let m1 = this.getMutatorMultiplier();
    return method => m1(method);
  }

  getMutatorMultiplier() {
    let index = this.sequences.reduce((a,s) => a + s.invocations.length, 0);
    let invocations = this.invocations.slice(index);
    let readOnly = invocations.every(i => i.method.readonly);
    let position = invocations.length + 1;
    return method => (readOnly && !method.readonly) ? (2 ** position) : 1;
  }

  getValue(type) {
    if (isIntAssignable(type))
      return this.getInt();

    if (isIntAssignableCollection(type))
      return this.getIntCollection();

    if (isIntAssignableMap(type))
      return this.getIntMap();

    throw new Error(`Unexpected type: ${type}`);
  }

  getIntCollection(type) {
    return [ this.getInt(), this.getInt() ];
  }

  getIntMap(type) {
    return this.chance.unique(_ => this.getInt(), 2)
      .reduce((m,k) => Object.assign({}, m, {[k]: this.getInt()}), {});
  }

  getInt() {
    return this.chance.integer({ min: 0, max: this.numValues - 1 });
  }
}

function isIntAssignable(type) {
  return ["int", "java.lang.Integer", "java.lang.Object"].includes(type);
}

function isIntAssignableCollection(type) {
  return Array.isArray(type) && type.length == 1 && isIntAssignable(type[0]);
}

function isIntAssignableMap(type) {
  let keys = type ? Object.keys(type) : [];
  return keys.length == 1 && isIntAssignable(type[keys[0]])
}

module.exports = {
  RandomProgramGenerator
}
