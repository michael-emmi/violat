const assert = require('assert');
const debug = require('debug')('history-encoding');


class Event {
  constructor(that) {
    Object.assign(this, that);
  }

  static fromJson(json) {
    return new Event(JSON.parse(json));
  }

  toString() {
    return `${this.kind}:${this.sid} ${this.kind === 'call' ? this.invocation : this.value}`;
  }
}

class Trace {
  constructor(schema, events) {
    this.schema = schema;
    this.events = [...events];
  }

  toString() {
    return this.events.join('; ');
  }
}

class History {
  constructor(schema, order) {
    this.schema = schema;
    this.order = order;
  }

  toString() {
    return this.order.toString();
  }
}

module.exports = {
  Event,
  Trace,
  History
};
