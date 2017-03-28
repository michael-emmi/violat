var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var cp = require('child_process');
var es = require('event-stream');
var figlet = require('figlet');

var enumerator = require('./schema-enumerator.js');
var translator = require('./schema-translator.js');
var jcstress = require('./jcstress.js')(path.resolve(path.dirname(__dirname), 'jcstress'));
var records = require('./records.js')('---\n');
var shuffle = require('./shuffle.js')('TODO: seed goes here');

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

async function clockMe(description, fn) {
  process.stdout.write(description + "...");
  let t = new Date();
  let result = await fn();
  t = (new Date() - t) / 1000;
  process.stdout.write(` ${t}s\n`);
  return result;
}

async function testMethod(specFile, method, sequences, invocations) {
  try {
    var schemaPath = 'schemas';

    var schemas = path.resolve(schemaPath, specFile.replace(
      '.json',
      `.${method}.${sequences}.${invocations}.json`
    ));

    var spec = JSON.parse(fs.readFileSync(specFile, 'utf8'));

    console.log(figlet.textSync(`SPEC TESTER`));
    console.log(`---`);
    console.log(`class: ${spec.class}`)
    console.log(`method: ${method}`);
    console.log(`sequences: ${sequences}`);
    console.log(`invocations: ${invocations}`)
    console.log(`---`);

    mkdirp.sync(path.dirname(schemas));

    await clockMe('Generating harness schemas', async () => {
      await records.put(
        Array.from(enumerator.generator(spec, method, sequences, invocations)()),
        fs.createWriteStream(schemas));

      process.stdout.write('\n');
      process.stdout.write(`* generated ${await records.count(fs.createReadStream(schemas))} schemas.`);
    });

    let shuffled = await clockMe('Shuffling harness schemas', async () => {
      return await shuffleFile(schemas);
    });

    let splits = await clockMe('Splitting harness schemas', async () => {
      return await splitFile(shuffled, 1000);
    });

    for (let split in splits) {

      await clockMe(`Translating harness schemas (${split})`, () => {
        cp.execSync(`find ${jcstress.testsPath()} -name "*StressTests*.java" | xargs rm`);
        translator.translate(splits[split], jcstress.testsPath())
      });

      let done = await clockMe(`Running test harnesses (${split})`, async () => {
        let total;
        let count = 0;
        let result = await jcstress.test(() => {
          process.stdout.write(count > 0 ? '' : '\n');
          process.stdout.write(`* ${++count} of ${total || (total = jcstress.count())}\r`)
        });
        if (result.status != 'fail') {
          process.stdout.write(`* all ${count} tests passed.`);
          return false

        } else {
          console.log(`Bug found!`)
          console.log(`The following harness got ${result.values}:`);
          console.log(`---`);
          console.log(result.harness);
          console.log(`---`);
          return true;
        }
      });

      if (done)
        break;
    }
  } catch (e) {
    console.log(e);
  }
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
