const debug = require('debug')('collection');
const assert = require('assert');

const { Executor, CachingExecutor } = require('../java/executor.js');

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
    this.executor = new CachingExecutor();
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
      yield { schema, lin };
  }

  async run({ schema, lin }) {
    return await this.executor.execute(lin, schema);
  }
}

class RelaxedExecutionCollector extends ExecutionCollector {

  async * models(schema) {
    for (let lin of schema.getProgramOrder().linearizations())
      for await (let vis of this._visibilities(schema, lin))
        yield { schema, lin, vis };
  }

  async * _visibilities(schema, lin) {
    debug(`generating visibilities for %s`, lin);
    let minimal = this._minimalVis(schema, lin);

    debug(`generated visibility: %o`, minimal);
    yield minimal;

    for await (let vis of this._extensions(schema, lin, minimal)) {
      debug(`generated visibility: %o`, vis);
      yield vis;
    }
  }

  _minimalVis(schema, lin) {
    let vis = {};
    let preds = [];
    for (let inv of lin) {
      vis[inv.id] = new Set();

      // NOTE consider predecessors in reverse order, so that we can
      // consider transitive constraints in order
      for (let pred of preds.reverse())
        if (this._mustSee(inv, pred, preds, vis, schema))
          vis[inv.id].add(pred.id);

      preds.push(inv);
    }
    return vis;
  }

  async * _extensions(schema, lin, base) {
    let extensions = [base];

    let preds = [];

    for (let inv of lin) {
      for (let pred of preds) {
        for (let vis of extensions) {
          if (!vis[inv.id].has(pred.id)) {
            let ext = Object.assign({}, vis, {
              [inv.id]: new Set([pred.id, ...vis[inv.id]])
            });
            yield ext;
            extensions.push(ext);
          }
        }
      }
      preds.push(inv);
    }
  }

  _mustSee(src, tgt, preds, vis, schema) {
    let s1 = schema.sequences.find(s => s.invocations.includes(src));
    let s2 = schema.sequences.find(s => s.invocations.includes(tgt));

    let self = _ => s1 === s2;

    let monotonic = _ => preds.some(inv => {
      let s3 = schema.sequences.find(s => s.invocations.includes(inv));
      return s1 === s3 && vis[inv.id].has(tgt.id);
    });

    let peer = _ => preds.some(inv => {
      let s3 = schema.sequences.find(s => s.invocations.includes(inv));

      // NOTE this relies on reverse-order processing, so that `inv` is known
      // to be linearized after `tgt`.
      return s2 === s3 && vis[src.id].has(inv.id);
    });

    let causal = _ => preds.some(inv => {

      // NOTE this relies on reverse-order processing, so that `inv` is known
      // to be linearized after `tgt`.
      return vis[src.id].has(inv.id) && vis[inv.id].has(tgt);
    });

    switch (src.method.visibility) {
      case 'weak':      return false;
      case 'self':      return self();
      case 'monotonic': return self() || monotonic();
      case 'peer':      return self() || monotonic() || peer();
      case 'causal':    return self() || monotonic() || peer() || causal();
      case 'complete':
      case undefined:   return true;
      default: assert.fail(`unexpected visibility: ${src.method.visibility}`);
    }
  }

  async run({ schema, lin, vis }) {
    let result = {};
    let prefix = [];

    for (let op of lin) {
      prefix.push(op);
      let projection = this._projection(prefix, vis);
      let response = await this.executor.execute(projection, schema);
      result[op.id] = response[op.id];
    }

    // XXX optimized code: avoid redundant executor calls
    // XXX
    // let rest = [...lin];
    // while (rest.length) {
    //   let idx = prefix.length;
    //   prefix.push(rest.shift());
    //
    //   while (rest.length && vis[rest[0].id].size == prefix.length)
    //     prefix.push(rest.shift());
    //
    //   let projection = this._projection(prefix, vis);
    //   let response = await this.executor.execute(projection, schema);
    //
    //   for (let inv of prefix.slice(idx))
    //     result[inv.id] = response[inv.id];
    // }

    return result;
  }

  _projection(seq, vis) {
    let last = seq[seq.length-1];
    return seq.filter(inv => inv.id === last.id || vis[last.id].has(inv.id));
  }
}

module.exports = {
  Collectors,
  AtomicExecutionCollector,
  RelaxedExecutionCollector
};
