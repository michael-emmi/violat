#!/usr/bin/env node
"use strict";

let fs = require('fs');
let path = require('path');
let meow = require('meow');
var config = require(path.join(__dirname, '../lib', 'config.js'));
let defaults = config.defaultParameters;

let meta = require('../package.json');
let name = Object.keys(meta.bin)
  .find(key => meta.bin[key].match(path.basename(__filename)));

let outcomes = require(path.join(__dirname, '../lib', 'outcomes.js'));

let cli = meow(`
  Usage
    $ ${name} <harness-schema.json>

  Options
    --weak                      Admit weakly-atomic outcomes.
    --weak-relax-linearization  Linearizations need not include program order.
    --weak-relax-visibility     Visibility need not include program order.
    --weak-relax-returns        Return values need not agree across views.

  Examples
    $ ${name} --weak my_test_harness_schema.json
`, {
  default: {
  }
});

(async () => {

  if (!(cli.input.length == 1 && cli.input[0]))
    cli.showHelp();

  let schema = JSON.parse(fs.readFileSync(cli.input[0]));
  let args = Object.assign({}, cli.flags);

  console.log(`${cli.pkg.name} version ${cli.pkg.version}`);
  let results = (await outcomes([schema], args))[0].outcomes;

  console.log(`computed ${results.length} outcomes`);

  for (let result of results) {
    console.log(`---`);
    console.log(result);
  }
})();
