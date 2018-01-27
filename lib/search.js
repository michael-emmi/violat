const debug = require('debug')('search');
const assert = require('assert');

class HistoryPosition {
  constructor() {

  }

  advance() {
    assert.fail("TODO implement history position");
  }

  isAtEnd() {
    assert.fail("TODO implement history position");
  }

  minimals() {
    assert.fail("TODO implement history position");
  }

  firstToReturn() {
    assert.fail("TODO implement history position");
  }

  concurrentWith(op) {
    assert.fail("TODO implement history position");
  }
}

class LinearizationValidator {
  constructor() {

  }

  validate(lin) {
    assert.fail("TODO implement linearization validation");
  }
}

class ConsistencyValidator extends LinearizationValidator {
  constructor() {
    super();
  }

  validate(lin, vis) {
    assert.fail("TODO implement consistency validation");
  }
}

class LinearizationExtender {
  constructor(validator) {
    this.validator = validator;
  }

  * extensions(pos, lin) {
    for (let op of pos.minimals()) {
      let [nextPos, linExt] = this._extend(pos, lin, op);
      if (this.validator.validate(linExt))
        yield [nextPos, linExt];
    }
  }

  _extend(pos, lin, op) {
    let nextPos = pos.advance(op);
    let linExt = lin.append(op);
    return [nextPos, linExt];
  }
}

class JustInTimeLinearizationExtender extends LinearizationExtender {
  constructor(validator) {
    super(validator);
  }

  * extensions(pos, lin) {
    let op = pos.firstToReturn();
    let pending = pos.concurrentWith(op);
    for (let ops of this._subsets(pending)) {
      for (let seq of this._linearizations([...ops, op])) {
        let [nextPos, linExt] = seq.reduce(([p,l],op) => this._extend(p,l,op), [pos, lin]);
        if (this.validator.validate(linExt)) {
          yield [nextPos, linExt];
        }
      }
    }
  }

  _subsets(elems) {
    assert.fail("TODO implement linearization extender");
  }

  _linearizations(elems) {
    assert.fail("TODO implement linearization extender");
  }

}

class VisibilityExtender {
  constructor() {

  }

  * extensions(vis) {
    assert.fail("TODO implement visibility extender");
  }
}

class MinimalVisibilityExtender extends VisibilityExtender {
  constructor() {
    super();
  }

  * extensions(vis) {
    assert.fail("TODO implement visibility extender");
  }
}

class SearchBasedConsistency {
  constructor(posRepr, linRepr, visRepr, linExtender, visExtender) {
    this.posRepr = posRepr;
    this.linRepr = linRepr;
    this.visRepr = visRepr;
    this.linExtender = linExtender;
    this.visExtender = visExtender;
  }

  isLinearizable() {
    let pos = this.posRepr.initial();
    let lin = this.visRepr.empty();
    return this._isLinearizable(pos, lin);
  }

  _isLinearizable(pos, lin) {
    if (pos.isAtEnd())
      return true;

    for (let [nextPos, linExt] of this.linExtender.extensions(pos, lin)) {
      if (this._isLinearizable(nextPos, linExt))
        return true;

    return false;
  }

  isConsistent() {
    let pos = this.posRepr.initial();
    let lin = this.linRepr.empty();
    let vis = this.visRepr.empty();
    return this._isConsistent(pos, lin, vis);
  }

  _isConsistent(pos, lin, vis) {
    if (pos.isAtEnd())
      return true;

    for (let [nextPos, linExt] of this.linExtender.extensions(pos, lin))
      for (let visExt of this.visExtender.extensions(vis))
        if (this._isConsistent(nextPos, linExt, visExt))
          return true;

    return false;
  }
}
