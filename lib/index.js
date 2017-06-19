var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var winston = require('winston');

let t0 = new Date();

var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({
        timestamp: () => `${((new Date() - t0) / 1000).toFixed(3)}s`
      })
    ]
});

var enumeration = require('./enumeration.js');
var annotation = require('./annotation.js');
var translation = require('./translation.js');
var jcstress = require('./jcstress.js')
var records = require('./records.js')('---\n');
var shuffle = require('./shuffle.js');
var config = require('./config.js');

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

async function schemaFile(args) {
  let spec = JSON.parse(fs.readFileSync(args.spec, 'utf8'));
  let dstFile = path.join(
    config.outputPath,
    'schemas',
    path.basename(args.spec)
      .replace('.json', `.${args.method}.${args.values}v.${args.sequences}s.${args.invocations}i.json`)
  );
  mkdirp.sync(path.dirname(dstFile));
  let ary = Array.from(enumeration.generator(spec, args.method, args.values, args.sequences, args.invocations)());
  await records.put(ary, fs.createWriteStream(dstFile));
  return dstFile;
}

async function shuffleFile(srcFile) {
  let dstFile = srcFile.replace(/[.]json$/, '.shuffled.json');
  let ary = await records.get(fs.createReadStream(srcFile));
  shuffle(ary);
  await records.put(ary, fs.createWriteStream(dstFile));
  return dstFile;
}

async function splitFile(srcFile, cycle) {
  let elems = [];
  let prefix = srcFile.replace(/[.]json$/, '.split');
  let ary = await records.get(fs.createReadStream(srcFile));
  let n = 0;
  for (let i = 0; i < ary.length; i+= cycle) {
    let dstFile = `${prefix}.${n++}.json`;
    elems.push({
      file: dstFile,
      promise: records.put(ary.slice(i, i+cycle), fs.createWriteStream(dstFile))
    });;
  }
  await Promise.all(elems.map(e => e.promise));
  return elems.map(e => e.file);
}

async function testMethod(args) {
  try {
    let violations = [];
    let startTime = new Date();
    let chunkSize = 100;
    let explored = 0;

    let spec = JSON.parse(fs.readFileSync(args.spec));
    let method = spec.methods.find(m => m.name === args.method);

    if (!method)
      throw `no entry for method ${args.method} in spec ${args.spec}`;

    args = Object.assign({},
      config.defaultParameters,
      spec.harnessParameters,
      method.harnessParameters,
      args
    );

    logger.info(`method: ${method.name}`);
    logger.info(`values: ${args.values}`);
    logger.info(`sequences: ${args.sequences}`);
    logger.info(`invocations: ${args.invocations}`);

    let schemas = await schemaFile(args);
    let count = await records.count(fs.createReadStream(schemas));
    logger.info(`generated ${count} schemas`);

    let shuffled = await shuffleFile(schemas);
    logger.info(`shuffled harness schemas`)

    let chunks = await splitFile(shuffled, chunkSize);
    logger.info(`split into ${chunks.length} chunks of ${chunkSize} schemas`);

outer:
    for (let idx in chunks) {
      explored += chunkSize;
      logger.info(`processing chunk ${parseInt(idx)+1} of ${chunks.length}`);

      let annotated = await annotation.annotate(chunks[idx]);
      logger.info(`annotated harness schemas`);

      let harnesses = await translation.translate(annotated, method.name.capitalize());
      logger.info(`translated ${chunkSize} harness schemas`);

      let n = 0;
      let results = await jcstress.test(harnesses, () => {
        if (++n % 10 == 0)
          logger.info(`completed ${n} of ${chunkSize} tests`);
      }, !args.all);

      for (let result of results) {
        if (result.failedHarness) {
          let dstFile = path.join(
            config.outputPath, "violations",
            `${result.failedHarness.replace(/[.]/g,'/')}.java`);

          let res = Object.assign({}, args, {
            time: ((new Date() - startTime) / 1000).toFixed(3),
            total: count,
            explored: explored,
            results: [result]
          });

          let code =
            JSON.stringify(Object.assign({}, res, {
              numExecutions: result.numExecutions,
              results: result.forbiddenResults
            }), null, 2).replace(/^/gm,'// ')
            + '\n'
            + result.forbiddenResults.reduce((c,r) =>
              translation.addOutcome(c, r.outcome),
              result.harnessCode);

          mkdirp.sync(path.dirname(dstFile));
          fs.writeFileSync(dstFile, code);

          violations.push(result);
          if (!args.all)
            break outer;
        }
      }
    }

    return Object.assign({}, args, {
      time: ((new Date() - startTime) / 1000).toFixed(3),
      total: count,
      explored: explored,
      results: violations
    });

  } catch (e) {
    logger.error(e);
  }

  return Object.assign({}, args);
}

async function testUntrustedMethods(args) {
  let spec = JSON.parse(fs.readFileSync(args.spec));
  let methods = spec.methods.filter(m => m.trusted === false);
  let results = [];
  for (let m of methods) {
    for (let result of await testMethod(Object.assign({}, args, {method: m.name}))) {
      logger.info(`---`);
      logger.info(result);
      logger.info(`---`);
      results.push(result);
    }
  }
  return results;
}

exports.testMethod = testMethod;
exports.testUntrustedMethods = testUntrustedMethods;
