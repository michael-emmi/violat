const assert = require('assert');
const debug = require('debug')('partialorder');

class PartialOrder {
  constructor() {
    this.basis = new Map();
    this.closure = new Map();
  }

  add(n) {
    this.basis.has(n) || this.basis.set(n, new Set());
    this.closure.has(n) || this.closure.set(n, new Set());
  }

  sequence(n1, n2) {
    this.add(n1);
    this.add(n2);
    this.basis.get(n2).add(n1);

    let before = Array.from(this.closure.get(n1));
    let after = Array.from(this.closure.entries())
      .filter(([_,ns]) => ns.has(n2)).map(([n,_]) => n);
    before.push(n1)
    after.push(n2);

    for (let succ of after)
      for (let pred of before)
        this.closure.get(succ).add(pred);
  }

  drop(node) {
    let that = new PartialOrder();
    for (let [succ,preds] of this.basis.entries()) {
      if (succ != node) {
        that.add(succ);
        for (let pred of preds)
          if (pred != node)
            that.sequence(pred, succ);
      }
    }
    return that;
  }

  before(node) {
    return Array.from(this.closure.get(node));
  }

  isBefore(n1, n2) {
    return this.closure.get(n2).has(n1);
  }

  values() {
    return Array.from(this.basis.keys());
  }

  minimals() {
    return this.values().filter(n => this.basis.get(n).size == 0);
  }

  linearizations() {
    let linearizations = [];
    let workList = [];
    workList.push([[], this]);
    while (workList.length) {
      let [seq, po] = workList.shift();
      debug(`partial linearization`);
      debug(seq);
      debug(`remainder`);
      debug(po);
      if (po.values().length)
        for (let min of po.minimals())
          workList.push([seq.concat(min), po.drop(min)]);
      else
        linearizations.push(seq);
    }
    return linearizations;
  }

  toString() {
    let lines = [];
    lines.push("partial order {");
    for (let [node, preds] of this.basis.entries())
      lines.push(`  ${node} > {${Array.from(preds).join(', ')}}`);
    lines.push("}");
    return lines.join('\n');
  }
}

module.exports = PartialOrder;
