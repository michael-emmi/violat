const fs = require('fs');
const assert = require('assert');
const Properties = require('../lib/outcome-properties');

const P0 = Properties.empty();
const P1 = Properties.unit('foo');
const P2 = Properties.unit('bar');
P2.add('bar');
const P3 = Properties.empty();
P3.merge(P1);
P3.merge(P2);
P3.add('blah');
const P4 = P1.join(P2);

const PX1 = Properties.unit('foo');
const PX2 = Properties.unit('bar');
const PX3 = Properties.empty();

describe('outcome-properties', function() {

  it (`isEmpty() reflects emptiness`, function() {
    assert.ok(P0.isEmpty());
    assert.ok(!P1.isEmpty());
    assert.ok(!P2.isEmpty());
    assert.ok(!P3.isEmpty());
    assert.ok(!P4.isEmpty());
  });

  it (`get() reflects keys`, function() {
    assert.deepEqual(new Set(P0.get()), new Set([]));
    assert.deepEqual(new Set(P1.get()), new Set(['foo']));
    assert.deepEqual(new Set(P2.get()), new Set(['bar']));
    assert.deepEqual(new Set(P3.get()), new Set(['foo', 'bar', 'blah']));
    assert.deepEqual(new Set(P4.get()), new Set(['foo', 'bar']));
  });

  it (`includesAll() reflects containment`, function() {
    assert.ok(!P0.includesAll(P1));
    assert.ok(P1.includesAll(P0));
    assert.ok(!P1.includesAll(P2));
    assert.ok(P2.includesAll(P0));
    assert.ok(!P2.includesAll(P1));
    assert.ok(P3.includesAll(P0));
    assert.ok(P3.includesAll(P1));
    assert.ok(P3.includesAll(P2));
  });

  it (`minimals() returns the minimals`, function() {
    assert.deepEqual(
      new Set(Properties.minimals([P0, P1, P2, P3, P4])),
      new Set([P0])
    );
    assert.deepEqual(
      new Set(Properties.minimals([P1, P2, P3, P4])),
      new Set([P1, P2])
    );
    assert.deepEqual(
      new Set(Properties.minimals([P3, P4])),
      new Set([P4])
    );
    assert.deepEqual(
      new Set(Properties.minimals([PX1, PX2, PX3])),
      new Set([PX3])
    );
  });
});
