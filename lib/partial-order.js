const assert = require('assert');
const debug = require('debug')('partialorder');
const detail = require('debug')('partialorder:detail');
const trace = require('debug')('partialorder:trace');

class PartialOrder {
  constructor() {
    this.basis = new Map();
    this.closure = new Map();
  }

  static from(iterable) {
    let that = new PartialOrder();
    let last;
    for (let item of iterable) {
      that.add(item);
      if (last)
        that.sequence(last, item);
      last = item;
    }
    trace(`from( %s ) = %s`, iterable.join('; '), that);
    return that;
  }

  toString() {
    return `{ ${[...this.closure.entries()].map(([n,preds]) => `${n} > {${[...preds].join(', ')}}`).join('; ')} }`;
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
    let predsOfNode = this.basis.get(node);

    for (let [succ,preds] of this.basis.entries()) {
      if (succ != node) {
        that.add(succ);
        for (let pred of preds)
          if (pred === node)
            this.basis.get(node).forEach(pp => that.sequence(pp, succ));
          else
            that.sequence(pred, succ);
      }
    }
    return that;
  }

  before(node) {
    let result = Array.from(this.closure.get(node));
    trace(`%s.before(%s) = { %s }`, this, node, result.join(', '));
    return result;
  }

  isBefore(n1, n2) {
    let result = this.closure.get(n2).has(n1);
    trace(`%s.isBefore(%s, %s) = %s`, this, n1, n2, result);
    return result;
  }

  values() {
    return Array.from(this.basis.keys());
  }

  minimals() {
    return this.values().filter(n => this.basis.get(n).size == 0);
  }

  * linearizations() {
    let count = 0;
    let workList = [];
    workList.push([[], this]);
    while (workList.length) {
      let [seq, po] = workList.pop();

      if (po.values().length) {
        detail(`partial linearization %s with remainder %s`, seq, po);
        for (let min of po.minimals())
          workList.push([seq.concat(min), po.drop(min)]);

      } else {
        detail(`generated %s`, seq);
        count++;
        yield seq;
      }
    }
    debug(`generated ${count} linearizations`);
  }
}

module.exports = PartialOrder;
