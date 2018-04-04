import * as assert from 'assert';
import * as Debug from 'debug';
const debug = Debug('history-position');

import { HistoryReader } from './reader';

export class HistoryPosition {
  reader: HistoryReader;
  consumed: Set<any>;
  archived: Set<any>;
  pending: Set<any>;
  values: {};
  overlapping: {};

  constructor(args) {
    debug(`HistoryPosition(%o)`, args);
    this.reader = args.reader.dup();
    this.consumed = new Set(args.consumed || []);
    this.archived = new Set(args.archived || []);
    this.pending = new Set(args.pending || []);
    this.values = args.values || {};
    this.overlapping = args.overlapping || {};
  }

  getSchema() {
    return this.reader.getSchema();
  }

  getValue(op) {
    this._ensureValue(op);
    return this.values[op];
  }

  getConcurrentWith(op) {
    this._ensureOverlapping(op);
    return this.overlapping[op];
  }

  consume(op) {
    this._ensureValue(op);
    this._ensureOverlapping(op);
    let that = new HistoryPosition(this);
    that.consumed.add(op);

    // advance the reader beyond the events of consumed operations
    while (that.reader.hasMore()) {
      that.reader.mark();
      let event = that.reader.read();
      let id = event.invocation.id;
      if (!that.consumed.has(id)) {
        that.reader.reset();
        break;

      } else if (event.kind === 'call') {
        that.pending.add(id);

      } else if (event.kind === 'return') {
        that.archived.add(id);
        that.pending.delete(id);
      }
    }
    return that;
  }

  isAtEnd() {
    return !this.reader.hasMore();
  }

  unconsumedMinimals() {
    let ops = [];
    this.reader.mark();

    for (let event of this._unconsumed()) {
      if (event.kind === 'return')
        break;
      ops.push(event.invocation.id);
    }
    this.reader.reset();
    return ops;
  }

  firstUnconsumedToReturn() {
    let op;
    this.reader.mark();

    for (let event of this._unconsumed()) {
      if (event.kind === 'return') {
        op = event.invocation.id;
        break;
      }
    }
    this.reader.reset();
    return op;
  }

  consumedConcurrentWith(op) {

  }

  unconsumedConcurrentWith(op) {
    let ops = new Set();
    this.reader.mark();

    let pending = new Set();

    for (let event of this._unconsumed()) {
      let id = event.invocation.id;

      if (id === op && event.kind === 'call') {
        pending.forEach(ops.add.bind(ops));
        pending.add(op);

      } else if (id === op)
        break;

      else if (pending.has(op))
        ops.add(id);

      else if (event.kind === 'call')
        pending.add(id);

      else
        pending.delete(id);
    }
    this.reader.reset();
    return [...ops];
  }

  * _unconsumed() {
    while (this.reader.hasMore()) {
      let event = this.reader.read();
      let id = event.invocation.id;
      if (this.consumed.has(id))
        continue;
      yield event;
    }
  }

  _ensureValue(op) {
    if (this.values.hasOwnProperty(op))
      return;

    this.reader.mark();

    while (this.reader.hasMore()) {
      let event = this.reader.read();
      let id = event.invocation.id;
      if (id === op && event.kind === 'return')
        this.values[op] = event.value;
    }

    this.reader.reset();
  }

  _ensureOverlapping(op) {
    if (this.overlapping.hasOwnProperty(op))
      return;

    let called = false;
    let pending = new Set(this.pending);
    let overlap = new Set();
    this.reader.mark();

    while (this.reader.hasMore()) {
      let event = this.reader.read();
      let id = event.invocation.id;

      if (id === op && event.kind === 'return')
        break;

      if (id === op) {
        pending.forEach(p => overlap.add(p));
        pending.add(id);
        continue;
      }

      if (event.kind === 'return')
        pending.delete(id);

      else if (pending.has(op))
        overlap.add(id);

      else
        pending.add(id);
    }
    this.overlapping[op] = [...overlap];
    this.reader.reset();
  }

  static initial(reader) {
    return new HistoryPosition({reader});
  }
}
