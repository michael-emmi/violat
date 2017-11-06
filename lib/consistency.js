const debug = require('debug')('consistency');
const debugTrace = require('debug')('consistency:trace');
const assert = require('assert');

const RELATIONS = {
  programorder: 'po',
  linearization: 'lin',
  visibility: 'vis'
};

const PROPERTIES = {
  consistentreturns: 'ret'
}

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

class Expression {
  static isTop(...exprs) {
    return exprs.every(e => e === EXPRESSIONS.wildcard);
  }

  static isBottom(...exprs) {
    return exprs.some(e => e === EXPRESSIONS.bottom);
  }

  static compare(e1, e2) {
    if (e1 === e2)
      return COMPARISONS.equal;

    if (e1 === EXPRESSIONS.wildcard || e2 === EXPRESSIONS.bottom)
      return COMPARISONS.greater;

    if (e1 === EXPRESSIONS.bottom || e2 === EXPRESSIONS.wildcard)
      return COMPARISONS.lesser;

    return COMPARISONS.incomparable;
  }

  static match(i, expr) {
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
    debug(`match(${i.atomic ? 'A' : "_"}, ${expr}) = ${result}`);
    return result;
  }

  static ofInvocation(i) {
    return i.atomic ? EXPRESSIONS.atomic : EXPRESSIONS.wildcard;
  }

  static weaken(...exprs) {
    let weakenings = exprs.map((e,i) => {
      if (e !== EXPRESSIONS.wildcard)
        return [...exprs].map(_ => EXPRESSIONS.bottom);
      let ws = [...exprs];
      ws.splice(i,1,EXPRESSIONS.atomic)
      return ws;
    });
    let filtered = weakenings.filter(ws => !Expression.isBottom(...ws));
    let result = filtered.length > 0 ? filtered : weakenings;
    debug(`weaken(${exprs.join(',')}) = ${result.join(' | ')}`);
    return result;
  }

  static meet(...exprs) {
    let [min] = exprs ;
    for (let expr of exprs) {
      switch (Expression.compare(min, expr)) {
        case COMPARISONS.equal:
        case COMPARISONS.lesser:
          continue;
        case COMPARISONS.greater:
          min = expr;
          continue;
        case COMPARISONS.incomparable:
          min = EXPRESSIONS.bottom;
          break;
      }
    }
    return min;
  }
}

// function fullyTransitiveVisibility([relName, baseName, comp, lexpr, rexpr]) {
//   return relName === RELATIONS.visibility
//       && baseName === RELATIONS.visibility
//       && comp !== COMPOSITIONS.simple
//       && Expression.isTop(lexpr, rexpr);
// }

// function compareComp(c1, c2) {
//   if (c1 === c2)
//     return COMPARISONS.equal;
//
//   if (c1 === COMPOSITIONS.simple)
//     return COMPARISONS.greater;
//
//   if (c2 === COMPOSITIONS.simple)
//     return COMPARISONS.lesser;
//
//   return COMPARISONS.incomparable;
// }

