const fs = require('fs');
const assert = require('assert');
const PartialOrder = require('../lib/partial-order');

const PO1 = new PartialOrder();
PO1.sequence(1, 2);
PO1.sequence(3, 4);
PO1.sequence(2, 3);

const PO2 = new PartialOrder();
PO2.sequence(1, 2);
PO2.sequence(2, 3);
PO2.sequence(3, 4);
PO2.sequence(4, 5);

const PO3 = PO2.drop(3);

const PO4 = new PartialOrder();
PO4.sequence(1, 8);
PO4.sequence(2, 8);
PO4.sequence(8, 9);
PO4.sequence(3, 9);

function allPairs(values) {
  return [].concat(...values.map(x => values.map(y => [x,y])));
}

function beforePairs(po) {
  return allPairs(po.values()).filter(([x,y]) => po.isBefore(x,y));
}

describe('partial order', function() {

  it (`computes values`, function() {
    assert.deepEqual(new Set(PO1.values()), new Set([1,2,3,4]));
    assert.deepEqual(new Set(PO2.values()), new Set([1,2,3,4,5]));
    assert.deepEqual(new Set(PO3.values()), new Set([1,2,4,5]));
    assert.deepEqual(new Set(PO4.values()), new Set([1,2,3,8,9]));
  });

  it (`computes transitive closure`, function() {
    assert.deepEqual(new Set(beforePairs(PO1)), new Set([
      [1,2], [1,3], [1,4],
      [2,3], [2,4],
      [3,4]
    ]));
  });

  it (`maintains transitive closure after removals`, function() {
    assert.deepEqual(new Set(beforePairs(PO3)), new Set([
      [1,2],
      [4,5]
    ]));
  });

  it (`computes minimals`, function() {
    assert.deepEqual(new Set(PO1.minimals()), new Set([1]));
    assert.deepEqual(new Set(PO2.minimals()), new Set([1]));
    assert.deepEqual(new Set(PO3.minimals()), new Set([1,4]));
    assert.deepEqual(new Set(PO4.minimals()), new Set([1,2,3]));
  });

  it (`computes linearizations`, function() {
    assert.deepEqual(new Set(PO4.linearizations()), new Set([
      [1,2,3,8,9],
      [1,2,8,3,9],
      [1,3,2,8,9],
      [2,1,3,8,9],
      [2,1,8,3,9],
      [2,3,1,8,9],
      [3,1,2,8,9],
      [3,2,1,8,9]
    ]));
  });
});
