const debug = require('debug')('translation');

function escape(outcome) {
  return outcome.replace(/([\[\]\{\}])/g, '\\\\$1');
}

class SchemaIR {
  constructor(schema, id) {
    this.schema = schema;
    this.id = id;

    if (!this.isLegal())
      throw new Error(`Unable to translate schema:\n${JSON.stringify(schema)}`);

    // TODO fix this nonsense hackery
    this.resultIndexes = this.schema.sequences
      .reduce((xs,s) => xs.concat(s.invocations.map(v => ({seq: s, inv: v}))), [])
      .map((x,i) => Object.assign({}, x, {idx: i}))
      .filter(x => this.hasResult(x.seq, x.inv))
      .map((x,i) => {
        x.inv.resultPosition = i;
        return x.idx;
      });
  }

  qualifiedClassName() {
    return this.schema.class;
  }

  packageName() {
    let parts = this.qualifiedClassName().split('.');
    parts.pop();
    parts[0] = 'xxxx';
    return parts.join('.');
  }

  className() {
    return this.qualifiedClassName().split('.').pop();
  }

  classArgs() {
    return this.schema.arguments || [];
  }

  testName() {
    return `${this.schema.class.split('.').pop()}${this.id}Test${this.schema.id || '0'}`;
  }

  objectName() {
    return 'obj';
  }

  resultIdxs() {
    return this.resultIndexes;
  }

  isLegal() {
    let initial = this.initialSequence();
    let final = this.finalSequence();
    return this.schema.sequences.map(s => s.index).every(i => {
      let predecessors = this.schema.order.filter(([_,j]) => j == i).map(([j,_]) => j);
      let successors = this.schema.order.filter(([j,_]) => j == i).map(([_,j]) => j);
      return i == initial || i == final || (
        predecessors.filter(j => j != initial).length == 0
        && successors.filter(j => j != final).length == 0
      );
    });
  }

  initialSequence() {
    let minimals = this.schema.sequences.map(s => s.index)
      .filter(i => this.schema.order.every(([_,j]) => i != j));
    return minimals.length == 1 ? minimals[0] : undefined;
  }

  finalSequence() {
    let maximals = this.schema.sequences.map(s => s.index)
      .filter(i => this.schema.order.every(([j,_]) => i != j));
    return maximals.length == 1 ? maximals[0] : undefined;
  }

  hasResult(sequence, invocation) {
    return sequence.index != this.initialSequence() && !invocation.method.void;
  }
}

class JavaCodeGenerator extends SchemaIR {
  constructor(schema, id) {
    super(schema, id);
  }

  toString() {
    return this.declarations().join('\n');
  }

  declarations() {
    return [
      this.packageDecl(),
      '',
      ...this.importDecls(),
      '',
      this.classDecl()
    ];
  }

  packageDecl() {
    return `package ${this.packageName()};`;
  }

  importDecls() {
    return this.imports().map(i => `import ${i};`);
  }

  imports() {
    return [
      'java.util.Arrays',
      'java.util.AbstractMap',
      'java.util.Collections',
      'java.util.stream.Collectors',
      'java.util.stream.Stream',
      this.qualifiedClassName()
    ];
  }

  classDecl() {
    return [
      ...this.classAnnotations(),
      `public class ${this.testName()} {`,
      ...this.memberDecls().map(d => d.replace(/^/mg, '    ')),
      `}`
    ].join('\n');
  }

  classAnnotations() {
    return [];
  }

  memberDecls() {
    return [
      ...this.fieldDecls(),
      ...this.methodDecls()
    ];
  }

  fieldDecls() {
    return [
      `${this.className()} ${this.objectName()} = new ${this.className()}(${this.classArgs().join(', ')});`
    ];
  }

  methodDecls() {
    return this.schema.sequences.map(this.sequence.bind(this));
  }

  sequence(s) {
    return [
      '',
      `${this.signature(s)} {`,
      ...this.beginSequence(s).map(d => d.replace(/^/mg, '    ')),
      ...s.invocations.map(i => this.wrappedInvocation(s, i).replace(/^/mg, '    ')),
      ...this.endSequence(s).map(d => d.replace(/^/mg, '    ')),
      `}`
    ].join('\n');
  }

  signature(sequence) {
    if (sequence.index == this.initialSequence())
      return `public ${this.testName()}()`;
    else if (sequence.index == this.finalSequence())
      return `public void arbiter()`;
    else
      return `public void actor${sequence.index}()`;
  }

