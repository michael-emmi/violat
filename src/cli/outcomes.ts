#!/usr/bin/env node
"use strict";

import * as fs from 'fs-extra';
import * as path from 'path';
import * as meow from 'meow';
import config from '../config';
let defaults = config.defaultParameters;

let meta = require('../../package.json');
let name = Object.keys(meta.bin)
  .find(key => meta.bin[key].match(path.basename(__filename)));

const { Schema } = require(path.join(__dirname, '../lib', 'schema.js'));
const annotate = require(path.join(__dirname, '../lib', 'outcomes.js'));
const { JCStressTester } = require(path.join(__dirname, '../lib', 'jcstress.js'));

let cli = meow(`
  Usage
    $ ${name} <harness-schema.json>

  Options
    --schema STRING              Construct schema from STRING and JSON spec.
    --[no-]test                 Just predict outcomes; no testing.
    --weak                      Admit weakly-atomic outcomes.
    --weak-relax-linearization  Linearizations need not include program order.
    --weak-relax-visibility     Visibility need not include program order.
    --weak-relax-returns        Return values need not agree across views.

  Examples
    $ ${name} --weak my_test_harness_schema.json
`, {
  flags: {
    weak: { type: 'boolean' },
    weakRelaxLinearization: { type: 'boolean' },
    weakRelaxVisibility: { type: 'boolean' },
    weakRelaxReturns: { type: 'boolean' }
  }
});

(async () => {

  if (cli.input.length !== 1)
    cli.showHelp();

  let json = fs.readFileSync(cli.input[0]).toString();
  let schema = cli.flags.schema
    ? Schema.fromString(cli.flags.schema, JSON.parse(json))
    : Schema.fromJson(json);

  if (!schema.id)
    schema.id = 0;
  let args = Object.assign({}, cli.flags);

  console.log(`${cli.pkg.name} version ${cli.pkg.version}`);
  let annotated = await annotate([schema], args);

  console.log(`predicted ${annotated[0].outcomes.length} outcomes`);
  console.log(`---`);

  for (let outcome of annotated[0].outcomes) {
    console.log(`${outcome}`);
    console.log(`---`);
  }

  if (!cli.flags.test)
    return;

  let tester = new JCStressTester(annotated, 'Blah');
  let testResults = await tester.run();
  let total = testResults[0].total;
  let outcomes = testResults[0].outcomes.filter(o => o.count > 0);

  console.log(`observed ${outcomes.length} outcomes in ${total} executions`);
  console.log(`---`);

  for (let outcome of outcomes) {
    console.log(`${outcome}`);
    console.log(`---`);
  }
})();
