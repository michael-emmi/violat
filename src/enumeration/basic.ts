import * as assert from 'assert';
import * as Debug from 'debug';
const debug = Debug('enum:basic');

import { Schema } from '../schema';

function compose(g1, g2) {
  return function*(x) {
    for (let y of g1(x))
      for (let z of g2(y))
        yield z;
  }
}

function select(path) {
  function match(selector) {
    return x => selector === '*' ? true : selector === x;
  }

  function m(prefix, x, selectors, selection) {
    var rest = selectors.slice(1,selectors.length);
    for (let i of Object.keys(x).filter(match(selectors[0]))) {
      var curr = prefix === '' ? i : (prefix + '.' + i)
      if (rest.length > 0)
        m(curr, x[i], rest, selection);
      else
        selection.push({path: curr, item: x[i]});
    }
  }
  return x => {
    let selection = []
    m('', x, path.split("."), selection);
    return selection;
  };
}

function map(path, f) {
  function match(selector) {
    return x => selector === '*' ? true : selector === x;
  }
  function m(x, selectors) {
    var rest = selectors.slice(1,selectors.length);
    var y = {}
    for (let i of Object.keys(x).filter(match(selectors[0])))
      y[i] = selectors.length > 1 ? m(x[i],rest) : f(x[i])
    var z = Object.assign({}, x, y);
    return Array.isArray(x) ? Object.values(z) : z;
  }

  return x => m(x, path.split("."));
}

function mapgen(path, f) {
  return function*(x) { yield map(path, f)(x); };
}

function filter(p) {
  return function*(schema) {
    if (p(schema))
      yield schema;
  };
}

function harness() {
  return new Schema({
    class: null,
    parameters: [],
    arguments: [],
    sequences: null,
    order: null
  });
}

function sequence(index) {
  return {
    id: index,
    invocations: null
  };
}

function invocation(spec?) {
  return spec
    ? { method: spec, arguments: spec.parameters, atomic: !!spec.trusted }
    : { method: null, arguments: null, atomic: null }
}

function seeds() {
  return function*() {
    yield harness();
  }
}

function placeSequences(numSequences) {
  return mapgen('sequences', _ =>
    Array.apply(null, Array(numSequences)).map((_,i) => sequence(i))
  )
}

function placeOrders() {
  return function*(schema) {
    switch(schema.sequences.length) {
      case 2:
        yield map('order', _ => [])(schema)
        break

      case 3:
        yield map('order', _ => [])(schema)
        yield map('order', _ => [[0,1],[0,2]])(schema)
        yield map('order', _ => [[0,2],[1,2]])(schema)
        yield map('order', _ => [[0,1],[1,2]])(schema)
        break

      default:
        throw new Error("Unexpected size")
    }
  }
}

function placeOneInvocationPerSequence() {
  return mapgen('sequences.*.invocations', _ => [invocation()]);
}

function placeOneInvocation() {
  return function*(schema) {
    for (var i in schema.sequences)
      yield map(`sequences.${i}.invocations`, xs => [...xs, invocation()])(schema)
  }
}

function placeInvocations(numInvocations) {
  return function*(schema) {

    var numExtras = numInvocations - schema.sequences.length;
    if (numExtras < 0)
      return;

    var generator =
      Array.apply(null, Array(numExtras))
      .map(placeOneInvocation)
      .reduce(compose, placeOneInvocationPerSequence());

    for (let s of generator(schema))
      yield s;
  }
}

function placeClass(spec) {
  return mapgen('class', _ => spec.class);
}

function placeConstructor(spec, values) {
  return function*(schema) {
    if (spec.parameters) {
        let s = map('parameters', _ => spec.parameters)(schema);
      if (spec.default_parameters) {
        yield map('arguments', _ => spec.default_parameters)(s);
      } else {
        throw new Error("TODO: generate parameters");
      }
    } else {
      yield schema;
    }
  };
}

function placeOneMethod(method) {
  return function*(schema) {
    var paths = select('sequences.*.invocations.*.method')(schema)
      .filter(x => x.item == null)
      .map(x => x.path);

    for (var path of paths)
      yield map(path, _ => method)(schema);
  }
}

