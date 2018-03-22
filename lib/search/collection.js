const debug = require('debug')('collection');
const assert = require('assert');

const { Executor } = require('../java/executor.js');

class Collectors {
  static get(kind) {
    switch (kind) {
      case 'atomic':
        return new AtomicExecutionCollector();
      case 'spec':
        return new RelaxedExecutionCollector();
      default:
        assert.fail(`Unexpected collector: ${kind}`);
    }
  }
}

class ExecutionCollector {
  constructor() {
    this.executor = new Executor();
  }

  close() {
    this.executor.close();
  }

  async * collect(schema) {
    let results = new Set();

    for await (let model of this.models(schema)) {
      debug(`model: %o`, model);
      let result = await this.run(model);
      debug(`result: %o`, result);

      let str = JSON.stringify(result);
      if (!results.has(str))
        yield result;

      results.add(str);
    }
  }
}

class AtomicExecutionCollector extends ExecutionCollector {

  async * models(schema) {
    for (let lin of schema.getProgramOrder().linearizations())
      yield { schema, lin: lin.map(i => i.id) };
  }

  async run({ schema, lin }) {
    let result = {};
    for (let [idx,value] of (await this.executor.run(lin, schema)).entries()) {
      result[lin[idx]] = value;
    }
    return result;
  }
}

class RelaxedExecutionCollector extends ExecutionCollector {

  async * models(schema) {
    for (let lin of schema.getProgramOrder().linearizations())
      for await (let vis of XXX.visibilities())
        yield { schema, lin, vis };
  }

  async run({ schema, lin, vis }) {
    let result = [];
    let prefix = [];
    for (let op of lin) {
      prefix.push(op);
      let projection = this._projection(prefix, vis);
      let response = await this.executor.run(projection, schema);
      result.push(response.pop());
    }
    return result;
  }
}

module.exports = {
  Collectors,
  AtomicExecutionCollector,
  RelaxedExecutionCollector
};
