const debug = require('debug')('annotation');

var path = require('path');
var cp = require('child_process');
var fs = require('fs');

const records = require('./records.js')('---\n');

let jcsgenPath = path.resolve(path.dirname(__dirname), 'jcsgen');
let jcsgen = path.resolve(jcsgenPath, 'build/libs/jcsgen.jar');

function compile() {
  return new Promise((resolve, reject) => {
    debug(`checking whether jcsgen needs compiling`);

    if (fs.existsSync(jcsgen)) {
      debug(`jcsgen has already been compiled`);
      resolve();

    } else {
      debug(`recompiling jcsgen`);
      cp.exec(`gradle`, {cwd: jcsgenPath}, (rc, out, err) => {
        if (rc)
          reject(err);
        else
          resolve();
      });
    }
  });
}

module.exports = function(schemas) {
  return new Promise(async (resolve, reject) => {
    await compile();

    debug(`annotating ${schemas.length} harness schemas`);
    let proc = cp.spawn('java', ['-jar', jcsgen]);
    records.put(schemas, proc.stdin);

    let annotated = await records.get(proc.stdout);
    debug(`annotated ${annotated.length} harness schemas`);
    resolve(annotated);
  });
}
