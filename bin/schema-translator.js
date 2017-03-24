var path = require('path');
var cp = require('child_process');

function translate(schemaFile, dstPath) {
  var jcsgen = path.resolve(
    path.dirname(__dirname),
    'jcsgen/build/install/jcsgen/bin/jcsgen'
  );
  cp.execSync(`${jcsgen} --path ${dstPath} < ${schemaFile}`)
}

exports.translate = translate;
