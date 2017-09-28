const debug = require('debug')('annotation');

const path = require('path');
const cp = require('child_process');
const fs = require('fs');
const ncp = require('ncp');

const records = require('./records.js')('---\n');
const config = require('./config.js');

let jcsgenPath = path.resolve(config.resourcesPath, 'jcsgen');
let workPath = path.resolve(config.outputPath, 'jcsgen');
let jcsgen = path.resolve(workPath, 'build/libs/jcsgen.jar');

function compile() {
  return new Promise((resolve, reject) => {
    debug(`checking whether jcsgen needs compiling`);

    if (fs.existsSync(jcsgen)) {
      debug(`jcsgen has already been compiled`);
      resolve();

    } else {
      debug(`recompiling jcsgen`);
      ncp(jcsgenPath, workPath, err => {
        if (err) {
          debug(`unable to copy jcsgen: ${err}`);
          reject(err);
        } else {
          cp.exec(`gradle`, {cwd: workPath}, (rc, out, err) => {
            if (rc) {
              debug(`unable to build jcsgen: ${err}`);
              reject(err);
            } else {
              resolve();
            }
          });
        }
      });
    }
  });
}

module.exports = function(schemas) {
  return new Promise(async (resolve, reject) => {
    await compile();

    debug(`annotating ${schemas.length} harness schemas`);
    let proc = cp.spawn('java', ['-ea', '-jar', jcsgen]);
    records.put(schemas, proc.stdin);

    let annotated = await records.get(proc.stdout);
    debug(`annotated ${annotated.length} harness schemas`);
    resolve(annotated);
  });
}
