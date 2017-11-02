const debug = require('debug')('enumeration');
const assert = require('assert');
const seedrandom = require('seedrandom');
const random = seedrandom('anticonstitutionnellement');
const { Schema } = require('./schema.js');

function range(min, limit) {
  return Math.floor(random() * (limit-min)) + min;
}

function coin() {
  return Math.floor(random() * 2) == 0;
}

function distinct(n, min, max) {
  assert.ok(max - min >= n, `cannot generate ${n} distinct values from ${min} to ${max}`);
  ary = [];
  while (ary.length < n) {
    let k = range(min, max);
    if (!ary.includes(k))
      ary.push(k);
  }
  return ary;
}

function any(ary) {
  return ary[range(0, ary.length)];
}

function isIntAssignable(type) {
  return type === "int"
      || type === "java.lang.Integer"
      || type === "java.lang.Object";
}

function argument(type, n) {
  let value;

  if (isIntAssignable(type))
    value = range(0, n);

  else if (Array.isArray(type) && type.length == 1 && isIntAssignable(type[0]))
    value = [range(0,n), range(0,n)];

  else if (type && Object.keys(type).length == 1 && isIntAssignable(type[Object.keys(type)[0]]))
    value =  distinct(2, 0, n).reduce((m,k) => Object.assign({}, m, {[k]: range(0,n)}), {});

  else
    throw new Error(`Unexpected type: ${type}`);

  debug(`generated value ${JSON.stringify(value)} for type ${JSON.stringify(type)}`);

  return value;
}

function harness(args) {
  assert.ok(args.methods.length <= args.invocations, "more methods than invocations");
  let trusted = args.spec.methods.filter(m => m.trusted);
  let untrusted = args.spec.methods.filter(m => args.methods.includes(m.name));
  let methods = Array.from(new Array(args.invocations-untrusted.length), _ => any(trusted));

  while (untrusted.length > 0)
    methods.splice(range(0, methods.length+1), 0, untrusted.shift());

  let invocations = methods.map(method => ({
    method: {
      name: method.name,
      parameters: method.parameters
    },
    arguments: method.parameters.map(p => argument(p.type, args.values)),
    void: method.void,
    atomic: !!method.trusted
  }));

  return new Schema({
    class: args.spec.class,
    parameters: [],
    sequences: Array.from(new Array(args.sequences), (_,idx) => ({
      index: idx,
      invocations: invocations.splice(0,
        (idx < args.sequences - 1)
        ? range(1, invocations.length - args.sequences + idx + 2)
        : invocations.length)
    })),
    order: []
  });
}

function* enumerate(args) {
  let count = 0;
  while (true) {
    let h = Object.assign({id: count++}, harness(args));
    debug(`generated harness:`);
    debug(h);
    yield h;
  }
}

exports.generator = enumerate;

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
