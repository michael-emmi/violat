const debug = require('debug')('visibility');
const assert = require('assert');

const LEVELS = [
  'weak',
  'self',
  'monotonic',
  'peer',
  'causal',
  'complete'
].reduce((m, k, i) => Object.assign({}, m, {[k]: i}));

class Level {
  static of(str) {
    return LEVELS[str];
  }
  static get({ invocation }) {
    return Level.of(invocation.method.visibility);
  }
  static has(invocation, level) {
    return Level.get({ invocation }) >= Level.of(level);
  }
}

class Constraints {

  // NOTE here we assume that target is linearized before source
  // NOTE and that invocations is a prefix of the linearization up to source
  constructor({ invocations, source, target, schema, vis }) {
    this.invocations = invocations;
    this.source = source;
    this.target = target;
    this.schema = schema;
    this.sourceSeq = schema.sequences.find(s => s.invocations.includes(source));
    this.targetSeq = schema.sequences.find(s => s.invocations.includes(target));
    this.vis = vis;
  }

  mustSee() {
    return this.completeVisibility()
    || this.causalVisibility()
    || this.peerVisibility()
    || this.monotonicVisibility()
    || this.selfVisibility();
  }

  selfVisibility() {
    return Level.has(this.source, 'self')
    && this.sourceSeq === this.targetSeq;
  }

  monotonicVisibility() {
    return Level.has(this.source, 'monotonic')
    && this.invocations.some(i => {
      let seq = this.schema.sequences.find(s => s.invocations.includes(i));
      return this.vis.isVisible(i, this.target) && this.sourceSeq === seq;
    });
  }

  peerVisibility() {
    return Level.has(this.source, 'peer')
    && this.invocations.some(i => {
      let seq = this.schema.sequences.find(s => s.invocations.includes(i));
      return this.vis.isVisible(this.source, i) && this.targetSeq === seq;
    });
  }

  causalVisibility() {
    return Level.has(this.source, 'causal')
    && this.invocations.some(i => {
      return this.vis.isVisible(this.source, i) && this.vis.isVisible(i, this.target);
    });
  }

  completeVisibility() {
    return Level.has(this.source, 'complete');
  }
}

class VisibilitySemantics {
  mustSee({ invocations, source, target, po, vis }) {
    let constraints = new Constraints({ invocations, source, target, po, vis });
    return constraints.mustSee();
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
  constructor({ map } = {}) {
    this.map = map || {};
  }

  source(source) {
    if (!this.map[source.id])
      this.map[source.id] = new Set();
  }

  isVisible({ source, target }) {
    this.source(source);
    return this.map[source.id].has(target.id);
  }

  allVisible({ source }) {
    this.source(source);
    return [...this.map[source.id]];
  }

  add({ source, target }) {
    this.source(source);
    this.map[source.id].add(target.id);
  }

  extend({ source, target }) {
    let { map } = this;
    return new VisibilityImpl({
      map: Object.assign({}, map, { [source.id]: new Set([target.id, ...map[source.id]]) }),
    });
  }

  toVisibility() {
    return {
      isVisible: (source, target) => this.isVisible({ source, target }),
      visible: (source) => this.allVisible({ source })
    };
  }
}

class VisibilityExtender {
  constructor({ schema, linearization }) {
    this.schema = schema;
    this.linearization = linearization;
  }

  getMinimal() {
    let vis = new VisibilityImpl();
    let preds = [];
    for (let source of this.linearization) {

      // NOTE we consider predecessors in reverse order, in order to
      // consider transitive constraints in order
      for (let target of preds.reverse()) {

        let constraints = new Constraints({
          invocations: preds,
          source,
          target,
          schema: this.schema,
          vis: vis.toVisibility()
        });

        if (constraints.mustSee())
          vis.add({ source, target });
      }

      preds.push(source);
    }
    return vis;
  }

  async * getExtensions(base) {
    let extensions = [base];
    let preds = [];

    for (let source of this.linearization) {
      for (let target of preds) {
        for (let vis of extensions) {
          if (!vis.isVisible({ source, target })) {
            let ext = this.extend({ source, target, preds, vis });
            yield ext;
            extensions.push(ext);
          }
        }
      }
      preds.push(source);
    }
  }

  extend({ source, target, preds, vis }) {
    let extension = vis.extend({ source, target });

    // TODO FIXME must add causal and peer visibility implications

    return extension;

    // let workList = [[target,source]];
    //
    // for (let pred of preds.reverse()) {
    //   let visible = this.semantics.mustSee({
    //     source,
    //     target: pred,
    //     preds,
    //     vis: this.toVisibility(extension),
    //     schema: this.schema
    //   });
    //
    //   if (visible)
    //     workList.unshift([pred, source]);
    // }
    //
    // while (workList.length) {
    //   let [i1, i2] = workList.shift();
    //   extension[i2.id].add(i1.id);
    //
    //   for (let succ of _successors_) {
    //     let visible = this.semantics.mustSee({
    //       source: succ,
    //       target: i1,
    //       _,
    //       vis: this.toVisibility(extension),
    //       schema: this.schema
    //     });
    //   }
    // }

    //
    // let newPreds = new Set([target]);
    //
    // if (source.method.visibility === 'causal')
    //   for (let pred of _visibleto_(target))
    //     newPreds.push(pred);
    //
    // else (source.method.visibility === 'peer')
    //   for (let pred of _before_(target))
    //     newPreds.push(pred);
    //
    // let workList = newPreds.map(pred => [pred, source]);
    //
    // while (workList.length) {
    //   let [i1,i2] = workList.shift();
    //
    // }
    //
    // // add target to the monotonic successors of source
    // for (let succ of _after_(source))
    //   if (succ.method.visibility _>=_ 'monotonic')
    //     ...

  }
}

module.exports = {
  VisibilitySemantics,
  VisibilityGenerator
};
