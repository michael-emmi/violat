const assert = require('assert');
const shuffle = require('../lib/shuffle');

describe('shuffle()', function() {
  const tests = [
    [3, 9, 4, 2],
    ['a', 'b', 'c', 'd', 'e'],
    [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
  ];
  for (let ary of tests) {
    it(`permutes ${ary}`, function() {
      let shuffled = ary.map(x => x);
      shuffle(shuffled);
      assert.equal(shuffled.length, ary.length);
      assert.notEqual(shuffled, ary);
      assert.ok(ary.every(x => shuffled.includes(x)));
      assert.ok(shuffled.every(x => ary.includes(x)));
    });
  }
});
