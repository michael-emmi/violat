import * as assert from 'assert';
import * as Debug from 'debug';
const debug = Debug('history-checker');

import { HistoryReader } from './reader';
import { HistoryPosition } from './position';

import { Validator, TrivialValidator, LinearizationValidator, ConsistencyValidator } from './validation';
import { LinearizationExtender, JustInTimeLinearizationExtender, VisibilityExtender, MinimalVisibilityExtender } from './extension';

class Linearization {
  sequence: any[];

  constructor(sequence) {
    this.sequence = sequence;
  }

  static empty() {
    return new Linearization([]);
  }

  append(op) {
    return new Linearization([...this.sequence, op]);
  }

  getSequence() {
    return this.sequence;
  }

  toString() {
    return this.sequence.toString();
  }
}

class Visibility {
  map: {};

  constructor(args) {
    this.map = {};
    for (let [op,ops] of Object.entries(args.map || {}))
      this.map[op] = new Set(ops as Iterable<any>);
  }

  static empty() {
    return new Visibility({});
  }

  extend(op, ops) {
    let that = new Visibility(this);
    if (!that.map[op])
      that.map[op] = new Set();
    ops.forEach(id => that.map[op].add(id));
    return that;
  }

  has(src, dst) {
    return this.map[src].has(dst);
  }

  toString() {
    return Object.entries(this.map)
      .map(([op,ops]) => `${op}:{${[...ops as Iterable<any>].join(",")}}`)
      .join(" ");
  }
}

class SearchBasedConsistency {
  posRepr: typeof HistoryPosition;
  linRepr: typeof Linearization;
  visRepr: typeof Visibility;
  linExtender: LinearizationExtender;
  visExtender: VisibilityExtender;

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

    for await (let [nextPos, linExt] of this.linExtender.extensions(pos, lin)) {
      let newOps = linExt.getSequence().filter(op => !lin.getSequence().includes(op))
      for await (let visExt of this.visExtender.extensions(pos, linExt, vis, ...newOps)) {
        if (await this._isConsistent(nextPos, linExt, visExt)) {
          return true;
        }
      }
    }

    return false;
  }
}

export class ConsistencyChecker {
  weak: boolean;
  searcher: SearchBasedConsistency;

  constructor(args) {
    let linValidator: any = args.weak ? TrivialValidator : LinearizationValidator;
    let linExtender = args.jit ? JustInTimeLinearizationExtender : LinearizationExtender;
    let visValidator = ConsistencyValidator;
    let visExtender = args.min ? MinimalVisibilityExtender : VisibilityExtender;

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
