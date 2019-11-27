#!/usr/bin/env node
"use strict";

require('source-map-support').install();
require('console.table');

import * as fs from 'fs-extra';
import * as path from 'path';
import * as meow from 'meow';
import config from '../config';
let defaults = config.defaultParameters;

let meta = require('../../package.json');
let name = Object.keys(meta.bin)
  .find(key => meta.bin[key].match(path.basename(__filename)));

import { Schema } from '../schema';
import * as RunJavaObjectServer from '../java/runjobj';
import { VisibilitySemantics } from '../core/visibility';
import { AtomicExecutionGenerator, RelaxedExecutionGenerator } from '../core/execution';
import { SpecValidator, ProgramValidator, RandomTestValidator, SpecStrengthValidator, TestingBasedValidatorLimits, StrengtheningResult, Strengthening } from '../alg/validation';
import { VisibilitySpecStrengthener } from '../spec/visibility';

import * as uuidv1 from 'uuid/v1';
import { TestResult } from '../alg/violation';
import { Spec } from '../spec/spec';

let cli = meow(`
  Usage
    $ ${name} <spec-file.json>

  Options
    --tester TESTER
    --schema STRING
    --java-home PATH
    --jar STRING
    --method-filter REGEXP
    --maximality
    --max-programs N
    --min-threads N
    --max-threads N
    --min-invocations N
    --max-invocations N
    --min-values N
    --max-values N
    --time-per-test N
    --iters-per-test N
    --forks-per-test N

  Examples
    $ ${name} ConcurrentHashMap.json
    $ ${name} --schema "{ clear(); put(0,1) } || { containsKey(1); remove(0) }" ConcurrentHashMap.json
`, {
  flags: {
    tester: { default: 'JCStress' },
    methodFilter: { default: '.*' },
    maxPrograms: { default: 100 },
    maxThreads: { default: 2 },
    maxInvocations: { default: 6 }
  }
});

async function main() {
  try {
    if (cli.input.length !== 1)
      cli.showHelp();

    console.log(`${cli.pkg.name} version ${cli.pkg.version}`);
    console.log(`---`);

    let inputSpec = JSON.parse(fs.readFileSync(cli.input[0]).toString()) as Spec;
    let { maximality, schema: schemas, jar, javaHome, tester, ...limits } = cli.flags;
    let methods = inputSpec.methods.filter(m => m.name.match(limits.methodFilter));
    let jars = jar ? [].concat(jar) : [];

    let server = await RunJavaObjectServer.create({
      sourcePath: path.resolve(config.resourcesPath, 'runjobj'),
      workPath: path.resolve(config.outputPath, 'runjobj'),
      jars,
      javaHome
    });

    let semantics = new VisibilitySemantics();
    let generator = new RelaxedExecutionGenerator(semantics);

    // NOTE: here we may prune away methods present in an input schema, which will error when parsing it
    // TODO: do something to trace back that error to the pruning happening here.
    let spec = semantics.pruneSpecification({ ...inputSpec, methods });

    let validator: SpecValidator<StrengtheningResult>;

    if (schemas) {
      let count = 0;
      validator = new ProgramValidator({
        server, jars, javaHome, generator,
        limits: limits as TestingBasedValidatorLimits,
        tester,
        programs: [].concat(schemas).map(s => Schema.fromString(s, spec, count++))
      });

    } else if (maximality)
      validator = new SpecStrengthValidator({
        server, jars, javaHome, generator, limits, tester,
        strengthener: new VisibilitySpecStrengthener()
      });

    else
      validator = new RandomTestValidator({ server, jars, javaHome, generator, limits, tester });

    let count = 0;

    for await (let violation of validator.getViolations(spec)) {
      console.log(`violation discovered`);
      console.log(`---`);

      if (maximality) {
        // TODO: check this?
        let { method, attribute } = violation as Strengthening;
        console.log(`observed ${attribute} consistency for method: %s`, method.name);
        console.log(`---`);

      } else {
        const { schema, getTable } = violation as TestResult;
        console.log(`${schema}`);
        console.log(`---`);
        console.table(getTable());
        console.log(`---`);
      }
      count++;
    }

    console.log(`Found ${count} violations.`);
    server.close();

  } catch (e) {
    console.error(`Unhandled promise rejection:`);
    console.error(e);
    process.exitCode = 1;

  } finally {
    process.exit();
  }
}

main();
