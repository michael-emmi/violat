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
var jcstress = require('./jcstress.js')(path.resolve(path.dirname(__dirname), 'jcstress'));
var records = require('./records.js')('---\n');
var shuffle = require('./shuffle.js');

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

async function schemaFile(specFile, method, sequences, invocations) {
  let spec = JSON.parse(fs.readFileSync(specFile, 'utf8'));
  let dstFile = path.resolve(
    'schemas',
    specFile.replace('.json', `.${method}.${sequences}.${invocations}.json`)
  );
  mkdirp.sync(path.dirname(dstFile));
  let ary = Array.from(enumeration.generator(spec, method, sequences, invocations)());
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

async function testMethod(specFile, method, sequences, invocations) {
  try {
    let chunkSize = 100;

    let schemas = await schemaFile(specFile, method, sequences, invocations);
    let count = await records.count(fs.createReadStream(schemas));
    logger.info(`generated ${count} schemas`);

    let shuffled = await shuffleFile(schemas);
    logger.info(`suffled harness schemas`)

    let chunks = await splitFile(shuffled, chunkSize);
    logger.info(`split into ${chunks.length} chunks of ${chunkSize} schemas`);

    for (let idx in chunks) {
      logger.info(`processing chunk ${parseInt(idx)+1} of ${chunks.length}`);

      let annotated = await annotation.annotate(chunks[idx]);
      logger.info(`annotated harness schemas`);

      let harnesses = await translation.translate(annotated, method.capitalize());
      logger.info(`translated ${chunkSize} harness schemas`);

      let n = 0;
      let result = await jcstress.test(harnesses, () => {
        if (++n % 10 == 0)
          logger.info(`completed ${n} of ${chunkSize} tests`);
      });

      if (result.status == 'fail')
        return result;
    }
  } catch (e) {
    logger.error(e);
  }
  return {status: 'success'};
}

async function testUntrustedMethods(specFile, sequences, invocations) {
  let spec = JSON.parse(fs.readFileSync(specFile));
  let methods = spec.methods.filter(m => !m.trusted);
  let results = [];
  for (let m of methods) {
    logger.info(`testing untrusted method: ${m.name}`);
    let result = await testMethod(specFile, m.name, sequences, invocations);
    if (result.status == 'fail') {
      logger.info(`Bug found!`);
      logger.info(`The following harness got ${result.values}:`);
      logger.info(`---`);
      logger.info(result.harness);
      logger.info(`---`);
    }
    results.push(result);
  }
  return results;
}

exports.testMethod = testMethod;
exports.testUntrustedMethods = testUntrustedMethods;
