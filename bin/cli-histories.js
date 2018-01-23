#!/usr/bin/env node
"use strict";

let fs = require('fs');
let mkdirp = require('mkdirp');
let path = require('path');
let meow = require('meow');
var config = require(path.join(__dirname, '../lib', 'config.js'));
let defaults = config.defaultParameters;

let meta = require('../package.json');
let name = Object.keys(meta.bin)
  .find(key => meta.bin[key].match(path.basename(__filename)));

const { Schema } = require(path.join(__dirname, '../lib', 'schema.js'));
const annotate = require(path.join(__dirname, '../lib', 'outcomes.js'));
const { JCStressHistoryGenerator } = require(path.join(__dirname, '../lib', 'jcstress.js'));

const uuidv1 = require('uuid/v1');

let cli = meow(`
  Usage
    $ ${name} <harness-schema.json>

  Options
    --schema STRING             Construct schema from STRING and JSON spec.

  Examples
    $ ${name} --schema "{ clear(); put(0,1) } || { containsKey(1); remove(0) }" ConcurrentHashMap.json
`, {
  boolean: [],
  default: {}
});

(async () => {

  if (cli.input.length !== 1)
    cli.showHelp();

  let json = fs.readFileSync(cli.input[0]);
  let schema = cli.flags.schema
    ? Schema.fromString(cli.flags.schema, json)
    : Schema.fromJson(json);

  if (!schema.id)
    schema.id = 0;
  let args = Object.assign({}, cli.flags);

  console.log(`${cli.pkg.name} version ${cli.pkg.version}`);

  let tester = new JCStressHistoryGenerator([schema], 'Blah');
  let testResults = await tester.run();
  let total = testResults[0].total;
  let histories = testResults[0].histories;

  console.log(`observed ${histories.length} outcomes in ${total} executions`);
  console.log(`---`);

  for (let history of histories) {
    let hpath = path.join(config.historiesPath, ...history.schema.class.split('.'), `${uuidv1()}.json`);
    mkdirp(path.dirname(hpath), (err) => {
      if (err) throw err;
      fs.writeFile(hpath, JSON.stringify(history), (err) => {
        if (err) throw err;
      });
    });
    console.log(`${history}`);
    console.log(`---`);
  }
})();
