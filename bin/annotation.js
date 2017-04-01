var path = require('path');
var cp = require('child_process');
var fs = require('fs');

function annotate(schemaFile) {
  let jcsgen = path.resolve(
    path.dirname(__dirname),
    'jcsgen/build/install/jcsgen/bin/jcsgen'
  );
  let dstFile = schemaFile.replace('.json', '.annotated.json');
  cp.execSync(`${jcsgen} < ${schemaFile} > ${dstFile}`);
  return dstFile;
}

exports.annotate = annotate;

if (require.main === module) {
  console.log(annotate(JSON.parse(fs.readFileSync(process.argv[2]))));
}
