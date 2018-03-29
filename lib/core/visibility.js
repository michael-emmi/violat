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

    debug(`generating visibilities`);
    debug(`schema: %s`, schema);
    debug(`linearization: %s`, linearization);
    let minimal = extender.getMinimal();

    debug(`generated minimal visibility: %o`, minimal);
    yield minimal.toVisibility();

    for await (let vis of extender.getExtensions(minimal)) {
      debug(`generated visibility extension: %o`, vis);
      yield vis.toVisibility();
    }
  }
}

class VisibilityImpl {
  constructor({ semantics, map }) {
    this.semantics = semantics;
    this.map = map || {};
  }

  source(src) {
    if (!this.map[src.id])
      this.map[src.id] = new Set();
  }

  isVisible({ src, tgt }) {
    this.source(src);
    return this.map[src.id].has(tgt.id);
  }

  allVisible({ src }) {
    this.source(src);
    return [...this.map[src.id]];
  }

  add({ src, tgt }) {
    this.source(src);
    this.map[src.id].add(tgt.id);
  }

  extend({ src, tgt }) {
    let { semantics, map } = this;
    return new VisibilityImpl({
      semantics,
      map: Object.assign({}, map, { [src.id]: new Set([tgt.id, ...map[src.id]]) }),
    });
  }

  toVisibility() {
    return {
      isVisible: (src, tgt) => this.isVisible({ src, tgt }),
      visible: (src) => this.allVisible({ src })
    };
  }
}

class VisibilityExtender {
  constructor({ semantics, schema, linearization }) {
    this.semantics = semantics;
    this.schema = schema;
    this.linearization = linearization;
  }

  getMinimal() {
    let vis = new VisibilityImpl({ semantics: this.semantics });
    let preds = [];
    for (let src of this.linearization) {

      // NOTE we consider predecessors in reverse order, in order to
      // consider transitive constraints in order
      for (let tgt of preds.reverse()) {
        let visible = this.semantics.mustSee({
          src,
          tgt,
          preds,
          vis: vis.toVisibility(),
          schema: this.schema
        });

        if (visible)
          vis.add({ src, tgt });
      }

      preds.push(src);
    }
    return vis;
  }

  async * getExtensions(base) {
    let extensions = [base];
    let preds = [];

    for (let src of this.linearization) {
      for (let tgt of preds) {
        for (let vis of extensions) {
          if (!vis.isVisible({ src, tgt })) {
            let ext = this.extend({ src, tgt, preds, vis });
            yield ext;
            extensions.push(ext);
          }
        }
      }
      preds.push(src);
    }
  }

  extend({ src, tgt, preds, vis }) {
    let extension = vis.extend({ src, tgt });

    return extension;

    // let workList = [[tgt,src]];
    //
    // for (let pred of preds.reverse()) {
    //   let visible = this.semantics.mustSee({
    //     src,
    //     tgt: pred,
    //     preds,
    //     vis: this.toVisibility(extension),
    //     schema: this.schema
    //   });
    //
    //   if (visible)
    //     workList.unshift([pred, src]);
    // }
    //
    // while (workList.length) {
    //   let [i1, i2] = workList.shift();
    //   extension[i2.id].add(i1.id);
    //
    //   for (let succ of _successors_) {
    //     let visible = this.semantics.mustSee({
    //       src: succ,
    //       tgt: i1,
    //       _,
    //       vis: this.toVisibility(extension),
    //       schema: this.schema
    //     });
    //   }
    // }

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
}

module.exports = {
  VisibilitySemantics,
  VisibilityGenerator
};
