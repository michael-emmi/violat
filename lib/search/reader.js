const debug = require('debug')('history-reader');
const assert = require('assert');

const fs = require('fs');

const { Trace } = require('../history.js');

class HistoryReader {
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

module.exports = {
  HistoryReader
};
