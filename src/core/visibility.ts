const debug = require('debug')('visibility');
const assert = require('assert');

const LEVELS_ARRAY = [
  'weak',
  'self',
  'monotonic',
  'peer',
  'causal',
  'complete'
];

const LEVELS_OBJECT = LEVELS_ARRAY
  .reduce((m, k, i) => Object.assign({}, m, {[k]: i}), {});

class Level {
  static of(str) {
    return LEVELS_OBJECT[str];
  }

  static toString(level) {
    return (level >= 0 && level < LEVELS_ARRAY.length)
      ? LEVELS_ARRAY[level]
      : undefined;
  }

  static get({ invocation }) {
    return Level.of(invocation.method.visibility);
  }

  static has(invocation, level) {
    return Level.get({ invocation }) >= Level.of(level);
  }

  static up(str) {
    let level = Level.of(str) + 1;
    return level < LEVELS_ARRAY.length ? LEVELS_ARRAY[level] : undefined;
  }

  static down(str) {
    let level = Level.of(str) - 1;
    return level >= 0 ? LEVELS_ARRAY[level] : undefined;
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

  isWitness(i) {
    return this.isMonotonicWitness(i)
    || this.isPeerWitness(i)
    || this.isCausalWitness(i);
  }

  selfVisibility() {
    return Level.has(this.source, 'self')
    && this.sourceSeq === this.targetSeq;
  }

  monotonicVisibility() {
    return Level.has(this.source, 'monotonic')
    && this.invocations.some(i => this.isMonotonicWitness(i));
  }

  isMonotonicWitness(i) {
    if (!Level.has(this.source, 'monotonic'))
      return false;
    let seq = this.schema.sequences.find(s => s.invocations.includes(i));
    return this.vis.isVisible(i, this.target) && this.sourceSeq === seq;
  }

  peerVisibility() {
    return Level.has(this.source, 'peer')
    && this.invocations.some(i => this.isPeerWitness(i));
  }

  isPeerWitness(i) {
    if (!Level.has(this.source, 'peer'))
      return false;
    let seq = this.schema.sequences.find(s => s.invocations.includes(i));
    return this.vis.isVisible(this.source, i) && this.targetSeq === seq;
  }

  causalVisibility() {
    return Level.has(this.source, 'causal')
    && this.invocations.some(i => this.isCausalWitness(i));
  }

  isCausalWitness(i) {
    if (!Level.has(this.source, 'causal'))
      return false;
    return this.vis.isVisible(this.source, i) && this.vis.isVisible(i, this.target);
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
            debug(`extension: %s sees %s`, source, target);
            let ext = this.extend({ source, target, preds, vis });
            yield ext;
            extensions.push(ext);
          }
        }
      }
      preds.push(source);
    }
  }

  extend({ source: s0, target: t0, vis }) {
    let workList = [{ source: s0, target: t0 }];

    while (workList.length) {
      let { source, target } = workList.shift();
      let sourceIdx = this.linearization.indexOf(source);
      let targetIdx = this.linearization.indexOf(target);
      let before = this.linearization.slice(0, targetIdx);
      let after = this.linearization.slice(sourceIdx);

      debug(`adding: %s sees %s`, source, target);
      debug(`vis: %o`, vis);
      vis = vis.extend({ source, target });
      debug(`vis: %o`, vis);

      for (let pred of before) {
        let link = this.missingLink({
          invocations: before,
          source,
          inter: target,
          target: pred,
          vis
        });
        if (link) {
          debug(`implication: %s sees %s`, source, pred);
          workList.unshift({ source, target: pred });
        }
      }

      for (let succ of after) {
        let link = this.missingLink({
          invocations: after,
          source: succ,
          inter: source,
          target,
          vis
        });
        if (link) {
          debug(`implication %s sees %s`, succ, target);
          workList.unshift({ source: succ, target });
        }
      }
    }

    return vis;
  }

  missingLink({ invocations, source, inter, target, vis }) {
    if (vis.isVisible({ source, target }))
      return false;

    let schema = this.schema;
    vis = vis.toVisibility();
    let constraints = new Constraints({ invocations, source, target, schema, vis });
    return constraints.isWitness(inter);
  }
}

module.exports = {
  Level,
  VisibilitySemantics,
  VisibilityGenerator
};
