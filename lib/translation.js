var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var records = require('./records.js')('---\n');

var config = require('./config.js');

async function translate(schemaFile, id) {
  let dstFiles = [];
  let dstPath = path.join(config.outputPath, 'harnesses');
  for (let schema of await records.get(fs.createReadStream(schemaFile))) {
    let parts = schema.class.split('.');
    let className = `${parts.pop()}${id}Test${schema.id}`;
    let packagePath = parts.join('/');
    let dstFile = path.resolve(dstPath, packagePath, `${className}.java`);
    mkdirp.sync(path.dirname(dstFile));
    fs.writeFileSync(dstFile, schemaToHarness(schema, className));
    dstFiles.push({
      absolutePath: dstFile,
      relativePath: `${packagePath}/${className}.java`
    });
  }
  return dstFiles;
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

function addOutcome(harnessCode, outcome) {
  return harnessCode.replace(/^(?=@State)/m,
    `@Outcome(id = "${escape(outcome)}", expect = Expect.ACCEPTABLE_INTERESTING)\n`
  );
}

function schemaToHarness(schema, testName) {
  if (!isLegal(schema))
    throw new Error(`Unable to translate schema:\n${JSON.stringify(schema)}`);

  let parts = schema.class.split('.');
  let className = parts.pop();
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
    return `obj.${i.method}(${i.arguments.map(x => {
      return Array.isArray(x) ? `Arrays.asList(${x.join(', ')})` : x;
    }).join(',')})`;
  }

  return `package ${packageName};
import org.openjdk.jcstress.annotations.*;
import org.openjdk.jcstress.infra.results.*;
import java.util.Arrays;
import ${schema.class};

@JCStressTest
${schema.outcomes.map(outcome => {

    let filtered = outcome.filter((_,i) => resultIdxs.includes(i));
    let escaped = escape(filtered.join(', '));

    return `@Outcome(id = "${escaped}", expect = Expect.ACCEPTABLE)`;

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
            ${hasResult(s,i) ? `result.r${resultIdx} = ResultAdapter.get(e)` : ``};
        }`
        }).join('\n        ')}
    }`;
  }).join('\n    ')}
}
`;
}

exports.translate = translate;
exports.addOutcome = addOutcome;

if (require.main === module) {
  console.log(schemaToHarness(JSON.parse(fs.readFileSync(process.argv[2])), 'Test'));
}
