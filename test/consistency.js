const assert = require('assert');
const debug = require('debug')('consistency');

const PartialOrder = require('../lib/partial-order');
const {
  PROPERTIES, RELATIONS, COMPOSITIONS, EXPRESSIONS, ATTRIBUTES, COMPARISONS,
  ConsistencyLevel, Consistency
} = require('../lib/consistency');

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

let C1 = Consistency.top()
  .weakenRelationalLevel(RELATIONS.linearization, RELATIONS.programorder, L1, P1, I1, I2)
  .weakenSimpleLevel('consistent_returns', I3);

let C2 = Consistency.top()
  .weakenRelationalLevel(RELATIONS.linearization, RELATIONS.programorder, L2, P1, I1, I2);

let C3 = Consistency.top()
  .weakenRelationalLevel(RELATIONS.linearization, RELATIONS.programorder, L3, P1, I1, I2)
  .weakenRelationalLevel(RELATIONS.visibility, RELATIONS.linearization, V1, L3, I1, I2);

const TOP1 = ConsistencyLevel.top(1);
const TOP2 = ConsistencyLevel.top(2);

const ATOMIC1 = ConsistencyLevel.atomic(1);
const ATOMIC2 = ConsistencyLevel.atomic(2);

const BOTTOM1 = ConsistencyLevel.bottom(1);
const BOTTOM2 = ConsistencyLevel.bottom(2);

describe('consistency', function() {

  it (`basic inclusion`, function() {
    assert.ok(C1.includes('lin_contains_po', TOP2));
    assert.ok(C2.includes('consistent_returns', TOP1));
    assert.ok(C3.includes('consistent_returns', ATOMIC1));
  });

  it (`basic exclusion`, function() {
    assert.ok(C1.includes('consistent_returns', ATOMIC1));
    assert.ok(!C1.includes('consistent_returns', TOP1));
    assert.ok(C2.includes('lin_contains_po', BOTTOM2));
    assert.ok(!C2.includes('lin_contains_po', ATOMIC2));
  });

  it (`mixed levels`, function() {
    assert.ok(C3.includes('lin_contains_po', ATOMIC2));
    assert.ok(C3.includes('vis_contains_po', ATOMIC2));
    assert.ok(!C3.includes('vis_contains_lin', ATOMIC2));
  });

  it (`comparison`, function() {
    assert.ok(C1.compare(C2) === COMPARISONS.incomparable);
    assert.ok(C1.compare(C3) === COMPARISONS.incomparable);
    assert.ok(C2.compare(C3) === COMPARISONS.incomparable);
    assert.ok(C1.compare(Consistency.top()) === COMPARISONS.lesser);
    assert.ok(Consistency.top().compare(C1) === COMPARISONS.greater);
    assert.ok(C1.compare(C1) === COMPARISONS.equal);
  });

  it (`join`, function() {
    assert.equal(Consistency.join(C1,C1,C1).length, 1);
    assert.equal(Consistency.join(C1,C2,C1).length, 2);
    assert.equal(Consistency.join(C2,C3,C1).length, 3);
  });
});
