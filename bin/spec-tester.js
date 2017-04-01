var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var cp = require('child_process');
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
    logger.info(e);
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

if (require.main === module) {
  var minimist = require('minimist');

  var args = minimist(process.argv.slice(2), {
    default: {
      sequences: 2,
      invocations: 2
    }
  });

  var check = arg => {
    if (!(arg in args))
      throw new Error(`Missing argument: ${arg}`);
  }

  check('spec');
  if (!fs.existsSync(args.spec)) {
    throw new Error(`Cannot find file: ${args.spec}`);
  }

  (async () => {
    logger.info(`SPEC TESTER`);
    logger.info(`---`);
    logger.info(`class: ${JSON.parse(fs.readFileSync(args.spec)).class}`);
    if (args.method)
      logger.info(`method: ${args.method}`);
    logger.info(`sequences: ${args.sequences}`);
    logger.info(`invocations: ${args.invocations}`)
    logger.info(`---`);

    let results = args.method
      ? await testMethod(args.spec, args.method, args.sequences, args.invocations)
      : await testUntrustedMethods(args.spec, args.sequences, args.invocations);

    for (let result of ([].concat(results))) {
      if (result.status == 'fail') {
        logger.info(`Bug found!`);
        logger.info(`The following harness got ${result.values}:`);
        logger.info(`---`);
        logger.info(result.harness);
        logger.info(`---`);
      }
    }
  })();
}
