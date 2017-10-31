const debug = require('debug')('consistency');
const assert = require('assert');

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
  smaller: '<',
  larger: '>',
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
  [RELATIONS.visibility, RELATIONS.visibility, COMPOSITIONS.left]
];

const CONSISTENCY_LEVEL_ARGS = [].concat(...SCHEMA.map(args =>
  [].concat(...Object.values(EXPRESSIONS).map(e1 =>
    Object.values(EXPRESSIONS).map(e2 =>
      args.concat(e1,e2))))));

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
    return COMPARISONS.larger;

  if (e1 === EXPRESSIONS.bottom)
    return COMPARISONS.smaller;

  if (e2 === EXPRESSIONS.wildcard)
    return COMPARISONS.smaller;

  if (e2 === EXPRESSIONS.bottom)
    return COMPARISONS.larger;

  return COMPARISONS.incomparable;
}

function compareComp(c1, c2) {
  if (c1 === COMPOSITIONS.simple)
    return COMPARISONS.larger;

  if (c2 === COMPOSITIONS.simple)
    return COMPARISONS.smaller;

  if (c1 === c2)
    return COMPARISONS.equal;

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

class ConsistencyLevel {
  constructor(relName, baseName, comp, lexpr, rexpr) {
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

  static compare(l1, l2, transitiveVis) {
    let cmp = compareSchema(
      [l1.relName, l1.baseName, l1.comp],
      [l2.relName, l2.baseName, l2.comp],
      transitiveVis);

    return cmp === COMPARISONS.equal
      ? compareArys([l1.lexpr, l1.rexpr], [l2.lexpr, l2.rexpr], compareExpr)
      : cmp;
  }
}

const CONSISTENCY_LEVELS = CONSISTENCY_LEVEL_ARGS.map(args => new ConsistencyLevel(...args));
debug(`using consistency levels:`)
debug(CONSISTENCY_LEVELS);

class Consistency {
  constructor() {
    this.levels = Array.from(CONSISTENCY_LEVELS);
  }

  integrate(...args) {
    debug(`integrating ${args} into: ${this.levels}`);
    this.levels = this.levels.filter(level => level.satisfies(...args));
    debug(`after integration: ${this.levels}`);
  }

  includes(...args) {
    return this.levels.some(level => ConsistencyLevel.compare(level,
      new ConsistencyLevel(...args)) === COMPARISONS.equal);
  }

  simplify(levels) {
    let results = [];
    let worklist = Array.from(this.levels);

    debug(`computing maximals for: ${this.levels}`);

    let transitiveVis = this.levels.some(l => l.isFullyTransitiveVisibility);

    OUTER_LOOP: while (worklist.length) {
      let c = worklist.shift();

      for (let cc of results) {
        let cmp = ConsistencyLevel.compare(cc,c, transitiveVis);
        if (cmp === COMPARISONS.larger || cmp === COMPARISONS.equal) {
          debug(`consistency ${c} already subsumed by ${cc}`);
          continue OUTER_LOOP;
        }
      }

      results = results.filter(cc => {
        let cmp = ConsistencyLevel.compare(c,cc, transitiveVis);
        let keep = cmp !== COMPARISONS.larger;
        if (!keep)
          debug(`removing consistency ${cc} subsumed by ${c}`);
        return keep;
      });

      debug(`adding consistency ${c}`);
      results.push(c);
    }

    debug(`got maximals: ${results}`);

    return results;
  }

  toString() {
    return this.simplify().join("; ");
  }
}

module.exports = {
  RELATIONS,
  EXPRESSIONS,
  COMPARISONS,
  COMPOSITIONS,
  Consistency
};
