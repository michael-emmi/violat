const debug = require('debug')('linearization');
const detail = require('debug')('linearization:detail');
const assert = require('assert');

const PartialOrder = require('./partial-order');
const { RELATIONS, COMPOSITIONS, Consistency } = require('./consistency');

class Linearization {
  constructor({sequence, consistency}) {
    this.sequence = [].concat(sequence);
    this.consistency = consistency;
  }

  toString() {
    return `[${this.sequence.join('; ')}] : ${this.consistency}`;
  }

  static * enumerate(program, weak, relax) {
    debug(`computing linearizations`);
    debug(`program order: %s`, program);
    debug(`weak: ${weak}`);
    debug(`relax: ${relax}`);

    let po = program;

    if (relax) {
      for (let invocation of po.values()) {
        if (!invocation.atomic) {
          po = po.drop(invocation);
          po.add(invocation);
        }
      }
      debug(`using relaxed program order %s`, po);
    }

    let count = 0;

    for (let seq of po.linearizations()) {
      let linOrd = PartialOrder.from(seq);
      let consistency = Consistency.top().weakenRelationalLevelAll(
        RELATIONS.linearization, RELATIONS.programorder, linOrd, program);

      let lin = new Linearization({
        sequence: seq,
        consistency: consistency
      });
      count++;
      detail(`computed %s`, lin);
      yield lin;
    }

    debug(`computed ${count} linearizations`);
  }
}

module.exports = function*(program, args) {
  for (let lin of Linearization.enumerate(program, args.weak, args.weakRelaxLinearization))
    yield lin;
}
