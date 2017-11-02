const debug = require('debug')('schema');
const assert = require('assert');

class Invocation {
  constructor(that) {
    Object.assign(this, that);
  }

  static fromJson(json) {
    return new Invocation(JSON.parse(json));
  }

  toString() {
    return `${this.method.name}(${this.arguments.join(',')})`;
  }
}

class Schema {
  constructor(that) {
    Object.assign(this, that);
    for (let seq of this.sequences)
      seq.invocations = seq.invocations.map(i => new Invocation(i));
  }

  static fromJson(json) {
    return new Schema(JSON.parse(json));
  }
}

module.exports = {
  Invocation,
  Schema
};
