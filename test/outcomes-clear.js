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

const ATOMIC = {};
const WEAK = {weak: true};
const WEAKEST = {
  weak: true,
  weakRelaxLinearization: true,
  weakRelaxVisibility: true,
  weakRelaxReturns: true
};

const S1 = schema(
  'java.util.concurrent.ConcurrentHashMap',
  [ ['put', ['java.lang.Object','java.lang.Object'], [0,0], true],
    ['put', ['java.lang.Object','java.lang.Object'], [1,0], true],
    ['remove', ['java.lang.Object'], [1], true] ],
  [ ['put', ['java.lang.Object','java.lang.Object'], [0,1], true],
    ['clear', [], [], false] ] );

const OS1 = [
  ['null', 'null', 'false', '1'],
  ['null', 'null', 'false', 'null']
];

describe('outcomes', function() {
  this.timeout(50000);

  it (`outcomes() reflects the correct outcomes`, async function() {
    assert.deepEqual(new Set(await get(S1, WEAKEST)), new Set(OS1));
  });
});