function placeOneOfEachMethod(methods) {
  return methods.map(placeOneMethod).reduce(compose);
}

function combine(slots, choices) {
  var result = [[]];
  for (var slot of slots) {
    let partial = result;
    result = [];
    for (var part of partial) {
      for (let choice of choices(slot)) {
        result.push([... part, [slot, choice]])
      }
    }
  }
  return result;
}

function placeRemainingMethods(spec) {
  return function*(schema) {
    var paths = select('sequences.*.invocations.*.method')(schema)
      .filter(x => x.item == null)
      .map(x => x.path);

    var methods = spec.methods.filter(m => m.trusted === true).map(m => m.name);

    for (var assignment of combine(paths, _ => methods))
      yield assignment.reduce((acc,ass) => map(ass[0],_ => ass[1])(acc), schema)
  }
}

function placeArgumentTypes(spec) {
  return mapgen('sequences.*.invocations.*', i =>
    invocation(spec.methods.find(m => m.name === i.method))
  );
}

function flatten(xs) {
  return xs.reduce((ys,x) => ys.concat(Array.isArray(x) ? flatten(x) : x), []);
}

function crossProduct(xs, ys) {
  return xs.map(x => ys.map(y => [x,y])).reduce((zs,xs) => zs.concat(xs),[]);
}

function isIntAssignable(type) {
  return type === "int"
      || type === "java.lang.Integer"
      || type === "java.lang.Object";
}

function valuesOf(type, numValues) {
  let values = Array.from('x'.repeat(numValues)).map((_,i) => i);

  if (isIntAssignable(type))
    undefined;

  else if (Array.isArray(type) && type.length == 1 && isIntAssignable(type[0]))
    values = crossProduct(values, values);

  else if (type && Object.keys(type).length == 1 && isIntAssignable(type[Object.keys(type)[0]]))
    values = crossProduct(values, values)
      .filter(([k1,k2]) => k1 != k2)
      .map(ks => combine(ks, _ => values))
      .reduce((x,y) => x.concat(y), [])
      .map(v => v.reduce((d,m) => Object.assign({},d,{[m[0]]:m[1]}),{}));

  else
    throw new Error(`Unexpected type: ${type}`);


  debug(`generated values ${JSON.stringify(values)} for type ${JSON.stringify(type)}`);
  return values;
}

function placeArgumentValues(numValues) {
  return function*(schema) {
    var args = select('sequences.*.invocations.*.arguments.*')(schema);

    for (var assignment of combine(args, x => valuesOf(x.item.type, numValues)))
      yield assignment.reduce((acc,ass) => map(ass[0].path, _ => ass[1])(acc), schema)
  }
}

function rejectAllReadOnly(spec) {
  let mutators = spec.methods.filter(m => !m.readonly).map(m => m.name);
  return filter(schema => {
    return select('sequences.*.invocations.*.method')(schema)
      .map(i => i.item)
      .some(m => mutators.includes(m));
  });
}

function rejectUntrustedAgainstReadonly(spec) {

  // TODO except for non-parallel sequences...

  let mutators = spec.methods.filter(m => m.readonly === false).map(m => m.name);
  let untrusted = spec.methods.filter(m => m.trusted === false).map(m => m.name);
  return filter(schema => {
    let seqs = select('sequences.*')(schema).map(s => s.item);
    return seqs.every(seq => seq.invocations.some(i => {
      return mutators.includes(i.method) || untrusted.includes(i.method);
    }))
  });
}

function tagWithIdentifier() {
  let id = 0;
  return function*(schema) {
    let tagged = Object.assign({id: id++}, schema);
    debug(`generated harness:`);
    debug(tagged);
    yield new Schema(tagged);
  };
}

export function generator(args) {
  return [
    seeds(),
    placeSequences(args.sequences),
    placeOrders(),
    placeInvocations(args.invocations),
    placeClass(args.spec),
    placeConstructor(args.spec, args.values),
    placeOneOfEachMethod(args.methods),
    placeRemainingMethods(args.spec),
    rejectAllReadOnly(args.spec),
    rejectUntrustedAgainstReadonly(args.spec),
    placeArgumentTypes(args.spec),
    placeArgumentValues(args.values),
    tagWithIdentifier(),
  ].reduce(compose);
}
