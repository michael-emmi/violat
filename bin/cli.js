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
    --cutoff N                  Run at most N tests (default: ${defaults.cutoff}).
    --weak                      Admit weakly-atomic outcomes.
    --weak-relax-linearization  Linearizations need not include program order.
    --weak-relax-visibility     Visibility need not include program order.
    --weak-relax-returns        Return values need not agree across views.

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

  let weaknesses = 0;
  let violations = 0;

  console.log(`${cli.pkg.name} version ${cli.pkg.version}`);
  console.log(`---`);
  console.log(`class: ${args.spec.class}`);
  console.log(`---`);

  args.onResult = function(result) {
    console.log(`Violation or weakness discovered in the following harness.`);
    console.log(`---`);
    console.log(result.harness);
    console.log(`---`);
    for (let outcome of result.outcomes) {
      if (outcome.expectation == 'FORBIDDEN') {
        violations++;
        console.log(`${outcome.count} of ${result.total} executions gave violating outcome: ${outcome.result}`);
      } else if (outcome.expectation == 'ACCEPTABLE_INTERESTING' && outcome.count > 0) {
        weaknesses++;
        console.log(`${outcome.count} of ${result.total} executions gave weak(${outcome.description}) outcome: ${outcome.result}`);
      }
    }
    console.log(`---`);
  };

  let results = args.methods
    ? await checker.testMethod(args)
    : await checker.testUntrustedMethods(args);

  console.log(`Found ${weaknesses} weakness(es) and ${violations} violation(s).`);
})();
