const fs = require('fs');
const config = require('../../lib/config.js');
const checker = require('../../lib/index.js');

const experiments = require('./experiment-list-SkipListMap.js');

async function run() {
  console.log(`---`);
  console.log(`Running ${experiments.name}`);

  for (let experiment of experiments.list) {
    console.log(`---`);
    console.log(`running experiment: ${experiment.name}`);
    console.log(`---`);
    let args = experiment.parameters;

    let results = await checker.testMethod(Object.assign({},
      args,
      {spec: JSON.parse(fs.readFileSync(args.spec))}
    ));

    for (let result of results) {
      if (result.outcomes.every(x => x.expectation == 'ACCEPTABLE' || x.count < 1))
        continue;

      console.log(`Violation/weakness discovered in the following harness.`);
      console.log(`---`);
      console.log(result.harness);
      console.log(`---`);
      let total = result.outcomes.reduce((sum,x) => sum + x.count, 0);
      for (let outcome of result.outcomes) {
        if (outcome.count < 1)
          continue;
        else if (outcome.expectation == 'FORBIDDEN')
          console.log(`${outcome.count} of ${total} executions gave violating outcome: ${outcome.result}`);
        else if (outcome.expectation == 'ACCEPTABLE_INTERESTING')
          console.log(`${outcome.count} of ${total} executions gave weak(${outcome.description}) outcome: ${outcome.result}`);
      }
      console.log(`---`);
    }
  }

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
