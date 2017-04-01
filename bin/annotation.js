var path = require('path');
var cp = require('child_process');
var fs = require('fs');

let jcsgen = path.resolve(
  path.dirname(__dirname),
  'jcsgen/build/install/jcsgen/bin/jcsgen'
);

function annotate(schemaFile) {
  return new Promise((resolve, reject) => {
    let dstFile = schemaFile.replace('.json', '.annotated.json');
    cp.exec(`${jcsgen} < ${schemaFile} > ${dstFile}`, (rc, out, err) => {
      if (rc)
        reject(err);
      else
        resolve(dstFile);
    });
  });
}

exports.annotate = annotate;

if (require.main === module) {
  console.log(annotate(JSON.parse(fs.readFileSync(process.argv[2]))));
}
