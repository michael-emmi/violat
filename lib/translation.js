const debug = require('debug')('translation');

module.exports = function(schemas, id) {
  debug(`translating ${schemas.length} schemas`);
  let translated = schemas.map(s =>
    schemaToHarness(s, `${s.class.split('.').pop()}${id}Test${s.id}`)
  );
  debug(`translated ${translated.length} schemas`);
  return translated;
}

function getInitialSequence(schema) {
  let minimals = schema.sequences.map(s => s.index)
    .filter(i => schema.order.every(([_,j]) => i != j));
  return minimals.length == 1 ? minimals[0] : undefined;
}

function getFinalSequence(schema) {
  let maximals = schema.sequences.map(s => s.index)
    .filter(i => schema.order.every(([j,_]) => i != j));
  return maximals.length == 1 ? maximals[0] : undefined;
}

function isLegal(schema) {
  let initial = getInitialSequence(schema);
  let final = getFinalSequence(schema);
  return schema.sequences.map(s => s.index).every(i => {
    let predecessors = schema.order.filter(([_,j]) => j == i).map(([j,_]) => j);
    let successors = schema.order.filter(([j,_]) => j == i).map(([_,j]) => j);
    return i == initial || i == final || (
      predecessors.filter(j => j != initial).length == 0
      && successors.filter(j => j != final).length == 0
    );
  });
}

function escape(outcome) {
  return outcome.replace(/([\[\]\{\}])/g, '\\\\$1');
}

function schemaToHarness(schema, testName) {
  debug(`translating schema:`);
  debug(schema);

  if (!isLegal(schema))
    throw new Error(`Unable to translate schema:\n${JSON.stringify(schema)}`);

  let parts = schema.class.split('.');
  let className = parts.pop();
  parts[0] = 'xxxx';
  let packageName = parts.join('.');

  let initial = getInitialSequence(schema);
  let final = getFinalSequence(schema);

  let hasResult = (seq, inv) => seq.index != initial && !inv.void;
  let numResults = schema.sequences
    .map(s => s.invocations.filter(i => hasResult(s,i)).length)
    .reduce((x,y) => x + y, 0);
  let resultType = `StringResult${numResults}`;
  let resultIdxs = schema.sequences
    .reduce((xs,s) => xs.concat(s.invocations.map(v => ({seq: s, inv: v}))), [])
    .map((x,i) => Object.assign({}, x, {idx: i}))
    .filter(x => hasResult(x.seq, x.inv))
    .map(x => x.idx);

  let actorIdx = 0;
  let resultIdx = 0;

  function invocation(i) {
    return `obj.${i.method.name}(${i.arguments.map(x => {
      if (Array.isArray(x))
        return `Arrays.asList(${x.join(', ')})`;
      else if (Object.keys(x).length > 0)
        return `Collections.unmodifiableMap(Stream.of(${Object.keys(x).map(k => `new AbstractMap.SimpleEntry<>(${k},${x[k]})`).join(', ')}).collect(Collectors.toMap(e -> e.getKey(), e -> e.getValue())))`;
      else
        return x;
    }).join(',')})`;
  }

  let translation = `package ${packageName};
import org.openjdk.jcstress.annotations.*;
import org.openjdk.jcstress.infra.results.*;
import java.util.Arrays;
import java.util.AbstractMap;
import java.util.Collections;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import ${schema.class};

@JCStressTest
${schema.outcomes.map(outcome => {

    let id = escape(
      outcome.values.filter((_,i) => resultIdxs.includes(i))
      .join(', '));

    let expect;
    let desc = outcome.description;

    switch (outcome.expected) {
      case true:
        expect = "Expect.ACCEPTABLE";
        break;
      case false:
        expect = "Expect.FORBIDDEN";
        break;
      default:
        expect = "Expect.ACCEPTABLE_INTERESTING";
    }

    return `@Outcome(id = "${id}", expect = ${expect}, desc = "${desc}")`;

}).join('\n')}
@State
public class ${testName} {
    ${className} obj = new ${className}(${schema.parameters.join(", ")});
    ${schema.sequences.map(s => {
      let signature;
      if (s.index == initial)
        signature = `public ${testName}()`
      else if (s.index == final)
        signature = `@Arbiter\n    public void arbiter(${resultType} result)`
      else
        signature = `@Actor\n    public void actor${++actorIdx}(${resultType} result)`
      return `
    ${signature} {
        ${s.invocations.map(i => {
          let v = invocation(i);
          return `try {
            ${hasResult(s,i) ? `result.r${++resultIdx} = ResultAdapter.get(${v})` : `${v}`};
        } catch (Exception e) {
            ${hasResult(s,i) ? `result.r${resultIdx} = ResultAdapter.get(e);` : ``}
        }`
        }).join('\n        ')}
    }`;
  }).join('\n    ')}
}
`;
  debug(`got translation:`);
  debug(translation);
  return translation;
}
