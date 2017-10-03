#!/usr/bin/env node
"use strict";

let fs = require('fs');
let path = require('path');
let meow = require('meow');
var config = require(path.join(__dirname, '../lib', 'config.js'));
let checker = require(path.join(__dirname, '../lib', 'index.js'));
let meta = require('../package.json');
let defaults = config.defaultParameters;

let cli = meow(`
  Usage
    $ ${meta.name} <spec-file.json>

  Options
    --methods <method-name(s)>  Name(s) of a method to test (jointly).
    --values N                  Number of distinct argument values.
    --sequences N               Number of concurrent invocation sequences.
    --invocations N             Total number of invocations.
    --enum [complete|shuffle|random]  Enumeration strategy (default: ${defaults.enum}).
    --limit N                   Limit to N violations (default: ${defaults.limit}).
    --cutoff N                  Explore at most N harnesses (default: ${defaults.cutoff}).
    --weak                      Check “weak” atomicity.

  Examples
    $ ${meta.name} \\
      --methods clear \\
      --sequences 2 \\
      --invocations 4 \\
      specs/java/util/concurrent/ConcurrentSkipListMap.json
`, {
  default: {
  }
});

(async () => {

  let args = Object.assign({}, cli.flags, {
    specFile: cli.input.length == 1 && cli.input[0] || cli.showHelp(),
    spec: JSON.parse(fs.readFileSync(cli.input[0])),
    methods: cli.flags.methods && cli.flags.methods.split(',')
  });

  console.log(`${cli.pkg.name} version ${cli.pkg.version}`);
  console.log(`---`);
  console.log(`class: ${args.spec.class}`);
  console.log(`---`);

  let results = args.methods
    ? await checker.testMethod(args)
    : await checker.testUntrustedMethods(args);

  for (let result of results) {
    if (result.outcomes.every(x => x.expectation == 'ACCEPTABLE' || x.count < 1))
      continue;

    console.log(`Violation/weakness discovered in the following harness.`);
    console.log(`---`);
    console.log(result.harness);
    console.log(`---`);
    let total = result.outcomes.reduce((sum,x) => sum + x.count, 0);
    for (let outcome of result.outcomes) {
      if (outcome.count < 1)
        continue;
      else if (outcome.expectation == 'FORBIDDEN')
        console.log(`${outcome.count} of ${total} executions gave violating outcome: ${outcome.result}`);
      else if (outcome.expectation == 'ACCEPTABLE_INTERESTING')
        console.log(`${outcome.count} of ${total} executions gave weak(${outcome.description}) outcome: ${outcome.result}`);
    }
    console.log(`---`);
  }
})();
