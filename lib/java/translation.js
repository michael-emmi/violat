const debug = require('debug')('translation');

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
    return this.schema.sequences.map(s => s.id).every(i => {
      let predecessors = this.schema.order.filter(([_,j]) => j == i).map(([j,_]) => j);
      let successors = this.schema.order.filter(([j,_]) => j == i).map(([_,j]) => j);
      return i == initial || i == final || (
        predecessors.filter(j => j != initial).length == 0
        && successors.filter(j => j != final).length == 0
      );
    });
  }

  initialSequence() {
    let minimals = this.schema.sequences.map(s => s.id)
      .filter(i => this.schema.order.every(([_,j]) => i != j));
    return minimals.length == 1 ? minimals[0] : undefined;
  }

  finalSequence() {
    let maximals = this.schema.sequences.map(s => s.id)
      .filter(i => this.schema.order.every(([j,_]) => i != j));
    return maximals.length == 1 ? maximals[0] : undefined;
  }

  hasResult(sequence, invocation) {
    return sequence.id != this.initialSequence() && !invocation.method.void;
  }
}

class JavaCodeGenerator extends SchemaIR {
  constructor(schema, id) {
    super(schema, id);
  }

  toString() {
    debug(`generating code for schema: %O`, this.schema);
    let code = this.declarations().join('\n');
    debug(`generated code:`, code);
    return code;
  }

  declarations() {
    return [
      this.packageDecl(),
      '',
      ...this.importDecls(),
      '',
      this.classDecl(),
      ''
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
    if (sequence.id == this.initialSequence())
      return `public ${this.testName()}()`;
    else if (sequence.id == this.finalSequence())
      return `public void arbiter()`;
    else
      return `public void actor${sequence.id}()`;
  }

  wrappedInvocation(seq, inv) {
    let n = seq.id;
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
        ...(p !== undefined ? [`r = ${this.exception('e')};`] : []),
        '}'].join(' '),
      ...this.postInvocation(seq, inv)
    ].join('\n');
  }

  invocation(i) {
    return `${this.objectName()}.${i.method.name}(${i.arguments.map(this.argument.bind(this)).join(',')})`;
  }

  exception(e) {
    return e;
  }

  argument(arg) {
    if (Array.isArray(arg))
      return `Arrays.asList(${arg.join(', ')})`;
    else if (Object.keys(arg).length > 0)
      return `Collections.unmodifiableMap(Stream.of(${Object.keys(arg).map(k => `new AbstractMap.SimpleEntry<>(${k},${arg[k]})`).join(', ')}).collect(Collectors.toMap(e -> e.getKey(), e -> e.getValue())))`;
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

  postInvocation(sequence, invocation) {
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

  localDecls(sequence) {
    return [
      `String r;`
    ];
  }

  invocation(i) {
    let p = i.resultPosition;
    let invString = super.invocation(i);
    return p !== undefined
      ? `${this.resultAdapter()}(${invString})`
      : invString;
  }

  exception(e) {
    return `${this.resultAdapter()}(${e})`;
  }

  postInvocation(sequence, invocation) {
    let p = invocation.resultPosition;
    return [
      ...(p !== undefined ? [`result.r${p+1} = r;`] : [])
    ];
  }

  resultAdapter() {
    return 'ResultAdapter.get';
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
    return outcome.values()
      .filter((_,i) => this.resultIdxs().includes(i))
      .join(',')

      // escape all braces and brackets
      .replace(/([\[\]\{\}])/g, '\\\\$1')

      // handle possible spaces after commas
      .replace(/,/g, ',\\\\s*');
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
    if (sequence.id == this.initialSequence())
      return `public ${this.testName()}()`;
    else if (sequence.id == this.finalSequence())
      return `@Arbiter\npublic void arbiter(${this.resultType()} result)`;
    else
      return `@Actor\npublic void actor${sequence.id}(${this.resultType()} result)`;
  }

  resultType() {
    let numResults = this.schema.sequences
      .map(s => s.invocations.filter(i => this.hasResult(s,i)).length)
      .reduce((x,y) => x + y, 0);
    return `StringResult${numResults}`;
  }
}

class JCStressHistoryRecordingCodeGenerator extends JCStressCodeGenerator {
  constructor(schema, id, encoding) {
    super(schema, id);
    this.encoding = encoding;
  }

  outcomeAnnotations() {
    return [`@Outcome(id = ".*", expect = Expect.ACCEPTABLE, desc = "")`];
  }

  fieldDecls() {
    return [
      ...super.fieldDecls(),
      ...this.schema.sequences.map(s => `NoReorderCounter pc${s.id} = new NoReorderCounter();`),
    ];
  }

  localDecls(sequence) {
    let m = this.schema.sequences.length - 1;
    let n = sequence.invocations.length * 2;
    return [
      ...super.localDecls(sequence),
      `Object ${sequence.invocations.map((_,idx) => `r${idx}`).join(', ')};`,
      `int pcs[][] = new int[${n}][${m}];`,
      `int n = 0;`
    ];
  }

  beforeInvocation(sequence, invocation) {
    return [
      ...this.schema.sequences.filter(s => s != sequence).map((s,i) => `pcs[n][${i}] = pc${s.id}.get();`),
      `n++;`,
      `pc${sequence.id}.increment();`,
      ...super.beforeInvocation(sequence, invocation)
    ];
  }

  afterInvocation(sequence, invocation) {
    return [
      ...super.afterInvocation(sequence, invocation),
      ...this.schema.sequences.filter(s => s != sequence).map((s,i) => `pcs[n][${i}] = pc${s.id}.get();`),
      `n++;`,
      `pc${sequence.id}.increment();`
    ];
  }

  postInvocation(sequence, invocation) {
    let p = invocation.resultPosition;
    let pos = sequence.invocations.indexOf(invocation);
    return [
      ...(p !== undefined ? [`r${pos} = r;`] : [])
    ];
  }

  resultType() {
    return `StringResult${this.schema.sequences.length}`;
  }

  endSequence(sequence) {
    let encoding = this.encoding.encode(sequence, {
      counter: (i,j) => `pcs[${i}][${j}]`,
      result: i => sequence.invocations[i].resultPosition === undefined ? `"void"` : `r${i}`
    });
    return [
      '',
      `result.r${sequence.id+1} = ${encoding};`
    ];
  }
}

module.exports = {
  JCStressCodeGenerator,
  JCStressHistoryRecordingCodeGenerator
};
