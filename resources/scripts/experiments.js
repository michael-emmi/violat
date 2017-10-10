const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const config = require('../../lib/config.js');
const checker = require('../../lib/index.js');

const experiments = require('./experiment-list.js');

async function run() {
  console.log(`---`);
  console.log(`Running ${experiments.name}`);

  for (let experiment of experiments.list) {
    console.log(`---`);
    console.log(`running experiment: ${experiment.name}`);
    console.log(`---`);
    let args = experiment.parameters;

    await checker.testMethod(Object.assign({},
      args,
      {spec: JSON.parse(fs.readFileSync(args.spec))}
    ));
  }

  console.log(`---`);
  console.log(`Experiments completed`);
}

(async () => {
  try {
    await run();
  } catch (e) {
    console.log(`caught exception`);
    console.log(e.stack);
  }
})();
