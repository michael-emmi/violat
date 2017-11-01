const debug = require('debug')('consistency');
const assert = require('assert');

const BASIC_LEVELS = {
  consistentreturns: 'ret'
}

const RELATIONS = {
  programorder: 'po',
  linearization: 'lin',
  visibility: 'vis'
};

const EXPRESSIONS = {
  wildcard: '*',
  atomic: 'A',
  bottom: '!'
}

const COMPARISONS = {
  equal: '=',
  lesser: '<',
  greater: '>',
  incomparable: '<>'
}

const COMPOSITIONS = {
  simple: '.',
  left: 'L',
  right: 'R'
}

const SCHEMA = [
  [RELATIONS.linearization, RELATIONS.programorder, COMPOSITIONS.simple],
  [RELATIONS.visibility, RELATIONS.programorder, COMPOSITIONS.simple],
  [RELATIONS.visibility, RELATIONS.programorder, COMPOSITIONS.left],
  [RELATIONS.visibility, RELATIONS.programorder, COMPOSITIONS.right],
  [RELATIONS.visibility, RELATIONS.linearization, COMPOSITIONS.simple],
  [RELATIONS.visibility, RELATIONS.linearization, COMPOSITIONS.left],
  [RELATIONS.visibility, RELATIONS.linearization, COMPOSITIONS.right],
  [RELATIONS.visibility, RELATIONS.visibility, COMPOSITIONS.left],
  [BASIC_LEVELS.consistentreturns]
];

const CONSISTENCY_LEVEL_ARGS = [].concat(...SCHEMA.map(args => {
  return [].concat(...Object.values(EXPRESSIONS).map(e1 => {
    if (args.length < 3)
      return [args.concat(e1)];
    else
      return Object.values(EXPRESSIONS).map(e2 => args.concat(e1,e2));
  }));
}));

function fullyTransitiveVisibility([relName, baseName, comp, lexpr, rexpr]) {
  return relName === RELATIONS.visibility
      && baseName === RELATIONS.visibility
      && comp !== COMPOSITIONS.simple
      && lexpr === EXPRESSIONS.wildcard
      && rexpr === EXPRESSIONS.wildcard;
}

function matchExpr(i, expr) {
  switch (expr) {
    case EXPRESSIONS.wildcard:
      return true;
    case EXPRESSIONS.bottom:
      return false;
    case EXPRESSIONS.atomic:
      return i.atomic;
    default:
      return expr === i.method.name;
  }
}

function relationIncludes(rel, i1, i2) {
  return rel.isBefore(i1, i2);
}

function compareExpr(e1, e2) {
  if (e1 === e2)
    return COMPARISONS.equal;

  if (e1 === EXPRESSIONS.wildcard)
    return COMPARISONS.greater;

  if (e1 === EXPRESSIONS.bottom)
    return COMPARISONS.lesser;

  if (e2 === EXPRESSIONS.wildcard)
    return COMPARISONS.lesser;

  if (e2 === EXPRESSIONS.bottom)
    return COMPARISONS.greater;

  return COMPARISONS.incomparable;
}

function compareComp(c1, c2) {
  if (c1 === c2)
    return COMPARISONS.equal;

  if (c1 === COMPOSITIONS.simple)
    return COMPARISONS.greater;

  if (c2 === COMPOSITIONS.simple)
    return COMPARISONS.lesser;

  return COMPARISONS.incomparable;
}

function compareSchema([rel1, base1, comp1], [rel2, base2, comp2], transitiveVis) {
  if (rel1 !== rel2 || base1 !== base2)
    return COMPARISONS.incomparable;

  if (rel1 === RELATIONS.visibility && base1 === RELATIONS.linearization)
    return compareComp(comp1, comp2);

  if (rel1 === RELATIONS.visibility && base1 == RELATIONS.programorder && transitiveVis)
    return compareComp(comp1, comp2);

  return comp1 === comp2 ? COMPARISONS.equal : COMPARISONS.incomparable;
}

function compareArys(ary1, ary2, fn) {
  assert.ok(ary1.length);
  assert.equal(ary1.length, ary2.length);

  let acc;

  for (let idx of Object.keys(ary1)) {
    let cmp = fn(ary1[idx], ary2[idx]);

    if (!acc)
      acc = cmp;

    else if (cmp === COMPARISONS.equal)
      ;

    else if (acc === COMPARISONS.equal && cmp !== COMPARISONS.equal)
      acc = cmp;

    else if (acc !== cmp)
      acc = COMPARISONS.incomparable;

    if (acc === COMPARISONS.incomparable)
      break;;
  }

  return acc;
}

class RelationConsistencyLevel {
  constructor({relName, baseName, comp, lexpr, rexpr}) {
    this.relName = relName;
    this.baseName = baseName;
    this.comp = comp;
    this.lexpr = lexpr;
    this.rexpr = rexpr;
  }

  toString() {
    return `W(${this.relName},${this.baseName})[${this.comp}][${this.lexpr},${this.rexpr}]`;
  }

  matchKind(relName, baseName) {
    return this.relName === relName && this.baseName === baseName;
  }

  satisfiesBase(rel, base, i1, i2) {
    switch (this.comp) {
      case COMPOSITIONS.simple:
        return relationIncludes(base, i1, i2);
      case COMPOSITIONS.left:
        return /* (i1,i2) \in rel;base */ true;
      case COMPOSITIONS.right:
        return /* (i1,i2) \in base;rel */ true;
    }
  }

  satisfiesBody(relName, baseName, rel, base, i1, i2) {
    return this.matchKind(relName, baseName)
        && matchExpr(i1, this.lexpr)
        && matchExpr(i2, this.rexpr)
        && this.satisfiesBase(rel, base, i1, i2)
  }

