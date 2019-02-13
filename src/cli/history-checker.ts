#!/usr/bin/env node
"use strict";

import * as fs from 'fs-extra';
import * as glob from 'glob';
import * as path from 'path';
import * as meow from 'meow';
import * as Mustache from 'mustache';
import config from '../config';
let defaults = config.defaultParameters;

let meta = require('../../package.json');
let name = Object.keys(meta.bin)
  .find(key => meta.bin[key].match(path.basename(__filename)));

import { Schema } from '../schema';
import * as RunJavaObjectServer from '../java/runjobj';
import { Executor } from '../java/executor';
import { ConsistencyChecker } from '../search/checker';

import { performance } from 'perf_hooks';
import * as uuidv1 from 'uuid/v1';

async function output(log) {
  await fs.ensureDir(path.join(config.resultsPath));
  await Promise.all(['js','css'].map(ext => {
    let filename = `plot.${ext}`;
    return fs.copy(
      path.join(config.resourcesPath, 'visualization', filename),
      path.join(config.resultsPath, filename));
  }));
  let logFile = path.join(config.resultsPath, `history-checker-${uuidv1()}.json`);
  fs.writeFile(logFile, JSON.stringify(log, null, 2));

  let data = await fs.readFile(path.join(config.resourcesPath, 'visualization', 'plot.html.mustache'));
  let template = data.toString();
  let instance = path.join(config.resultsPath, 'plot.html');

  glob(path.join(config.resultsPath, "history-checker-*.json"), {}, (err, files) => {
    fs.writeFile(instance, Mustache.render(template, {
      files: files.map(f => path.relative(path.dirname(instance), f))
    }));
  });
}

async function sleep(ms) {
  return new Promise((resolve, _) => {
    setTimeout(_ =>  resolve(), ms);
  });
}

let cli = meow(`
  Usage
    $ ${name} [options] <history-file.json>

  Options
    --weak            Check weak consistency.
    --jit             Apply Lowe’s just-in-time linearizability.
    --min             Explore only minimal visibilities.
    --time-limit N    Per-trace millisecond time limit.

  Examples
    $ ${name} --weak some_history.json
`, {
  flags: {
    weak: 'boolean',
    jit: 'boolean',
    min: 'boolean',
    timeLimit: { default: 1000 }
  }
});

(async () => {

  if (cli.input.length < 1)
    cli.showHelp();

  let { javaHome } = cli.flags;

  let server = await RunJavaObjectServer.create({
    sourcePath: path.resolve(config.resourcesPath, 'runjobj'),
    workPath: path.resolve(config.outputPath, 'runjobj'),
    javaHome
  });
  let executor = new Executor(server);
  await executor.isReady();
  let checker = new ConsistencyChecker({ executor, ...cli.flags });
  let stats: {}[] = [];
  let log = { ...cli.flags, stats };

  for (let input of cli.input) {
    let html = path.join(path.dirname(input), `${path.basename(input, '.json')}.html`);
    let url = `http://localhost:8080/${path.relative(config.outputPath, html)}`;

    console.log(`---`);
    console.log(url);

    let t0 = performance.now();
    let result = await Promise.race([checker.check(input), sleep(cli.flags.timeLimit)]);

    let time = performance.now() - t0;
    let schema = JSON.parse(await fs.readFile(input).toString()).schema;
    let frequency = schema.frequency;

    stats.push({
      input,
      url,
      schema,
      frequency,
      result,
      time
    });

    console.log(`result: ${result === undefined ? 'unknown' : result ? 'consistent' : 'inconsistent'}`);
    console.log(`time: ${time}ms`);

    if (!result)
      process.exitCode++;
  }

  server.close();
  output(log);

})();
