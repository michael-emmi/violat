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
    let name = this.method && this.method.name || this.id || '?';
    let args = this.arguments ? this.arguments.join(',') : '...';
    return `${name}(${args})`;
  }
}

class Schema {
  constructor(that) {
    Object.assign(this, that);
    for (let seq of this.sequences || [])
      seq.invocations = seq.invocations.map(i => new Invocation(i));
  }

  static fromJson(json) {
    return new Schema(JSON.parse(json));
  }

  toString() {
    assert.equal(this.order.length, 0);
    return `${this.sequences.map(s => `{ ${s.invocations.join('; ')} }`).join(' || ')}`;
  }
}

module.exports = {
  Invocation,
  Schema
};
