const assert = require('assert');

var path = require('path');
var cp = require('child_process');
var fs = require('fs');
var mkdirp = require('mkdirp');
var es = require('event-stream');
var ncp = require('ncp');

var config = require("./config.js");
const utils = require("./utils.js");
const debug = require('debug')('testing');
const trace = require('debug')('testing:trace');
const detail = require('debug')('testing:detail');
const translate = require('./translation.js');
const { JCStressCodeGenerator, JCStressHistoryRecordingCodeGenerator } = require('./translation.js');
const Outcome = require('./outcome.js');
const PartialOrder = require('./partial-order.js');
const HistoryEncoding = require('./history-encoding.js');

function testsPath(jcstressPath) {
  return path.resolve(jcstressPath, 'src/main/java');
}

function jarFile(jcstressPath) {
  return path.resolve(jcstressPath, 'target/jcstress.jar');
}

function needsCompile(jcstressPath) {
  let jar = jarFile(jcstressPath);
  let sources = utils.findFiles(testsPath(jcstressPath), `-name "*.java"`);
  return utils.targetsOutdated([jar], sources);
}

function compile(jcstressPath) {
  return new Promise((resolve, reject) => {
    cp.exec(`mvn clean install`, {cwd: jcstressPath}, (rc, stdout, stderr) => {
      if (rc) {
        let message = stdout.split('\n')
          .filter(l => l.match(/ERROR/))
          .slice(0,5)
          .join('\n');
        reject(message || stderr);
      } else
        resolve();
    });
  });
}

function runJar(jcstressPath, ...extras) {
  const ARGS = [
    '-Djava.awt.headless=true',
    '-jar', jarFile(jcstressPath),
    '-v',
    '-f', '1',
    '-iters', '1',
    '-jvmArgs', '-server',
    ... extras
  ];
  debug(`running tests: java ${ARGS.join(' ')}`);
  return cp.spawn('java', ARGS, {cwd: jcstressPath});
}

function parseResult(result) {
  let sanitized = result
    .replace(/\\/g,'')
    .replace(/\s*/g,'')
    .replace(/(\w*Exception)/g,'"$1"')
    .replace(/([\{\[](\w+=\w+,?)*[\}\]])/g, '"$1"');
  let json = `[${sanitized}]`;
  let ary = JSON.parse(json).map(v => Array.isArray(v) ? `[${v}]` : `${v}`);
  trace(`parseResult('%s') = [%s]`, result, ary.join(';'));
  return ary;
}

function matchResult(observed, predicted, schema) {
  let eq = true;

  OUTER: for (let seq of schema.sequences) {
    for (let inv of seq.invocations) {
      let idx = inv.index;
      let pos = inv.resultPosition;
      if (pos != null && observed[pos] !== predicted[idx]) {
        eq = false;
        break OUTER;
      }
    }
  }
  trace(`matchResult([%s], [%s], %s) = %s`,
    observed.join(';'), predicted.join(';'), schema, eq);
  return eq;
}

function createOutcome(observed, schema) {
  let map = {};
  for (let seq of schema.sequences) {
    for (let inv of seq.invocations) {
      let idx = inv.index;
      let pos = inv.resultPosition;
      map[idx] = (pos != null) ? observed[pos] : 'null';
    }
  }
  let outcome = new Outcome({results: map, consistency: undefined});
  trace(`createOutcome([%s], %s) = %s`, observed.join(';'), schema, outcome);
  return outcome;
}

function getOutcome(result, schema) {
  let outcome;
  let observed = parseResult(result);
  for (let predicted of schema.outcomes) {
    if (matchResult(observed, Object.values(predicted.results), schema)) {
      outcome = predicted;
      break;
    }
  }

  if (!outcome)
    outcome = createOutcome(observed, schema);

  trace(`getOutcome([%s], %s) = %s`, observed.join(';'), schema, outcome);
  return outcome;
}

function copyTemplate(dstPath) {
  return new Promise((resolve, reject) => {
    let templateDir = path.join(config.resourcesPath, 'jcstress');
    ncp(templateDir, dstPath, err => err ? reject(err) : resolve());
  });
}

let get = p => b => (b.toString().match(p) || []).slice(1).map(s => s.trim());

class JCStressRunner {
  constructor(codes) {
    this.workPath = path.join(config.outputPath, 'tests');
    this.proc = undefined;
    this.codes = codes;
    this.results = [];
    this.subscribers = [];
    this.initialized = this._initialize();
  }

  onResult(fn) {
    this.subscribers.push(fn);
  }

