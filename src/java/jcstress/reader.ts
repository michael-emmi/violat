const debug = require('debug')('jcstress:reader');
const assert = require('assert');

class JCStressOutputReader {
  constructor(generator) {
    this.generator = generator;
  }

  async * getResults() {
    const STATUS_LINE = /\[(OK|FAILED)\]\s+([A-Za-z_$.]+([0-9]+))\s*$/;
    const RESULT_LINE = /^\s+(.*)\s+([0-9,]+)\s+([A-Z_]+)\s+(.*)\s*$/;
    const FINISH_LINE = /RUN (COMPLETE)\./;

    let result;
    let complete;

    for await (let line of this.generator) {

      // NOTE nobody will catch promise rejection if we break out of this loop
      // NOTE for this reason we continue to consume all generated lines

      if (complete)
        continue;

      let [ statusS, name, idxS ] = this.match(line, STATUS_LINE);

      if (statusS) {
        assert.ok(!result);
        let index = parseInt(idxS);
        let status = statusS === 'OK';
        result = { name, index, status, outcomes: [] };
        continue;
      }

      let [ value, countS, expectation, description ] = this.match(line, RESULT_LINE);

      if (value) {
        assert.ok(result);
        let count = parseInt(countS.replace(/,/g,''));
        result.outcomes.push({ value, count, expectation, description });
        continue;
      }

      if (result && !line.trim()) {
        let total = result.outcomes.reduce((a,o) => a + o.count, 0);
        yield { total, ... result };
        result = undefined;
        continue;
      }

      [ complete ] = this.match(line, FINISH_LINE);

      if (complete) {
        assert.ok(!result);
      }
    }
  }

  match(line, pattern) {
    return (line.match(pattern) || []).slice(1).map(s => s.trim());
  }
}

module.exports = {
  JCStressOutputReader
};
