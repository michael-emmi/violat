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

    boolean inInitial(Invocation invocation) {
        return getInitial().map(i -> i.getInvocations().contains(invocation)).orElse(false);
    }

    Map<Invocation,Integer> getNumbering() {
        Map<Invocation,Integer> numbering = new HashMap<>();

        Invocation[] invocations = new Invocation[harness.getNumbering().size()];
        for (Invocation i : harness.getNumbering().keySet())
            if (!i.isVoid() && !inInitial(i))
                invocations[harness.getNumbering().get(i)-1] = i;

        int count = 0;
        for (int i = 0; i < invocations.length; i++)
            if (invocations[i] != null)
                numbering.put(invocations[i], ++count);

        return numbering;
    }

    void harness() {

        InvocationSequence
            initial = getInitial().orElse(null),
            arbiter = getArbiter().orElse(null);

        Class<?> _class = harness.getConstructor().getMethod().getDeclaringClass();
        Map<Invocation,Integer> numbering = getNumbering();

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
                        declaration = "public Test()";

                    } else if (seq.equals(arbiter)) {
                        line("@Arbiter");
                        declaration =
                            "public void arbiter" +
                            "(StringResult" + numbering.size() + " result)";

                    } else {
                        line("@Actor");
                        declaration =
                            "public void actor" + ++seqNum +
                            "(StringResult" + numbering.size() + " result)";
                    }

                    scope(declaration, () -> {
                        for (Invocation i : seq.getInvocations()) {
                            if (i.isVoid() || seq.equals(initial))
                                line("obj." + i + ";");
                            else
                                line("result.r" + numbering.get(i) + " = String.valueOf(obj." + i + ");");
                        }
                    });
                }
            });
        });
    }

    String result(Map<Integer,Object> r) {
        Map<Invocation,Integer> numbering = harness.getNumbering();
        Set<Integer> initials =
            getInitial()
            .map(i -> i.getInvocations().stream().map(numbering::get))
            .orElse(Stream.empty())
            .collect(Collectors.toSet());

        Set<Integer> voids =
            numbering.keySet().stream()
            .filter(Invocation::isVoid).map(numbering::get)
            .collect(Collectors.toSet());

        return IntStream.range(1, r.size()+1)
            .filter(i -> !initials.contains(i) && !voids.contains(i))
            .mapToObj(i -> String.valueOf(r.get(i)))
            .collect(Collectors.joining(", "));
    }

    public String toString() {
        return stringWriter.toString();
    }
}
