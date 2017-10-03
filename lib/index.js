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

  let allresults = [];
  let violations = [];
  let weakresults = [];
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
  debug(`cutoff: ${args.cutoff}`);
  debug(`weak: ${args.weak}`);

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

    let annotated = await annotate(schemas, args.weak);
    debug(`got ${annotated.length} annotated schemas`);

    let translated = await translate(annotated, method.name.capitalize());
    debug(`got ${translated.length} translated schemas`);

    let results = await test(translated, () => {},
      args.limit && args.limit - violations.length);

    debug(`got ${results.filter(x => !x.status).length} violation(s)`);

    for (let result of results) {
      if (!result.status) {
        output('violations',
          `${result.name.replace(/[.]/g,'/')}.java`,
          decorate(Object.assign({}, args, result, {
            total: total,
            explored: explored,
            time: ((new Date() - startTime) / 1000).toFixed(3)}
          ))
        );
      }
    }

    allresults.push(...results);
    violations.push(...results.filter(x => !x.status));
    weakresults.push(...results.filter(x => x.outcomes.some(y => y.expectation.match(/INTERESTING/))));

    if (args.limit && violations.length >= args.limit) {
      debug(`reached violation limit`);
      break;
    }

    if (args.cutoff && explored >= args.cutoff) {
      debug(`reach exploration cutoff`);
      break;
    }
  }

  debug(`returning from testMethod with ${violations.length} violation(s) and ${weakresults.length} weak result(s)`);
  return allresults;
}

async function testUntrustedMethods(args) {
  let results = [];
  for (let m of args.spec.methods.filter(m => !m.trusted))
    results.push(...await testMethod(Object.assign({method: m.name}, args)));
  return results;
}

exports.testMethod = testMethod;
exports.testUntrustedMethods = testUntrustedMethods;
