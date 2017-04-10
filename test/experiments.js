var path = require('path');
var cp = require('child_process');
let config = require('../lib/config.js');
let checker = require('../lib/index.js');

async function run(specDir) {
  let specFiles = cp.execSync(`find ${specDir} -name "*.json"`).toString().split('\n');

  for (let specFile of specFiles) {
    console.log(`---`);
    console.log(`Checking specification: ${specFile}`);
    console.log(`---`);

    let result = await checker.testUntrustedMethods({
      spec: specFile
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
