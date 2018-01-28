const debug = require('debug')('history-position');
const assert = require('assert');

class HistoryPosition {
  constructor(args) {
    debug(`HistoryPosition(%o)`, args);
    this.reader = args.reader.dup();
    this.consumed = new Set(args.consumed || []);
    this.values = args.values || {};
  }

  getSchema() {
    return this.reader.getSchema();
  }

  getValue(op) {
    return this.values[op];
  }

  consume(op) {
    let that = new HistoryPosition(this);
    that.consumed.add(op);

    // advance the reader beyond the events of consumed operations
    while (that.reader.hasMore()) {
      that.reader.mark();
      let event = that.reader.read();
      let id = event.invocation.id;

      if (this.values[id] === undefined && event.value)
        this.values[id] = event.value;

      if (!that.consumed.has(id)) {
        that.reader.reset();
        break;
      }
    }
    return that;
  }

  isAtEnd() {
    return !this.reader.hasMore();
  }

  minimals() {
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

  firstToReturn() {
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

  concurrentWith(op) {
    let ops = new Set();
    this.reader.mark();

    let pending = new Set();

    for (let event of this._unconsumed()) {
      let id = event.invocation.id;

      if (id === op && event.kind === 'call')
        pending.forEach(ops.add.bind(ops));

      else if (id === op)
        break;

      else if (pending.has(op))
        ops.add(p);

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
      if (this.consumed.has(event.invocation.id))
        continue;
      yield event;
    }
  }

  static initial(reader) {
    return new HistoryPosition({reader});
  }
}

module.exports = {
  HistoryPosition
};
