import * as assert from 'assert';
import * as Debug from 'debug';
const debug = Debug('jpf:harness');

import { Schema, Invocation } from '../../schema';
import { Outcome } from '../../outcome';
import { Source } from './executor';

type ResultIndex = Map<number,number>;

export function getTestHarness(schema: Schema): Source {
  const { class: fullClassName, id, sequences, outcomes } = schema;
  const className = fullClassName.split('.').pop()
  const name = `${className}Test${id}`;

  assert.equal(sequences.length, 2, `TODO: implement more threads`);

  const idx: ResultIndex = new Map<number,number>();
  for (const seq of sequences)
    for (const { id } of seq.invocations)
      idx.set(id, idx.size);

  const code = `
import java.util.Arrays;
import java.util.Collections;
import java.util.Enumeration;
import java.util.stream.Collectors;
import java.util.HashSet;
import ${fullClassName};

public class ${name} {

  static String stringify(Object object) {
    String result;
    if (object instanceof Exception)
      result = String.valueOf(object.getClass().getName());

    else if (object instanceof Enumeration)
      result = Collections.list((Enumeration<?>) object).stream()
        .map(${name}::stringify)
        .collect(Collectors.joining(",", "[", "]"));

    else if (object instanceof Object[])
      result = Arrays.stream((Object[]) object)
        .map(${name}::stringify)
        .collect(Collectors.joining(",", "[", "]"));

    else
      result = String.valueOf(object);

    return result.replaceAll(" ", "");
  }

  public static void main(String[] args) {
    final ${className} obj = new ${className}();
    final String results[] = new String[${idx.size}];
    final HashSet<String> expected = new HashSet<String>();

    ${outcomes.map((o: Outcome) => `expected.add("${o.valueString()}");`).join('\n    ')}

    Thread t1 = new Thread(() -> {
      String r;
      ${sequences[0].invocations.map(i => getInvocation(i, idx)).join('\n      ')}
    });

    Thread t2 = new Thread(() -> {
      String r;
      ${sequences[1].invocations.map(i => getInvocation(i, idx)).join('\n      ')}
    });

    try {
      t1.start();
      t2.start();
      t1.join();
      t2.join();

      String result = ${[...idx.values()].map(idx => `results[${idx}]`).join(` + ", " + `)};
      System.out.println(result);
      assert expected.contains(result);

    } catch (InterruptedException e) {

    }
  }
}
  `;

  debug(code);
  return { name, code };
}

function getInvocation({ arguments: args, id, method }: Invocation, idx: ResultIndex): string {
  const { name, void: isVoid } = method;
  const invocation = `obj.${name}(${args.join(', ')})`;

  const normalPath = isVoid
    ? `${invocation}; r = "_";`
    : `r = stringify(${invocation});`;

  return `
      try { ${normalPath} }
      catch (Exception e) { r = stringify(e); }
      results[${idx.get(id)}] = r;`;
}
