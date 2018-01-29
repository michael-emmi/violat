const debug = require('debug')('history-checker');
const assert = require('assert');

const { HistoryReader } = require('./reader.js');
const { HistoryPosition } = require('./position.js');
const { TrivialValidator, LinearizationValidator, ConsistencyValidator } = require('./validation.js');
const { LinearizationExtender, JustInTimeLinearizationExtender, VisibilityExtender, MinimalVisibilityExtender } = require('./extension.js');

class Linearization {
  constructor(sequence) {
    this.sequence = sequence;
  }

  static empty() {
    return new Linearization([]);
  }

  append(op) {
    return new Linearization([...this.sequence, op]);
  }

  toString() {
    return this.sequence.toString();
  }
}

class Visibility {
  constructor() {

  }

  static empty() {
    assert.fail("TODO implement visibility");
  }
}

class SearchBasedConsistency {
  constructor(args) {
    this.posRepr = args.posRepr;
    this.linRepr = args.linRepr;
    this.visRepr = args.visRepr;
    this.linExtender = args.linExtender;
    this.visExtender = args.visExtender;
  }

  async isLinearizable(reader) {
    let pos = this.posRepr.initial(reader);
    let lin = this.linRepr.empty();
    return await this._isLinearizable(pos, lin);
  }

  async _isLinearizable(pos, lin) {
    debug(`isLinearizable(%o, %o)`, pos, lin);

    if (pos.isAtEnd())
      return true;

    for await (let [nextPos, linExt] of this.linExtender.extensions(pos, lin))
      if (await this._isLinearizable(nextPos, linExt))
        return true;

    return false;
  }

  async isConsistent(reader) {
    let pos = this.posRepr.initial(reader);
    let lin = this.linRepr.empty();
    let vis = this.visRepr.empty();
    return await this._isConsistent(pos, lin, vis);
  }

  async _isConsistent(pos, lin, vis) {
    debug(`isConsistent(%o, %o)`, pos, lin);

    if (pos.isAtEnd())
      return true;

    for await (let [nextPos, linExt] of this.linExtender.extensions(pos, lin))
      for await (let visExt of this.visExtender.extensions(vis))
        if (await this._isConsistent(nextPos, linExt, visExt))
          return true;

    return false;
  }
}

class ConsistencyChecker {
  constructor(args) {
    let linValidator = args.weak ? TrivialValidator : LinearizationValidator;
    let linExtender = args.jit ? JustInTimeLinearizationExtender : LinearizationExtender;
    let visValidator = ConsistencyValidator;
    let visExtender = args.min ? MinimalVisibilityExtender : VisibilityExtender;;

    this.weak = args.weak;
    this.searcher = new SearchBasedConsistency({
      posRepr: HistoryPosition,
      linRepr: Linearization,
      visRepr: Visibility,
      linExtender: new linExtender(new linValidator(args.executor)),
      visExtender: new visExtender(new ConsistencyValidator(args.executor))
    });
  }

  async check(filename) {
    let reader = await HistoryReader.fromFile(filename);
    return this.weak
      ? await this.searcher.isConsistent(reader)
      : await this.searcher.isLinearizable(reader);
  }
}

module.exports = {
  ConsistencyChecker
};
