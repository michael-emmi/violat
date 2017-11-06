const debug = require('debug')('visibility');
const detail = require('debug')('visibility:detail');
const assert = require('assert');

const PartialOrder = require('./partial-order');
const { RELATIONS, COMPOSITIONS, Consistency } = require('./consistency');

class Visibility {
  constructor({relation, consistency, complete}) {
    assert.ok(consistency);
    this.relation = new Map();
    for (let [k,vs] of relation)
      this.relation.set(k, new Set(vs));
    this.consistency = consistency;
    this.complete = undefined; // TODO optimize me
  }

  toString() {
    return `{ ${[...this.relation.entries()].map(([i,preds]) => `${i} > {${[...preds].join(', ')}}`).join('; ')} }`;
  }

  // XXX depricated
  static minimum(invocation, linearization, programOrder, relax) {
    let visible = new Set();

    if (invocation.atomic || !relax) {
      // include the program order
      for (let pred of programOrder.before(invocation)) {
        if (linearization.sequence.indexOf(pred) <
            linearization.sequence.indexOf(invocation)) {
          if (pred.atomic || !relax) {
            visible.add(pred);
          }
        }
      }
    }

    if (invocation.atomic) {
      // include atomic operations linearized before
      for (let pred of linearization.sequence) {
        if (pred == invocation)
          break;
        if (pred.atomic)
          visible.add(pred);
      }
    }
    return Array.from(visible);
  }

  // XXX depricated
  static basis(linearization, programOrder, relax) {
    assert(linearization.consistency);
    return new Visibility({
      relation: linearization.sequence.map(i => [i,Visibility.minimum(i,linearization,programOrder,relax)]),
      consistency: linearization.consistency
    });
  }

  // XXX depricated
  extend(pairs) {
    let that = new Visibility({
      relation: this.relation,
      consistency: this.consistency
    });
    for (let [target, source] of pairs)
      that.relation.get(source).add(target);
    return that;
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

  weaken(inv1, inv2, program, lin, weak, relax) {
    if (!this.isBefore(inv1, inv2))
      return undefined;

    detail(`trying to weaken %s < %s`, inv1, inv2);

    if (!weak)
      return undefined;

    if (inv1.atomic && inv2.atomic)
      return undefined;

    let pord = program.isBefore(inv1, inv2);
    let lord = lin.isBefore(inv1, inv2);

    if (!relax && pord)
      return undefined;

    let consistency = this.consistency;

    if (pord)
      consistency = consistency.weakenRelationalLevel(
          RELATIONS.visibility, RELATIONS.programorder,
          this, program, inv1, inv2);

    if (lord)
      consistency = consistency.weakenRelationalLevel(
        RELATIONS.visibility, RELATIONS.linearization,
        this, lin, inv1, inv2);

    return new Visibility({
      relation: [...this.relation].map(([k,vs]) =>
        (k === inv2)
          ? [k, new Set([...vs].filter(v => v !== inv1))]
          : [k, vs]
      ),
      consistency: consistency,
      complete: false
    });
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
      complete: true
    });
  }

  static enumerate(program, linearization, weak, relax) {
    debug(`computing visibilities`);
    debug(`program order: %s`, program);
    debug(`linearization: %s`, linearization);
    debug(`weak: ${weak}`);
    debug(`relax: ${relax}`);

    let lin = PartialOrder.from(linearization.sequence);
    let invocations = linearization.sequence;
    let predecessors = [];
    let visibilities = [];

    let complete = Visibility.full(program, linearization)
    detail(`complete visibility: %s`, complete);

    visibilities.push(complete);

    for (let invocation of invocations) {
      for (let predecessor of predecessors) {
        let worklist = visibilities;
        visibilities = [];

        while (worklist.length) {
          let viz = worklist.shift();
          let weaker = viz.weaken(predecessor, invocation, program, lin, weak, relax);
          if (weaker) {
            detail(`weakened visibility: %s`, weaker);
            visibilities.push(weaker);
          }
          visibilities.push(viz);
        }
      }
      predecessors.push(invocation);
    }

    debug(`computed ${visibilities.length} visibilities`);
    for (let viz of detail.enabled ? visibilities : [])
      detail(`${viz}`);
    return visibilities;
  }
}

function oldVisibility(programOrder, linearization, args) {
  debug(`computing visibilities for %s`, linearization);
  debug(`weak: ${args.weak}`);
  debug(`relax: ${args.weakRelaxVisibility}`);

  let basis = Visibility.basis(linearization, programOrder, args.weakRelaxVisibility);
  detail(`visibility basis %s`, basis);

  let visibilities = [];
  let predecessors = [];

  visibilities.push(basis);

  for (let invocation of linearization.sequence) {
    detail(`processing invocation %s`, invocation);

    for (let predecessor of predecessors) {
      let workList = visibilities;
      visibilities = [];

      detail(`considering predecessor %s`, predecessor);

      while (workList.length) {
        let viz = workList.shift();

        detail(`extending visibility %s`, viz);

        if (viz.isVisible(predecessor, invocation)) {
          detail(`predecessor already visible; skipping`);
          visibilities.push(viz);
          continue;
        }

        if (programOrder.isBefore(invocation, predecessor)) {
          detail(`invocation precedes predecessor; skipping`);
          visibilities.push(viz);
          continue;
        }

        if (args.weak && !(invocation.atomic && predecessor.atomic)) {
          detail(`considering invisible predecessor`);
          visibilities.push(viz.extend([]));
        }

        detail(`considering visible predecessor`);
        visibilities.push(viz.extend([[predecessor, invocation]]));
      }
    }
    predecessors.push(invocation);
  }

  debug(`computed ${visibilities.length} visibilities`);

  let lin = PartialOrder.from(linearization.sequence);
  for (let viz of visibilities) {
    viz.consistency = viz.consistency.weakenRelationalLevelAll(
      RELATIONS.visibility, RELATIONS.linearization, viz, lin);
    viz.consistency = viz.consistency.weakenRelationalLevelAll(
      RELATIONS.visibility, RELATIONS.programorder, viz, programOrder);
    viz.consistency = viz.consistency.weakenRelationalLevelAll(
      RELATIONS.visibility, RELATIONS.visibility, viz, viz);
  }

  debug(`computed ${visibilities.length} consistencies`);
  if (detail.enabled)
    for (let viz of visibilities)
      detail(`%s`, viz);

  return visibilities;
}

module.exports = function(program, linearization, args) {
  return oldVisibility(program, linearization, args);
  // return Visibility.enumerate(program, linearization, args.weak, args.weakRelaxVisibility);
}