  wrappedInvocation(seq, inv) {
    let n = seq.index;
    let p = inv.resultPosition;
    return [
      '',
      [ 'try',
        '{',
        ...this.beforeInvocation(seq, inv),
        (p !== undefined ? `r = ${this.invocation(inv)};` : `${this.invocation(inv)};`),
        ...this.afterInvocation(seq, inv),
        '}'].join(' '),
      [ 'catch (Exception e)',
        '{',
        ...this.afterInvocation(seq, inv),
        ...(p !== undefined ? [`r = e;`] : []),
        '}'].join(' ')
    ].join('\n');
  }

  invocation(i) {
    return `${this.objectName()}.${i.method.name}(${i.arguments.map(this.argument.bind(this)).join(',')})`;
  }

  argument(arg) {
    if (Array.isArray(arg))
      return `Arrays.asList(${arg.join(', ')})`;
    else if (Object.keys(arg).length > 0)
      return `Collections.unmodifiableMap(Stream.of(${Object.keys(arg).map(k => `new AbstractMap.SimpleEntry<>(${k},${x[k]})`).join(', ')}).collect(Collectors.toMap(e -> e.getKey(), e -> e.getValue())))`;
    else
      return arg;
  }

  beginSequence(sequence) {
    return this.localDecls(sequence);
  }

  localDecls(sequence) {
    return [
      `Object r;`
    ];
  }

  endSequence(sequence) {
    return [];
  }

  beforeInvocation(sequence, invocation) {
    return [];
  }

  afterInvocation(sequence, invocation) {
    return [];
  }
}

class JCStressCodeGenerator extends JavaCodeGenerator {
  constructor(schema, id) {
    super(schema, id);
  }

  imports() {
    return [
      ...super.imports(),
      'org.openjdk.jcstress.annotations.*',
      'org.openjdk.jcstress.infra.results.*'
    ]
  }

  classAnnotations() {
    return [
      ...super.classAnnotations(),
      '@JCStressTest',
      ...this.outcomeAnnotations(),
      '@State'
    ];
  }

  wrappedInvocation(sequence, invocation) {
    let p = invocation.resultPosition;
    return [
      super.wrappedInvocation(sequence, invocation),
      ...(p !== undefined ? [`result.r${p+1} = ResultAdapter.get(r);`] : [])
    ].join('\n');
  }

  outcomeAnnotations() {
    return this.schema.outcomes.map(outcome => {
      return [
        `@Outcome(`,
        `    id = "${this.identifier(outcome)}",`,
        `    expect = ${this.expectation(outcome)},`,
        `    desc = ${this.description(outcome)})`
      ].join('\n');
    });
  }

  identifier(outcome) {
    return escape(outcome.values().filter((_,i) => this.resultIdxs().includes(i))
      .join(', '));
  }

  expectation(outcome) {
    return outcome.isWeak()
      ? "Expect.ACCEPTABLE_INTERESTING"
      : "Expect.ACCEPTABLE";
  }

  description(outcome) {
    return [].concat(outcome.consistency)
      .map(c => `"${c.toString()}"`).join(`\n         + `);
  }

  signature(sequence) {
    if (sequence.index == this.initialSequence())
      return `public ${this.testName()}()`;
    else if (sequence.index == this.finalSequence())
      return `@Arbiter\npublic void arbiter(${this.resultType()} result)`;
    else
      return `@Actor\npublic void actor${sequence.index}(${this.resultType()} result)`;
  }

  resultType() {
    let numResults = this.schema.sequences
      .map(s => s.invocations.filter(i => this.hasResult(s,i)).length)
      .reduce((x,y) => x + y, 0);
    return `StringResult${numResults}`;
  }
}

class JCStressCodeGeneratorWithHistory extends JCStressCodeGenerator {
  constructor(schema, id) {
    super(schema, id);
  }

  identifier(outcome) {
    return super.identifier(outcome) + '.*';
  }

  fieldDecls() {
    return [
      ...super.fieldDecls(),
      ...this.schema.sequences.map(s => `int pc${s.index} = 0;`),
    ];
  }

  localDecls(sequence) {
    let m = this.schema.sequences.length - 1;
    let n = sequence.invocations.length;
    return [
      ...super.localDecls(sequence),
      `int pcs[][] = new int[${n}][${m}];`,
      `int n = 0;`
    ];
  }

  beforeInvocation(sequence, invocation) {
    return [
      `pc${sequence.index}++;`,
      ...this.schema.sequences.filter(s => s != sequence).map((s,i) => `pcs[n][${i}] = pc${s.index};`),
      ...super.beforeInvocation(sequence, invocation)
    ];
  }

  afterInvocation(sequence, invocation) {
    return [...super.afterInvocation(sequence, invocation), `pc${sequence.index}++;`];
  }
}

module.exports = function(schema, id) {
  debug(`translating schema: %O`, schema);
  let translation = new JCStressCodeGenerator(schema, id).toString();
  debug(`got translation:`, translation);
  return translation;
}
