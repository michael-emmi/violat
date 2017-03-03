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
        Vector<Invocation> invocations = harness.getInvocations();
        List<List<Integer>> rounds = harness.getRounds();

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

                for (List<Integer> seq : harness.getSequences()) {
                    line();
                    line(annotation());
                    scope("public void seq" + ++seqNum + "(StringResult" + invocations.size() + " result)", () -> {
                        for (int i : seq) {
                            if (invocations.get(i).isVoid()) {
                                line("obj." + invocations.get(i).toString() + "; result.r" + (i+1) + " = null;");
                            } else
                                line("result.r" + (i+1) + " = String.valueOf(obj." + invocations.get(i).toString() + ");");
                        }
                    });
                }
            });
        });
    }

    String result(Map<Integer,Object> r) {
        return IntStream.range(0, r.size())
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
