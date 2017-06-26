const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const config = require('../lib/config.js');
const checker = require('../lib/index.js');

async function run(specDir) {
  let specFiles = cp.execSync(`find ${specDir} -name "*.json"`).toString().split('\n');

  for (let specFile of specFiles) {
    console.log(`---`);
    console.log(`Checking specification: ${specFile}`);
    console.log(`---`);

    let result = await checker.testUntrustedMethods({
      specFile: specFile,
      spec: JSON.parse(fs.readFileSync(specFile))
    });

    console.log(`---`);
    console.log(`Checking completed for: ${specFile}`);
  }
}

(async () => {
  try {
    await run(path.join(config.resourcesPath, "specs"));
  } catch (e) {
    console.log(`caught exception`);
    console.log(e.stack);
  }
})();
