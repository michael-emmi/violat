var path = require('path');
var meta = require('../package.json');

module.exports = {
  outputPath: `${path.resolve(meta.name)}-output`
};
