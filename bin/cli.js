#!/usr/bin/env node
"use strict";

let fs = require('fs');
let path = require('path');
let minimist = require('minimist');
let checker = require(path.join(__dirname, '../lib', 'index.js'));

var args = minimist(process.argv.slice(2), {
  default: {
    sequences: 2,
    invocations: 2
  }
});

var check = arg => {
  if (!(arg in args))
    throw new Error(`Missing argument: ${arg}`);
}

check('spec');
if (!fs.existsSync(args.spec)) {
  throw new Error(`Cannot find file: ${args.spec}`);
}

(async () => {
  console.log(`SPEC TESTER`);
  console.log(`---`);
  console.log(`class: ${JSON.parse(fs.readFileSync(args.spec)).class}`);
  if (args.method)
    console.log(`method: ${args.method}`);
  console.log(`sequences: ${args.sequences}`);
  console.log(`invocations: ${args.invocations}`)
  console.log(`---`);

  let results = args.method
    ? await checker.testMethod(args.spec, args.method, args.sequences, args.invocations)
    : await checker.testUntrustedMethods(args.spec, args.sequences, args.invocations);

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
