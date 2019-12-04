import * as assert from 'assert';
import * as Debug from 'debug';
const debug = Debug('jcstress');
const trace = Debug('jcstress:trace');
const detail = Debug('jcstress:detail');

import * as cp from 'child_process';

var path = require('path');
var fs = require('fs-extra');
var mkdirp = require('mkdirp');
var es = require('event-stream');
var xml2js = require('xml2js');

import { promisify } from 'util';
const parseXml = promisify(xml2js.parseString);
const exec = promisify(cp.exec);

import config from "../../config";
import { JCStressOutputReader, Result } from './reader';
import { JCStressCodeGenerator } from './harness';
import { Outcome } from '../../outcome';
import { targetsOutdated } from '../../utils/deps';
import { maven } from '../build';
import { findFiles } from '../../utils/find';
import { lines } from '../../utils/lines';

import { Schema } from '../../schema';

function testsPath(jcstressPath: string): string {
  return path.resolve(jcstressPath, 'src/main/java');
}

function jarFile(jcstressPath: string): string {
  return path.resolve(jcstressPath, 'target/jcstress.jar');
}

async function needsCompile(jcstressPath: string): Promise<boolean> {
  let jar = jarFile(jcstressPath);
  let sources = await findFiles(testsPath(jcstressPath), `*.java`);
  return await targetsOutdated([jar], sources);
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

  debug(`copying %s to %s`, templateDir, dstPath)
  await fs.copy(templateDir, dstPath);

  debug(`project file: %s`, projectFile);
  let inXml = await fs.readFile(projectFile);
  debug(`project data: %s`, inXml);

  let pom = await parseXml(inXml);
  debug(`project: %o`, pom)

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
  await fs.writeFile(projectFile, outXml);
}

let get = p => b => (b.toString().match(p) || []).slice(1).map(s => s.trim());

export type PackageSpec = {groupId: string, artifactId: string, version: string};

export interface JCStressLimits {
  forksPerTest: number;
  itersPerTest: number;
  timePerTest: number;
}

export abstract class JCStressRunner {
  workPath: string;
  javaHome?: string;
  codes: Iterable<string>;
  limits: JCStressLimits;
  initialized: Promise<void>;

  constructor(codes: Iterable<string>,
      jars: string[] = [],
      javaHome: string | undefined,
      limits: Partial<JCStressLimits>) {

    const { timePerTest = 1, itersPerTest = 1, forksPerTest = 1 } = limits;
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
      '-f', this.limits.forksPerTest.toString(),
      '-iters', this.limits.itersPerTest.toString(),
      '-time', (this.limits.timePerTest * 1000).toString(),
      '-jvmArgs', '-server'
    ];
    try {
      let generator = lines(cp.spawn(cmd, args, {cwd: this.workPath}).stdout);
      let reader = new JCStressOutputReader(generator);

      for await (let result of reader.getResults()) {
        debug(`got result: %o`, result);
        yield Object.assign({}, result, this._resultData(result));
      }

    } catch (e) {
      if (e.toString().match(/TEST FAILURES/))
        debug(`jcstress found failures`);
      else
        throw new Error(e);
    }
  }

  abstract _resultData(result: Result);

  _initialize(jars: string[]): Promise<void> {
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

      if (await needsCompile(this.workPath)) {
        try {
          debug(`compiling test harnesses`);
          await maven(this.workPath);
          debug(`test harnesses compiled`);
        } catch (e) {
          debug(`test-harness compilation failed`);
          reject(e);
          throw e;
        }
      }

      resolve();
    });
  }
}

export interface JCStressTesterInputs {
  testName: string;
  maxViolations: number;
  limits: Partial<JCStressLimits>;
}

export class JCStressTester extends JCStressRunner {
  schemas: Schema[];

  constructor(schemas: Iterable<Schema>,
      jars: string[] = [],
      javaHome: string | undefined,
      params: Partial<JCStressTesterInputs>) {

    const { testName = '', maxViolations = 1, limits = {} } = params
    super(JCStressTester._codeGenerator(schemas, testName), jars, javaHome, limits);
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
