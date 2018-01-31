const debug = require('debug')('history-extension');
const assert = require('assert');

class LinearizationExtender {
  constructor(validator) {
    this.validator = validator;
  }

  async * extensions(pos, lin) {
    for (let op of pos.unconsumedMinimals()) {
      let [nextPos, linExt] = this._extend(pos, lin, op);
      let valid = await this.validator.validate(linExt, pos);
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

class JustInTimeLinearizationExtender extends LinearizationExtender {
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
        let valid = await this.validator.validate(linExt, pos);
        debug(`extension: %s / %s`, linExt, valid);
        if (valid)
          yield [nextPos, linExt];
      }
    }
  }
}

class VisibilityExtender {
  constructor(validator) {
    this.validator = validator;
  }

  async * extensions(pos, lin, vis, ...newOps) {
    let [op, ...more] = newOps;
    assert.ok(more.length === 0);

    let maySee = pos.getConcurrentWith(op).filter(id => lin.getSequence().includes(id));
    let mustSee = lin.getSequence().filter(id => id !== op && !maySee.includes(id));
    let visBase = vis.extend(op, mustSee);

    debug(`lin: %o`, lin.getSequence());
    debug(`maySee: %o`, maySee);
    debug(`mustSee: %o`, mustSee);

    let _subsets = subsets(maySee).reverse();
    debug(`subsets: %o`, _subsets);

    for (let ops of _subsets) {

      debug(`subset: %o`, ops);

      let visExt = visBase.extend(op, ops);
      let valid = await this.validator.validate(lin, visExt, pos);

      debug(`extension: %s / %s`, visExt, valid);

      if (valid)
        yield visExt;
    }
  }
}

class MinimalVisibilityExtender extends VisibilityExtender {
  constructor(validator) {
    super(validator);
  }

  async * extensions(pos, vis) {
    assert.fail("TODO implement visibility extender");
  }
}

function subsets([x, ...xs]) {
  return x !== undefined ? [].concat(...subsets(xs).map(ys => [ys, [x, ...ys]])) : [[]];
}

function linearizations(xs) {
  return xs.length ? [].concat(...xs.map(x => linearizations(xs.filter(y => y !== x)).map(ys => [x, ...ys]))) : [[]];
}

module.exports = {
  LinearizationExtender,
  JustInTimeLinearizationExtender,
  VisibilityExtender,
  MinimalVisibilityExtender
};
