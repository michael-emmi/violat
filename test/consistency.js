const assert = require('assert');
const debug = require('debug')('consistency');

const PartialOrder = require('../lib/partial-order');
const {
  RELATIONS, COMPOSITIONS, EXPRESSIONS, BASIC_LEVELS, COMPARISONS,
  Consistency } = require('../lib/consistency');

const I1 = { id: 1, atomic: true };
const I2 = { id: 2, atomic: true };
const I3 = { id: 3, atomic: false };

const P1 = new PartialOrder();
P1.sequence(I1, I2);
P1.sequence(I1, I3);

const L1 = new PartialOrder();
L1.sequence(I1, I2);
L1.sequence(I2, I3);

const L2 = new PartialOrder();
L2.sequence(I2, I1);
L2.sequence(I1, I3);

const L3 = new PartialOrder();
L3.sequence(I3, I1);
L3.sequence(I1, I2);

const V1 = new PartialOrder();
V1.sequence(I1, I3);
V1.add(I2);

let C1 = Consistency.full();
C1 = C1.weakenRelationalLevel(RELATIONS.linearization, RELATIONS.programorder, L1, P1, I1, I2);
C1 = C1.weakenSimpleLevel(BASIC_LEVELS.consistentreturns, I3);

let C2 = Consistency.full();
C2 = C2.weakenRelationalLevel(RELATIONS.linearization, RELATIONS.programorder, L2, P1, I1, I2);

let C3 = Consistency.full();
C3 = C3.weakenRelationalLevel(RELATIONS.linearization, RELATIONS.programorder, L3, P1, I1, I2);
C3 = C3.weakenRelationalLevel(RELATIONS.visibility, RELATIONS.linearization, V1, L3, I1, I2);

let linIncludesPo = Consistency.level(
  RELATIONS.linearization, RELATIONS.programorder,
  COMPOSITIONS.simple,
  EXPRESSIONS.wildcard, EXPRESSIONS.wildcard);

let linIncludesPoB = Consistency.level(
  RELATIONS.linearization, RELATIONS.programorder,
  COMPOSITIONS.simple,
  EXPRESSIONS.bottom, EXPRESSIONS.bottom);

let visIndludesPo = Consistency.level(
  RELATIONS.visibility, RELATIONS.programorder,
  COMPOSITIONS.simple,
  EXPRESSIONS.wildcard, EXPRESSIONS.wildcard);

let visIndludesLin = Consistency.level(
  RELATIONS.visibility, RELATIONS.linearization,
  COMPOSITIONS.simple,
  EXPRESSIONS.wildcard, EXPRESSIONS.wildcard);

let consistentReturns = Consistency.level(
  BASIC_LEVELS.consistentreturns, EXPRESSIONS.wildcard);

let consistentReturnsA = Consistency.level(
  BASIC_LEVELS.consistentreturns, EXPRESSIONS.atomic);

describe('consistency', function() {

  it (`basic inclusion`, function() {
    assert.ok(C1.includes(linIncludesPo));
    assert.ok(C2.includes(consistentReturnsA));
    assert.ok(C3.includes(consistentReturnsA));
  });

  it (`basic exclusion`, function() {
    assert.ok(C1.includes(consistentReturnsA));
    assert.ok(!C1.includes(consistentReturns));
    assert.ok(C2.includes(linIncludesPoB));
    assert.ok(!C2.includes(linIncludesPo));
  });

  it (`mixed levels`, function() {
    assert.ok(C3.includes(linIncludesPo));
    assert.ok(C3.includes(visIndludesPo));
    assert.ok(!C3.includes(visIndludesLin));
  });

  it (`simplification`, function() {
    assert.ok(C1.simplify().includes(linIncludesPo));
    assert.ok(!C1.simplify().includes(consistentReturns));
  });

  it (`comparison`, function() {
    assert.ok(C1.compare(C2) === COMPARISONS.incomparable);
    assert.ok(C1.compare(C3) === COMPARISONS.incomparable);
    assert.ok(C2.compare(C3) === COMPARISONS.incomparable);
    assert.ok(C1.compare(Consistency.full()) === COMPARISONS.lesser);
    assert.ok(Consistency.full().compare(C1) === COMPARISONS.greater);
    assert.ok(C1.compare(C1) === COMPARISONS.equal);
  });
});
