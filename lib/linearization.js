const debug = require('debug')('linearization');
const assert = require('assert');

const PartialOrder = require('./partial-order');
const { RELATIONS, COMPOSITIONS, Consistency } = require('./consistency');

class Linearization {
  constructor(sequence, consistency) {
    this.sequence = [].concat(sequence);
    this.consistency = consistency;
  }

  toString() {
    return `${this.sequence.join('; ')}`;
  }
}

module.exports = function(program, args) {
  debug(`computing linearizations from program order %s`, program);
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
    debug(`using relaxed program order %s`, po);
  }

  let sequences = po.linearizations();

  debug(`computed ${sequences.length} linearizations`);
  let linearizations = sequences.map(sequence => {
    let lin = PartialOrder.from(sequence);
    let consistency = Consistency.top().weakenRelationalLevelAll(
      RELATIONS.linearization, RELATIONS.programorder, lin, program);
    return new Linearization(sequence, consistency);
  });
  debug(`computed ${linearizations.length} consistencies`);
  return linearizations;
}
