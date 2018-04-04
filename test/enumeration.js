const fs = require('fs');
const assert = require('assert');
const { generator } = require('../lib/enumeration/index');
const strategies = ['complete', 'shuffle', 'random'];
const specs = [
  require('../resources/specs/java/util/concurrent/ConcurrentHashMap.json'),
  require('../resources/specs/java/util/concurrent/ConcurrentLinkedDeque.json')
];

describe('generate()', function() {
  for (let e of strategies) {
    describe(`${e} enumeration`, function() {
      for (let spec of specs) {
        const schemaGenerator = generator({
          enum: e,
          spec: spec,
          methods: ['clear'],
          values: 2,
          sequences: 2,
          invocations: 3,
          minThreads: 2,
          maxThreads: 2,
          minInvocations: 3,
          maxInvocations: 3,
          minValues: 2,
          maxValues: 2
        });

        const tests = [
          [0,0,0].map(_ => schemaGenerator.next().value)
        ];

        for (let schemas of tests) {
          it(`generates ${schemas.length} schemas for ${spec.class.split('.').pop()}`, function() {
            schemas.forEach(s => assert.equal(s.sequences.length, 2));
          });
        }
      }
    });
  }
});
