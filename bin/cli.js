#!/usr/bin/env node
"use strict";

let fs = require('fs');
let path = require('path');
let meow = require('meow');
let checker = require(path.join(__dirname, '../lib', 'index.js'));
let meta = require('../package.json');

let cli = meow(`
  Usage
    $ ${meta.name} --spec <spec-file.json>

  Options
    --spec <spec-file.json>     Java class specification file (required).
    --method <method-name>      Name of a method to test.
    --values N                  Number of distinct argument values.
    --sequences N               Number of concurrent invocation sequences.
    --invocations N             Total nuber of invocations.

  Examples
    $ ${meta.name} \\
      --spec specs/java/util/concurrent/ConcurrentSkipListMap.json \\
      --method clear \\
      --sequences 2 \\
      --invocations 4
`, {
  default: {
    sequences: 2,
    invocations: 2,
    values: 2
  }
});

if (!cli.flags.spec)
  cli.showHelp();

(async () => {
  console.log(`${meta.name} version ${meta.version}`);
  console.log(`---`);
  console.log(`class: ${JSON.parse(fs.readFileSync(cli.flags.spec)).class}`);
  if (cli.flags.method)
    console.log(`method: ${cli.flags.method}`);
  console.log(`values: ${cli.flags.values}`);
  console.log(`sequences: ${cli.flags.sequences}`);
  console.log(`invocations: ${cli.flags.invocations}`)
  console.log(`---`);

  let results = cli.flags.method
    ? await checker.testMethod(cli.flags)
    : await checker.testUntrustedMethods(cli.flags);

  for (let result of ([].concat(results))) {
    if (result.failedHarness) {
      console.log(`Violation discovered in the following harness.`);
      console.log(`---`);
      console.log(result.harnessCode);
      console.log(`---`);
      for (let r of result.forbiddenResults)
        console.log(`${r.count} of ${result.numExecutions} executions gave outcome: ${r.outcome}`);
      console.log(`---`);
    }
  }
})();