// function compareSchema([rel1, base1, comp1], [rel2, base2, comp2], transitiveVis) {
//   if (rel1 !== rel2 || base1 !== base2)
//     return COMPARISONS.incomparable;
//
//   if (rel1 === RELATIONS.visibility && base1 === RELATIONS.linearization)
//     return compareComp(comp1, comp2);
//
//   if (rel1 === RELATIONS.visibility && base1 == RELATIONS.programorder && transitiveVis)
//     return compareComp(comp1, comp2);
//
//   return comp1 === comp2 ? COMPARISONS.equal : COMPARISONS.incomparable;
// }

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
  constructor(maximals) {
    let [first] = maximals;
    this.dimension = first.length;
    assert.ok(maximals.every(m => m.length === this.dimension));
    this.maximals = [...maximals];
  }

  static top(dim) {
    return new ConsistencyLevel([[...Array(dim)].map(_ => EXPRESSIONS.wildcard)]);
  }

  static atomic(dim) {
    return new ConsistencyLevel([[...Array(dim)].map(_ => EXPRESSIONS.atomic)]);
  }

  static bottom(dim) {
    return new ConsistencyLevel([[...Array(dim)].map(_ => EXPRESSIONS.bottom)]);
  }

  isWeak() {
    return this.maximals.some(exprs => !Expression.isTop(...exprs));
  }

  isBottom() {
    return this.maximals.some(exprs => Expression.isBottom(...exprs));
  }

  toString() {
    return `${this.maximals.map(exprs => exprs.join(',')).join('|')}`;
  }

  weaken(...invocations) {
    assert.equal(invocations.length, this.dimension);
    let maximals = [];

    if (this.isBottom())
      return this;

    let excluded = invocations.map(i => Expression.ofInvocation(i));
    let worklist = [...this.maximals];

    while (worklist.length > 0) {
      let elem = worklist.shift();

      if (Expression.isBottom(...elem)) {
        debug(`weaken-level(${excluded}) = bottom`);
        return ConsistencyLevel.bottom(this.dimension);
      }

      let cmp = compareArys(elem, excluded, Expression.compare);
      debug(`${elem} ${cmp} ${excluded}`);
      if (cmp === COMPARISONS.greater || cmp === COMPARISONS.equal)
        worklist.unshift(...Expression.weaken(...elem));
      else {
        let redundant = maximals.some(maximal => {
          let cmp = compareArys(elem, maximal, Expression.compare);
          debug(`${elem} ${cmp} ${maximal}`);
          return cmp === COMPARISONS.lesser || cmp === COMPARISONS.equal;
        });

        if (!redundant) {
          debug(`adding ${elem}`);
          maximals = maximals.filter(maximal => {
            let cmp = compareArys(elem, maximal, Expression.compare);
            return cmp !== COMPARISONS.greater;
          });
          maximals.push(elem);
        }
      }
    }

    assert.ok(maximals.length > 0);
    debug(`weaken-level(${excluded}) = ${maximals.join(" | ")}`);
    return new ConsistencyLevel(maximals);
  }

  compare(that) {
    assert.equal(this.dimension, that.dimension);

    let neq;
    let gte = that.maximals.every(m2 => this.maximals.some(m1 => {
      let cmp = compareArys(m1, m2, Expression.compare);
      neq = neq || cmp !== COMPARISONS.equal;
      return cmp === COMPARISONS.greater || cmp == COMPARISONS.equal;
    }));

    if (gte && neq)
      return COMPARISONS.greater;

    let lte = that.maximals.every(m2 => this.maximals.some(m1 => {
      let cmp = compareArys(m1, m2, Expression.compare);
      return cmp === COMPARISONS.lesser || cmp == COMPARISONS.equal;
    }));

    if (lte && neq)
      return COMPARISONS.lesser;

    if (gte && lte)
      return COMPARISONS.equal;

    return COMPARISONS.incomparable;
  }

  satisfies(...invocations) {
    assert.equal(this.expressions.length, invocations.length);
    return this.expressions.each((e,i) => matchExpr(invocations[i], e));
  }
}

class Attribute {
  static get(...args) {
    return args.length === 1
      ? new SimpleAttribute(...args)
      : new RelationalAttribute(...args);
  }
}

class SimpleAttribute extends Attribute {
  constructor(name) {
    super();
    this.name = name;
  }

  dimensions() {
    return 1;
  }

  toString() {
    return `W(${this.name})`;
  }
}

class RelationalAttribute extends Attribute {
  constructor(relName, baseName, comp) {
    super();
    this.relName = relName;
    this.baseName = baseName;
    this.comp = comp;
  }

  dimensions() {
    return 2;
  }

  toString() {
    return `W(${this.relName},${this.baseName})[${this.comp}]`;
  }

  satisfies(relName, baseName, rel, base, i1, i2) {
    let debug = debugTrace;
    let body = this.satisfiesBody(relName, baseName, rel, base, i1, i2);
    let result = !body || this.satisfiesHead(rel, i1, i2);
    debug(`${this}.satisfies(${relName}, ${baseName}, ...) = ${result}`);
    return result;
  }

