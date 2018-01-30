const debug = require('debug')('enum:random');
const trace = require('debug')('enum:random:trace');
const assert = require('assert');
const seedrandom = require('seedrandom');
const { Schema } = require('../schema.js');

class RandomEnumeration {
  constructor(args) {
    Object.assign(this, args);
    this.random = seedrandom('anticonstitutionnellement');
    this.count = 0;

    assert.ok(this.spec);
    assert.ok(this.methods);
    assert.ok(this.invocations);
    assert.ok(this.values);
    assert.ok(this.methods.length <= this.invocations);
  }

  range(min, limit) {
    return Math.floor(this.random() * (limit-min)) + min;
  }

  coin() {
    return Math.floor(this.random() * 2) == 0;
  }

  distinct(n, min, max) {
    assert.ok(max - min >= n, `cannot generate ${n} distinct values from ${min} to ${max}`);
    ary = [];
    while (ary.length < n) {
      let k = this.range(min, max);
      if (!ary.includes(k))
        ary.push(k);
    }
    return ary;
  }

  any(ary) {
    return ary[this.range(0, ary.length)];
  }

  static isIntAssignable(type) {
    return type === "int"
        || type === "java.lang.Integer"
        || type === "java.lang.Object";
  }

  argument(type, n) {
    let value;

    if (RandomEnumeration.isIntAssignable(type))
      value = this.range(0, n);

    else if (Array.isArray(type) && type.length == 1 && RandomEnumeration.isIntAssignable(type[0]))
      value = [this.range(0,n), this.range(0,n)];

    else if (type && Object.keys(type).length == 1 && RandomEnumeration.isIntAssignable(type[Object.keys(type)[0]]))
      value =  this.distinct(2, 0, n).reduce((m,k) => Object.assign({}, m, {[k]: this.range(0,n)}), {});

    else
      throw new Error(`Unexpected type: ${type}`);

    trace(`generated value %s for type %s`, value, type);
    return value;
  }

  harness() {
    let trusted = this.spec.methods.filter(m => m.trusted);
    let untrusted = this.spec.methods.filter(m => this.methods.includes(m.name));
    let methods = Array.from(new Array(this.invocations-untrusted.length), _ => this.any(trusted));

    while (untrusted.length > 0)
      methods.splice(this.range(0, methods.length+1), 0, untrusted.shift());

    let invocations = methods.map(method => ({
      method: method,
      arguments: method.parameters.map(p => this.argument(p.type, this.values)),
      atomic: !!method.trusted
    }));

    let invIds = 0;

    return new Schema({
      id: this.count++,
      class: this.spec.class,
      parameters: this.spec.parameters || [],
      arguments: this.spec.default_parameters || [],
      sequences: Array.from(new Array(this.sequences), (_,idx) => ({
        index: idx,
        invocations: invocations.splice(0,
          (idx < this.sequences - 1)
          ? this.range(1, invocations.length - this.sequences + idx + 2)
          : invocations.length).map(i => Object.assign(i, {id: invIds++}))
      })),
      order: []
    });
  }

  static * enumerate(args) {
    debug(`generating schemas for class %s`, args.spec.class);
    debug(`methods: { %s }`, args.methods.join(', '));
    debug(`invocations: ${args.invocations}`);
    debug(`sequences: ${args.sequences}`);
    debug(`values: ${args.values}`);

    let enumeration = new RandomEnumeration(args);

    while (true) {
      let schema = enumeration.harness();
      debug(`generated schema: %s`, schema);
      yield schema;
    }
  }
}


exports.generator = RandomEnumeration.enumerate;

if (require.main === module) {
  const fs = require('fs');
  const path = require('path');
  const meow = require('meow');

  let cli = meow(`
    Usage
      $ node random-enumeration.js --spec <spec-file.json> --method <method-name>

    Options
      --spec <spec-file.json>     Java class specification file (required).
      --method <method-name>      Name of a method to test (required).
      --values N                  Number of distinct argument values.
      --sequences N               Number of concurrent invocation sequences.
      --invocations N             Total nuber of invocations.
      --count N                   Limit to N harnesses.

    Examples
      $ node random-enumeration.js \\
        --spec resources/specs/java/util/concurrent/ConcurrentSkipListMap.json \\
        --method clear \\
        --sequences 2 \\
        --invocations 4
        --count 1
  `, {
    default: {
      values: 2,
      sequences: 2,
      invocations: 4,
      count: 1
    }
  });

  if (!cli.flags.spec || !cli.flags.method)
    cli.showHelp();

  (async () => {
    let count = 0;
    for (let schema of enumerate(Object.assign({}, cli.flags, {spec: JSON.parse(fs.readFileSync(cli.flags.spec, 'utf8'))}))) {
      if (++count > cli.flags.count)
        break;

      console.log(JSON.stringify(schema,null,2));
      console.log(`---`);
    }
  })();
}
