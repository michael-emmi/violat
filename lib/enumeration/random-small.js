const debug = require('debug')('enum:random:small');
const trace = require('debug')('enum:random:small:trace');
const assert = require('assert');
const { Dice } = require('./dice.js');
const { Schema } = require('../schema.js');

class RandomEnumeration {
  constructor(args) {
    Object.assign(this, args);
    this.dice = new Dice();
    this.count = 0;

    assert.ok(this.spec);
    assert.ok(this.methods);
    assert.ok(this.invocations);
    assert.ok(this.values);
    assert.ok(this.methods.length <= this.invocations);
  }

  argument(type, n) {
    let value;

    if (isIntAssignable(type))
      value = this.dice.range(0, n);

    else if (Array.isArray(type) && type.length == 1 && isIntAssignable(type[0]))
      value = [this.dice.range(0,n), this.dice.range(0,n)];

    else if (type && Object.keys(type).length == 1 && isIntAssignable(type[Object.keys(type)[0]]))
      value =  this.dice.distinct(2, 0, n).reduce((m,k) => Object.assign({}, m, {[k]: this.dice.range(0,n)}), {});

    else
      throw new Error(`Unexpected type: ${type}`);

    trace(`generated value %s for type %s`, value, type);
    return value;
  }

  harness() {
    let trusted = this.spec.methods.filter(m => m.trusted);
    let untrusted = this.spec.methods.filter(m => this.methods.includes(m.name));
    let methods = Array.from(new Array(this.invocations-untrusted.length), _ => this.dice.any(trusted));

    while (untrusted.length > 0)
      methods.splice(this.dice.range(0, methods.length+1), 0, untrusted.shift());

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
          ? this.dice.range(1, invocations.length - this.sequences + idx + 2)
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

function isIntAssignable(type) {
  return type === "int"
      || type === "java.lang.Integer"
      || type === "java.lang.Object";
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
