const debug = require('debug')('outcome');
const assert = require('assert');

const Properties = require('./outcome-properties.js');

class Outcome {
  constructor(results, properties) {
    this.results = Object.assign({}, results);
    this.properties = properties;
  }

  static empty() {
    return Outcome.results({});
  }

  static results(results) {
    return new Outcome(results, Properties.empty());
  }

  consistent(that) {
    return Object.keys(this.results)
      .filter(k => Object.keys(that.results).includes(k))
      .every(k => this.results[k] == that.results[k]);
  }

  merge(that) {
    let results = Object.assign({}, that.results, this.results);
    let properties = this.properties.join(that.properties);
    if (!this.consistent(that))
      properties.add('inconsistent-returns');
    return new Outcome(results, properties);
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

  static merged_minimals(outcomes) {
    debug(`computing minmals of:`);
    debug(outcomes);
    let groups = Outcome.partition(outcomes);
    debug(`got groups:`);
    debug(groups);
    let merged = Object.values(groups).map(outcomes => {
      let results = outcomes[0].results;
      let minimals = Properties.minimals(outcomes.map(o => o.properties));
      let joined = minimals.map(p => p.get().join(",")).join(";");
      return new Outcome(results, joined);
    });
    debug(`got merged:`);
    debug(merged);
    return merged;
  }

  static minimals(outcomes) {
    debug(`computing minmals of:`);
    debug(outcomes);
    let groups = Outcome.partition(outcomes);
    debug(`got groups:`);
    debug(groups);
    let minimals = [].concat(...Object.values(groups).map(outcomes => {
      let results = outcomes[0].results;
      let minimals = Properties.minimals(outcomes.map(o => o.properties));
      return minimals.map(min => new Outcome(results, min));
    }));
    debug(`got minimals:`);
    debug(minimals);
    return minimals;
  }

  getResults() {
    return results;
  }
}

module.exports = Outcome;
