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
    debug(`computing minimals of:`);
    debug(pss);
    let workList = Array.from(pss);
    let minimals = [];

    while (workList.length) {
      let ps = workList.shift();
      if (minimals.some(m => ps.includesAll(m)))
        continue;
      if (workList.some(m => ps.includesAll(m)))
        continue;
      minimals.push(ps);
    }
    debug(`got minimals:`);
    debug(minimals);
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
    return this.keys.size < 1;
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
}

module.exports = Properties;
