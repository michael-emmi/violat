var path = require('path');
var meta = require('../package.json');

module.exports = {
  defaultParameters: {
    values: 2,
    sequences: 2,
    invocations: 3
  },
  outputPath: `${path.resolve(meta.name)}-output`,
  resourcesPath: path.join(__dirname, '../resources')
};
