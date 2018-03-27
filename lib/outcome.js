const debug = require('debug')('outcome');
const assert = require('assert');

const { Consistency } = require('../lib/consistency');

class Outcome {
  constructor(that) {
    Object.assign(this, that);
  }

  isAtomic() {
    return this.consistency && !this.consistency.isWeak();
  }

  isWeak() {
    return this.consistency && this.consistency.isWeak();
  }

  hasBottom() {
    return this.consistency.hasBottom();
  }

  isIncosistent() {
    return !this.consistency;
  }

  values() {
    return Object.values(this.results);
  }

  toString() {
    let kind =
      this.isIncosistent() ? 'inconsistent'
      : this.isWeak() ? `${this.consistency}`
      : 'atomic';

    return `outcome [${this.valueString()}] (${kind}, frequency: ${this.count || 0})`;
  }

  valueString() {
    let values = this.values().map(v => v === undefined ? "_" : v);
    return values.join(', ');
  }

  static empty(consistency) {
    return new Outcome({results: {}, consistency: consistency});
  }

  consistent(that) {
    return Object.keys(this.results)
      .filter(k => Object.keys(that.results).includes(k))
      .every(k => this.results[k] == that.results[k]);
  }

  mergeResults(results) {
    return new Outcome({
      results: Object.assign({}, results, this.results),
      consistency: this.consistency
    });
  }

  observe(count) {
    return new Outcome({
      results: this.results,
      consistency: this.consistency,
      count: (this.count || 0) + count
    });
  }

  static partition(outcomes) {
    let groups = {};
    for (let outcome of outcomes) {
      let key = Object.values(outcome.results).join(",");
      groups[key] || (groups[key] = []);
      groups[key].push(outcome);
    }
    return groups;
  }

  static maximals(outcomes) {
    debug(`computing maximals of ${outcomes.length} outcomes`);
    let groups = Outcome.partition(outcomes);
    let merged = Object.values(groups).map(outcomes => {
      let results = outcomes[0].results;
      let maxs = Consistency.join(...outcomes.map(o => o.consistency));
      return new Outcome({
        results: results,
        consistency: maxs
      });
    });
    debug(`got ${merged.length} merged outcomes`);
    return merged;
  }

  getResults() {
    return results;
  }
}

module.exports = Outcome;
