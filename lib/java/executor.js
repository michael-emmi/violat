const debug = require('debug')('executor');
const assert = require('assert');
const path = require('path');

const utils = require("../utils.js");
const config = require('../config.js');

const { Server } = require('./server.js');

const runjobjPath = path.resolve(config.resourcesPath, 'runjobj');
const workPath = path.resolve(config.outputPath, 'runjobj');
const runjobj = path.resolve(workPath, 'build/libs/runjobj.jar');

class Executor {
  constructor(server) {
    this._init();
  }

  async _init() {
    this.init = new Promise(async (resolve, reject) => {
      this.build = await utils.buildJar(runjobjPath, workPath, 'runjobj');
      this.server = new Server(runjobj);
      await this.server.isReady();
      this.ready = true;
      resolve();
    });
  }

  async isReady() {
    await this.init;
    return this.ready;
  }

  async run(invocations, schema) {
    await this.isReady();

    debug(`invocations: %o`, invocations);
    debug(`schema: %O`, schema);

    let query = this._getQuery(invocations, schema);
    debug(`query: %o`, query);

    let response = await this.server.query(query);
    debug(`response: %o`, response);

    let result = {};
    for (let [idx, value] of response.entries())
      result[invocations[idx].id] = value.replace(/\s+/g, '');

    debug(`result: %o`, result);
    return result;
  }

  close() {
    assert.ok(this.ready);
    this.server.close();
  }

  _getQuery(invocations, schema) {
    return ({
      class: schema.class,
      constructor: {
        parameters: schema.parameters || []
      },
      arguments: schema.arguments || [],
      invocations
    });
  }
}

module.exports = { Executor };
