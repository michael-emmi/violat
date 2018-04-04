import * as assert from 'assert';
import * as Debug from 'debug';
const debug = Debug('history-encoding');

import { Invocation, Schema } from './schema';

export class Event {
  kind: string;
  sid: number;
  invocation: Invocation;
  value: any;

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

export class Trace {
  schema: Schema;
  events: Event[];

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

export class History {
  schema: Schema;
  order: {};

  constructor(schema, order) {
    this.schema = schema;
    this.order = order;
  }

  toString() {
    return this.order.toString();
  }
}
