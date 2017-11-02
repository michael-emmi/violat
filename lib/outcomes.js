const createDebug = require('debug');

function f(o) {

  if (Array.isArray(o))
    return o.map(f);

  if (typeof o === 'string')
    return o;

  if (o instanceof Set)
    return Array.from(o.values()).map(f);

  if (o instanceof Map)
    return Array.from(o.entries())
      .reduce((acc,[k,v]) => Object.assign(acc, {[f(k)]: f(v)}), {});

  if (o.method)
    return `${o.method.name}(${o.arguments.map(JSON.stringify).join(',')})`;

  if (o.invocations)
    return f(o.invocations);

  if (o.sequences)
    return f(o.sequences);

  if (o.basis)
    return f(o.basis);

  if (o.relation)
    return f(o.relation);

  if (o.sequence)
    return f(o.sequence);

  if (o.results)
    return [f(o.results), f(o.consistency)];

  if (o.keys)
    return f(o.keys);

  return Object.entries(o)
    .reduce((acc,[k,v]) => Object.assign(acc, {[k]: v}), {});
}

createDebug.formatters.O = (v) => {
  return JSON.stringify(f(v), null, 2);
};

const debug = createDebug('outcomes');
const debugdetail = createDebug('outcomes:detail');
const assert = require('assert');

const path = require('path');
const cp = require('child_process');
const fs = require('fs');
const ncp = require('ncp');

const config = require('./config.js');
const server = require('./server.js');
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
  debug(`computing outcomes for schema %O`, schema);

  // let reducedSchema = splitBulkOperations(schema, args.spec);

  let outcomes = [];
  let programOrder = getProgramOrder(schema);
  indexInvocations(schema);

  debugdetail(`using happens before %O`, programOrder);

  for (let lin of linearization(programOrder, args)) {
    debugdetail(`using linearization %O`, lin);

    for (let viz of visibility(programOrder, lin, args)) {
      debugdetail(`using visibility %O`, viz);

      let outcome = await getOutcome(executor, schema, lin, viz, args);
      if (outcome) {

        // TODO call combineSplitResults(schema, args.spec, outcome)

        debug(`computed outcome %O`, outcome);
        outcomes.push(outcome);
      } else {
        debug(`no consistent outcomes are possible`);
      }
    }
  }
  debug(`got ${outcomes.length} total outcomes: %s`, outcomes);

  let unique = Outcome.maximals(outcomes);
  debug(`got ${unique.length} unique outcomes: %s`, unique);

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
  let cummulativeOutcome = Outcome.empty(visibility.consistency);
  let orderedIns = [].concat(...schema.sequences.map(s => s.invocations));

  let prefix = [];
  for (let invocation of linearization.sequence) {
    prefix.push(invocation);
    let projection = prefix.filter(i => visibility.isVisible(i, invocation));
    projection.push(invocation);
    let outcome = await getSimpleOutcome(executor, schema, projection);
    let conflict;

    for (let idx of Object.keys(outcome.results)) {
      if (Object.keys(cummulativeOutcome.results).includes(idx)) {
        if (outcome.results[idx] !== cummulativeOutcome.results[idx]) {
          conflict = orderedIns[idx];
          cummulativeOutcome.consistency =
            cummulativeOutcome.consistency.weakenSimpleLevel(
              'consistent_returns', conflict);
        }
      }
    }

    cummulativeOutcome = cummulativeOutcome.merge(outcome);
    if (!args.weakRelaxReturns && conflict)
      return undefined;
  }
  return cummulativeOutcome;
}

async function getSimpleOutcome(executor, schema, invocations) {
  let returns = await executor.query(getQuerySequence(schema, invocations));
  debugdetail(`got executor results`);
  debugdetail(returns);

  let results = invocations.reduce((outcome, invocation, index) =>
    Object.assign({}, outcome, {[invocation.index]: returns[index]}), {});

  return Outcome.results(results);
}

function getQuerySequence(schema, invocations) {
  return {
    class: schema.class,
    constructor: {
      parameters: []
    },
    arguments: [],
    invocations: invocations
  };
}

module.exports = function(schemas, args) {
  return new Promise(async (resolve, reject) => {
    await compile();

    debug(`annotating ${schemas.length} harness schemas`);

    let executor = server(runjobj);

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
