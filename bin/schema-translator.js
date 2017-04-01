var path = require('path');
var cp = require('child_process');
var fs = require('fs');

var records = require('./records.js')('---\n');

async function translate(schemaFile, dstPath, id) {
  let annotated = annotate(schemaFile);
  for (let schema of await records.get(fs.createReadStream(annotated))) {
    let parts = schema.class.split('.');
    let className = `${parts.pop()}${id}Test${schema.id}`;
    let dstFile = path.resolve(dstPath, parts.join('/'), `${className}.java`);
    fs.writeFileSync(dstFile, schemaToHarness(schema, className));
  }
}

function annotate(schemaFile) {
  let jcsgen = path.resolve(
    path.dirname(__dirname),
    'jcsgen/build/install/jcsgen/bin/jcsgen'
  );
  let dstFile = schemaFile.replace('.json', '.annotated.json');
  cp.execSync(`${jcsgen} < ${schemaFile} > ${dstFile}`);
  return dstFile;
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

function numResults(schema) {
  let initial = getInitialSequence(schema);
  return schema.sequences
    .map(s => s.index == initial ? 0 : s.invocations.filter(i => !i.void).length)
    .reduce((x,y) => x + y, 0);
}

function schemaToHarness(schema, testName) {
  if (!isLegal(schema))
    throw new Error(`Unable to translate schema:\n${JSON.stringify(schema)}`);

  let parts = schema.class.split('.');
  let className = parts.pop();
  let packageName = parts.join('.');

  let initial = getInitialSequence(schema);
  let final = getFinalSequence(schema);

  let resultIdxs = schema.sequences
    .map(s => s.invocations)
    .reduce((x,y) => x.concat(y))
    .map((v,i) => [v,i])
    .filter(([v,i]) => !v.void)
    .map(([_,i]) => i);

  let resultType = `StringResult${numResults(schema)}`;

  let actorIdx = 0;
  let resultIdx = 0;

  function outcome(o) {
    let filtered = o.filter((_,i) => resultIdxs.includes(i));
    let escaped = filtered.join(', ').replace(/([\[\]\{\}])/g, '\\\\$1')
    return `@Outcome(id = "${escaped}", expect = Expect.ACCEPTABLE)`;
  }

  function sequence(s) {
    let signature;
    if (s.index == initial)
      signature = `public ${className}()`
    else if (s.index == final)
      signature = `@Arbiter\n    public void arbiter(${resultType} result)`
    else
      signature = `@Actor\n    public void actor${++actorIdx}(${resultType} result)`
    return `
    ${signature} {
        ${s.invocations.map(i => assignment(i,s)).join('\n        ')}
    }`;
  }

  function assignment(i, seq) {
    return i.void || seq.index == initial
      ? `${invocation(i)};`
      : `result.r${++resultIdx} = ResultAdapter.get(${invocation(i)});`;
  }

  function invocation(i) {
    return `obj.${i.method}(${i.arguments.map(argument).join(',')})`;
  }

  function argument(x) {
    return Array.isArray(x) ? `Arrays.asList(${x.join(', ')})` : x;
  }

  return `package ${packageName};
import org.openjdk.jcstress.annotations.*;
import org.openjdk.jcstress.infra.results.*;
import java.util.Arrays;
import ${schema.class};

@JCStressTest
${schema.outcomes.map(outcome).join('\n')}
@State
public class ${testName} {
    ${className} obj = new ${className}();
    ${schema.sequences.map(s => sequence(s)).join('\n    ')}
}
`;
}

exports.translate = translate;

if (require.main === module) {
  console.log(schemaToHarness(JSON.parse(fs.readFileSync(process.argv[2])), 'Test'));
}
