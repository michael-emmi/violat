const table = require('console.table');

import { Schema } from '../schema';
import { Outcome } from '../outcome';

export class TestResult {
  schema: Schema;
  outcomes: Outcome[];

  constructor({ schema, outcomes }) {
    this.schema = schema;
    this.outcomes = outcomes;
  }

  getTable() {
    return this.outcomes.map(o => {
      let outcome = o.valueString();
      let consistent = o.consistency ? '√' : 'X';
      let frequency = Number(o.count).toLocaleString();
      return { outcome, 'OK': consistent, frequency };
    });
  }

  toString() {
    let tableStr = table.getTable(this.getTable());
    return `${this.schema}\n${tableStr}`;
  }
}
