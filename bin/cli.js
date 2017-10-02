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
    --method <method-name>      Name of a method to test.
    --values N                  Number of distinct argument values.
    --sequences N               Number of concurrent invocation sequences.
    --invocations N             Total number of invocations.
    --enum [complete|shuffle|random]  Enumeration strategy (default: ${defaults.enum}).
    --limit N                   Limit to N violations (default: ${defaults.limit}).
    --weak                      Check “weak” atomicity.

  Examples
    $ ${meta.name} \\
      --method clear \\
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
    spec: JSON.parse(fs.readFileSync(cli.input[0]))
  });

  console.log(`${cli.pkg.name} version ${cli.pkg.version}`);
  console.log(`---`);
  console.log(`class: ${args.spec.class}`);
  console.log(`---`);

  let violations = args.method
    ? await checker.testMethod(args)
    : await checker.testUntrustedMethods(args);

  for (let violation of violations) {
    console.log(`Violation discovered in the following harness.`);
    console.log(`---`);
    console.log(violation.harnessCode);
    console.log(`---`);
    for (let r of violation.forbiddenResults)
      console.log(`${r.count} of ${violation.numExecutions} executions gave outcome: ${r.outcome}`);
    console.log(`---`);
  }
})();
