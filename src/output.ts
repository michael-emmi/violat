import * as assert from 'assert';
import * as Debug from 'debug';
const debug = Debug('output');

const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const config = require('./config.js');

export function output(location, name, data) {
  let filename = path.join(config.outputPath, location, name);
  mkdirp.sync(path.dirname(filename));
  fs.writeFileSync(filename, data);
}
