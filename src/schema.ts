import * as assert from 'assert';
import * as Debug from 'debug';
const debug = Debug('schema');

import { PartialOrder } from './partial-order';
import { Method, Parameter, Spec } from './spec/spec';

export class Argument {
  static toString(arg) {
    let entries = Object.entries(arg);
    return Array.isArray(arg)
      ? `[${arg.map(Argument.toString).join(',')}]`
      : entries.length
      ? `[${entries.map(([k,v]) => `${k}=${v}`).join(',')}]`
      : arg.toString();
  }
}

export class Invocation {
  id: number;
  method: Method;
  arguments: Argument[];

  constructor(that) {
    Object.assign(this, that);
  }

  static fromJson(json) {
    return new Invocation(JSON.parse(json));
  }

  toString() {
    let name = this.method && this.method.name || this.id || '?';
    let args = this.arguments ? this.arguments.map(Argument.toString).join(',') : '...';
    return `${name}(${args})`;
  }

}

export interface Sequence {
  id: number;
  invocations: Invocation[]
}

export interface SchemaParameters {
  id?: number;
  class: string;
  parameters: Parameter[];
  arguments: Argument[];
  sequences: Sequence[];
  order: [number,number][];
}

export class Schema {
  id: number;
  class: string;
  parameters: Parameter[];
  arguments: Argument[];
  sequences: Sequence[];
  order: [number,number][];

  // TODO fix this hackery
  outcomes: any[];

  constructor(that: SchemaParameters) {
    Object.assign(this, that);
    for (let seq of this.sequences || [])
      seq.invocations = seq.invocations.map(i => new Invocation(i));
  }

  static fromJson(json: string) {
    return new Schema(JSON.parse(json));
  }

  static fromString(string: string, spec: Spec, id = 0) {
    debug(`parsing schema: %s`, string);
    let json = string
      .replace(/\{([^}]*)\}/g, '{ "invocations": [ $1 ] }')
      .replace(/;|(\|\|)/g, ',')
      .replace(/(\w+)\(([^)]*)\)/g, '{ "method": { "name": "$1" }, "arguments": [ $2 ] }');
    let obj = JSON.parse(`{ "class": "${spec.class}", "parameters": [], "sequences": [ ${json} ], "order": [] }`) as SchemaParameters;
    obj.id = id;
    let ids = { seq: 0, inv: 0 };
    for (let seq of obj.sequences) {
      seq.id = ids.seq++;
      for (let inv of seq.invocations) {
        inv.id = ids.inv++;
        let method = spec.methods.find(m => m.name === inv.method.name);
        if (method === undefined) {
          throw Error(`Method ${inv.method.name} not found for spec ${spec.class}`);
        }
        Object.assign(inv.method, method);
      }
    }
    debug(obj);
    let schema = new Schema(obj);
    debug(`fromString(%s) = %s`, string, schema);
    return schema;
  }

  toString() {
    assert.equal(this.order.length, 0);
    return `${this.sequences.map(s => `{ ${s.invocations.join('; ')} }`).join(' || ')}`;
  }

  indexInvocations() {
    let count = 0;
    for (let sequence of this.sequences) {
      for (let invocation of sequence.invocations) {
        invocation.id = count++;
      }
    }
  }

  getProgramOrder() {
    let order = new PartialOrder<Invocation>();
    for (let sequence of this.sequences) {
      let predecessor;
      for (let invocation of sequence.invocations) {
        order.add(invocation);
        if (predecessor)
          order.sequence(predecessor, invocation);
        predecessor = invocation;
      }
    }

    for (let [i1,i2] of this.order) {
      let s1 = this.sequences.find(s => s.id === i1) as Sequence;
      let s2 = this.sequences.find(s => s.id === i2) as Sequence;
      assert.ok(s1 && s2);
      order.sequence(
        s1.invocations[s1.invocations.length-1],
        s2.invocations[0]);
    }

    return order;
  }
}
