const fs = require('fs');
const assert = require('assert');
const PartialOrder = require('../lib/partial-order');
const visibility = require('../lib/visibility');
const Atomicity = require('./atomicity');
const { Consistency } = require('../lib/consistency');

function pairs(values) {
  return [].concat(...values.map(x => values.map(y => [x,y])));
}

function vizPairs(po, lin, opts) {
  return visibility(po, lin, opts).map(viz => {
    return pairs(viz.values()).filter(([x,y]) => viz.isVisible(x,y));
  });
}

function testcase(po, lin, opts, expected) {
  return {
    compute: () => new Set(vizPairs(po, lin, opts).map(pss => new Set(pss))),
    expected: () => new Set(expected.map(pss => new Set(pss)))
  };
}

const I1 = { id: 1, atomic: true };
const I2 = { id: 2, atomic: true };
const I3 = { id: 3, atomic: true };
const I4 = { id: 4, atomic: false };

const PO1 = new PartialOrder();
PO1.sequence(I1, I2);
PO1.sequence(I3, I4);

const L1 = { sequence: [I1, I4, I2, I3], consistency: Consistency.top() };

const T1 = testcase(
  PO1, L1, Atomicity.ATOMIC,
  [ [ [I1,I4], [I1,I2], [I1,I3],
      [I4,I2],
      [I2,I3], [I3,I3] ] ] );

const T2 = testcase(
  PO1, L1, Atomicity.WEAKEST,
  [ [ [I1,I4], [I1,I2], [I1,I3],
      [I4,I2],
      [I2,I3], [I3,I3] ],
    [ [I1,I4], [I1,I2], [I1,I3],
      [I2,I3], [I3,I3] ],
    [ [I1,I2], [I1,I3],
      [I4,I2],
      [I2,I3], [I3,I3] ],
    [ [I1,I2], [I1,I3],
      [I2,I3], [I3,I3] ] ] );

describe('visibility', function() {

  it (`visibility() reflects visibilities`, function() {
    assert.deepEqual(T1.compute(), T1.expected());
    assert.deepEqual(T2.compute(), T2.expected());
  });

});
