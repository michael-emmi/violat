#!/usr/bin/env node
"use strict";

let fs = require('fs');
let path = require('path');
let meow = require('meow');
let gen = require(path.join(__dirname, '../lib', 'spec-generator.js'));
let meta = require('../package.json');

let cli = meow(`
  Usage
    $ generate-class-spec <class-name>

  Options
    --help              Show this message.

  Examples
    $ generate-class-spec java.util.LinkedList
`, {
  default: {
  }
});

if (!cli.input[0])
  cli.showHelp();

(async () => {
  console.log(JSON.stringify(await gen.generateSpec(cli.input[0]), null, 2));
})();
