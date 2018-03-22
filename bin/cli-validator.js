#!/usr/bin/env node --harmony_async_iteration
"use strict";

let fs = require('fs-extra');
let path = require('path');
let meow = require('meow');
var config = require(path.join(__dirname, '../lib', 'config.js'));
let defaults = config.defaultParameters;

let meta = require('../package.json');
let name = Object.keys(meta.bin)
  .find(key => meta.bin[key].match(path.basename(__filename)));

const lib = path.join(__dirname, '../lib');

const { Collectors } = require(path.join(lib, 'search/collection.js'));
const { RandomTestingBasedValidator } = require(path.join(lib, 'alg/validation.js'));

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

    programs: 20,
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

    let spec = JSON.parse(fs.readFileSync(cli.input[0]));
    let limits = cli.flags;

    let collector = Collectors.get('atomic');
    let validator = new RandomTestingBasedValidator(collector, limits);
    let count = 0;

    for await (let violation of validator.getViolations(spec)) {
      console.log(`violation discovered`);
      console.log(`schema: ${violation.schema}`);
      for (let outcome of violation.outcomes)
        console.log(outcome.toString());
      console.log(`---`);
      count++;
    }

    console.log(`Found ${count} violations.`);
    collector.close();

  } catch (e) {
    console.error(`Unhandled promise rejection:`);
    console.error(e);
    process.exitCode = 1;

  } finally {
    process.exit();
  }
}

main();
