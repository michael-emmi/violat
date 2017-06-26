const debug = require('debug')('decorate');

function escape(outcome) {
  return outcome.replace(/([\[\]\{\}])/g, '\\\\$1');
}

function addOutcome(harnessCode, outcome) {
  return harnessCode.replace(/^(?=@State)/m,
    `@Outcome(id = "${escape(outcome)}", expect = Expect.ACCEPTABLE_INTERESTING)\n`
  );
}

module.exports = function(violation, data) {
  let header = Object.assign({},
    (({sequences, invocations, values, method}) => ({sequences, invocations, values, method}))(data),
    (({numExecutions, forbiddenResults}) => ({numExecutions, forbiddenResults}))(violation)
  );

  return JSON.stringify(header, null, 2).replace(/^/gm,'// ')
  + '\n'
  + violation.forbiddenResults.reduce((c,r) =>
    addOutcome(c, r.outcome),
    violation.harnessCode);
}
