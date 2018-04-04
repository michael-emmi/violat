const debug = require('debug')('spec:visibility');
const assert = require('assert');

const { Level } = require('../core/visibility.js');

class VisibilitySpecStrengthener {
  * getStrengthenings({ spec, method }) {
    let current = method.visibility;
    if (current === undefined)
      return;

    let next = Level.up(current);
    if (next === undefined)
      return;

    let visibility = next;
    let newMethod = Object.assign({}, method, { visibility });
    let methods = spec.methods.map(m => m === method ? newMethod : m);
    let newSpec = Object.assign({}, spec, { methods });

    debug(`strengthening %s: %s -> %s`, method.name, current, next);
    yield { newSpec, attribute: visibility };
  }
}

module.exports = {
  VisibilitySpecStrengthener
};
