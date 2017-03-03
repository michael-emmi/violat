package org.mje.blah;

import java.io.*;
import java.util.*;
import java.util.function.*;
import java.util.stream.*;

public class JCStressHarnessPrinter {

    Harness harness;
    StringWriter stringWriter;
    PrintWriter printWriter;
    int indentation;

    public JCStressHarnessPrinter(Harness harness) {
        this.harness = harness;
        stringWriter = new StringWriter();
        printWriter = new PrintWriter(stringWriter);
        indentation = 0;
        harness();
    }

    void indent(int n) {
        indentation = Math.max(0, indentation + n);
    }

    void line() {
        line("");
    }

    void line(String s) {
        if (indentation > 0)
            printWriter.print(String.format("%" + indentation + "s", ""));
        printWriter.println(s);
    }

    void scope(String head, Runnable body) {
        line(head + " {");
        indent(4);
        body.run();
        indent(-4);
        line("}");
    }

    void harness() {
        Class<?> klass = harness.getConstructor().getMethod().getDeclaringClass();
        Map<Invocation,Integer> invocations = harness.getInvocations();

        line("package " + harness.getPackage() + ";");
        line("import org.openjdk.jcstress.annotations.*;");
        line("import org.openjdk.jcstress.infra.results.*;");
        line("import " + klass.getName() + ";");
        line();

        scope("public class " + harness.getName(), () -> {
            int testNum = 0;
            line();
            line("@JCStressTest");
            for (Map<Integer,Object> r : harness.getResults())
                line("@Outcome(id = \"[" + result(r) + "]\", expect = Expect.ACCEPTABLE)");

            line("@State");
            scope("public static class Test" + ++testNum, () -> {
                int seqNum = 0;
                line(klass.getName() + " obj = new " + harness.getConstructor() + ";");

                for (InvocationSequence seq : harness.getSequences().getNodes()) {
                    line();
                    line(annotation());
                    scope("public void seq" + ++seqNum + "(StringResult" + invocations.size() + " result)", () -> {
                        for (Invocation i : seq.getInvocations()) {
                            if (i.isVoid()) {
                                line("obj." + i + "; result.r" + invocations.get(i) + " = null;");
                            } else
                                line("result.r" + invocations.get(i) + " = String.valueOf(obj." + i + ");");
                        }
                    });
                }
            });
        });
    }

    String result(Map<Integer,Object> r) {
        return IntStream.range(1, r.size()+1)
            .mapToObj(i -> String.valueOf(r.get(i)))
            .collect(Collectors.joining(", "));
    }

    String annotation() {
        return "@Actor";
    }

    public String toString() {
        return stringWriter.toString();
    }
}
