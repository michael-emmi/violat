import * as assert from 'assert';
import * as Debug from 'debug';
const debug = Debug('main');

import { Schema } from './schema';
import { generator } from './enumeration/index';
import { outcomes } from './outcomes';
import { decorate } from './decorate';
import { JCStressTester } from './java/jcstress';
import { output } from './output';
import { config } from './config';

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function pullSchemas(generator, n) {
  let schemas: Schema[] = [];
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

type Result = any;

export async function testMethod(args) {
  let methods = args.methods.map(name => args.spec.methods.find(m => m.name === name) || name);
  let testName = methods.map(m => capitalize(m.name)).join("And");

  for (let name of methods.filter(m => typeof(m) === 'string'))
    throw `no entry for method ${name} in spec ${args.spec}`;

  let allresults: Result[] = [];
  let allviolations: Result[] = [];
  let weakresults: Result[] = [];
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

    let annotated = await outcomes(schemas, args);
    debug(`got ${annotated.length} outcome-annotated schemas`);

    let tester = new JCStressTester(annotated, [], { testName, maxViolations: args.limit && args.limit - allviolations.length });
    // XXX TODO clean this up
    let results: Result[] = [];
    for await (let result of tester.getResults()) {
      if (args.onResult &&
          result.outcomes.some(o => !o.isAtomic() && o.count > 0))
          args.onResult(result);
      results.push(result);
    }
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

export async function testUntrustedMethods(args) {
  let results: Result[] = [];
  for (let m of args.spec.methods.filter(m => !m.trusted))
    results.push(...await testMethod(Object.assign({}, args, {methods: [m.name]})));
  return results;
}
