import * as assert from 'assert';
import * as Debug from 'debug';
const debug = Debug('decorate');

function escape(outcome) {
  return outcome.replace(/([\[\]\{\}])/g, '\\\\$1');
}

function addOutcome(harnessCode, outcome) {
  return harnessCode.replace(/^(?=@State)/m,
    `@Outcome(id = "${escape(outcome)}", expect = Expect.ACCEPTABLE_INTERESTING)\n`
  );
}

export function decorate(violation) {
  return JSON.stringify(violation, null, 2).replace(/^/gm,'// ')
  + '\n'
  + violation.outcomes.reduce((code,outcome) =>
      outcome.isIncosistent()
      ? addOutcome(code, outcome.result)
      : code,
      violation.harness);
}
