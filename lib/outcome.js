const debug = require('debug')('outcome');
const assert = require('assert');

const { Consistency } = require('../lib/consistency');

class Outcome {
  constructor(results, consistency) {
    this.results = Object.assign({}, results);
    this.consistency = consistency;
  }

  isWeak() {
    return [].concat(this.consistency).some(c => c.isWeak());
  }

  hasBottom() {
    return [].concat(this.consistency).some(c => c.hasBottom());
  }

  values() {
    return Object.values(this.results);
  }

  toString() {
    return `${this.isWeak() ? `${this.consistency}` : `atomic`} outcome ${Object.values(this.results).join(',')}`;
  }

  static empty(consistency) {
    return Outcome.results({}, consistency);
  }

  static results(results, consistency) {
    return new Outcome(results, consistency);
  }

  consistent(that) {
    return Object.keys(this.results)
      .filter(k => Object.keys(that.results).includes(k))
      .every(k => this.results[k] == that.results[k]);
  }

  merge(that) {
    let results = Object.assign({}, that.results, this.results);
    return new Outcome(results, this.consistency);
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
    debug(`computing maximals of: %O`, outcomes);
    let groups = Outcome.partition(outcomes);
    debug(`got groups: %O`, groups);
    let merged = Object.values(groups).map(outcomes => {
      let results = outcomes[0].results;
      let maxs = Consistency.join(...outcomes.map(o => o.consistency));
      return new Outcome(results, maxs);
    });
    debug(`got merged: %O`, merged);
    return merged;
  }

  getResults() {
    return results;
  }
}

module.exports = Outcome;
