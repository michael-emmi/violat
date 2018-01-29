const debug = require('debug')('history-extension');
const assert = require('assert');

class LinearizationExtender {
  constructor(validator) {
    this.validator = validator;
  }

  async * extensions(pos, lin) {
    for (let op of pos.minimals()) {
      let [nextPos, linExt] = this._extend(pos, lin, op);
      let valid = await this.validator.validate(linExt, pos);
      debug(`extension(%s): %s`, valid, linExt);
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
    let op = pos.firstToReturn();
    let pending = pos.concurrentWith(op);

    // TODO is the order of subsets/linearizations important here?
    for (let ops of subsets(pending)) {
      for (let seq of linearizations([...ops, op])) {
        let [nextPos, linExt] = seq.reduce(([p,l],op) => this._extend(p,l,op), [pos, lin]);
        let valid = await this.validator.validate(linExt, pos);
        debug(`extension(%s): %s`, valid, linExt);
        if (valid)
          yield [nextPos, linExt];
      }
    }
  }
}

class VisibilityExtender {
  constructor() {

  }

  async * extensions(vis) {
    assert.fail("TODO implement visibility extender");
  }
}

class MinimalVisibilityExtender extends VisibilityExtender {
  constructor() {
    super();
  }

  async * extensions(vis) {
    assert.fail("TODO implement visibility extender");
  }
}

function subsets([x, ...xs]) {
  return x ? [].concat(...subsets(xs).map(ys => [ys, [x, ...ys]])) : [[]];
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
