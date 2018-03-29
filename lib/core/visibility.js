const debug = require('debug')('visibility');
const assert = require('assert');

class VisibilitySemantics {

  mustSee({ src, tgt, preds, vis, schema }) {
    let s1 = schema.sequences.find(s => s.invocations.includes(src));
    let s2 = schema.sequences.find(s => s.invocations.includes(tgt));

    let self = _ => s1 === s2;

    let monotonic = _ => preds.some(inv => {
      let s3 = schema.sequences.find(s => s.invocations.includes(inv));
      return s1 === s3 && vis.isVisible(inv,tgt);
    });

    let peer = _ => preds.some(inv => {
      let s3 = schema.sequences.find(s => s.invocations.includes(inv));

      // NOTE this relies on reverse-order processing, so that `inv` is known
      // to be linearized after `tgt`.
      return s2 === s3 && vis.isVisible(src,inv);
    });

    let causal = _ => preds.some(inv => {

      // NOTE this relies on reverse-order processing, so that `inv` is known
      // to be linearized after `tgt`.
      return vis.isVisible(src,inv) && vis.isVisible(inv,tgt);
    });

    switch (src.method.visibility) {
      case 'weak':      return false;
      case 'self':      return self();
      case 'monotonic': return self() || monotonic();
      case 'peer':      return self() || monotonic() || peer();
      case 'causal':    return self() || monotonic() || peer() || causal();
      case 'complete':  return true;
      default: assert.fail(`unexpected visibility: ${src.method.visibility}`);
    }
  }

  pruneSpecification({ methods: specMethods, ...rest }) {
    let methods = specMethods.filter(m => {
      m.visibility || debug(`omitting method: ${m.name}`);
      return m.visibility;
    });
    return { methods, ...rest };
  }
}

class VisibilityGenerator {
  constructor() {
    this.semantics = new VisibilitySemantics();
  }

  async * getVisibilities({ schema, linearization }) {
    let extender = new VisibilityExtender({ schema, linearization, ...this });

    debug(`generating visibilities for %s`, linearization);
    let minimal = extender.getMinimal();

    debug(`generated visibility: %o`, minimal);
    yield extender.toVisibility(minimal);

    for await (let vis of extender.getExtensions(minimal)) {
      debug(`generated visibility: %o`, vis);
      yield extender.toVisibility(vis);
    }
  }
}

class VisibilityExtender {
  constructor({ semantics, schema, linearization }) {
    this.semantics = semantics;
    this.schema = schema;
    this.linearization = linearization;
  }

  getMinimal() {
    let vis = {};
    let preds = [];
    for (let src of this.linearization) {
      vis[src.id] = new Set();

      // NOTE we consider predecessors in reverse order, in order to
      // consider transitive constraints in order
      for (let tgt of preds.reverse()) {
        let visible = this.semantics.mustSee({
          src,
          tgt,
          preds,
          vis: this.toVisibility(vis),
          schema: this.schema
        });

        if (visible)
          vis[src.id].add(tgt.id);
      }

      preds.push(src);
    }
    return vis;
  }

  async * getExtensions(base) {
    let extensions = [base];
    let preds = [];

    for (let inv of this.linearization) {
      for (let pred of preds) {
        for (let vis of extensions) {
          if (!vis[inv.id].has(pred.id)) {
            let ext = this.extend(vis, pred, inv);
            yield ext;
            extensions.push(ext);
          }
        }
      }
      preds.push(inv);
    }
  }

  extend(vis, tgt, src) {
    let extension = Object.assign({}, vis, {
      [src.id]: new Set([tgt.id, ...vis[src.id]])
    });

    return extension;
    //
    // let newPreds = new Set([tgt]);
    //
    // if (src.method.visibility === 'causal')
    //   for (let pred of _visibleto_(tgt))
    //     newPreds.push(pred);
    //
    // else (src.method.visibility === 'peer')
    //   for (let pred of _before_(tgt))
    //     newPreds.push(pred);
    //
    // let workList = newPreds.map(pred => [pred, src]);
    //
    // while (workList.length) {
    //   let [i1,i2] = workList.shift();
    //
    // }
    //
    // // add tgt to the monotonic successors of src
    // for (let succ of _after_(src))
    //   if (succ.method.visibility _>=_ 'monotonic')
    //     ...

  }

  toVisibility(vis) {
    return {
      isVisible: (source, target) => vis[source.id].has(target.id),
      visible: (source) => [...vis[source.id]]
    };
  }
}

module.exports = {
  VisibilitySemantics,
  VisibilityGenerator
};
