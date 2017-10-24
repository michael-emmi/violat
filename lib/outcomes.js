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
    return [f(o.results), f(o.properties)];

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
const Properties = require('./outcome-properties.js');
const PartialOrder = require('./partial-order.js');

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

async function getOutcomes(executor, schema, args) {
  debug(`computing outcomes for schema %O`, schema);

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
        debug(`computed outcome %O`, outcome);
        outcomes.push(outcome);
      } else {
        debug(`no consistent outcomes are possible`);
      }
    }
  }
  debug(`got ${outcomes.length} total outcomes: %O`, outcomes);

  let unique = Outcome.minimals(outcomes);
  debug(`got ${unique.length} unique outcomes: %O`, unique);

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

  for (let [s1,s2] of schema.order)
    order.sequence(
      s1.invocations[s1.invocations.length-1],
      s2.invocations[0]);

  return order;
}

async function getOutcome(executor, schema, linearization, visibility, args) {
  let cummulativeOutcome = Outcome.empty();

  let prefix = [];
  for (let invocation of linearization.sequence) {
    prefix.push(invocation);
    let projection = prefix.filter(i => visibility.isVisible(i, invocation));
    let outcome = await getSimpleOutcome(executor, schema, projection);
    cummulativeOutcome = cummulativeOutcome.merge(outcome);
    if (!args.weakRelaxReturns
        && cummulativeOutcome.properties.get().includes('inconsistent-returns'))
      return undefined;
  }
  cummulativeOutcome.properties.merge(linearization.properties);
  cummulativeOutcome.properties.merge(visibility.properties);
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
        let properties = outcome.properties.get();
        schema.outcomes.push({
          values: Object.values(outcome.results),
          expected: properties.length ? undefined : true,
          description: properties.length ? properties.join(", ") : "atomic"
        });
      }
    }

    executor.close();

    let annotated = schemas;
    debug(`annotated ${annotated.length} harness schemas`);
    resolve(annotated);
  });
}
