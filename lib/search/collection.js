const debug = require('debug')('collection');
const assert = require('assert');

class ExecutionCollector {
  constructor(executor) {
    this.executor = executor;
  }

  async * collect(schema) {
    for await (let model of this.models(schema)) {
      debug(`model: %o`, model);
      let result = await this.run(model);
      debug(`result: %o`, result);
      yield result;
    }
  }
}

class AtomicExecutionCollector extends ExecutionCollector {
  constructor(executor) {
    super(executor);
  }

  async * models(schema) {
    for (let lin of schema.getProgramOrder().linearizations())
      yield { schema, lin: lin.map(i => i.id) };
  }

  async run({ schema, lin }) {
    return await this.executor.run(lin, schema)
  }
}

class RelaxedExecutionCollector extends ExecutionCollector {
  constructor(executor) {
    super(executor);
  }

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
  AtomicExecutionCollector,
  RelaxedExecutionCollector
};
