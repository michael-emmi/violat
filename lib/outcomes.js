const createDebug = require('debug');

const debug = createDebug('outcomes');
const trace = createDebug('outcomes:trace');
const assert = require('assert');

const path = require('path');
const cp = require('child_process');
const fs = require('fs');
const ncp = require('ncp');

const config = require('./config.js');
const Server = require('./server.js');
const utils = require("./utils.js");
const linearization = require('./linearization.js');
const visibility = require('./visibility.js');

const Outcome = require('./outcome.js');
const PartialOrder = require('./partial-order.js');
const { RELATIONS, COMPARISONS, Consistency } = require('./consistency');

let runjobjPath = path.resolve(config.resourcesPath, 'runjobj');
let workPath = path.resolve(config.outputPath, 'runjobj');
let runjobj = path.resolve(workPath, 'build/libs/runjobj.jar');

function compile() {
  return new Promise((resolve, reject) => {
    debug(`checking whether runjobj needs compiling`);

    let sources = utils.findFiles(runjobjPath, `-name "*.java"`);
    let outdated = utils.targetsOutdated([runjobj], sources);

    if (!outdated) {
      debug(`runjobj has already been compiled`);
      resolve();

    } else {
      debug(`recompiling runjobj`);
      ncp(runjobjPath, workPath, err => {
        if (err) {
          debug(`unable to copy runjobj: ${err}`);
          reject(err);
        } else {
          cp.exec(`gradle`, {cwd: workPath}, (rc, out, err) => {
            if (rc) {
              debug(`unable to build runjobj: ${err}`);
              reject(err);
            } else {
              resolve();
            }
          });
        }
      });
    }
  });
}

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

async function getOutcomes(executor, schema, args) {
  debug(`computing outcomes for schema %s`, schema);

  // let reducedSchema = splitBulkOperations(schema, args.spec);

  let results = [];
  let programOrder = getProgramOrder(schema);
  indexInvocations(schema);

  trace(`using happens before %s`, programOrder);

  for (let lin of linearization(programOrder, args)) {
    trace(`using linearization %s`, lin);

    for (let viz of visibility(programOrder, lin, args)) {
      trace(`using visibility %s`, viz);

      results.push(getOutcome(executor, schema, lin, viz, args));

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

function indexInvocations(schema) {
  let count = 0;
  for (let sequence of schema.sequences) {
    for (let invocation of sequence.invocations) {
      invocation.index = count++;
    }
  }
}

function getProgramOrder(schema) {
  let order = new PartialOrder();
  for (let sequence of schema.sequences) {
    let predecessor;
    for (let invocation of sequence.invocations) {
      order.add(invocation);
      if (predecessor)
        order.sequence(predecessor, invocation);
      predecessor = invocation;
    }
  }

  for (let [i1,i2] of schema.order) {
    let s1 = schema.sequences.find(s => s.index === i1);
    let s2 = schema.sequences.find(s => s.index === i2);
    assert.ok(s1 && s2);
    order.sequence(
      s1.invocations[s1.invocations.length-1],
      s2.invocations[0]);
  }

  return order;
}

async function getOutcome(executor, schema, linearization, visibility, args) {
  let outcome;

  if (visibility.complete) {
    let results = await getResults(executor, schema, linearization.sequence);
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
      let results = await getResults(executor, schema, projection);
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
      if (!args.weakRelaxReturns && conflict)
        return undefined;
    }
  }
  trace(`got outcome: %s`, outcome);
  return outcome;
}

executorCache = {};
useCache = true;

async function getResults(executor, schema, invocations) {
  if (!executorCache[schema.class])
    executorCache[schema.class] = {};

  let returns = executorCache[schema.class][invocations];

  if (!returns) {
    let response = await executor.query(getQuerySequence(schema, invocations));
    // returns = response.replace(/\s+/g,'');
    returns = response.map(v => v.replace(/\s+/g,''));
    debug(returns);
  }

  if (useCache)
    executorCache[schema.class][invocations] = returns;

  let results = invocations.reduce((outcome, invocation, index) =>
    Object.assign({}, outcome, {[invocation.index]: returns[index]}), {});

  return results;
}

function getQuerySequence(schema, invocations) {
  return {
    class: schema.class,
    constructor: {
      parameters: schema.parameters || []
    },
    arguments: schema.arguments || [],
    invocations: invocations
  };
}

module.exports = function(schemas, args) {
  return new Promise(async (resolve, reject) => {
    await compile();

    debug(`annotating ${schemas.length} harness schemas`);

    let executor = new Server(runjobj);

    for (let schema of schemas) {
      schema.outcomes = [];
      for (let outcome of await getOutcomes(executor, schema, args)) {
        schema.outcomes.push(outcome);
      }
    }

    executor.close();

    let annotated = schemas;
    debug(`annotated ${annotated.length} harness schemas`);
    resolve(annotated);
  });
}
