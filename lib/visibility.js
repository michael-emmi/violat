const debug = require('debug')('visibility');
const assert = require('assert');

const Properties = require('./outcome-properties.js');

class Visibility {
  constructor(relation, properties) {
    this.relation = new Map();
    for (let [k,vs] of relation)
      this.relation.set(k, new Set(vs));
    this.properties = properties.clone();
  }

  static minimum(invocation, linearization, programOrder) {
    let visible = new Set();

    // include self
    visible.add(invocation);

    // include the program order
    for (let pred of programOrder.before(invocation))
      visible.add(pred);

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

  static basis(linearization, programOrder) {
    return new Visibility(
      linearization.sequence.map(i => [i,Visibility.minimum(i,linearization,programOrder)]),
      Properties.empty());
  }

  extend(pairs, properties) {
    let that = new Visibility(this.relation, this.properties);
    for (let [target, source] of pairs)
      that.relation.get(source).add(target);
    that.properties.merge(properties);
    return that;
  }

  isVisible(target, source) {
    return this.relation.get(source).has(target);
  }

  toString() {
    let lines = [];
    lines.push("visibility {");
    for (let [i,js] of this.relation.entries())
      lines.push(`  ${this.i2s(i)} sees ${Array.from(js.values()).map(this.i2s).join(", ")}`);
    for (let prop of this.properties.get())
      lines.push(`(${prop})`);
    lines.push("}");
    return lines.join("\n");
  }

  i2s(i) {
    return `${i.index}:${i.method.name}`
  }
}


module.exports = function(programOrder, linearization, args) {
  assert.ok(!args.weakRelaxVisibility, "TODO: implement visibility relaxation");
  debug(`computing visibilities for ${linearization}`);
  debug(`weak: ${args.weak}`);

  let basis = Visibility.basis(linearization, programOrder);
  debug(`visibility basis: ${basis}`);

  let visibilities = [];
  let predecessors = [];

  visibilities.push(basis);

  for (let invocation of linearization.sequence) {
    debug(`processing invocation:`);
    debug(invocation);

    for (let predecessor of predecessors) {
      let workList = visibilities;
      visibilities = [];

      debug(`considering predecessor:`);
      debug(predecessor);

      while (workList.length) {
        let viz = workList.shift();

        debug(`extending visibility:`);
        debug(viz);

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
          visibilities.push(viz.extend([], Properties.unit('weak-visibility')));
        }

        debug(`considering visible predecessor`);
        visibilities.push(viz.extend([[predecessor, invocation]], Properties.empty()));
      }
    }
    predecessors.push(invocation);
  }

  debug(`computed ${visibilities.length} visibilities`);
  return visibilities;
}
