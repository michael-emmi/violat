const debug = require('debug')('dice');
const assert = require('assert');
const seedrandom = require('seedrandom');

class Dice {
  constructor(seed) {
    this.random = seedrandom(seed || 'anticonstitutionnellement');
  }

  range(min, limit) {
    assert.ok(min <= limit);
    return Math.floor(this.random() * (limit-min)) + min;
  }

  coin() {
    return Math.floor(this.random() * 2) == 0;
  }

  distinct(n, min, max) {
    assert.ok(max - min >= n, `cannot generate ${n} distinct values from ${min} to ${max}`);
    let ary = [];
    while (ary.length < n) {
      let k = this.range(min, max);
      if (!ary.includes(k))
        ary.push(k);
    }
    return ary;
  }

  any(ary) {
    return ary[this.range(0, ary.length)];
  }
}

module.exports = {
  Dice
}
