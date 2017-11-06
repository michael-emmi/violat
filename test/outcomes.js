const fs = require('fs');
const assert = require('assert');
const outcomes = require('../lib/outcomes');
const Atomicity = require('./atomicity');
const { Schema } = require('../lib/schema.js');

function schema(klass, ...seqs) {
  let count = 0;
  return new Schema({
    class: klass,
    parameters: [],
    sequences: seqs.map((invs,idx) => ({
      index: idx,
      invocations: invs.map(([m,ps,args,at,v]) => ({
        method: { name: m, parameters: ps.map(t => ({ type: t })), void: v },
        arguments: args,
        atomic: at,
      }))
    })),
    order: []
  });
}

async function get(schema, opts) {
  let results = await outcomes([schema], opts || ATOMIC);
  let first = results[0];
  let values = first.outcomes.map(o => Object.values(o.results));
  return values;
}

function testcase(schema, opts, expected) {
  return {
    compute: async () => new Set(await get(schema, opts)),
    expected: () => new Set(expected)
  };
}

const T1 = testcase(
  schema('java.util.concurrent.ConcurrentHashMap',
    [ ['clear', [], [], false, true],
      ['put', ['java.lang.Object','java.lang.Object'], [0,1], true, false] ],
    [ ['containsKey', ['java.lang.Object'], [1], true, false],
      ['remove', ['java.lang.Object'], [0], true, false] ] ),
  Atomicity.WEAKEST,
  [ ['null', 'null', 'false', '1'],
    ['null', 'null', 'false', 'null'] ] );

const T2 = testcase(
  schema('java.util.concurrent.ConcurrentHashMap',
    [ ['put', ['java.lang.Object','java.lang.Object'], [0,0], true, false],
      ['put', ['java.lang.Object','java.lang.Object'], [1,0], true, false],
      ['remove', ['java.lang.Object'], [1], true, false] ],
    [ ['put', ['java.lang.Object','java.lang.Object'], [0,1], true, false],
      ['clear', [], [], false, true] ] ),
    Atomicity.WEAKEST,
    [ ['null', 'null', '0', '0', 'null'],
      ['null', 'null', 'null', '0', 'null'],
      ['1', 'null', '0', 'null', 'null'],
      ['1', 'null', 'null', 'null', 'null'],
      ['null', 'null', '0', 'null', 'null'],
     ] );

describe('outcomes', function() {
  this.timeout(50000);

  it (`outcomes() reflects the correct outcomes`, async function() {
    assert.deepEqual(await T1.compute(), T1.expected());
    assert.deepEqual(await T2.compute(), T2.expected());
  });
});
