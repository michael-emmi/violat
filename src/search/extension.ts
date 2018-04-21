import * as assert from 'assert';
import * as Debug from 'debug';
const debug = Debug('history-extension');
const detail = Debug('history-extension:detail');

import { LinearizationValidator, ConsistencyValidator } from './validation';

export class LinearizationExtender {
  validator: LinearizationValidator;

  constructor(validator) {
    this.validator = validator;
  }

  async * extensions(pos, lin) {
    for (let op of pos.unconsumedMinimals()) {
      let [nextPos, linExt] = this._extend(pos, lin, op);
      let valid = await this.validator.validate({ lin: linExt, pos });
      debug(`extension: %s / %s`, linExt, valid);
      if (valid)
        yield [nextPos, linExt];
    }
  }

  _extend(pos, lin, op) {
    let nextPos = pos.consume(op);
    let linExt = lin.append(op);
    return [nextPos, linExt];
  }
}

export class JustInTimeLinearizationExtender extends LinearizationExtender {
  constructor(validator) {
    super(validator);
  }

  async * extensions(pos, lin) {
    let op = pos.firstUnconsumedToReturn();
    let pending = pos.unconsumedConcurrentWith(op);

    // TODO is the order of subsets/linearizations important here?
    for (let ops of subsets(pending).reverse()) {
      for (let seq of linearizations([...ops, op])) {
        let [nextPos, linExt] = seq.reduce(([p,l],op) => this._extend(p,l,op), [pos, lin]);
        let valid = await this.validator.validate({ lin: linExt, pos });
        debug(`extension: %s / %s`, linExt, valid);
        if (valid)
          yield [nextPos, linExt];
      }
    }
  }
}

export class VisibilityExtender {
  validator: ConsistencyValidator;

  constructor(validator) {
    this.validator = validator;
  }

  async * extensions(pos, lin, vis, ...newOps) {
    let [op, ...more] = newOps;
    assert.ok(more.length === 0);

    let maySee = pos.getConcurrentWith(op).filter(id => lin.getSequence().includes(id));
    let mustSee = lin.getSequence().filter(id => id !== op && !maySee.includes(id));
    let visBase = vis.extend(op, mustSee);
    let _subsets = subsets(maySee).reverse();

    detail(`lin: %o`, lin.getSequence());
    detail(`maySee: %o`, maySee);
    detail(`mustSee: %o`, mustSee);
    detail(`subsets: %o`, _subsets);

    for (let ops of _subsets) {

      detail(`subset: %o`, ops);

      let visExt = visBase.extend(op, ops);
      let valid = await this.validator.validate({ lin, vis: visExt, pos });

      debug(`extension: %s / %s`, visExt, valid);

      if (valid)
        yield visExt;
    }
  }
}

export class MinimalVisibilityExtender extends VisibilityExtender {
  constructor(validator) {
    super(validator);
  }

  async * extensions(pos, lin, vis, ...newOps) {
    let [op, ...more] = newOps;

    // TODO combine with JIT-linearizability
    assert.ok(more.length === 0);

    let maySee = pos.getConcurrentWith(op).filter(id => lin.getSequence().includes(id));
    let mustSee = lin.getSequence().filter(id => id !== op && !maySee.includes(id));
    let visBase = vis.extend(op, mustSee);
    let _subsets = subsets(maySee);
    let validated: any[] = [];

    detail(`lin: %o`, lin.getSequence());
    detail(`maySee: %o`, maySee);
    detail(`mustSee: %o`, mustSee);
    detail(`subsets: %o`, _subsets);

    for (let ops of _subsets) {
      detail(`min subset: %o`, ops);

      if (validated.some(ss => ss.every(id => ops.includes(id)))) {
        detail(`skpping; already covered`);
        continue;
      }

      let visExt = visBase.extend(op, ops);
      let valid = await this.validator.validate({ lin, vis: visExt, pos });

      debug(`extension: %s / %s`, visExt, valid);

      if (valid) {
        validated.push(ops);
        yield visExt;
      }
    }
  }
}

function subsets([x, ...xs]) {
  return x !== undefined ? [].concat(...subsets(xs).map(ys => [ys, [x, ...ys]])) : [[]];
}

function linearizations(xs) {
  return xs.length ? [].concat(...xs.map(x => linearizations(xs.filter(y => y !== x)).map(ys => [x, ...ys]))) : [[]];
}
