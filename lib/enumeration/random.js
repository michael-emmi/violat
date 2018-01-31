const debug = require('debug')('enum:random');
const trace = require('debug')('enum:random:trace');
const assert = require('assert');
const os = require('os');

const { Dice } = require('./dice.js');
const { Schema } = require('../schema.js');

class RandomProgramGenerator {
  constructor(args) {
    let threads = (args.limits || {}).threads || os.cpus().length;
    let invocations = (args.limits || {}).invocations || 25;
    let values = (args.limits || {}).values  || Math.ceil(Math.log(invocations));

    this.spec = args.spec;
    this.limits = { threads, invocations, values };
    this.count = 0;
    this.dice = new Dice();

    debug(`program generator: %o`, this);
  }

  * getPrograms() {
    while (true)
      yield this.getProgram();
  }

  getProgram() {
    let numThreads = this.dice.range(2, this.limits.threads);
    let numInvocations = this.dice.range(numThreads, this.limits.invocations);
    let numOpsPerThread = Math.ceil(numInvocations / numThreads);
    let ids = { sequence: 0, invocation: 0 };

    let program = new Schema({
      id: this.count++,
      class: this.spec.class,
      parameters: this.spec.parameters || [],
      arguments: this.spec.default_parameters || [],
      sequences: [...Array(numThreads)].map(_ => this.getSequence(numOpsPerThread, ids)),
      order: []
    });

    debug(`generated program: %s`, program);
    return program;
  }

  getSequence(numInvocations, ids) {
    return {
      index: ids.sequence++,
      invocations: [...Array(numInvocations)].map(_ => this.getInvocation(ids))
    };
  }

  getInvocation(ids) {
    let method = this.dice.any(this.spec.methods);
    return {
      id: ids.invocation++,
      method,
      arguments: method.parameters.map(p => this.getValue(p.type))
    };
  }

  getValue(type) {
    let value;
    let n = this.limits.values;

    if (isIntAssignable(type))
      value = this.dice.range(0, n);

    else if (Array.isArray(type) && type.length == 1 && isIntAssignable(type[0]))
      value = [this.dice.range(0,n), this.dice.range(0,n)];

    else if (type && Object.keys(type).length == 1 && isIntAssignable(type[Object.keys(type)[0]]))
      value =  this.dice.distinct(2, 0, n).reduce((m,k) => Object.assign({}, m, {[k]: this.dice.range(0,n)}), {});

    else
      throw new Error(`Unexpected type: ${type}`);

    trace(`generated value %s for type %s`, value, type);
    return value;
  }
}

function isIntAssignable(type) {
  return ["int", "java.lang.Integer", "java.lang.Object"].includes(type);
}

module.exports = {
  RandomProgramGenerator
}
