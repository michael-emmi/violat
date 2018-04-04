import * as assert from 'assert';
import * as Debug from 'debug';
const debug = Debug('enum');

const randomenum = require('./random.js');
const basicenum = require('./basic.js');
const shuffle = require('../shuffle.js');

export function generator(args) {
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
