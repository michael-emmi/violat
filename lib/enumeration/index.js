const debug = require('debug')('enum');
const randomenum = require('./random-small.js');
const basicenum = require('./basic.js');
const shuffle = require('../shuffle.js');

module.exports = function(args) {
  debug(`using enumerator: ${args.enum}`);

  switch (args.enum) {
    case 'random':
      return randomenum.generator(args);

    case 'complete':
      return basicenum.generator(args)();

    case 'shuffle':
      let ary = Array.from(basicenum.generator(args)());
      shuffle(ary);
      debug(`shuffled ${ary.length} schemas`);
      return function*() {
        while (ary.length > 0)
          yield ary.shift();
      }();

    default:
      assert.fail(`unknown enumerator: ${args.enum}`);
  }

}
