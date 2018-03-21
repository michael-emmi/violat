const debug = require('debug')('executor');
const assert = require('assert');
const path = require('path');

const utils = require("../utils.js");
const config = require('../config.js');

const { Server } = require('../server.js');

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

  async run(seq, schema) {
    assert.ok(this.ready);
    debug(`sequence: %o`, seq);
    debug(`schema: %O`, schema);
    let query = this._getQuery(seq, schema);
    debug(`query: %o`, query);
    let result = await this.server.query(query)
    debug(`result: %o`, result);
    return result;
  }

  close() {
    assert.ok(this.ready);
    this.server.close();
  }

  _getQuery(seq, schema) {
    let invocations = [].concat(...schema.sequences.map(s => s.invocations));
    debug(`invocations: %o`, invocations);
    return ({
      class: schema.class,
      constructor: {
        parameters: schema.parameters || []
      },
      arguments: schema.arguments || [],

      // TODO FIXME why using both id and index for invocation identifiers??

      invocations: seq.map(id => invocations.find(i => i.id === id || i.index === id))
    });
  }
}

module.exports = { Executor };
