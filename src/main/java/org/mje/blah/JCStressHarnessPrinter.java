package org.mje.blah;

import java.io.*;
import java.util.*;
import java.util.function.*;
import java.util.stream.*;

public class JCStressHarnessPrinter {

    Harness harness;
    String packageName;
    String className;
    StringWriter stringWriter;
    PrintWriter printWriter;
    int indentation;

    public JCStressHarnessPrinter(String packageName, String className, Harness harness) {
        this.packageName = packageName;
        this.className = className;
        this.harness = harness;

        stringWriter = new StringWriter();
        printWriter = new PrintWriter(stringWriter);
        indentation = 0;

        if (!isRepresentable())
            throw new RuntimeException("Unable to represent harness.");

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

    boolean isRepresentable() {
        PartialOrder<InvocationSequence> sequences = harness.getSequences();

        InvocationSequence
            initial = getInitial().orElse(null),
            arbiter = getArbiter().orElse(null);

        for (InvocationSequence seq : sequences.getNodes()) {
            if (seq.equals(initial) || seq.equals(arbiter))
                continue;

            Set<InvocationSequence>
                predecessors = sequences.getPredecessors(seq),
                successors = sequences.getSuccessors(seq);

            if (predecessors.size() > 1 || successors.size() > 1)
                return false;

            if (!predecessors.isEmpty() && !predecessors.contains(initial))
                return false;

            if (!successors.isEmpty() && !successors.contains(arbiter))
                return false;
        }

        return true;
    }

    Optional<InvocationSequence> getInitial() {
        Set<InvocationSequence> minimals = harness.getSequences().getMinimals();
        return minimals.size() == 1
            ? Optional.of(minimals.iterator().next())
            : Optional.empty();
    }

    Optional<InvocationSequence> getArbiter() {
        Set<InvocationSequence> maximals = harness.getSequences().getMaximals();
        return maximals.size() == 1
            ? Optional.of(maximals.iterator().next())
            : Optional.empty();
    }

    void harness() {

        InvocationSequence
            initial = getInitial().orElse(null),
            arbiter = getArbiter().orElse(null);

        Class<?> _class = harness.getConstructor().getMethod().getDeclaringClass();
        Map<Invocation,Integer> numbering = harness.getNumbering();

        line("package " + this.packageName + ";");
        line("import org.openjdk.jcstress.annotations.*;");
        line("import org.openjdk.jcstress.infra.results.*;");
        line("import " + _class.getName() + ";");
        line();

        scope("public class " + this.className, () -> {
            line();
            line("@JCStressTest");
            for (Map<Integer,Object> r : harness.getResults())
                line("@Outcome(id = \"[" + result(r) + "]\", expect = Expect.ACCEPTABLE)");

            line("@State");
            scope("public static class Test", () -> {
                int seqNum = 0;
                line(_class.getSimpleName() + " obj = new " + harness.getConstructor() + ";");

                for (InvocationSequence seq : harness.getSequences().getNodes()) {
                    line();
                    String declaration;

                    if (seq.equals(initial)) {
                        declaration = "public Test";

                    } else if (seq.equals(arbiter)) {
                        line("@Arbiter");
                        declaration = "public void arbiter";

                    } else {
                        line("@Actor");
                        declaration = "public void actor" + ++seqNum;
                    }

                    scope(declaration + "(StringResult" + numbering.size() + " result)", () -> {
                        for (Invocation i : seq.getInvocations()) {
                            if (i.isVoid()) {
                                line("obj." + i + "; result.r" + numbering.get(i) + " = null;");
                            } else
                                line("result.r" + numbering.get(i) + " = String.valueOf(obj." + i + ");");
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

    public String toString() {
        return stringWriter.toString();
    }
}
