var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');
var cp = require('child_process');
var figlet = require('figlet');

var enumerator = require('./schema-enumerator.js');
var translator = require('./schema-translator.js');
var jcstress = require('./jcstress-wrapper.js')(path.resolve(path.dirname(__dirname), 'jcstress'));

function countSchemas(schemas) {
  return cp.execSync(`grep ${schemas} -e '---' | wc -l`).toString().trim();
}

function clockMe(description, fn) {
  process.stdout.write(description + "...");
  var t = new Date();
  fn();
  t = (new Date() - t) / 1000;
  process.stdout.write(` ${t}s\n`);
}

function testMethod(specFile, method, sequences, invocations) {
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
  cp.execSync(`find ${schemaPath} -name "*.json" | xargs rm`);
  cp.execSync(`find ${jcstress.testsPath()} -name "*StressTests*.java" | xargs rm`);

  var stream = fs.createWriteStream(schemas);

  clockMe('Generating harness schemas',
    () => enumerator.dump(spec, method, sequences, invocations, stream)
  );

  stream.on('finish', () => {
    console.log(`* generated ${countSchemas(schemas)} schemas`);

    clockMe('Translating harness schemas', () => translator.translate(schemas, jcstress.testsPath()));
    clockMe('Compiling test harnesses', () => jcstress.compile());

    process.stdout.write('Running test harnesses...');
    var t = new Date();
    var e = jcstress.test();
    e.on('passed', () => process.stdout.write('.'));
    e.on('failed', test => process.stdout.write(` test ${test} failed`))
    e.on('finish', () => {
      t = (new Date() - t) / 1000;
      process.stdout.write(` ${t}s\n`);
      console.log("Testing complete.");
    });
  });
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
