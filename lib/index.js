const debug = require('debug')('main');
const assert = require('assert');

const generator = require('./enumeration.js');
const annotate = require('./outcomes.js');
const translate = require('./translation.js');
const decorate = require('./decorate.js');
const test = require('./jcstress.js');
const output = require('./output.js');
const config = require('./config.js');

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}

function pullSchemas(generator, n) {
  let schemas = [];
  let count = 0;
  while (count++ < n) {
    let next = generator.next();

    if (next.value)
      schemas.push(next.value);

    if (next.done)
      break;
  }
  return schemas;
}

function collectResults(results, explored, startTime, args) {
  let unexpected = results.filter(x => x.outcomes.some(y => y.count > 0));
  let violations = unexpected.filter(x => !x.status);
  let weaknesses = unexpected.filter(x =>
    x.status !== false &&
    x.outcomes.some(o => o.expectation.match(/INTERESTING/) && o.count > 0) );

  debug(`got ${violations.length} violation(s)`);
  for (let violation of violations) {
    debug(`in harness:`);
    debug(violation.harness);
    debug(`violation:`);
    for (let outcome of violation.outcomes)
      if (outcome.expectation.match(/FORBIDDEN/))
        debug(`observed ${outcome.result} outcome ${outcome.count} times in ${violation.total} tests`);

    output('violations',
      `${violation.name.replace(/[.]/g,'/')}.java`,
      decorate(Object.assign({}, args, violation, {
        explored: explored,
        time: ((new Date() - startTime) / 1000).toFixed(3)}
      ))
    );
  }

  debug(`got ${weaknesses.length} weak results`);
  for (let weakness of weaknesses) {
    debug(`weakness:`);
    for (let outcome of weakness.outcomes)
      if (outcome.expectation.match(/INTERESTING/) && outcome.count > 0)
        debug(`observed ${outcome.result} outcome ${outcome.count} times in ${weakness.total} tests`);
    debug(`in harness:`);
    debug(weakness.harness);
  }

  return [violations, weaknesses];
}

async function testMethod(args) {
  let methods = args.methods.map(name => args.spec.methods.find(m => m.name === name) || name);

  for (let name of methods.filter(m => typeof(m) === 'string'))
    throw `no entry for method ${name} in spec ${args.spec}`;

  let allresults = [];
  let allviolations = [];
  let weakresults = [];
  let explored = 0;
  let startTime = new Date();

  args = Object.assign({},
    config.defaultParameters,
    args.spec.harnessParameters,
    ...methods.map(m => m.harnessParameters),
    args
  );

  debug(`methods: ${methods.map(m => m.name).join(", ")}`);
  debug(`values: ${args.values}`);
  debug(`sequences: ${args.sequences}`);
  debug(`invocations: ${args.invocations}`);
  debug(`cutoff: ${args.cutoff}`);
  debug(`weak: ${args.weak}`);
  debug(args);

  let schemaGenerator = generator(args);

  while (true) {
    let batchSize = args.cutoff
      ? Math.min(args.testBatchSize, args.cutoff - explored)
      : args.testBatchSize;

    let schemas = pullSchemas(schemaGenerator, batchSize);
    debug(`got ${schemas.length} harness schemas`);

    if (schemas.length < 1)
      break;

    explored += batchSize;

    let annotated = await annotate(schemas, args);
    debug(`got ${annotated.length} outcome-annotated schemas`);

    let translated = await translate(annotated, methods.map(m => m.name.capitalize()).join("And"));
    debug(`got ${translated.length} translated schemas`);

    let results = await test(translated, function(result) {
      if (args.onResult &&
          result.outcomes.some(o => o.expectation !== 'ACCEPTABLE' && o.count > 0))
          args.onResult(result);
    }, args.limit && args.limit - allviolations.length);

    let [violations, weaknesses] =
      collectResults(results, explored, startTime, args);

    allresults.push(...results);
    allviolations.push(...violations);
    weakresults.push(...weaknesses);

    if (args.limit && allviolations.length >= args.limit) {
      debug(`reached violation limit`);
      break;
    }

    if (args.cutoff && explored >= args.cutoff) {
      debug(`reach exploration cutoff`);
      break;
    }
  }

  debug(`returning from testMethod with ${allviolations.length} violation(s) and ${weakresults.length} weak result(s)`);
  return allresults;
}

async function testUntrustedMethods(args) {
  let results = [];
  for (let m of args.spec.methods.filter(m => !m.trusted))
    results.push(...await testMethod(Object.assign({}, args, {methods: [m.name]})));
  return results;
}

exports.testMethod = testMethod;
exports.testUntrustedMethods = testUntrustedMethods;
