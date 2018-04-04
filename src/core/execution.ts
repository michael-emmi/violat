import * as assert from 'assert';
import * as Debug from 'debug';
const debug = Debug('execution');

import { Schema, Sequence, Invocation } from '../schema';
import { Visibility, VisibilityGenerator } from './visibility';

class AtomicExecution {
  schema: Schema;
  linearization: Invocation[];

  constructor({ schema, linearization }) {
    this.schema = schema;
    this.linearization = linearization;
  }

  async execute(executor) {
    return await executor.execute(this.linearization, this.schema);
  }
}

export interface ExecutionGenerator {
  getExecutions(schema);
}

export class AtomicExecutionGenerator implements ExecutionGenerator {
  async * getExecutions(schema) {
    for (let linearization of schema.getProgramOrder().linearizations())
      yield new AtomicExecution({ schema, linearization });
  }
}

class RelaxedExecution extends AtomicExecution {
  visibility: Visibility;

  constructor({ schema, linearization, visibility }) {
    super({ schema, linearization });
    this.visibility = visibility;
  }

  async execute(executor) {
    let result = {};
    let prefix = [];

    for (let op of this.linearization) {
      let projection = prefix.filter(i => this.visibility.isVisible(op, i));
      projection.push(op);
      let response = await executor.execute(projection, this.schema);
      result[op.id] = response[op.id];
      prefix.push(op);
    }
    return result;
  }
}

export class RelaxedExecutionGenerator {
  visibilities: VisibilityGenerator;

  constructor(semantics) {
    this.visibilities = new VisibilityGenerator();
  }

  async * getExecutions(schema, visibilities) {
    for (let linearization of schema.getProgramOrder().linearizations())
      for await (let visibility of this.visibilities.getVisibilities({ schema, linearization }))
        yield new RelaxedExecution({ schema, linearization, visibility });
  }
}

class OptimizedRelaxedExecution extends RelaxedExecution {
  constructor(args) {
    super(args);
  }

  async execute(executor) {
    let result = {};
    let prefix = [];
    let rest = [...this.linearization];

    while (rest.length) {
      let idx = prefix.length;
      prefix.push(rest.shift());

      while (rest.length && this.visibility.visible(rest[0]).length == prefix.length)
        prefix.push(rest.shift());

      let last = prefix[prefix.length-1];
      let projection = prefix.filter(i => this.visibility.isVisible(last, i));
      projection.push(last);
      let response = await executor.execute(projection, this.schema);

      for (let inv of prefix.slice(idx))
        result[inv.id] = response[inv.id];
    }

    return result;
  }
}
