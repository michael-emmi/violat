#!/usr/bin/env node
"use strict";

let fs = require('fs-extra');
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
const { RandomProgramGenerator } = require(path.join(__dirname, '../lib/enumeration/random.js'));

const uuidv1 = require('uuid/v1');

let cli = meow(`
  Usage
    $ ${name} <spec-file.json>

  Options
    --schema STRING
    --programs N
    --threads N
    --invocations N
    --values N

  Examples
    $ ${name} ConcurrentHashMap.json
    $ ${name} --schema "{ clear(); put(0,1) } || { containsKey(1); remove(0) }" ConcurrentHashMap.json
`, {
  boolean: [],
  default: {
    programs: 200,
  }
});

async function setup() {
  await fs.ensureDir(config.historiesPath);
  await Promise.all(['js','css'].map(ext => {
    let filename = `history.${ext}`;
    return fs.copy(
      path.join(config.resourcesPath, 'visualization', filename),
      path.join(config.historiesPath, filename));
  }));
  let data = await fs.readFile(path.join(config.resourcesPath, 'visualization', 'history.html.mustache'));
  let template = data.toString();
  return { template };
}

async function output(args) {
  let id = uuidv1();
  let dir = path.join(
    config.historiesPath,
    ...args.history.schema.class.split('.'),
    `run-${args.runId}`,
    `test-${args.testId}`);

  let trace = path.join(dir, `trace-${id}.json`);
  let instance = path.join(dir, `trace-${id}.html`);

  await fs.ensureDir(path.dirname(trace));
  fs.writeFile(trace, JSON.stringify(args.history));
  fs.writeFile(instance, Mustache.render(args.template, {
    trace: path.relative(dir, trace),
    path: path.relative(dir, config.historiesPath)
  }));
}

(async () => {

  if (cli.input.length !== 1)
    cli.showHelp();

  console.log(`${cli.pkg.name} version ${cli.pkg.version}`);

  let spec = JSON.parse(fs.readFileSync(cli.input[0]));
  let limits = cli.flags;
  let programGenerator = new RandomProgramGenerator({ spec, limits });
  let { template } = await setup();

  let schemas = [];
  let total = 0;
  let limit = cli.flags.programs;
  let runId = uuidv1();

  for (let schema of programGenerator.getPrograms()) {
    schemas.push(schema);

    if (schemas.length < 100 && !(limit <= ++total))
      continue;

    let tester = new JCStressHistoryGenerator(schemas, 'History');

    tester.onResult(result => {
      console.log(`observed ${result.histories.length} histories in ${result.total} executions`);
      console.log(`---`);

      let testId = uuidv1();

      for (let history of result.histories) {
        output({ history, template, runId, testId });
        console.log(`${history}`);
        console.log(`---`);
      }
    });

    await tester.run();

    if (limit <= total)
      break;

    schemas = [];
  }
})();
