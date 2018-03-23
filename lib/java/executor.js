const debug = require('debug')('executor');
const assert = require('assert');

class Executor {
  constructor(server) {
    this.server = server;
  }

  async isReady() {
    return await this.server.isReady();
  }

  async execute(invocations, schema) {
    debug(`executing invocations: %o`, invocations);
    return await this._getResult(invocations, schema);
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
