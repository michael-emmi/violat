const debug = require('debug')('visibility');
const assert = require('assert');

const PartialOrder = require('./partial-order');
const { RELATIONS, COMPOSITIONS, Consistency } = require('./consistency');

class Visibility {
  constructor(relation, consistency) {
    assert.ok(consistency);
    this.relation = new Map();
    for (let [k,vs] of relation)
      this.relation.set(k, new Set(vs));
    this.consistency = consistency;
  }

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

  static basis(linearization, programOrder, relax) {
    assert(linearization.consistency);
    return new Visibility(
      linearization.sequence.map(i => [i,Visibility.minimum(i,linearization,programOrder,relax)]),
      linearization.consistency);
  }

  extend(pairs) {
    let that = new Visibility(this.relation, this.consistency);
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
}


module.exports = function(programOrder, linearization, args) {
  debug(`computing visibilities for %O`, linearization);
  debug(`weak: ${args.weak}`);
  debug(`relax: ${args.weakRelaxVisibility}`);

  let basis = Visibility.basis(linearization, programOrder, args.weakRelaxVisibility);
  debug(`visibility basis %O`, basis);

  let visibilities = [];
  let predecessors = [];

  visibilities.push(basis);

  for (let invocation of linearization.sequence) {
    debug(`processing invocation %O`, invocation);

    for (let predecessor of predecessors) {
      let workList = visibilities;
      visibilities = [];

      debug(`considering predecessor %O`, predecessor);

      while (workList.length) {
        let viz = workList.shift();

        debug(`extending visibility %O`, viz);

        if (viz.isVisible(predecessor, invocation)) {
          debug(`predecessor already visible; skipping`);
          visibilities.push(viz);
          continue;
        }

        if (programOrder.isBefore(invocation, predecessor)) {
          debug(`invocation precedes predecessor; skipping`);
          visibilities.push(viz);
          continue;
        }

        if (args.weak && !(invocation.atomic && predecessor.atomic)) {
          debug(`considering invisible predecessor`);
          visibilities.push(viz.extend([]));
        }

        debug(`considering visible predecessor`);
        visibilities.push(viz.extend([[predecessor, invocation]]));
      }
    }
    predecessors.push(invocation);
  }

  let lin = PartialOrder.from(linearization.sequence);
  for (let viz of visibilities) {
    viz.consistency = viz.consistency.weakenRelationalLevelAll(
      RELATIONS.visibility, RELATIONS.linearization, viz, lin);
    viz.consistency = viz.consistency.weakenRelationalLevelAll(
      RELATIONS.visibility, RELATIONS.programorder, viz, programOrder);
    viz.consistency = viz.consistency.weakenRelationalLevelAll(
      RELATIONS.visibility, RELATIONS.visibility, viz, viz);
  }

  debug(`computed ${visibilities.length} visibilities`);
  return visibilities;
}
