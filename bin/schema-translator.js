var path = require('path');
var cp = require('child_process');
var fs = require('fs');

function translate(schemaFile, dstPath) {
  var jcsgen = path.resolve(
    path.dirname(__dirname),
    'jcsgen/build/install/jcsgen/bin/jcsgen'
  );
  cp.execSync(`${jcsgen} --path ${dstPath} < ${schemaFile}`)
}

function annotate(schemaFile) {
  let dstFile = schemaFile.replace('.json', '.annotated.json');
  cp.execSync(`XXX < ${schemaFile} > ${dstFile}`);
  return dstFile;
}

function schemaToHarness(schema) {
  let parts = schema.class.split('.');
  let className = parts.pop();
  let packageName = parts.join('.');
  let numResults = schema.sequences.reduce((n,s) => n + s.invocations.filter(i => i.returns.length > 0).length, 0);
  let resultIdx = 0;

  function invocation(i) {
    return `obj.${i.method}(${i.arguments.join(',')})`;
  }

  function assignment(i) {
    return i.returns.length == 0
      ? `${invocation(i)};`
      : `result.r${++resultIdx} = ResultAdapter.get(${invocation(i)});`;
  }

  function sequence(s, n) {
    return `
    @Actor
    public actor${s.index+1}(StringResult${n} result) {
        ${s.invocations.map(assignment).join('\n        ')}
    }`;
  }

  function outcome(o) {
    let escaped = o.join(', ').replace(/([\[\]\{\}])/g, '\\$1')
    return `@Outcome(id = "${escaped}", expect = Expect.ACCEPTABLE)`;
  }

  return `package ${packageName};
import org.openjdk.jcstress.annotations.*;
import org.openjdk.jcstress.infra.results.*;
import java.util.Arrays;
import ${schema.class};

@JCStressTest
${schema.outcomes.map(outcome).join('\n')}
@State
public class ${className}Test${schema.id} {
    ${className} obj = new ${className}();
    ${schema.sequences.map(s => sequence(s,numResults)).join('\n')}
}
`;
}

exports.translate = translate;
exports.annotate = annotate;

if (require.main === module) {
  console.log(schemaToHarness(JSON.parse(fs.readFileSync(process.argv[2]))));
}
