const fs = require('fs');
const assert = require('assert');
const debug = require('debug')('visibility');
const { PartialOrder } = require('../lib/partial-order');
const { visibilities } = require('../lib/visibility');
const Atomicity = require('./atomicity');
const { Consistency } = require('../lib/consistency');
const { Schema, Invocation } = require('../lib/schema.js');

function pairs(values) {
  return [].concat(...values.map(x => values.map(y => [x,y])));
}

function vizPairs(po, lin, opts) {
  return [...visibilities(po, lin, opts)].map(viz => {
    return pairs(viz.values()).filter(([x,y]) => viz.isVisible(x,y));
  });
}

function testcase(po, lin, opts, expected) {
  return {
    compute: () => new Set(vizPairs(po, lin, opts).map(pss => new Set(pss))),
    expected: () => new Set(expected.map(pss => new Set(pss)))
  };
}

const I1 = new Invocation({ id: 1, atomic: true });
const I2 = new Invocation({ id: 2, atomic: true });
const I3 = new Invocation({ id: 3, atomic: true });
const I4 = new Invocation({ id: 4, atomic: false });

const PO1 = new PartialOrder();
PO1.sequence(I1, I2);
PO1.sequence(I3, I4);

const L1 = { sequence: [I1, I4, I2, I3], consistency: Consistency.top() };

const T1 = testcase(
  PO1, L1, Atomicity.ATOMIC,
  [ [ [I1,I4], [I1,I2], [I1,I3],
      [I4,I2],
      [I2,I3] ] ] );

const T2 = testcase(
  PO1, L1, Atomicity.WEAKEST,
  [ [ [I1,I4], [I1,I2], [I1,I3],
      [I4,I2],
      [I2,I3] ],
    [ [I1,I4], [I1,I2], [I1,I3],
      [I2,I3] ],
    [ [I1,I2], [I1,I3],
      [I4,I2],
      [I2,I3] ],
    [ [I1,I2], [I1,I3],
      [I2,I3] ] ] );

describe('visibility', function() {

  it (`visibility() reflects visibilities`, function() {
    debug(T2.compute().size);
    debug(T2.expected().size);
    assert.deepEqual(T1.compute(), T1.expected());
    assert.deepEqual(T2.compute(), T2.expected());
  });

});
