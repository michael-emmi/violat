const debug = require('debug')('visibility');
const detail = require('debug')('visibility:detail');
const assert = require('assert');

const PartialOrder = require('./partial-order');
const { RELATIONS, COMPOSITIONS, Consistency } = require('./consistency');

class Visibility {
  constructor(args) {
    assert.ok(args.consistency);
    Object.assign(this, args, {
      relation: new Map([...args.relation].map(([k,vs]) => [k, new Set(vs)]))
    });
  }

  toString() {
    let entries = [...this.relation.entries()]
      .map(([i,preds]) => `${i} > {${[...preds].join(', ')}}`)
      .join('; ');
    return `{ ${entries} } : ${this.consistency}`;
  }

  // // XXX depricated
  // static minimum(invocation, linearization, programOrder, relax) {
  //   let visible = new Set();
  //
  //   if (invocation.atomic || !relax) {
  //     // include the program order
  //     for (let pred of programOrder.before(invocation)) {
  //       if (linearization.sequence.indexOf(pred) <
  //           linearization.sequence.indexOf(invocation)) {
  //         if (pred.atomic || !relax) {
  //           visible.add(pred);
  //         }
  //       }
  //     }
  //   }
  //
  //   if (invocation.atomic) {
  //     // include atomic operations linearized before
  //     for (let pred of linearization.sequence) {
  //       if (pred == invocation)
  //         break;
  //       if (pred.atomic)
  //         visible.add(pred);
  //     }
  //   }
  //   return Array.from(visible);
  // }
  //
  // // XXX depricated
  // static basis(linearization, programOrder, relax) {
  //   assert(linearization.consistency);
  //   return new Visibility({
  //     relation: linearization.sequence.map(i => [i,Visibility.minimum(i,linearization,programOrder,relax)]),
  //     consistency: linearization.consistency
  //   });
  // }
  //
  // // XXX depricated
  // extend(pairs) {
  //   let that = new Visibility({
  //     relation: this.relation,
  //     consistency: this.consistency
  //   });
  //   for (let [target, source] of pairs)
  //     that.relation.get(source).add(target);
  //   return that;
  // }

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

// // XXX depricated
// function oldVisibility(programOrder, linearization, args) {
//   debug(`computing visibilities for %s`, linearization);
//   debug(`weak: ${args.weak}`);
//   debug(`relax: ${args.weakRelaxVisibility}`);
//
//   let basis = Visibility.basis(linearization, programOrder, args.weakRelaxVisibility);
//   detail(`visibility basis %s`, basis);
//
//   let visibilities = [];
//   let predecessors = [];
//
//   visibilities.push(basis);
//
//   for (let invocation of linearization.sequence) {
//     detail(`processing invocation %s`, invocation);
//
//     for (let predecessor of predecessors) {
//       let workList = visibilities;
//       visibilities = [];
//
//       detail(`considering predecessor %s`, predecessor);
//
//       while (workList.length) {
//         let viz = workList.shift();
//
//         detail(`extending visibility %s`, viz);
//
//         if (viz.isVisible(predecessor, invocation)) {
//           detail(`predecessor already visible; skipping`);
//           visibilities.push(viz);
//           continue;
//         }
//
//         if (programOrder.isBefore(invocation, predecessor)) {
//           detail(`invocation precedes predecessor; skipping`);
//           visibilities.push(viz);
//           continue;
//         }
//
//         if (args.weak && !(invocation.atomic && predecessor.atomic)) {
//           detail(`considering invisible predecessor`);
//           visibilities.push(viz.extend([]));
//         }
//
//         detail(`considering visible predecessor`);
//         visibilities.push(viz.extend([[predecessor, invocation]]));
//       }
//     }
//     predecessors.push(invocation);
//   }
//
//   debug(`computed ${visibilities.length} visibilities`);
//
//   let lin = PartialOrder.from(linearization.sequence);
//   for (let viz of visibilities) {
//     viz.consistency = viz.consistency.weakenRelationalLevelAll(
//       RELATIONS.visibility, RELATIONS.linearization, viz, lin);
//     viz.consistency = viz.consistency.weakenRelationalLevelAll(
//       RELATIONS.visibility, RELATIONS.programorder, viz, programOrder);
//     viz.consistency = viz.consistency.weakenRelationalLevelAll(
//       RELATIONS.visibility, RELATIONS.visibility, viz, viz);
//   }
//
//   debug(`computed ${visibilities.length} consistencies`);
//   if (detail.enabled)
//     for (let viz of visibilities)
//       detail(`%s`, viz);
//
//   return visibilities;
// }

module.exports = function*(program, linearization, args) {
  // return oldVisibility(program, linearization, args);
  for (let viz of Visibility.enumerate(program, linearization, args.weak, args.weakRelaxVisibility))
    yield viz;
}
