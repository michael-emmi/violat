const debug = require('debug')('outcome-properties');
const assert = require('assert');

class Properties {
  constructor(keys) {
    this.keys = new Set(keys);
  }

  static empty() {
    return new Properties([]);
  }

  static unit(key) {
    return new Properties([key]);
  }

  static minimals(pss) {
    let minimals = [];
    for (let ps of pss) {
      let mindex = minimals.findIndex(m => ps.includesAll(m));
      if (mindex < 0) {
        let sindex = minimals.findIndex(m => m.includesAll(ps));
        if (sindex < 0) {
          minimals.push(ps);
        } else {
          minimals.splice(mindex, 1, ps);
        }
      }
    }
    return minimals;
  }

  add(key) {
    this.keys.add(key);
  }

  merge(that) {
    for (let key of that.get())
      this.add(key);
  }

  clone() {
    return new Properties(this.keys);
  }

  isEmpty() {
    return this.keys.size() < 1;
  }

  get() {
    return Array.from(this.keys.keys());
  }

  includesAll(that) {
    return that.get().every(key => this.get().includes(key));
  }

  join(that) {
    return new Properties([].concat(this.get(), that.get()));
  }

  toString() {
    return `{${this.get().join(", ")}}`;
  }
}

module.exports = Properties;
