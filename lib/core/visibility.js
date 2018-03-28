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
    debug(`generating visibilities for %s`, linearization);
    let minimal = this._minimalVisibility(schema, linearization);

    debug(`generated visibility: %o`, minimal);
    yield this._toVisibility(minimal);

    for await (let vis of this._extensions(schema, linearization, minimal)) {
      debug(`generated visibility: %o`, vis);
      yield this._toVisibility(vis);
    }
  }

  _minimalVisibility(schema, lin) {
    let vis = {};
    let preds = [];
    for (let inv of lin) {
      vis[inv.id] = new Set();

      // NOTE we consider predecessors in reverse order, in order to
      // consider transitive constraints in order
      for (let pred of preds.reverse()) {
        let visible = this.semantics.mustSee({
          src: inv,
          tgt: pred,
          preds,
          vis: this._toVisibility(vis),
          schema
        });

        if (visible)
          vis[inv.id].add(pred.id);
      }

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

  _toVisibility(vis) {
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
