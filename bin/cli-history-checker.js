#!/usr/bin/env node --harmony_async_iteration
"use strict";

let fs = require('fs');
let mkdirp = require('mkdirp');
let path = require('path');
let meow = require('meow');
var config = require(path.join(__dirname, '../lib', 'config.js'));
let defaults = config.defaultParameters;

let meta = require('../package.json');
let name = Object.keys(meta.bin)
  .find(key => meta.bin[key].match(path.basename(__filename)));

const utils = require("../lib/utils.js");
const Server = require('../lib/server.js');
const { ConsistencyChecker } = require('../lib/search/checker.js');

const runjobjPath = path.resolve(config.resourcesPath, 'runjobj');
const workPath = path.resolve(config.outputPath, 'runjobj');
const runjobj = path.resolve(workPath, 'build/libs/runjobj.jar');

let cli = meow(`
  Usage
    $ ${name} [options] <history-file.json>

  Options
    --weak      Check weak consistency.
    --jit       Apply Lowe’s just-in-time linearizability.
    --min       Explore only minimal visibilities.

  Examples
    $ ${name} --weak some_history.json
`, {
  boolean: [
    'weak',
    'jit',
    'min'
  ],
  default: {}
});

(async () => {

  if (cli.input.length < 1)
    cli.showHelp();

  await utils.buildJar(runjobjPath, workPath, 'runjobj');
  let executor = new Server(runjobj);
  let checker = new ConsistencyChecker({ executor, ...cli.flags });

  for (let input of cli.input) {
    let html = path.join(path.dirname(input), `${path.basename(input, '.json')}.html`);
    let url = `http://localhost:8080/${path.relative(config.historiesPath, html)}`;
    console.log(`---`);
    console.log(url);
    let result = await checker.check(input);
    console.log(`${result ? '' : 'in'}consistent`);
    if (!result)
      process.exitCode++;
  }

  executor.close();
})();
