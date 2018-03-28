#!/usr/bin/env node --harmony_async_iteration
"use strict";

require('console.table');

let fs = require('fs-extra');
let path = require('path');
let meow = require('meow');
var config = require(path.join(__dirname, '../lib', 'config.js'));
let defaults = config.defaultParameters;

let meta = require('../package.json');
let name = Object.keys(meta.bin)
  .find(key => meta.bin[key].match(path.basename(__filename)));

const lib = path.join(__dirname, '../lib');

const { Schema } = require('../lib/schema.js');
const { RunJavaObjectServer } = require('../lib/java/runjobj.js');
const { VisibilitySemantics } = require('../lib/core/visibility.js');
const { AtomicExecutionGenerator, RelaxedExecutionGenerator } = require('../lib/core/execution.js');
const { SingleProgramValidator, RandomTestingBasedValidator } = require('../lib/alg/validation.js');

const uuidv1 = require('uuid/v1');

let cli = meow(`
  Usage
    $ ${name} <spec-file.json>

  Options
    --schema STRING
    --programs N
    --threads N
    --invocations N
    --values N

  Examples
    $ ${name} ConcurrentHashMap.json
    $ ${name} --schema "{ clear(); put(0,1) } || { containsKey(1); remove(0) }" ConcurrentHashMap.json
`, {
  boolean: [],
  default: {

    programs: 100,
    threads: 2,
    invocations: 6,
    values: 2
  }
});

async function main() {
  try {
    if (cli.input.length !== 1)
      cli.showHelp();

    console.log(`${cli.pkg.name} version ${cli.pkg.version}`);
    console.log(`---`);

    let inputSpec = JSON.parse(fs.readFileSync(cli.input[0]));
    let limits = cli.flags;

    let server = new RunJavaObjectServer({
      sourcePath: path.resolve(config.resourcesPath, 'runjobj'),
      workPath: path.resolve(config.outputPath, 'runjobj')
    });

    let semantics = new VisibilitySemantics();
    let generator = new RelaxedExecutionGenerator(semantics);
    let spec = semantics.pruneSpecification(inputSpec);

    let validator = cli.flags.schema
      ? new SingleProgramValidator({ server, generator, limits,
        program: Schema.fromString(cli.flags.schema, spec)})
      : new RandomTestingBasedValidator({ server, generator, limits });

    let count = 0;

    for await (let violation of validator.getViolations(spec)) {
      console.log(`violation discovered`);
      console.log(`---`);
      console.log(`${violation.schema}`);
      console.log(`---`);
      console.table(violation.outcomes.map(o => {
        let outcome = o.valueString();
        let consistent = o.consistency ? '√' : 'X';
        let frequency = Number(o.count).toLocaleString();
        return { outcome, 'OK': consistent, frequency };
      }));
      console.log(`---`);
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
