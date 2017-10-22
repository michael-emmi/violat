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
  debug(`weak: ${args.weak}`);
  debug(`relax: ${args.weakRelaxLinearization}`);

  let po = program;

  if (args.weakRelaxLinearization) {
    for (let invocation of po.values()) {
      if (!invocation.atomic) {
        po = po.drop(invocation);
        po.add(invocation);
      }
    }
    debug(`using relaxed program order`);
    debug(po);
  }

  let sequences = po.linearizations();

  debug(`computed ${sequences.length} linearizations`);
  return sequences.map(sequence => {
    let properties = Properties.empty();

    let relaxed = program.values()
      .some(i => program.before(i)
      .some(j => sequence.indexOf(i) < sequence.indexOf(j)));

    if (relaxed)
      properties.add('relaxed-linearization');

    return new Linearization(sequence, properties);
  });
}
