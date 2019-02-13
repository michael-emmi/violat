#!/usr/bin/env node
"use strict";

import * as fs from 'fs-extra';
import * as path from 'path';
import * as meow from 'meow';
import * as Mustache from 'mustache';
import config from '../config';
let defaults = config.defaultParameters;

let meta = require('../../package.json');
let name = Object.keys(meta.bin)
  .find(key => meta.bin[key].match(path.basename(__filename)));

import { Schema } from '../schema';
import { JCStressHistoryGenerator } from '../java/jcstress/histories';
import { RandomProgramGenerator } from '../enumeration/random';

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
  flags: {
    programs: { default: 20 }
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
  console.log(`---`);

  let spec = JSON.parse(fs.readFileSync(cli.input[0]).toString());
  let limits = cli.flags;
  let { javaHome } = cli.flags;
  let programGenerator = new RandomProgramGenerator({ spec, limits });
  let { template } = await setup();

  let schemas: Schema[] = [];
  let total = 0;
  let count = 0;
  let limit = cli.flags.programs;
  let runId = uuidv1();

  for (let schema of programGenerator.getPrograms()) {
    schemas.push(schema);

    if (schemas.length < 100 && !(limit <= ++total))
      continue;

    let tester = new JCStressHistoryGenerator(schemas, [], javaHome, 'History');

    for await (let result of tester.getResults()) {
      console.log(`result ${++count} of ${limit}`);
      console.log(`observed ${result.histories.length} histories in ${result.total} executions`);
      console.log(`---`);

      let testId = uuidv1();

      for (let history of result.histories)
        output({ history, template, runId, testId });

    }

    if (limit <= total)
      break;

    schemas = [];
  }
})();
