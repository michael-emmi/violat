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
import { RunJavaObjectServer } from '../java/runjobj';
import { VisibilitySemantics } from '../core/visibility';
import { AtomicExecutionGenerator, RelaxedExecutionGenerator } from '../core/execution';
import { SpecValidator, ProgramValidator, RandomTestValidator, SpecStrengthValidator } from '../alg/validation';
import { VisibilitySpecStrengthener } from '../spec/visibility';

import * as uuidv1 from 'uuid/v1';

let cli = meow(`
  Usage
    $ ${name} <spec-file.json>

  Options
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

    let inputSpec = JSON.parse(fs.readFileSync(cli.input[0]));
    let { maximality, schema: schemas, jar, javaHome, ...limits } = cli.flags;
    let methods = inputSpec.methods.filter(m => m.name.match(limits.methodFilter));
    let jars = jar ? [].concat(jar) : [];

    let server = new RunJavaObjectServer({
      sourcePath: path.resolve(config.resourcesPath, 'runjobj'),
      workPath: path.resolve(config.outputPath, 'runjobj'),
      jars,
      javaHome
    });

    let semantics = new VisibilitySemantics();
    let generator = new RelaxedExecutionGenerator(semantics);
    let spec = semantics.pruneSpecification({ ...inputSpec, methods });

    let validator: SpecValidator;

    if (schemas) {
      let count = 0;
      validator = new ProgramValidator({
        server, jars, generator, limits,
        programs: [].concat(schemas).map(s => Schema.fromString(s, spec, count++))
      });

    } else if (maximality)
      validator = new SpecStrengthValidator({
        server, jars, generator, limits,
        strengthener: new VisibilitySpecStrengthener()
      });

    else
      validator = new RandomTestValidator({ server, jars, generator, limits });

    let count = 0;

    for await (let violation of validator.getViolations(spec)) {
      console.log(`violation discovered`);
      console.log(`---`);

      if (maximality) {
        let { method, attribute } = violation;
        console.log(`observed ${attribute} consistency for method: %s`, method.name);
        console.log(`---`);

      } else {
        console.log(`${violation.schema}`);
        console.log(`---`);
        console.table(violation.getTable());
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
