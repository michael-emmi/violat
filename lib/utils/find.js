const debug = require('debug')('violat:utils:find');
const cp = require('child_process');

function findFiles(path, pattern) {
  return cp.execSync(`find ${path} ${pattern}`)
    .toString().split('\n').filter(f => f);
}

module.exports = {
  findFiles
};
