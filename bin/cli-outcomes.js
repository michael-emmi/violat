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

const annotate = require(path.join(__dirname, '../lib', 'outcomes.js'));
const translate = require(path.join(__dirname, '../lib', 'translation.js'));
const test = require(path.join(__dirname, '../lib', 'jcstress.js'));

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
  boolean: [
    'weak',
    'weak-relax-linearization',
    'weak-relax-visibility',
    'weak-relax-returns'
  ],
  default: {}
});

(async () => {

  if (!(cli.input.length == 1 && cli.input[0]))
    cli.showHelp();

  let schema = JSON.parse(fs.readFileSync(cli.input[0]));
  let args = Object.assign({}, cli.flags);

  console.log(`${cli.pkg.name} version ${cli.pkg.version}`);
  let annotated = await annotate([schema], args);

  console.log(`predicted ${annotated[0].outcomes.length} outcomes`);
  console.log(`---`);

  for (let outcome of annotated[0].outcomes) {
    console.log(outcome);
    console.log(`---`);
  }

  let translated = await translate(annotated, 'Blah');
  let testResults = await test(translated);
  let outcomes = testResults[0].outcomes.filter(o => o.count > 0);

  console.log(`observed ${outcomes.length} outcomes`);
  console.log(`---`);

  for (let outcome of outcomes) {
    console.log(outcome);
    console.log(`---`);
  }
})();
