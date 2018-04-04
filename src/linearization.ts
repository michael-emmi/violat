import * as assert from 'assert';
import * as Debug from 'debug';
const debug = Debug('linearization');
const detail = Debug('linearization:detail');

import { PartialOrder } from './partial-order';
import { RELATIONS, COMPOSITIONS, Consistency } from './consistency';

class Linearization {
  sequence: any[];
  consistency: Consistency;

  constructor({sequence, consistency}) {
    this.sequence = [].concat(sequence);
    this.consistency = consistency;
  }

  toString() {
    return `[${this.sequence.join('; ')}] : ${this.consistency}`;
  }

  static * enumerate(program, weak, relax) {
    debug(`generating linearizations`);
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
      detail(`generated %s`, lin);
      yield lin;
    }

    debug(`generated ${count} linearizations`);
  }
}

export function * linearizations(program, args) {
  for (let lin of Linearization.enumerate(program, args.weak, args.weakRelaxLinearization))
    yield lin;
}
