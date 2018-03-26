const debug = require('debug')('enum:random');
const trace = require('debug')('enum:random:trace');
const assert = require('assert');
const os = require('os');

const Chance = require('chance');
const { Schema } = require('../schema.js');

class RandomProgramGenerator {
  constructor({ spec, limits }) {
    let threads = (limits || {}).threads || os.cpus().length;
    let invocations = (limits || {}).invocations || 15;
    let values = (limits || {}).values  || Math.ceil(Math.log(invocations));

    this.spec = spec;
    this.limits = { threads, invocations, values };
    this.chance = new Chance(1234567889);
    this.count = 0;
    this.weights = this.getMethodWeights();
  }

  * getPrograms() {
    while (true)
      yield this.getProgram();
  }

  getProgram() {
    let id = this.count++;
    let generator = new SingleUseRandomProgramGenerator({ id, ...this });
    let program = new Schema(generator.getProgram());
    debug(`generated program: %s`, program);
    return program;
  }

  getMethodWeights() {
    return this.spec.methods.map(method => {
      if (method.trusted)
        return this.limits.invocations / 2;
      else
        return 1;
    });
  }
}

class SingleUseRandomProgramGenerator {
  constructor({ spec, weights, chance, limits, id }) {
    this.spec = spec;
    this.weights = weights;
    this.limits = limits;
    this.chance = chance;
    this.id = id;
    this.numSequences = 0;
    this.numInvocations = 0;
  }

  getProgram() {
    let numThreads = this.chance.integer({ min: 2, max: this.limits.threads });
    let numInvocations = this.chance.integer({ min: numThreads, max: this.limits.invocations });
    let numOpsPerThread = Math.ceil(numInvocations / numThreads);

    let id = this.id;
    let _class = this.spec.class;
    let parameters = this.spec.parameters || [];
    let _arguments = this.spec.default_parameters || [];
    let sequences = [...Array(numThreads)].map(_ => this.getSequence(numOpsPerThread));
    let order = [];
    return { id, class: _class, parameters, arguments: _arguments, sequences, order };
  }

  getSequence(length) {
    let id = this.numSequences++;
    let invocations = [...Array(length)].map(_ => this.getInvocation());
    return { id, invocations };
  }

  getInvocation() {
    let id = this.numInvocations++;
    let method = this.getMethod();
    let _arguments = method.parameters.map(p => this.getValue(p.type));
    return { id, method, arguments: _arguments };
  }

  getMethod() {
    return this.chance.weighted(this.spec.methods, this.weights);
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
    return this.chance.integer({min: 0, max: this.limits.values - 1});
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
