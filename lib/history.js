const assert = require('assert');
const debug = require('debug')('history-encoding');

const { Invocation, Schema } = require('./schema.js');

class Event {
  constructor(that) {
    Object.assign(this, that);
  }

  static fromJson(string) {
    return new Event(JSON.parse(string));
  }

  toString() {
    return `${this.kind}:${this.sid} ${this.kind === 'call' ? this.invocation : this.value}`;
  }
}

class Trace {
  constructor(args) {
    this.schema = args.schema;
    this.events = [...args.events];
  }

  static fromJson(string) {
    let trace = new Trace(JSON.parse(string));
    return Object.assign(trace, {
      schema: new Schema(trace.schema),
      events: trace.events.map(e => {
        let event = new Event(e);
        return Object.assign(event, {
          invocation: new Invocation(event.invocation)
        });
      })
    });
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
