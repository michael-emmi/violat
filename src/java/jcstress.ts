import * as assert from 'assert';
import * as Debug from 'debug';
const debug = Debug('jcstress');
const trace = Debug('jcstress:trace');
const detail = Debug('jcstress:detail');

import * as cp from 'child_process';

var path = require('path');
var fs = require('fs');
var mkdirp = require('mkdirp');
var es = require('event-stream');
var xml2js = require('xml2js');

import { promisify } from 'util';
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const parseXml = promisify(xml2js.parseString);
const ncp = promisify(require('ncp'));
const exec = promisify(cp.exec);

import config from "../config";
import { JCStressOutputReader, Result } from './jcstress/reader';
import { JCStressCodeGenerator, JCStressHistoryRecordingCodeGenerator } from './translation';
import { Outcome } from '../outcome';
import { PartialOrder } from '../partial-order';
import { HistoryEncoding } from './history-encoding';
import { getOutputLines } from '../utils/proc';
import { targetsOutdated } from '../utils/deps';
import { findFiles } from '../utils/find';

import { Schema } from '../schema';

function testsPath(jcstressPath) {
  return path.resolve(jcstressPath, 'src/main/java');
}

function jarFile(jcstressPath) {
  return path.resolve(jcstressPath, 'target/jcstress.jar');
}

function needsCompile(jcstressPath) {
  let jar = jarFile(jcstressPath);
  let sources = findFiles(testsPath(jcstressPath), `-name "*.java"`);
  return targetsOutdated([jar], sources);
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

function parseResult(result) {
  let sanitized = result

    // remove regular expression characters
    .replace(/\\s\*/g, '')

    // remove backslashes
    .replace(/\\/g,'')

    // remove whitespace
    .replace(/\s*/g,'')

    // place quotes around exception names
    .replace(/([\w.]*Exception)/g,'"$1"')

    // place quotes around entry sets, e.g., 0,{0=1,1=2} => 0,"{0=1,2=1}"
    .replace(/([\{\[](\w+=\w+,?)*[\}\]])/g, '"$1"')

    // place quotes around individual entries, e.g., 0,1=2,3 => 0,"1=2",3
    .replace(/^([^\{\[]*([\{\[][^\}\]]*[\}\]][^\{\[])*)(\w+=\w+)/g, '$1"$3"');

  let json = `[${sanitized}]`;
  let ary = JSON.parse(json).map(v => Array.isArray(v) ? `[${v}]` : `${v}`);
  trace(`parseResult('%s') = [%s]`, result, ary.join(';'));
  return ary;
}

function matchResult(observed, predicted, schema) {
  let eq = true;

  OUTER: for (let seq of schema.sequences) {
    for (let inv of seq.invocations) {
      let idx = inv.id;
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
      let idx = inv.id;
      let pos = inv.resultPosition;
      map[idx] = (pos != null) ? observed[pos] : undefined;
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

async function copyTemplate(dstPath, jars: string[]) {
  let templateDir = path.join(config.resourcesPath, 'jcstress');
  let projectFile = path.join(dstPath, 'pom.xml');

  await ncp(templateDir, dstPath);
  let inXml = await readFile(projectFile);
  let pom = await parseXml(inXml);

  for (let jar of jars) {
    let groupId = 'xxx';
    let artifactId = path.basename(jar, '.jar');
    let version = '1.0';
    let packageSpec = { groupId, artifactId, version };
    let installCmd = `mvn install:install-file -Dfile=${jar} -DgroupId=${groupId} -DartifactId=${artifactId} -Dversion=${version} -Dpackaging=jar`;
    await exec(installCmd);

    let dependencies = pom.project.dependencies[0];
    dependencies.dependency.push(packageSpec);
  }
  let builder = new xml2js.Builder();
  let outXml = builder.buildObject(pom);
  await writeFile(projectFile, outXml);
}

let get = p => b => (b.toString().match(p) || []).slice(1).map(s => s.trim());

export type PackageSpec = {groupId: string, artifactId: string, version: string};

abstract class JCStressRunner {
  workPath: string;
  javaHome?: string;
  codes: Iterable<string>;
  limits: {
    forksPerTest: number,
    itersPerTest: number,
    timePerTest: number
  };
  initialized: Promise<{}>;

  constructor(codes, jars: string[] = [], javaHome, { limits: { timePerTest = 1, itersPerTest = 1, forksPerTest = 1 } }) {
    this.workPath = path.join(config.outputPath, 'tests');
    this.javaHome = javaHome;
    this.codes = codes;
    this.limits = { timePerTest, itersPerTest, forksPerTest };
    this.initialized = this._initialize(jars);
  }

  async * getResults() {
    await this.initialized;
    const cmd = this.javaHome ? `${this.javaHome}/bin/java` : 'java';
    const args = [
      '-Djava.awt.headless=true',
      '-jar', jarFile(this.workPath),
      '-v',
      '-f', this.limits.forksPerTest,
      '-iters', this.limits.itersPerTest,
      '-time', this.limits.timePerTest * 1000,
      '-jvmArgs', '-server'
    ];
    try {
      let generator = getOutputLines(cmd, args, {cwd: this.workPath});
      let reader = new JCStressOutputReader(generator);

      for await (let result of reader.getResults()) {
        debug(`got result: %o`, result);
        yield Object.assign({}, result, this._resultData(result));
      }

    } catch (e) {
      if (e.toString().match(/TEST FAILURES/))
        debug(`jcstress found failures`);
      else
        throw e;
    }
  }

  abstract _resultData(result: Result);

  _initialize(jars: string[]) {
    return new Promise(async (resolve, reject) => {
      debug(`initiating JCStress tester`);

      await copyTemplate(this.workPath, jars);
      cp.execSync(`find ${this.workPath} -name "*Test*.java" | xargs rm -rf`);

      for (let code of this.codes) {
        let pkg = (code.match(/^package (.*);/m) || [""])[1];
        let cls = (code.match(/^public class (\S+)\b/m) || [""])[1];
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
}

export class JCStressTester extends JCStressRunner {
  schemas: Schema[];

  constructor(schemas, jars: string[] = [], javaHome, { testName = '', maxViolations = 1, limits = {} } = {}) {
    super(JCStressTester._codeGenerator(schemas, testName), jars, javaHome, { limits });
    this.schemas = [...schemas];
    // let numViolations = 0;
    // this.subscribers.push(result => {
    //   if (!result.status)
    //     numViolations++;
    //   if (maxViolations && numViolations >= maxViolations)
    //     // this._end();
    // });
  }

  static *_codeGenerator(schemas, id) {
    for (let schema of schemas)
      yield new JCStressCodeGenerator(schema, id).toString();
  }

  _resultData(result: Result) {
    let schema = this.schemas.find(s => s.id === result.index);
    assert.ok(schema);
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

export class JCStressHistoryGenerator extends JCStressRunner {
  schemas: Schema[];

  constructor(schemas, jars = [], javaHome, testName) {
    super(JCStressHistoryGenerator._codeGenerator(schemas, testName), jars, javaHome, { limits: {} });
    this.schemas = schemas;
  }

  static *_codeGenerator(schemas, id) {
    for (let schema of schemas)
      yield new JCStressHistoryRecordingCodeGenerator(schema, id, new HistoryEncoding(schema)).toString();
  }

  _resultData(result: Result) {
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
