import * as assert from 'assert';
import * as Debug from 'debug';
const debug = Debug('spec:visibility');

import { Spec, Method } from './spec';
import { Level } from '../core/visibility';
import { SpecStrengthener } from './strengthener';

class VisibilitySpecStrengthener implements SpecStrengthener {
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
    let newSpec: Spec = Object.assign({}, spec, { methods });

    debug(`strengthening %s: %s -> %s`, method.name, current, next);
    yield { newSpec, attribute: visibility };
  }
}

module.exports = {
  VisibilitySpecStrengthener
};
