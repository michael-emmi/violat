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
const enumeration = require(path.join(__dirname, '../lib', 'random-enumeration.js'));

const uuidv1 = require('uuid/v1');

let cli = meow(`
  Usage
    $ ${name} <spec-file.json>

  Options
    --schema STRING
    --methods <method-name(s)>
    --values N
    --sequences N
    --invocations N
    --cutoff N

  Examples
    $ ${name} --schema "{ clear(); put(0,1) } || { containsKey(1); remove(0) }" ConcurrentHashMap.json
    $ ${name} --methods clear ConcurrentHashMap.json
`, {
  boolean: [],
  default: {}
});

(async () => {

  if (cli.input.length !== 1)
    cli.showHelp();

  if (!cli.flags.schema && !cli.flags.methods)
    cli.showHelp();

  let spec = JSON.parse(fs.readFileSync(cli.input[0]));
  let args = Object.assign({}, defaults, cli.flags, {
    spec,
    methods: cli.flags.methods && cli.flags.methods.split(',')
  });

  console.log(`${cli.pkg.name} version ${cli.pkg.version}`);

  let schemas = [];
  let total = 0;

  for (let schema of enumeration.generator(args)) {
    schemas.push(schema);
    if (schemas.length < 100 && !(args.cutoff <= ++total))
      continue;

    let tester = new JCStressHistoryGenerator(schemas, 'History');

    for (let result of await tester.run()) {
      console.log(`observed ${result.histories.length} histories in ${result.total} executions`);
      console.log(`---`);

      for (let history of result.histories) {
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
    }

    if (args.cutoff <= total)
      break;

    schemas = [];
  }
})();
