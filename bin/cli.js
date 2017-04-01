#!/usr/bin/env node
"use strict";

let fs = require('fs');
let path = require('path');
let meow = require('meow');
let checker = require(path.join(__dirname, '../lib', 'index.js'));
let script = `find-non-linearizability-tests`;

let cli = meow(`
  Usage
    $ ${script} --spec <spec-file.json>

  Options
    --spec <spec-file.json>
    --method <method-name>
    --sequences N
    --invocations N

  Examples
    $ ${script} \\
      --spec specs/java/util/concurrent/ConcurrentSkipListMap.json \\
      --method clear \\
      --sequences 4 \\
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