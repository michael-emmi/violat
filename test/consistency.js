const assert = require('assert');
const PartialOrder = require('../lib/partial-order');
const {
  RELATIONS, COMPOSITIONS, EXPRESSIONS,
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

let C1 = new Consistency();
C1.integrate(RELATIONS.linearization, RELATIONS.programorder, L1, P1, I1, I2);

let C2 = new Consistency();
C2.integrate(RELATIONS.linearization, RELATIONS.programorder, L2, P1, I1, I2);

let C3 = new Consistency();
C3.integrate(RELATIONS.linearization, RELATIONS.programorder, L3, P1, I1, I2);
C3.integrate(RELATIONS.visibility, RELATIONS.linearization, V1, L3, I1, I2);

describe('consistency', function() {

  it (`basic inclusion`, function() {
    assert.ok(C1.includes(
      RELATIONS.linearization, RELATIONS.programorder,
      COMPOSITIONS.simple,
      EXPRESSIONS.wildcard, EXPRESSIONS.wildcard));
  });

  it (`basic exclusion`, function() {
    assert.ok(C2.includes(
      RELATIONS.linearization, RELATIONS.programorder,
      COMPOSITIONS.simple,
      EXPRESSIONS.bottom, EXPRESSIONS.bottom));

    assert.ok(!C2.includes(
      RELATIONS.linearization, RELATIONS.programorder,
      COMPOSITIONS.simple,
      EXPRESSIONS.atomic, EXPRESSIONS.atomic));
  });

  it (`mixed levels`, function() {
    assert.ok(C3.includes(
      RELATIONS.linearization, RELATIONS.programorder,
      COMPOSITIONS.simple,
      EXPRESSIONS.wildcard, EXPRESSIONS.wildcard));

    assert.ok(C3.includes(
      RELATIONS.visibility, RELATIONS.programorder,
      COMPOSITIONS.simple,
      EXPRESSIONS.wildcard, EXPRESSIONS.wildcard));

    assert.ok(!C3.includes(
      RELATIONS.visibility, RELATIONS.linearization,
      COMPOSITIONS.simple,
      EXPRESSIONS.wildcard, EXPRESSIONS.wildcard));
  });
});
