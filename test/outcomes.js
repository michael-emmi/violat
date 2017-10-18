const fs = require('fs');
const assert = require('assert');
const outcomes = require('../lib/outcomes');

function schema(klass, ...seqs) {
  let count = 0;
  return {
    class: klass,
    parameters: [],
    sequences: seqs.map((invs,idx) => ({
      index: idx,
      invocations: invs.map(([m,ps,args,at]) => ({
        method: { name: m, parameters: ps.map(t => ({ type: t })) },
        arguments: args,
        atomic: at
      }))
    })),
    order: []
  };
}

async function get(schema, opts) {
  return (await outcomes([schema], opts || ATOMIC))[0].outcomes.map(o => o.values);
}

function testcase(schema, opts, expected) {
  return {
    compute: async () => new Set(await get(schema, opts)),
    expected: new Set(expected)
  };
}

const ATOMIC = {};
const WEAK = {weak: true};
const WEAKEST = {
  weak: true,
  weakRelaxLinearization: true,
  weakRelaxVisibility: true,
  weakRelaxReturns: true
};

const T1 = testcase(
  schema('java.util.concurrent.ConcurrentHashMap',
    [ ['clear', [], [], false],
      ['put', ['java.lang.Object','java.lang.Object'], [0,1], true] ],
    [ ['containsKey', ['java.lang.Object'], [1], true],
      ['remove', ['java.lang.Object'], [0], true] ] ),
  WEAKEST,
  [ ['null', 'null', 'false', '1'],
    ['null', 'null', 'false', 'null'] ] );

const T2 = testcase(
  schema('java.util.concurrent.ConcurrentHashMap',
    [ ['put', ['java.lang.Object','java.lang.Object'], [0,0], true],
      ['put', ['java.lang.Object','java.lang.Object'], [1,0], true],
      ['remove', ['java.lang.Object'], [1], true] ],
    [ ['put', ['java.lang.Object','java.lang.Object'], [0,1], true],
      ['clear', [], [], false] ] ),
    WEAKEST,
    [ ['null', 'null', 'false', '1'],
      ['null', 'null', 'false', 'null'] ] );

describe('outcomes', function() {
  this.timeout(50000);

  it (`outcomes() reflects the correct outcomes`, async function() {
    assert.deepEqual(await T1.compute(), T1.expected);
    assert.deepEqual(await T2.compute(), T2.expected);
  });
});
