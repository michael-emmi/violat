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
    $ ${name} <history-file.json>

  Options
    --XXX

  Examples
    $ ${name} some_history.json
`, {
  boolean: [],
  default: {}
});

(async () => {

  if (cli.input.length !== 1)
    cli.showHelp();

  await utils.buildJar(runjobjPath, workPath, 'runjobj');
  let executor = new Server(runjobj);
  let checker = new ConsistencyChecker(executor);
  let result = await checker.check(cli.input[0]);
  console.log(`${result ? '' : 'in'}consistent`);
  executor.close();

  process.exitCode = result ? 0 : 1;
})();
