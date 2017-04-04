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
    invocations: 2
  }
});

if (!cli.flags.spec)
  cli.showHelp();

(async () => {
  console.log(`SPEC TESTER`);
  console.log(`---`);
  console.log(`class: ${JSON.parse(fs.readFileSync(cli.flags.spec)).class}`);
  if (cli.flags.method)
    console.log(`method: ${cli.flags.method}`);
  console.log(`sequences: ${cli.flags.sequences}`);
  console.log(`invocations: ${cli.flags.invocations}`)
  console.log(`---`);

  let results = cli.flags.method
    ? await checker.testMethod(cli.flags.spec, cli.flags.method, cli.flags.sequences, cli.flags.invocations)
    : await checker.testUntrustedMethods(cli.flags.spec, cli.flags.sequences, cli.flags.invocations);

  for (let result of ([].concat(results))) {
    if (result.status == 'fail') {
      console.log(`Bug found!`);
      console.log(`The following harness got ${result.values}:`);
      console.log(`---`);
      console.log(result.harness);
      console.log(`---`);
    }
  }
})();
