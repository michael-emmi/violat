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

const { Executor } = require(path.join(lib, 'java/executor.js'));
const { AtomicExecutionCollector } = require(path.join(lib, 'search/collection.js'));
const { RandomTestBasedValidator } = require(path.join(lib, 'alg/validation.js'));


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

(async () => {

  if (cli.input.length !== 1)
    cli.showHelp();

  console.log(`${cli.pkg.name} version ${cli.pkg.version}`);
  console.log(`---`);

  let spec = JSON.parse(fs.readFileSync(cli.input[0]));
  let limits = cli.flags;

  let executor = new Executor();
  await executor.isReady();
  let collector = new AtomicExecutionCollector(executor);
  let validator = new RandomTestBasedValidator(collector, limits);
  await validator.validate(spec);
  executor.close();

})();
