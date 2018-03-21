const createDebug = require('debug');

const debug = createDebug('outcomes');
const trace = createDebug('outcomes:trace');
const assert = require('assert');

const path = require('path');
const cp = require('child_process');
const fs = require('fs');

const config = require('./config.js');
const { Executor } = require('./java/executor.js');
const utils = require("./utils.js");
const linearization = require('./linearization.js');
const visibility = require('./visibility.js');

const Outcome = require('./outcome.js');
const PartialOrder = require('./partial-order.js');
const { RELATIONS, COMPARISONS, Consistency } = require('./consistency');

function splitBulkOperations(schema, spec) {
  let result = JSON.parse(JSON.stringify(schema));
  for (let [i,sequence] of result.sequences.entries()) {
    for (let [j,invocation] of sequence.invocations.entries()) {
      let name = invocation.method.name;
      let method = spec.methods.find(m => m.name === name);
      let bulk = method.bulk;
      if (bulk) {
        debug(`splitting invocation %O in %O`, invocation, schema);
        assert.ok(invocation.arguments.length === 1);
        let collection = invocation.arguments[0];
        let index = sequence.invocations.indexOf(invocation);
        let repl = spec.methods.find(m => m.name === bulk.primitive);

        if (Array.isArray(collection)) {
          let split = collection.map(x => ({
            method: repl,
            arguments: [x],
            atomic: true
          }));
          schema.sequences[i].invocations[j].split = split;
          sequence.invocations.splice(index, 1, ...split);

        } else if (typeof collection === 'object') {
          let split = Object.entries(collection).map(([k,v]) => ({
            method: repl,
            arguments: [k,v],
            atomic: true
          }));
          schema.sequences[i].invocations[j].split = split;
          sequence.invocations.splice(index, 1, ...split);
        }
        debug(`result after split: %O`, result);
        debug(`schema after split: %O`, schema);
      }
    }
  }
  return result;
}

function combineSplitResults(schema, spec, outcome) {
  for (let sequence of schema.sequences) {
    for (let [i,invocation] of sequence.invocations.entries()) {
      let split = invocation.split;
      if (split) {
        let results = split.map(iv => outcome.results[iv.index]);
        let method = spec.methods.find(m => m.name === invocation.method.name);
        let result;
        assert.ok(method);
        assert.ok(method.bulk);
        switch (method.bulk.combine) {
          case 'ignore':
            result = null;
            break;
          case 'any':
            result = results.reduce((acc,r) => acc || r, false);
            break;
          case 'all':
            result = results.reduce((acc,r) => acc && r, true);
            break;
          default:
            throw `uknown combiner: ${combine}`;
        }
        // TODO replace results with result in outcome
      }
    }
  }
}

function getQuerySequence(schema, invocations) {
  return ({
    class: schema.class,
    constructor: {
      parameters: schema.parameters || []
    },
    arguments: schema.arguments || [],
    invocations: invocations
  });
}

class OutcomePredictor {
  constructor(args) {
    this.args = args;
    this.executor = new Executor();
    this.executorCache = {};
    this.useCache = true;
  }

  close() {
    assert.ok(this.executor);
    this.executor.close();
    this.executor = undefined;
  }

  async getOutcomes(schema) {
    debug(`computing outcomes for schema %s`, schema);

    // let reducedSchema = splitBulkOperations(schema, args.spec);

    let results = [];
    let programOrder = schema.getProgramOrder();
    schema.indexInvocations();

    trace(`using happens before %s`, programOrder);

    for (let lin of linearization(programOrder, this.args)) {
      trace(`using linearization %s`, lin);

      for (let viz of visibility(programOrder, lin, this.args)) {
        trace(`using visibility %s`, viz);

        results.push(this.getOutcome(schema, lin, viz));

        // TODO call combineSplitResults(schema, args.spec, outcome)
      }
    }

    debug(`enuerated linearizations & visibilities`);

    let outcomes = (await Promise.all(results)).filter(x => x);

    debug(`got ${outcomes.length} total outcomes`);
    if (trace.enabled) {
      for (let outcome of outcomes)
        trace(`  %s`, outcome);
    }

    let unique = Outcome.maximals(outcomes);

    debug(`got ${unique.length} unique outcomes`);
    if (trace.enabled) {
      for (let outcome of unique)
        trace(`  %s`, outcome);
    }

    return unique;
  }

  async getOutcome(schema, linearization, visibility) {
    let outcome;

    if (visibility.complete) {
      let results = await this.getResults(schema, linearization.sequence);
      outcome = new Outcome({
        results: results,
        consistency: visibility.consistency
      });

    } else {
      outcome = Outcome.empty(visibility.consistency);
      let orderedIns = [].concat(...schema.sequences.map(s => s.invocations));

      let prefix = [];
      for (let invocation of linearization.sequence) {
        prefix.push(invocation);
        let projection = prefix.filter(i => visibility.isVisible(i, invocation));
        projection.push(invocation);
        let results = await this.getResults(schema, projection);
        let conflict;

        for (let idx of Object.keys(results)) {
          if (Object.keys(outcome.results).includes(idx)) {
            if (results[idx] !== outcome.results[idx]) {
              conflict = orderedIns[idx];
              outcome.consistency =
                outcome.consistency.weakenSimpleLevel(
                  'consistent_returns', conflict);
            }
          }
        }

        outcome = outcome.mergeResults(results);
        if (!this.args.weakRelaxReturns && conflict)
          return undefined;
      }
    }
    trace(`got outcome: %s`, outcome);
    return outcome;
  }

  async getResults(schema, invocations) {
    await this.executor.isReady();

    if (!this.executorCache[schema.class])
      this.executorCache[schema.class] = {};

    let returns = this.executorCache[schema.class][invocations];

    if (!returns) {
      let response = await this.executor.run(invocations.map(i => i.index), schema);
      // returns = response.replace(/\s+/g,'');
      returns = response.map(v => v.replace(/\s+/g,''));
      debug(returns);
    }

    if (this.useCache)
      this.executorCache[schema.class][invocations] = returns;

    let results = invocations.reduce((outcome, invocation, index) =>
      Object.assign({}, outcome, {[invocation.index]: returns[index]}), {});

    return results;
  }
}

module.exports = function(schemas, args) {
  return new Promise(async (resolve, reject) => {
    debug(`annotating ${schemas.length} harness schemas`);

    let predictor = new OutcomePredictor(args);

    for (let schema of schemas) {
      schema.outcomes = [];
      for (let outcome of await predictor.getOutcomes(schema)) {
        schema.outcomes.push(outcome);
      }
    }

    predictor.close();

    let annotated = schemas;
    debug(`annotated ${annotated.length} harness schemas`);
    resolve(annotated);
  });
}
