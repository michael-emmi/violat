const debug = require('debug')('main');
const assert = require('assert');

const generator = require('./enumeration.js');
const annotate = require('./annotation.js');
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

async function testMethod(args) {
  let method = args.spec.methods.find(m => m.name === args.method);

  if (!method)
    throw `no entry for method ${args.method} in spec ${args.spec}`;

  let violations = [];
  let explored = 0;
  let total = '?';
  let startTime = new Date();

  args = Object.assign({},
    config.defaultParameters,
    args.spec.harnessParameters,
    method.harnessParameters,
    args
  );

  debug(`method: ${method.name}`);
  debug(`values: ${args.values}`);
  debug(`sequences: ${args.sequences}`);
  debug(`invocations: ${args.invocations}`);

  let schemaGenerator = generator(args);

  while (true) {
    let schemas = pullSchemas(schemaGenerator, args.testBatchSize);
    debug(`got ${schemas.length} harness schemas`);

    if (schemas.length < 1)
      break;

    explored += args.testBatchSize;

    let annotated = await annotate(schemas);
    debug(`got ${annotated.length} annotated schemas`);

    let translated = await translate(annotated, method.name.capitalize());
    debug(`got ${translated.length} translated schemas`);

    let failedTests = await test(translated, () => {},
      args.limit && args.limit - violations.length);
    debug(`got ${failedTests.length} violation(s)`);

    for (let violation of failedTests)
      output('violations',
        `${violation.failedHarness.replace(/[.]/g,'/')}.java`,
        decorate(Object.assign({}, args, violation, {
          total: total,
          explored: explored,
          time: ((new Date() - startTime) / 1000).toFixed(3)}
        ))
      );

    violations.push(...failedTests);

    if (!args.limit)
      continue;

    if (violations.length < args.limit)
      continue;

    debug(`reached violation limit`);
    break;
  }

  debug(`returning from testMethod with ${violations.length} violation(s)`);
  return violations;
}

async function testUntrustedMethods(args) {
  let violations = [];
  for (let m of args.spec.methods.filter(m => !m.trusted))
    violations.push(...await testMethod(Object.assign({method: m.name}, args)));
  return violations;
}

exports.testMethod = testMethod;
exports.testUntrustedMethods = testUntrustedMethods;
