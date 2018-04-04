let inquirer = require('inquirer');

let java = require('java');
let Class = java.import('java.lang.Class');
let Void = java.import('java.lang.Void');

let _Object = Class.forNameSync('java.lang.Object');
let Modifier = java.import('java.lang.reflect.Modifier');

function getSpec(className) {
  let _class = Class.forNameSync(className);
  let typeParams = _class.getTypeParametersSync().map(a => a.getNameSync());
  let substitute = typeName => typeParams.includes(typeName) ? "int" : typeName;

  return {
    class: className,
    methods: _class.getMethodsSync()
      .filter(m => {
        return Modifier.isPublicSync(m.getModifiersSync())
          && m.getParameterTypesSync()
            .every(t => !t.getTypeNameSync().match(/function/))
          && m.getDeclaringClassSync().equalsSync(_class)

      })
      .map(m => {
        return {
          name: m.getNameSync(),
          parameters: m.getGenericParameterTypesSync().map(t => substitute(t.getTypeNameSync())),
          void: m.getReturnTypeSync().equalsSync(Void.TYPE)
        };
      }).sort((m1,m2) => m1.name.localeCompare(m2.name))
  };
}

async function fillInGaps(methods) {
  for (let m of methods) {
    m.readonly = (await inquirer.prompt([{
      type: 'input',
      name: 'readonly',
      choices: ['y', 'n'],
      message: `is ${m.name}(${m.parameters.join(',')}) read only [y/n]?`,
      default: 'n'
    }])).readonly;
    m.trusted = (await inquirer.prompt([{
      type: 'input',
      name: 'trusted',
      choices: ['y', 'n'],
      message: `is ${m.name}(${m.parameters.join(',')}) trusted [y/n]?`,
      default: 'n'
    }])).trusted;
  }
}

async function generateSpec(className) {
  let spec = getSpec(className);
  spec.methods.forEach(m => {
    m.readonly = false;
    m.trusted = false;
  });
  return spec;
}

exports.generateSpec = generateSpec;
