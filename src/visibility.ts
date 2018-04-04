import * as assert from 'assert';
import * as Debug from 'debug';
const debug = Debug('visibility');
const detail = Debug('visibility:detail');

import { PartialOrder } from './partial-order';
import { RELATIONS, COMPOSITIONS, Consistency } from './consistency';

class Visibility {
  program: PartialOrder<any>;
  linearization: any;
  relation: Map<any,any>;
  excluded: any[];
  consistency: Consistency;

  constructor(args) {
    assert.ok(args.consistency);
    Object.assign(this, args, {
      relation: new Map([...args.relation].map(([k,vs]) => [k, new Set(vs)]) as Iterable<any>)
    });
  }

  toString() {
    let entries = [...this.relation.entries()]
      .map(([i,preds]) => `${i} > {${[...preds].join(', ')}}`)
      .join('; ');
    return `{ ${entries} } : ${this.consistency}`;
  }

  values() {
    return Array.from(this.relation.keys());
  }

  before(node) {
    return Array.from(this.relation.get(node));
  }

  isBefore(n1, n2) {
    return this.relation.get(n2).has(n1);
  }

  isVisible(target, source) {
    return this.relation.get(source).has(target);
  }

  isComplete() {
    return this.excluded.length === 0;
  }

  weaken(inv1, inv2, weak, relax) {
    if (!this.isBefore(inv1, inv2))
      return undefined;

    detail(`trying to weaken %s < %s`, inv1, inv2);

    if (!weak)
      return undefined;

    if (inv1.atomic && inv2.atomic)
      return undefined;

    if (!relax && this.program.isBefore(inv1, inv2))
      return undefined;

    let that = new Visibility({
      relation: [...this.relation].map(([k,vs]) =>
        (k === inv2)
          ? [k, new Set([...vs].filter(v => v !== inv1))]
          : [k, vs]
      ),
      consistency: this.consistency,
      excluded: [...this.excluded, [inv1, inv2]],
      program: this.program,
      linearization: this.linearization
    });

    return that;
  }

  finalize() {
    assert.ok(this.excluded);
    let that = new Visibility(this);
    for (let [i1,i2] of that.excluded) {
      that.consistency = that.consistency
        .weakenRelationalLevel(
          RELATIONS.visibility, RELATIONS.programorder,
          this, this.program, i1, i2)
        .weakenRelationalLevel(
          RELATIONS.visibility, RELATIONS.linearization,
          this, this.linearization, i1, i2)
        .weakenRelationalLevel(
          RELATIONS.visibility, RELATIONS.visibility,
          this, this, i1, i2);
    }
    that.excluded = undefined;
    return that;
  }

  static full(program, linearization) {
    let relation = [];
    let preds = [];
    for (let i of linearization.sequence) {
      relation.push([i, preds.filter(p => !program.isBefore(i,p))]);
      preds.push(i);
    }

    return new Visibility({
      relation: relation,
      consistency: linearization.consistency,
      excluded: [],
      program: program,
      linearization: PartialOrder.from(linearization.sequence)
    });
  }

  static * enumerate(program, linearization, weak, relax) {
    debug(`generating visibilities`);
    debug(`program order: %s`, program);
    debug(`linearization: %s`, linearization);
    debug(`weak: ${weak}`);
    debug(`relax: ${relax}`);

    let invocations = linearization.sequence;
    let predecessors = [];
    let visibilities = [];

    let complete = Visibility.full(program, linearization);
    visibilities.push(complete);

    let result = complete.finalize();
    detail(`generated complete visibility: %s`, result);
    yield result;

    for (let invocation of invocations) {
      for (let predecessor of predecessors) {
        let worklist = visibilities;
        visibilities = [];

        while (worklist.length) {
          let viz = worklist.shift();
          let weaker = viz.weaken(predecessor, invocation, weak, relax);
          if (weaker) {
            visibilities.push(weaker);
            let result = weaker.finalize();
            detail(`generated weak visibility: %s`, result);
            yield result;
          }
          visibilities.push(viz);
        }
      }
      predecessors.push(invocation);
    }

    debug(`generated ${visibilities.length} visibilities`);
  }
}

export function * visibilities(program, linearization, args) {
  for (let viz of Visibility.enumerate(program, linearization, args.weak, args.weakRelaxVisibility))
    yield viz;
}
