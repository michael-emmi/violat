#!/usr/bin/env node
"use strict";

import * as fs from 'fs-extra';
import * as path from 'path';
import * as meow from 'meow';
import * as gen from '../spec-generator';
let meta = require('../../package.json');

let cli = meow(`
  Usage
    $ generate-class-spec <class-name>

  Options
    --help              Show this message.

  Examples
    $ generate-class-spec java.util.LinkedList
`);

if (!cli.input[0])
  cli.showHelp();

(async () => {
  console.log(JSON.stringify(await gen.generateSpec(cli.input[0]), null, 2));
})();
