var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var cp = require('child_process');
var es = require('event-stream');
var seedrandom = require('seedrandom');
var winston = require('winston');

let t0 = new Date();

var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({
        timestamp: () => `${(new Date() - t0) / 1000}s`
      })
    ]
});

var enumerator = require('./schema-enumerator.js');
var translator = require('./schema-translator.js');
var jcstress = require('./jcstress.js')(path.resolve(path.dirname(__dirname), 'jcstress'));
var records = require('./records.js')('---\n');
var shuffle = require('./shuffle.js')('TODO: seed goes here');

async function schemaFile(specFile, method, sequences, invocations) {
  let spec = JSON.parse(fs.readFileSync(specFile, 'utf8'));
  let dstFile = path.resolve(
    'schemas',
    specFile.replace('.json', `.${method}.${sequences}.${invocations}.json`)
  );
  mkdirp.sync(path.dirname(dstFile));
  let ary = Array.from(enumerator.generator(spec, method, sequences, invocations)());
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
  for (let i = 0; i < ary.length; i+= cycle) {
    let dstFile = `${prefix}.${i}.json`;
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
    seedrandom('knick-knacks', { global: true });

    logger.info(`SPEC TESTER`);
    logger.info(`---`);
    logger.info(`class: ${JSON.parse(fs.readFileSync(specFile)).class}`)
    logger.info(`method: ${method}`);
    logger.info(`sequences: ${sequences}`);
    logger.info(`invocations: ${invocations}`)
    logger.info(`---`);

    let schemas = await schemaFile(specFile, method, sequences, invocations);
    let count = await records.count(fs.createReadStream(schemas));
    logger.info(`generated ${count} schemas`);

    let shuffled = await shuffleFile(schemas);
    logger.info(`suffled harness schemas`)

    let chunks = await splitFile(shuffled, 500);
    logger.info(`split into ${chunks.length} chunks of 500 schemas`);

    for (let chunk of chunks) {

      cp.execSync(`find ${jcstress.testsPath()} -name "*StressTests*.java" | xargs rm`);
      translator.translate(chunk, jcstress.testsPath());
      logger.info(`translated harness schemas`);

      let result = await jcstress.test();
      logger.info(`ran test harnesses`);

      if (result.status == 'fail') {
        logger.info(`Bug found!`);
        logger.info(`The following harness got ${result.values}:`);
        logger.info(`---`);
        logger.info(result.harness);
        logger.info(`---`);
        return true;
      }
    }
  } catch (e) {
    logger.info(e);
  }
  return false;
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
  check('method');
  if (!fs.existsSync(args.spec)) {
    throw new Error(`Cannot find file: ${args.spec}`);
  }

  testMethod(args.spec, args.method, args.sequences, args.invocations);
}