  satisfiesHead(rel, i1, i2) {
    return relationIncludes(rel, i1, i2);
  }

  satisfies(relName, baseName, rel, base, i1, i2) {
    return !this.satisfiesBody(relName, baseName, rel, base, i1, i2)
        || this.satisfiesHead(rel, i1, i2);
  }

  isFullyTransitiveVisibility() {
    return fullyTransitiveVisibility([
      this.relName, this.baseName, this.comp, this.lexpr, this.rexpr]);
  }

  compare(that, transitiveVis) {
    if (!(that instanceof RelationConsistencyLevel))
      return COMPARISONS.incomparable;

    let cmp = compareSchema(
      [this.relName, this.baseName, this.comp],
      [that.relName, that.baseName, that.comp],
      transitiveVis);

    return cmp === COMPARISONS.equal
      ? compareArys([this.lexpr, this.rexpr], [that.lexpr, that.rexpr], compareExpr)
      : cmp;
  }
}

class SimpleConsistencyLevel {
  constructor({name, expr}) {
    this.name = name;
    this.expr = expr;
  }

  match(name, inv) {
    return this.name === name && matchExpr(inv, this.expr);
  }

  compare(that) {
    if (!(that instanceof SimpleConsistencyLevel))
      return COMPARISONS.incomparable;

    if (this.name !== that.name)
      return COMPARISONS.incomparable;

    return compareExpr(this.expr, that.expr);
  }

  toString() {
    return `W(${this.name})[${this.expr}]`;
  }
}

class Consistency {
  constructor(levels) {
    this.levels = Array.from(levels);
  }

  static full() {
    return new Consistency(CONSISTENCY_LEVELS);
  }

  static level(...args) {
    switch (args.length) {
      case 2:
        let [name, expr] = args;
        return new SimpleConsistencyLevel({name: name, expr: expr});
      case 5:
        let [relName, baseName, comp, lexpr, rexpr] = args;
        return new RelationConsistencyLevel({
          relName: relName, baseName: baseName, comp: comp,
          lexpr: lexpr, rexpr: rexpr});
      default:
        assert.fail();
    }
  }

  static join(...cs) {
    let results = [];
    let worklist = Array.from(cs);

    OUTER_LOOP: while (worklist.length) {
      let c = worklist.shift();

      for (let cc of results) {
        let cmp = cc.compare(c);
        if (cmp === COMPARISONS.greater || cmp === COMPARISONS.equal)
          continue OUTER_LOOP;
      }

      results = results.filter(cc => {
        let cmp = c.compare(cc);
        let keep = cmp !== COMPARISONS.greater;
        return keep;
      });

      results.push(c);
    }

    return results;
  }

  includes(level) {
    return this.levels.some(l => l.compare(level) === COMPARISONS.equal);
  }

  toString() {
    return this.levels.join("; ");
  }

  compare(that) {
    let c1 = this.simplify();
    let c2 = that.simplify();

    let eq = c1.levels.length === c2.levels.length
      && Object.keys(c1.levels).every(idx =>
          c1.levels[idx].compare(c2.levels[idx]) === COMPARISONS.equal);

    if (eq)
      return COMPARISONS.equal;

    let leq = c1.levels.every(l1 => c2.levels.some(l2 => {
      let cmp = l2.compare(l1);
      return cmp === COMPARISONS.greater || cmp === COMPARISONS.equal;
    }));

    if (leq)
      return COMPARISONS.lesser

    let geq = c2.levels.every(l2 => c1.levels.some(l1 => {
      let cmp = l1.compare(l2);
      return cmp === COMPARISONS.greater || cmp === COMPARISONS.equal;
    }));

    if (geq)
      return COMPARISONS.greater;

    return COMPARISONS.incomparable;
  }

  weakenSimpleLevel(name, inv) {
    let levels = this.levels.filter(level =>
      !(level instanceof SimpleConsistencyLevel)
      || !level.match(name, inv)
    );
    return new Consistency(levels);
  }

  weakenRelationalLevel(...args) {
    let levels = this.levels.filter(level =>
      !(level instanceof RelationConsistencyLevel)
      || level.satisfies(...args)
    );
    return new Consistency(levels);
  }

  simplify() {
    let levels = [];

    debug(`computing maximals for: ${this.levels}`);

    let worklist = Array.from(this.levels);
    let transitiveVis = this.levels.some(l => l.isFullyTransitiveVisibility);

    OUTER_LOOP: while (worklist.length) {
      let c = worklist.shift();

      for (let cc of levels) {
        let cmp = cc.compare(c, transitiveVis);
        if (cmp === COMPARISONS.greater || cmp === COMPARISONS.equal) {
          debug(`consistency ${c} already subsumed by ${cc}`);
          continue OUTER_LOOP;
        }
      }

      levels = levels.filter(cc => {
        let cmp = c.compare(cc, transitiveVis);
        let keep = cmp !== COMPARISONS.greater;
        if (!keep)
          debug(`removing consistency ${cc} subsumed by ${c}`);
        return keep;
      });

      debug(`adding consistency ${c}`);
      levels.push(c);
    }

    debug(`got maximals: ${levels}`);

    return new Consistency(levels);
  }
}

const CONSISTENCY_LEVELS = CONSISTENCY_LEVEL_ARGS.map(args => Consistency.level(...args));

debug(`using consistency levels:`)
debug(CONSISTENCY_LEVELS);

module.exports = {
  RELATIONS,
  EXPRESSIONS,
  COMPARISONS,
  COMPOSITIONS,
  BASIC_LEVELS,
  Consistency
};