  satisfiesBody(relName, baseName, rel, base, i1, i2) {
    let debug = debugTrace;
    let result = this.sameKind(relName, baseName)
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

  sameKind(relName, baseName) {
    let debug = debugTrace;
    let result = this.relName === relName && this.baseName === baseName;
    debug(`${this}.sameKind(${relName}, ${baseName}) = ${result}`);
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
    debug(`${this}.satisfiesBase(...) = ${result}`);
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

  unsatPairs(relName, baseName, rel, base) {
    let debug = debugTrace;
    let pairs = [];

    for (let i2 of base.values()) {
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

      for (let i1 of invocations)
        if (!this.satisfies(relName, baseName, rel, base, i1, i2))
          pairs.push([i1,i2]);
    }
    debug(`${this}.unsatPairs(${relName}, ${baseName}, ...) = ${pairs}`);
    return pairs;
  }
}


class Consistency {
  constructor(entries) {
    this.levels = new Map(entries);
  }

  static top() {
    return new Consistency(Object.entries(ATTRIBUTES).map(([key,attr]) => {
      return [key, ConsistencyLevel.top(attr.dimensions())];
    }));
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

    return new ConsistencyDisjunction(results);
  }

  includes(attr, level) {
    let cmp = this.levels.get(attr).compare(level);
    return cmp === COMPARISONS.equal || cmp === COMPARISONS.greater;
  }

  isWeak() {
    return [...this.levels.values()].some(level => level.isWeak());
  }

  hasBottom() {
    return [...this.levels.values()].some(level => level.isBottom());
  }

  toString() {
    let weaknesses = [...this.levels.entries()].filter(([_,l]) => l.isWeak())
    return weaknesses.length > 0
      ? `${weaknesses.map(([a,l]) => `${ATTRIBUTES[a]}[${l}]`).join(':')}`
      : `atomic`;
  }

  compare(that) {
    assert.equal(this.levels.size, that.levels.size);
    let ls1 = [];
    let ls2 = [];
    for (let attr of this.levels.keys()) {
      ls1.push(this.levels.get(attr));
      let level = that.levels.get(attr);
      assert.ok(level);
      ls2.push(level);
    }
    return compareArys(ls1, ls2, (l1,l2) => l1.compare(l2));
  }

  weakenSimpleLevel(name, invocation) {
    let attribute = ATTRIBUTES[name];
    assert.ok(attribute instanceof SimpleAttribute);
    let oldLevel = this.levels.get(name)
    let newLevel = oldLevel.weaken(invocation);
    debug(`weakening attribute ${name} with ${Expression.ofInvocation(invocation)} invocation from ${oldLevel} to ${newLevel}`);
    return oldLevel === newLevel
      ? this
      : new Consistency([...this.levels].concat([[name, newLevel]]));
  }

  weakenRelationalLevel(relName, baseName, rel, base, i1, i2) {
    let newLevels = [];
    for (let [attr,level] of this.levels.entries()) {
      let attribute = ATTRIBUTES[attr];
      if (attribute instanceof RelationalAttribute) {
        if (!attribute.satisfies(relName, baseName, rel, base, i1, i2)) {
          let newLevel = level.weaken(i1, i2);
          debug(`weakening attribute ${attribute} with ${[i1,i2].map(i => Expression.ofInvocation(i))} invocations from ${level} to ${newLevel}`);
          if (level !== newLevel)
            newLevels.push([attr,newLevel]);
        }
      }
    }
    return newLevels.length > 0
      ? new Consistency([...this.levels].concat(newLevels))
      : this;
  }

  weakenRelationalLevelAll(relName, baseName, rel, base) {
    let newLevels = [];
    for (let [attr,level] of this.levels.entries()) {
      let attribute = ATTRIBUTES[attr];
      if (attribute instanceof RelationalAttribute) {
        let newLevel = level;
        for (let [i1,i2] of attribute.unsatPairs(relName, baseName, rel, base)) {
          debug(`UNSAT PAIR`);
          debug(i1);
          debug(i2);
          debug(rel);
          debug(base);
          newLevel = newLevel.weaken(i1, i2);
          debug(`weakening attribute ${attribute} with ${[i1,i2].map(i => Expression.ofInvocation(i))} invocations from ${newLevel} to ${newLevel}`);
        }
        if (level !== newLevel)
          newLevels.push([attr,newLevel]);
      }
    }
    return newLevels.length > 0
      ? new Consistency([...this.levels].concat(newLevels))
      : this;
  }
}


class ConsistencyDisjunction {
  constructor(consistencies) {
    this.consistencies = consistencies;
    this.size = consistencies.length;
  }

  isWeak() {
    return this.consistencies.some(c => c.isWeak());
  }

  hasBottom() {
    return this.consistencies.some(c => c.hasBottom());
  }

  toString() {
    return this.consistencies.join(' |||| ');
  }
}


const ATTRIBUTES = {
  lin_contains_po: Attribute.get(RELATIONS.linearization, RELATIONS.programorder, COMPOSITIONS.simple),
  vis_contains_po: Attribute.get(RELATIONS.visibility, RELATIONS.programorder, COMPOSITIONS.simple),
  vis_contains_vis_X_po: Attribute.get(RELATIONS.visibility, RELATIONS.programorder, COMPOSITIONS.left),
  vis_contains_po_X_vis: Attribute.get(RELATIONS.visibility, RELATIONS.programorder, COMPOSITIONS.right),
  vis_contains_lin: Attribute.get(RELATIONS.visibility, RELATIONS.linearization, COMPOSITIONS.simple),
  vis_contains_vis_X_lin: Attribute.get(RELATIONS.visibility, RELATIONS.linearization, COMPOSITIONS.left),
  vis_contains_lin_X_vis: Attribute.get(RELATIONS.visibility, RELATIONS.linearization, COMPOSITIONS.right),
  vis_is_transitive: Attribute.get(RELATIONS.visibility, RELATIONS.visibility, COMPOSITIONS.left),
  consistent_returns: Attribute.get(PROPERTIES.consistentreturns)
}

debug(`using consistency attributes:`)
debug(ATTRIBUTES);

module.exports = {
  PROPERTIES,
  RELATIONS,
  EXPRESSIONS,
  COMPOSITIONS,
  COMPARISONS,
  ATTRIBUTES,
  ConsistencyLevel,
  Consistency
};
