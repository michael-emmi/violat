const assert = require('assert');
const child_process = require('child_process');
const path = require('path');
const util = require('util');

const exec = util.promisify(child_process.exec);
const command = 'bin/cli.js';
const root = path.resolve(__dirname, '..');
const resources = path.join(root, 'resources');
const specs = path.join(resources, 'specs');
const testSpecs = [
    'java/util/concurrent/ConcurrentHashMap.json'
];
const validator = path.join(root, 'lib', 'cli', 'validator.js')
const histories = path.join(root, 'lib', 'cli', 'histories.js')

describe('The violat CLI', function () {
  for (const spec of testSpecs) {
    it(`validation should work on ${spec}`, async () => {
      try {
        const { stdout, stderr } = await exec(`node ${validator} ${path.join(specs, spec)}`);

      } catch (error) {
        assert.fail(error);
      }
    });

    it(`history generation should work on ${spec}`, async () => {
      try {
        const { stdout, stderr } = await exec(`node ${histories} ${path.join(specs, spec)}`);

      } catch (error) {
        assert.fail(error);
      }
    });
  }
});
