var path = require('path');
var cp = require('child_process');
var fs = require('fs');

let jcsgenPath = path.resolve(path.dirname(__dirname), 'jcsgen');
let jcsgen = path.resolve(jcsgenPath, 'build/libs/jcsgen.jar');

function compile() {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(jcsgen))
      resolve();
    cp.exec(`gradle`, {cwd: jcsgenPath}, (rc, out, err) => {
      if (rc)
        reject(err);
      else
        resolve();
    });
  });
}

function annotate(schemaFile) {
  return new Promise(async (resolve, reject) => {
    await compile();
    let dstFile = schemaFile.replace('.json', '.annotated.json');
    cp.exec(`java -jar ${jcsgen} < ${schemaFile} > ${dstFile}`, (rc, out, err) => {
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
