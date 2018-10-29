const path = require('path');
const mkdirp = require('mkdirp');
const meta = require('../package.json');

const outputPath = `${path.resolve(meta.name)}-output`;

export default {
  defaultParameters: {
    values: 2,
    sequences: 2,
    invocations: 3,
    limit: 1,
    cutoff: undefined,
    testBatchSize: 100,
    enum: 'shuffle'
  },
  outputPath: outputPath,
  historiesPath: path.join(outputPath, 'histories'),
  resultsPath: path.join(outputPath, 'results'),
  resourcesPath: path.join(__dirname, '../resources')
};

mkdirp.sync(outputPath);
