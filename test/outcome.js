const fs = require('fs');
const assert = require('assert');
const Outcome = require('../lib/outcome');
const Properties = require('../lib/outcome-properties');

const O1 = Outcome.empty();
const O2 = Outcome.results({0: 'a', 1: 'b'});
const O3 = Outcome.results({1: 'b', 2: 'c'});
const O4 = O2.merge(O3);
const O5 = Outcome.results({0: 'z', 2: 'c'});

const O6 = Outcome.results({0: 'a', 1: 'b'});
O6.properties.add(Properties.unit('foo'));

const O7 = Outcome.results({0: 'a', 1: 'b'});
O7.properties.add(Properties.unit('bar'));

const O8 = Outcome.results({0: 'a', 1: 'b'});
O8.properties.add(Properties.unit('foo'));
O8.properties.add(Properties.unit('bar'));

describe('outcome', function() {

  it (`consistent() reflects consistency`, function() {
    assert.ok(O1.consistent(O2));
    assert.ok(O1.consistent(O3));
    assert.ok(O1.consistent(O4));
    assert.ok(O1.consistent(O5));

    assert.ok(O2.consistent(O1));
    assert.ok(O2.consistent(O3));
    assert.ok(O2.consistent(O4));
    assert.ok(!O2.consistent(O5));

    assert.ok(O3.consistent(O1));
    assert.ok(O3.consistent(O2));
    assert.ok(O3.consistent(O4));
    assert.ok(O3.consistent(O5));

    assert.ok(O4.consistent(O1));
    assert.ok(O4.consistent(O2));
    assert.ok(O4.consistent(O3));
    assert.ok(!O4.consistent(O5));

    assert.ok(O5.consistent(O1));
    assert.ok(!O5.consistent(O2));
    assert.ok(O5.consistent(O3));
    assert.ok(!O5.consistent(O4));
  });

  it (`minimals() returns the minimals`, function() {
    assert.deepEqual(
      new Set(Outcome.minimals([O1, O2, O6, O7, O8])),
      new Set([O1, O2])
    );
    console.log(Outcome.minimals([O1, O6, O7, O8]));
    assert.deepEqual(
      new Set(Outcome.minimals([O1, O6, O7, O8])),
      new Set([O1, O6, O7])
    );
    assert.deepEqual(
      new Set(Outcome.minimals([O1, O8])),
      new Set([O1, O8])
    );
  });
});
