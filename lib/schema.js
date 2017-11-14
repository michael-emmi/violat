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
    let id = this.index != null ? `#${this.index}` : '';
    return `${name}(${args})${id}`;
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

  static fromString(string, specJson) {
    debug(`parsing schema: %s`, string);
    let spec = JSON.parse(specJson);
    let json = string
      .replace(/\{([^}]*)\}/g, '{ "invocations": [ $1 ] }')
      .replace(/;|(\|\|)/g, ',')
      .replace(/(\w+)\(([^)]*)\)/g, '{ "method": { "name": "$1" }, "arguments": [ $2 ] }');
    let obj = JSON.parse(`{ "class": "${spec.class}", "parameters": [], "sequences": [ ${json} ], "order": [] }`);
    obj.sequences.forEach((seq,idx) => {
      seq.index = idx + 1;
      seq.invocations.forEach(inv => {
        let method = spec.methods.find(m => m.name === inv.method.name);
        Object.assign(inv.method, method);
      });
    });
    debug(obj);
    let schema = new Schema(obj);
    debug(`fromString(%s) = %s`, string, schema);
    return schema;
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
