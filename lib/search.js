const debug = require('debug')('search');
const assert = require('assert');


function subsets([x, ...xs]) {
  return x ? [].concat(...subsets(xs).map(ys => [ys, [x, ...ys]])) : [[]];
}

function linearizations(xs) {
  return xs.length ? [].concat(...xs.map(x => f(xs.filter(y => y !== x)).map(ys => [x, ...ys]))) : [[]];
}

class HistoryReader {
  constructor(json) {
    this.json = json;
    this.length = events().length;
    this.position = 0;
    this.mark = 0;
  }

  events() {
    return this.json.events;
  }

  hasMore() {
    return this.position < this.length;
  }

  read() {
    if (!this.hasMore())
      return undefined;

    return this.events()[this.position++];
  }

  mark() {
    this.mark = this.position;
  }

  reset() {
    this.position = this.mark;
  }

  static fromFile(filename) {
    return new Promise((resolve, reject) => {
      fs.readFile(filename, (err, data) => {
        if (err) {
          reject(`failed to read history: ${err}`);
        } else try {
          let json = JSON.parse(data);
          resolve(new HistoryReader(json));
        } catch (e) {
          reject(`failed to parse history: ${err}`);
        }
      });
    });
  }
}

class HistoryPosition {
  constructor(reader) {
    this.reader = reader;
    this.consumed = new Set();
  }

  consume(op) {
    this.consumed.add(op);

    // advance the reader beyond the events of consumed operations
    while (this.reader.hasMore()) {
      this.reader.mark();
      let event = this.reader.read();
      if (!this.consumed.has(event.invocation.id)) {
        this.reader.reset();
        break;
      }
    }
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
      if (this.consume.has(event.invocation.id))
        continue;
      yield event;
    }
  }
}

class Linearization {
  constructor() {

  }

  static empty() {
    assert.fail("TODO implement linearization");
  }

  append(op) {
    assert.fail("TODO implement linearization");
  }
}

class Visibility {
  constructor() {

  }

  static empty() {
    assert.fail("TODO implement visibility");
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
    let nextPos = pos.consume(op);
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
    for (let ops of subsets(pending)) {
      for (let seq of linearizations([...ops, op])) {
        let [nextPos, linExt] = seq.reduce(([p,l],op) => this._extend(p,l,op), [pos, lin]);
        if (this.validator.validate(linExt)) {
          yield [nextPos, linExt];
        }
      }
    }
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
    let lin = this.linRepr.empty();
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
