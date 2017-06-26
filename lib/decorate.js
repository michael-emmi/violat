const debug = require('debug')('decorate');

function escape(outcome) {
  return outcome.replace(/([\[\]\{\}])/g, '\\\\$1');
}

function addOutcome(harnessCode, outcome) {
  return harnessCode.replace(/^(?=@State)/m,
    `@Outcome(id = "${escape(outcome)}", expect = Expect.ACCEPTABLE_INTERESTING)\n`
  );
}

module.exports = function(violation) {
  return JSON.stringify(violation, null, 2).replace(/^/gm,'// ')
  + '\n'
  + violation.forbiddenResults.reduce((c,r) =>
    addOutcome(c, r.outcome),
    violation.harnessCode);
}
