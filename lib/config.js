var path = require('path');
var meta = require('../package.json');

module.exports = {
  defaultParameters: {
    values: 2,
    sequences: 2,
    invocations: 3,
    limit: 1,
    testBatchSize: 100,
    enum: 'shuffle'
  },
  outputPath: `${path.resolve(meta.name)}-output`,
  resourcesPath: path.join(__dirname, '../resources')
};
