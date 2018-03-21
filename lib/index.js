const debug = require('debug')('main');
const assert = require('assert');

const generator = require('./enumeration/index');
const annotate = require('./outcomes.js');
const decorate = require('./decorate.js');
const { JCStressTester } = require('./java/jcstress.js');
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

async function testMethod(args) {
  let methods = args.methods.map(name => args.spec.methods.find(m => m.name === name) || name);
  let testName = methods.map(m => m.name.capitalize()).join("And");

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

    let tester = new JCStressTester(annotated, testName, args.limit && args.limit - allviolations.length);
    tester.onResult(result => {
      if (args.onResult &&
          result.outcomes.some(o => !o.isAtomic() && o.count > 0))
          args.onResult(result);
    });
    let results = await tester.run();
    let violations = results.filter(r => r.outcomes.some(o => o.isIncosistent() && o.count > 0));
    let weaknesses = results.filter(r => r.outcomes.some(o => o.isWeak() && o.count > 0));

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
