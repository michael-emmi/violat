const fs = require('fs');
const assert = require('assert');
const generator = require('../lib/enumeration/index');
const annotate = require('../lib/outcomes');
const spec = require('../resources/specs/java/util/concurrent/ConcurrentHashMap.json');

describe('annotate()', function() {
  this.timeout(50000);

  const n = 5;
  const schemaGenerator = generator({
    enum: 'random',
    spec: spec,
    methods: ['clear'],
    values: 4,
    sequences: 2,
    invocations: n
  });
  const tests = [
    [0].map(_ => schemaGenerator.next().value),
    [0,0].map(_ => schemaGenerator.next().value),
    [0,0,0].map(_ => schemaGenerator.next().value)
  ];
  for (let objs of tests) {
    it(`annotates ${objs.length} random schemas`, async function() {
      let annotated = await annotate(objs, {});
      assert.equal(annotated.length, objs.length);
      assert.ok(annotated.every(obj => 'outcomes' in obj));
      assert.ok(annotated.every(obj => obj['outcomes'].every(ary => ary.length = n)));
    });
  }
});
