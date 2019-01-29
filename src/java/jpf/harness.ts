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
    for (const { id, method: { void: isVoid } } of seq.invocations)
      if (!isVoid)
        idx.set(id, idx.size);

  const code = `
import ${fullClassName};
import java.util.*;
import java.util.stream.*;
import java.util.HashSet;

public class ${name} {
  static ${className} obj = new ${className}();
  static String results[] = new String[${idx.size}];
  static Set<String> expected = new HashSet<String>();

  static {
    ${outcomes.map((o: Outcome) => `expected.add("${o.valueString()}");`).join('\n    ')}
  };

  static String resultToString(Object object) {
    String result;
    if (object instanceof Exception)
      result = String.valueOf(object.getClass().getName());

    else if (object instanceof Enumeration)
      result = Collections.list((Enumeration<?>) object).stream()
        .map(${name}::resultToString)
        .collect(Collectors.joining(",", "[", "]"));

    else if (object instanceof Object[])
      result = Arrays.stream((Object[]) object)
        .map(${name}::resultToString)
        .collect(Collectors.joining(",", "[", "]"));

    else
      result = String.valueOf(object);

    return result.replaceAll(" ", "");
  }

  public static void main(String[] args) {

    Thread t1 = new Thread(() -> {
      ${sequences[0].invocations.map(i => getInvocation(i, idx)).join('\n      ')}
    });

    Thread t2 = new Thread(() -> {
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

  return { name, code };
}

function getInvocation({ arguments: args, id, method }: Invocation, idx: ResultIndex): string {
  const { name, void: isVoid } = method;
  const invocation = `obj.${name}(${args.join(', ')})`;

  if (isVoid)
    return `${invocation};`;

  return `results[${idx.get(id)}] = resultToString(${invocation});`;
}
