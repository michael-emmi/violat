import * as assert from 'assert';
import * as Debug from 'debug';
const debug = Debug('executor');

import { Invocation, Schema } from '../schema';
import { RunJavaObjectServer } from '../java/runjobj';

export class Executor {
  server: RunJavaObjectServer;

  constructor(server) {
    this.server = server;
  }

  async isReady() {
    return await this.server.isReady();
  }

  async execute(invocations: Invocation[], schema: Schema) {
    debug(`executing invocations: %o`, invocations);
    return await this._getResult(invocations, schema);
  }

  async _getResult(invocations: Invocation[], schema: Schema) {
    let query = this._getQuery(invocations, schema);
    return await this._getResultFromQuery(invocations, query);
  }

  _getQuery(invocations: Invocation[], schema: Schema) {
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

  async _getResultFromQuery(invocations: Invocation[], query: {}) {
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

export class CachingExecutor extends Executor {
  cache: Map<string, string>;

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
