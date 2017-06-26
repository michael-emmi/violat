const debug = require('debug')('output');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const config = require('./config.js');

mkdirp.sync(config.outputPath);

module.exports = function(location, name, data) {
  let filename = path.join(config.outputPath, location, name);
  mkdirp.sync(path.dirname(filename));
  fs.writeFileSync(filename, data);
}
