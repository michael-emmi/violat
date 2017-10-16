const debug = require('debug')('linearization');
const assert = require('assert');

const Properties = require('./outcome-properties.js');

class Linearization {
  constructor(sequence, properties) {
    this.sequence = [].concat(sequence);
    this.properties = properties;
  }

  toString() {
    return `linearization { ${this.sequence.map(this.i2s).join("; ")} }`;
  }

  i2s(i) {
    return `${i.index}:${i.method.name}`
  }
}

module.exports = function(program, args) {
  debug(`computing linearizations from program order`);
  debug(program);

  if (args.weakRelaxLinearization) {
    for (let invocation of program.values()) {
      if (!invocation.atomic) {
        program = program.drop(invocation);
        program.add(invocation);
      }
    }
    debug(`using relaxed program order`);
    debug(program);
  }

  let sequences = program.linearizations();

  debug(`computed ${sequences.length} linearizations`);
  return sequences.map(sequence => {
    return new Linearization(sequence, Properties.empty());
  });
}
