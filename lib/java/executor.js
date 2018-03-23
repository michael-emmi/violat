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

  async execute(invocations, schema) {
    debug(`executing invocations: %o`, invocations);
    return await this._getResult(invocations, schema);
  }

  close() {
    assert.ok(this.ready);
    this.server.close();
  }

  async _getResult(invocations, schema) {
    let query = this._getQuery(invocations, schema);
    return await this._getResultFromQuery(invocations, query);
  }

  _getQuery(invocations, schema) {
    let query = {
      class: schema.class,
      constructor: {
        parameters: schema.parameters || []
      },
      arguments: schema.arguments || [],
      invocations
    };
    debug(`query: %o`, query);
    return query;
  }

  async _getResultFromQuery(invocations, query) {
    await this.isReady();
    let response = await this.server.query(query);
    debug(`response: %o`, response);
    return this._getResultFromResponse(invocations, response);
  }

  _getResultFromResponse(invocations, response) {
    let result = {};
    for (let [idx, value] of response.entries())
      result[invocations[idx].id] = value.replace(/\s+/g, '');
    debug(`result: %o`, result);
    return result;
  }
}

class CachingExecutor extends Executor {
  constructor(server) {
    super(server);
    this.cache = new Map();
  }

  async _getResult(invocations, schema) {
    let query = this._getQuery(invocations, schema);
    let key = this._getKey(query);
    let result;

    if (this.cache.has(key)) {
      result = this.cache.get(key);
      debug(`cached result: %o`, result);

    } else {
      result = await super._getResultFromQuery(invocations, query);
      this.cache.set(key, result);
    }

    return result;
  }

  _getKey(query) {
    return JSON.stringify(query);
  }
}

module.exports = { Executor, CachingExecutor };
