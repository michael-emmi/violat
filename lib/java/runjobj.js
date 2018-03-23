const debug = require('debug')('runjobj');
const assert = require('assert');

const path = require('path');

const { gradleBuildJar } = require('./build.js');
const { Server } = require('./server.js');

class RunJavaObjectServer extends Server {
  constructor({ sourcePath, workPath }) {
    super(async () => await gradleBuildJar({ sourcePath, workPath, name: 'runjobj' }));
  }
}

module.exports = {
  RunJavaObjectServer
};
