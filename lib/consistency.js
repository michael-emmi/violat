const debug = require('debug')('consistency');
const debugTrace = require('debug')('consistency:trace');
const debugSimplify = require('debug')('consistency:simplify');
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

const COMPOSITIONS = {
  simple: '.',
  left: 'L',
  right: 'R'
}

const COMPARISONS = {
  equal: '=',
  lesser: '<',
  greater: '>',
  incomparable: '<>'
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

const CONSISTENCY_LEVEL_ARGS = [];
for (let args of SCHEMA) {
  let exprs = Object.values(EXPRESSIONS).filter(e => e !== EXPRESSIONS.bottom);

  if (args.length < 3) {
    for (let expr of exprs)
      CONSISTENCY_LEVEL_ARGS.push(args.concat(expr));
    CONSISTENCY_LEVEL_ARGS.push(args.concat(EXPRESSIONS.bottom));

  } else {
    for (let e1 of exprs)
      for (let e2 of exprs)
        CONSISTENCY_LEVEL_ARGS.push(args.concat(e1, e2));
    CONSISTENCY_LEVEL_ARGS.push(args.concat(EXPRESSIONS.bottom, EXPRESSIONS.bottom));
  }
}

function isTop(...exprs) {
  return exprs.every(e => e === EXPRESSIONS.wildcard);
}

function isBottom(...exprs) {
  return exprs.some(e => e === EXPRESSIONS.bottom);
}

function fullyTransitiveVisibility([relName, baseName, comp, lexpr, rexpr]) {
  return relName === RELATIONS.visibility
      && baseName === RELATIONS.visibility
      && comp !== COMPOSITIONS.simple
      && isTop(lexpr, rexpr);
}

function matchExpr(i, expr) {
  let debug = debugTrace;
  let result;
  switch (expr) {
    case EXPRESSIONS.wildcard:
      result = true;
      break;
    case EXPRESSIONS.bottom:
      result = false;
      break;
    case EXPRESSIONS.atomic:
      result = i.atomic;
      break;
    default:
      result = expr === i.method.name;
  }
  debug(`matchExpr(${i.atomic ? 'A' : "_"}, ${expr}) = ${result}`);
  return result;
}

function compareExpr(e1, e2) {
  if (e1 === e2)
    return COMPARISONS.equal;

  if (e1 === EXPRESSIONS.wildcard || e2 === EXPRESSIONS.bottom)
    return COMPARISONS.greater;

  if (e1 === EXPRESSIONS.bottom || e2 === EXPRESSIONS.wildcard)
    return COMPARISONS.lesser;

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
    let debug = debugTrace;
    let result = this.relName === relName && this.baseName === baseName;
    debug(`${this}.matchKind(${relName}, ${baseName}) = ${result}`);
    return result;
  }

  satisfiesBase(rel, base, i1, i2) {
    let debug = debugTrace;
    let result;
    switch (this.comp) {
      case COMPOSITIONS.simple:
        result = base.isBefore(i1, i2);
        break;
      case COMPOSITIONS.left:
        result = base.before(i2).some(i => rel.isBefore(i1, i));
        break;
      case COMPOSITIONS.right:
        result = rel.before(i2).some(i => base.isBefore(i1, i));
        break;
    }
    debug(`base: %o`, base.basis);
    debug(`${this}.satisfiesBase(...) = ${result}`);
    return result;
  }

  satisfiesBody(relName, baseName, rel, base, i1, i2) {
    let debug = debugTrace;
    let result = this.matchKind(relName, baseName)
        && matchExpr(i1, this.lexpr)
        && matchExpr(i2, this.rexpr)
        && this.satisfiesBase(rel, base, i1, i2);
    debug(`${this}.satisfiesBody(${relName}, ${baseName}, ...) = ${result}`);
    return result;
  }

  satisfiesHead(rel, i1, i2) {
    let debug = debugTrace;
    let result = rel.isBefore(i1, i2);
    debug(`${this}.satisfiesHead(${rel}, ...) = ${result}`);
    return result;
  }

  satisfies(relName, baseName, rel, base, i1, i2) {
    let debug = debugTrace;
    let body = this.satisfiesBody(relName, baseName, rel, base, i1, i2);
    let result = !body || this.satisfiesHead(rel, i1, i2);
    debug(`${this}.satisfies(${relName}, ${baseName}, ...) = ${result}`);
    return result;
  }

  satisfiesAll(relName, baseName, rel, base) {
    let debug = debugTrace;
    let result = true;

    OUTER_LOOP: for (let i2 of base.values()) {
      let invocations;

      switch (this.comp) {
        case COMPOSITIONS.simple:
          invocations = base.before(i2);
          break;
        case COMPOSITIONS.left:
          invocations = [...new Set(base.before(i2).map(i => rel.before(i)))];
          break;
        case COMPOSITIONS.right:
          invocations = [...new Set(rel.before(i2).map(i => base.before(i)))];
          break;
      }

      for (let i1 of invocations) {
        if (!this.satisfies(relName, baseName, rel, base, i1, i2)) {
          result = false;
          break OUTER_LOOP;
        }
      }
    }
    debug(`${this}.satisfiesAll(${relName}, ${baseName}, ...) = ${result}`);
    return result;
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
    return `{ ${this.levels.join(", ")} }`;
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

  weakenRelationalLevel(relName, baseName, rel, base, i1, i2) {
    let levels = this.levels.filter(level =>
      !(level instanceof RelationConsistencyLevel)
      || level.satisfies(relName, baseName, rel, base, i1, i2)
    );
    return new Consistency(levels);
  }

  weakenRelationalLevelAll(relName, baseName, rel, base) {
    let debug = debugTrace;
    let levels = this.levels.filter(level => {
      let keep = !(level instanceof RelationConsistencyLevel)
        || level.satisfiesAll(relName, baseName, rel, base);
      if (!keep)
        debug(`dropping level ${level}`);
      return keep;
    });
    debug(`${this}.weakenRelationalLevelAll(${relName}, ${baseName}, ...) dropped ${this.levels.length - levels.length} levels`);
    return new Consistency(levels);
  }

  simplify() {
    let debug = debugSimplify;
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
