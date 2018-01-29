#!/usr/bin/env node
"use strict";

let fs = require('fs-extra');
let ncp = require('ncp');
let mkdirp = require('mkdirp');
let path = require('path');
let meow = require('meow');
let Mustache = require('mustache');
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

async function setup() {
  const VP = path.join(config.resourcesPath, 'visualization');
  const HP = config.historiesPath;
  await fs.ensureDir(HP);
  for (let f of ['history.css', 'history.js'])
    await fs.copy(path.join(VP, f), path.join(HP, f));
  let template = (await fs.readFile(path.join(VP, 'history.html.mustache'))).toString();
  return { template };
}

async function output(history, template) {
  let id = uuidv1();
  let dir = path.join(config.historiesPath, ...history.schema.class.split('.'));
  let trace = path.join(dir, `${id}.json`);
  let instance = path.join(dir, `${id}.html`);

  await fs.ensureDir(path.dirname(trace));
  fs.writeFile(trace, JSON.stringify(history));
  fs.writeFile(instance, Mustache.render(template, {
    trace: path.relative(dir, trace),
    path: path.relative(dir, config.historiesPath)
  }));
}

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

  let { template } = await setup();

  for (let schema of enumeration.generator(args)) {
    schemas.push(schema);
    if (schemas.length < 100 && !(args.cutoff <= ++total))
      continue;

    let tester = new JCStressHistoryGenerator(schemas, 'History');

    for (let result of await tester.run()) {
      console.log(`observed ${result.histories.length} histories in ${result.total} executions`);
      console.log(`---`);

      for (let history of result.histories) {
        output(history, template);
        console.log(`${history}`);
        console.log(`---`);
      }
    }

    if (args.cutoff <= total)
      break;

    schemas = [];
  }
})();
