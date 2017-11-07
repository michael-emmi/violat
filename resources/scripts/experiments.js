const debug = require('debug')('experiments');
const fs = require('fs');
const config = require('../../lib/config.js');
const checker = require('../../lib/index.js');

const experiments = require('./experiment-list.js');

function printTime(hrtime) {
  return `${(0.0 + hrtime[0] + hrtime[1] / 1e9).toFixed(3)}s`;
}

async function run(...patterns) {
  console.log(`Running ${experiments.name}`);
  console.log(`---`);

  let pattern = new RegExp(patterns.join('|'));

  for (let experiment of experiments.list) {
    if (!experiment.name.match(pattern)) {
      console.log(`skipping experiment: ${experiment.name}`);
      console.log(`---`);
      continue;
    }

    console.log(`running experiment: ${experiment.name}`);
    console.log(`---`);
    let args = experiment.parameters;

    args.spec = JSON.parse(fs.readFileSync(args.spec));

    let startTime = process.hrtime();
    let firstTime;

    args.onResult = function(result) {
      if (!firstTime) {
        firstTime = process.hrtime(startTime);
        console.log(`first result after ${printTime(firstTime)}`);
        console.log(`---`);
      }

      console.log(`Violation or weakness discovered over ${result.total} executions of the following schema.`);
      console.log(`---`);
      console.log(`${result.schema}`);
      console.log(`---`);
      for (let outcome of result.outcomes) {
        if (outcome.count > 0 && !outcome.isAtomic()) {
          console.log(`${outcome}`);
          console.log(`---`);
        }
      }
    };

    let results = await checker.testMethod(args);
    let elapsedTime = process.hrtime(startTime);
    console.log(`experiment ended after ${printTime(elapsedTime)}`);
    console.log(`---`);
  }

  console.log(`Experiments completed`);
}

(async () => {
  try {
    await run(...process.argv.slice(2));
  } catch (e) {
    console.log(`caught exception`);
    console.log(e.stack);
  }
})();
