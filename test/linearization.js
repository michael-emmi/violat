const fs = require('fs');
const assert = require('assert');
const PartialOrder = require('../lib/partial-order');
const linearization = require('../lib/linearization');

const I1 = { id: 1, atomic: true };
const I2 = { id: 2, atomic: true };
const I3 = { id: 3, atomic: false };

const PO1 = new PartialOrder();
PO1.sequence(I1, I2);
PO1.sequence(I2, I3);

const PO2 = new PartialOrder();
PO2.sequence(I1, I2);
PO2.add(I3);

const PO3 = new PartialOrder();
PO3.sequence(I1, I3);
PO3.add(I2);

const W0 = {weakRelaxLinearization: false};
const W1 = {weakRelaxLinearization: true};

function lins(po, w) {
  return new Set(linearization(po, w).map(l => l.sequence));
}

describe('linearization', function() {

  it (`linerization() reflects linearizations`, function() {
    assert.deepEqual(lins(PO1, W0), new Set([
      [I1, I2, I3]
    ]));
    assert.deepEqual(lins(PO2, W0), new Set([
      [I1, I2, I3],
      [I1, I3, I2],
      [I3, I1, I2]
    ]));
    assert.deepEqual(lins(PO3, W0), new Set([
      [I1, I2, I3],
      [I1, I3, I2],
      [I2, I1, I3]
    ]));
  });

  it (`linerization() reflects weak linearizations`, function() {
    assert.deepEqual(lins(PO1, W1), new Set([
      [I1, I2, I3],
      [I1, I3, I2],
      [I3, I1, I2]
    ]));
    assert.deepEqual(lins(PO2, W1), new Set([
      [I1, I2, I3],
      [I1, I3, I2],
      [I3, I1, I2]
    ]));
    assert.deepEqual(lins(PO3, W1), new Set([
      [I1, I2, I3],
      [I1, I3, I2],
      [I2, I1, I3],
      [I2, I3, I1],
      [I3, I1, I2],
      [I3, I2, I1]
    ]));
  });
});
