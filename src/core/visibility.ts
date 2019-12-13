import * as assert from 'assert';
import * as Debug from 'debug';
const debug = Debug('visibility');

import { Schema, Sequence, Invocation } from '../schema';
import { Spec } from '../spec/spec';

export interface Visibility {
  isVisible(source: Invocation, target: Invocation): boolean;
  visible(source: Invocation): Invocation[];
}

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

export class Level {
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
  invocations: Invocation[];
  source: Invocation;
  target: Invocation;
  schema: Schema;
  sourceSeq: Sequence;
  targetSeq: Sequence;
  vis: Visibility;

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

export class VisibilitySemantics {
  mustSee({ invocations, source, target, schema, vis }) {
    let constraints = new Constraints({ invocations, source, target, schema, vis });
    return constraints.mustSee();
  }

  pruneSpecification({ methods: specMethods, ...rest }: Spec): Spec {
    let methods = specMethods.filter(m => {
      m.visibility || debug(`omitting method: ${m.name}`);
      return m.visibility;
    });
    return { methods, ...rest };
  }
}

export class VisibilityGenerator {
  async * getVisibilities(inputs: VisibilityInputs) {
    const { schema, linearization } = inputs;
    let extender = new VisibilityExtender({ schema, linearization });

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

export class VisibilityImpl implements Visibility {
  map: { };

  constructor({ map = {} } = {}) {
    this.map = map;
  }

  source(source: Invocation) {
    if (!this.map[source.id])
      this.map[source.id] = new Set();
  }

  isVisible(source: Invocation, target: Invocation) {
    this.source(source);
    return this.map[source.id].has(target.id);
  }

  visible(source: Invocation) {
    return this.allVisible(source);
  }

  allVisible(source: Invocation) {
    this.source(source);
    return [...this.map[source.id]];
  }

  add(source: Invocation, target: Invocation) {
    this.source(source);
    this.map[source.id].add(target.id);
  }

  extend(source: Invocation, target: Invocation) {
    let { map } = this;
    return new VisibilityImpl({
      map: Object.assign({}, map, { [source.id]: new Set([target.id, ...map[source.id]]) }),
    });
  }

  toVisibility(): Visibility {
    return {
      isVisible: (source: Invocation, target: Invocation) => this.isVisible(source, target),
      visible: (source) => this.allVisible(source)
    };
  }
}

interface VisibilityInputs {
  schema: Schema;
  linearization: Invocation[];
}

class VisibilityExtender {
  schema: Schema;
  linearization: Invocation[];

  constructor(inputs: VisibilityInputs) {
    const { schema, linearization } = inputs;
    this.schema = schema;
    this.linearization = linearization;
  }

  getMinimal(): VisibilityImpl {
    let vis = new VisibilityImpl();
    let preds: Invocation[] = [];
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
          vis.add(source, target);
      }

      preds.push(source);
    }
    return vis;
  }

  async * getExtensions(base: VisibilityImpl) {
    let extensions = [base];
    let preds: Invocation[] = [];

    for (let source of this.linearization) {
      for (let target of preds) {
        for (let vis of extensions) {
          if (!vis.isVisible(source, target)) {
            debug(`extension: %s sees %s`, source, target);
            let ext = this.extend(source, target, vis);
            yield ext;
            extensions.push(ext);
          }
        }
      }
      preds.push(source);
    }
  }

  extend(s0: Invocation, t0: Invocation, vis: VisibilityImpl) {
    let workList = [{ source: s0, target: t0 }];

    while (workList.length) {
      let { source, target } = workList.shift()!;
      let sourceIdx = this.linearization.indexOf(source);
      let targetIdx = this.linearization.indexOf(target);
      let before = this.linearization.slice(0, targetIdx);
      let after = this.linearization.slice(sourceIdx);

      debug(`adding: %s sees %s`, source, target);
      debug(`vis: %o`, vis);
      vis = vis.extend(source, target);
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

  missingLink({ invocations, source, inter, target, vis }: MissingLinkParams) {
    if (vis.isVisible(source, target))
      return false;

    let schema = this.schema;
    const v = vis.toVisibility();
    let constraints = new Constraints({ invocations, source, target, schema, vis: v });
    return constraints.isWitness(inter);
  }
}

interface MissingLinkParams {
  invocations: Invocation[];
  source: Invocation;
  inter: Invocation;
  target: Invocation;
  vis: VisibilityImpl;
}
