import * as assert from 'assert';
import * as Debug from 'debug';
const debug = Debug('history-reader');

const fs = require('fs');

import { Trace } from '../history';

export class HistoryReader {
  history: Trace;
  length: number;
  position: number;
  marked: number;

  constructor(args) {
    this.history = args.history;
    this.length = args.length || this.getEvents().length;
    this.position = args.position || 0;
    this.marked = args.marked || 0;
  }

  dup() {
    return new HistoryReader(this);
  }

  getEvents() {
    return this.history.events;
  }

  getSchema() {
    return this.history.schema;
  }

  hasMore() {
    return this.position < this.length;
  }

  read() {
    if (!this.hasMore())
      return undefined;

    return this.getEvents()[this.position++];
  }

  mark() {
    this.marked = this.position;
  }

  reset() {
    this.position = this.marked;
  }

  static fromFile(filename) {
    return new Promise((resolve, reject) => {
      fs.readFile(filename, (err, data) => {
        if (err) {
          reject(`failed to read trace: ${err}`);
        } else try {
          let history = Trace.fromJson(data);
          debug(`read history: %s`, history);
          resolve(new HistoryReader({history}));
        } catch (e) {
          reject(`failed to parse trace: ${err}`);
        }
      });
    });
  }
}
