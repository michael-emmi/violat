import * as assert from 'assert';
import * as Debug from 'debug';
const debug = Debug('execution');

import { Schema, Sequence, Invocation } from '../schema';
import { Visibility, VisibilityGenerator } from './visibility';
import { Executor } from '../java/executor';

export interface ExecutionInputs {
  schema: Schema;
  linearization: Invocation[];
}

class AtomicExecution {
  schema: Schema;
  linearization: Invocation[];

  constructor(inputs: ExecutionInputs) {
    const { schema, linearization } = inputs;
    this.schema = schema;
    this.linearization = linearization;
  }

  async execute(executor: Executor) {
    return await executor.execute(this.linearization, this.schema);
  }
}

export interface ExecutionGenerator {
  getExecutions(schema: Schema): AsyncIterable<AtomicExecution>;
}

export class AtomicExecutionGenerator implements ExecutionGenerator {
  async * getExecutions(schema: Schema) {
    for (let linearization of schema.getProgramOrder().linearizations())
      yield new AtomicExecution({ schema, linearization });
  }
}

interface RelaxedExecutionInputs extends ExecutionInputs {
  visibility: Visibility;
}

class RelaxedExecution extends AtomicExecution {
  visibility: Visibility;

  constructor(inputs: RelaxedExecutionInputs) {
    const { schema, linearization, visibility } = inputs
    super({ schema, linearization });
    this.visibility = visibility;
  }

  async execute(executor) {
    let result = {};
    let prefix: Invocation[] = [];

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

export class RelaxedExecutionGenerator implements ExecutionGenerator {
  visibilities: VisibilityGenerator;

  constructor(semantics) {
    this.visibilities = new VisibilityGenerator();
  }

  async * getExecutions(schema: Schema) {
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
    let prefix: Invocation[] = [];
    let rest = [...this.linearization];

    while (true) {
      let idx = prefix.length;
      let inv = rest.shift()
      if (!inv)
        break;
      prefix.push(inv);

      while (this.visibility.visible(rest[0]).length == prefix.length) {
        let inv = rest.shift();
        if (!inv)
          break;
        prefix.push(inv);
      }

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