  run() {
    return new Promise(async (resolve, reject) => {
      await this.initialized;
      this.proc = runJar(this.workPath);
      let lines = this.proc.stdout.pipe(es.split());
      this.proc.on('error', err => { reject(`jcstress error: ${err}`); });
      this.proc.on('exit', rc => { if (rc) reject(`jcstress exited with ${rc}`); });
      lines.on('data', line => { if (this.proc) this._line(line)});
      lines.on('end', () => {
        debug(`returning ${this.results.length} results`);
        resolve(this.results);
      });
    });
  }

  _initialize() {
    return new Promise(async (resolve, reject) => {
      debug(`initiating JCStress tester`);

      await copyTemplate(this.workPath);
      cp.execSync(`find ${this.workPath} -name "*Test*.java" | xargs rm`);

      for (let code of this.codes) {
        let pkg = code.match(/^package (.*);/m)[1];
        let cls = code.match(/^public class (\S+)\b/m)[1];
        let dstFile = path.join(testsPath(this.workPath), ...pkg.split('.'), `${cls}.java`);
        mkdirp.sync(path.dirname(dstFile));
        fs.writeFileSync(dstFile, code);
      }

      if (needsCompile(this.workPath)) {
        try {
          debug(`compiling test harnesses`);
          await compile(this.workPath);
          debug(`test harnesses compiled`);
        } catch (e) {
          reject(`test-harness compilation failed: ${e}`);
          return;
        }
      }

      resolve();
    });
  }

  async _line(line) {
    detail(`data: %s`, line);

    let [status, name, idxS] = get(/\[(OK|FAILED)\]\s+([A-Za-z_$.]+([0-9]+))\s*$/)(line);

    if (status) {
      let idx = parseInt(idxS);
      this._result(status, name, idx);
      return;
    }

    let [result, countS, expectation, description] =
      get(/^\s+(.*)\s+([0-9,]+)\s+([A-Z_]+)\s+(.*)\s*$/)(line);

    if (result) {
      let count = parseInt(countS.replace(/,/g,''));
      this._outcome(result, count, expectation, description);
      return;
    }

    if (!line.toString().trim() && this.results.length > 0) {
      this._endResult();
      return;
    }

    let [complete] = get(/RUN (COMPLETE)\./)(line);
    if (complete) {
      this._end();
      return;
    }
  }

  _result(status, name, index) {
    detail(`got result %s for test %s index %s`, status, name, index);
    this.results.push({
      name: name,
      index: index,
      status: status === 'OK',
      outcomes: []
    });
  }

  _outcome(value, count, expectation, description) {
    let last = this.results.pop();
    this.results.push(last);
    last.outcomes.push({value: value, count: count, expectation: expectation, description: description});
  }

  _endResult() {
    let last = this.results.pop();
    this.results.push(last);
    if (last.total)
      return;
    last.total = last.outcomes.map(o => o.count).reduce((a,b) => a+b, 0);
    Object.assign(last, this._resultData(last));
    debug(`test result: %O`, last);
    for (let fn of this.subscribers) {
      fn(last);
    }
  }

  _resultData(result) {
    return {};
  }

  _end() {
    if (!this.proc)
      return;
    this.proc.kill();
    this.proc = undefined;
  }
}

class JCStressTester extends JCStressRunner {
  constructor(schemas, testName, maxViolations = 1) {
    super(JCStressTester._codeGenerator(schemas, testName));
    this.schemas = schemas;
    let numViolations = 0;
    this.subscribers.push(result => {
      if (!result.status)
        numViolations++;
      if (maxViolations && numViolations >= maxViolations)
        this._end();
    });
  }

  static *_codeGenerator(schemas, id) {
    for (let schema of schemas)
      yield new JCStressCodeGenerator(schema, id).toString();
  }

  _resultData(result) {
    let schema = this.schemas.find(s => s.id === result.index);
    return {
      schema: schema,
      outcomes: result.outcomes.map(({value, count, expectation, description}) => {
        let outcome = getOutcome(value, schema).observe(count);
        detail(`got outcome: %s`, outcome);
        assert.ok(!result.status || outcome.consistency);
        return outcome;
      })
    };
  }
}

class JCStressHistoryGenerator extends JCStressRunner {
  constructor(schemas, testName) {
    super(JCStressHistoryGenerator._codeGenerator(schemas, testName));
    this.schemas = schemas;
  }

  static *_codeGenerator(schemas, id) {
    for (let schema of schemas)
      yield new JCStressHistoryRecordingCodeGenerator(schema, id, new HistoryEncoding(schema)).toString();
  }

  _resultData(result) {
    let schema = this.schemas.find(s => s.id === result.index);
    let total = result.outcomes.reduce((tot,o) => tot + o.count, 0);
    return {
      histories: result.outcomes.map(o => {
        let h = new HistoryEncoding(schema).decode(o.value);
        let count = o.count;
        h.frequency = { count, total };
        return h;
      })
    };
  }
}

module.exports = {
  JCStressTester,
  JCStressHistoryGenerator
};
