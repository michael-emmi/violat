package org.mje.blah;

import java.io.*;
import java.lang.reflect.*;
import java.util.*;
import java.util.concurrent.atomic.*;
import java.util.function.*;
import java.util.stream.*;

public class JCStressHarnessPrinter {

    Collection<Harness> harnesses;
    String className;
    StringWriter stringWriter;
    PrintWriter printWriter;
    int indentation;

    public JCStressHarnessPrinter(String className, Collection<Harness> harnesses) {
        this.className = className;
        this.harnesses = harnesses;

        stringWriter = new StringWriter();
        printWriter = new PrintWriter(stringWriter);
        indentation = 0;

        if (!harnesses.stream().allMatch(JCStressHarnessPrinter::isRepresentable))
            throw new RuntimeException("Unable to represent harness.");

        harness();
    }

    String packageName() {
        String[] pieces = this.className.split("[.]");
        return String.join(".", Arrays.copyOf(pieces, pieces.length-1));
    }

    String className() {
        String[] pieces = this.className.split("[.]");
        return pieces[pieces.length-1];
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

    static boolean isRepresentable(Harness h) {
        PartialOrder<InvocationSequence> sequences = h.getSequences();

        InvocationSequence
            initial = getInitial(h).orElse(null),
            arbiter = getArbiter(h).orElse(null);

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

    static Optional<InvocationSequence> getInitial(Harness h) {
        Set<InvocationSequence> minimals = h.getSequences().getMinimals();
        return minimals.size() == 1
            ? Optional.of(minimals.iterator().next())
            : Optional.empty();
    }

    static Optional<InvocationSequence> getArbiter(Harness h) {
        Set<InvocationSequence> maximals = h.getSequences().getMaximals();
        return maximals.size() == 1
            ? Optional.of(maximals.iterator().next())
            : Optional.empty();
    }

    static boolean inInitial(Harness h, Invocation invocation) {
        return getInitial(h).map(i -> i.getInvocations().contains(invocation)).orElse(false);
    }

    static Map<Invocation,Integer> getNumbering(Harness h) {
        Map<Invocation,Integer> numbering = new HashMap<>();

        Invocation[] invocations = new Invocation[h.getNumbering().size()];
        for (Invocation i : h.getNumbering().keySet())
            if (!i.isVoid() && !inInitial(h,i))
                invocations[h.getNumbering().get(i)-1] = i;

        int count = 0;
        for (int i = 0; i < invocations.length; i++)
            if (invocations[i] != null)
                numbering.put(invocations[i], ++count);

        return numbering;
    }

    void harness() {
        line("package " + packageName() + ";");
        line("import org.openjdk.jcstress.annotations.*;");
        line("import org.openjdk.jcstress.infra.results.*;");
        line("import java.util.Arrays;");

        harnesses.stream()
            .map(Harness::getConstructor)
            .map(Invocation::getMethod)
            .map(Executable::getDeclaringClass)
            .map(Class::getName)
            .distinct()
            .forEach(_class -> line("import " + _class + ";"));

        line();

        scope("public class " + className(), () -> {
            AtomicInteger idx = new AtomicInteger();
            harnesses.stream().forEach(harness -> {

                InvocationSequence
                    initial = getInitial(harness).orElse(null),
                    arbiter = getArbiter(harness).orElse(null);

                Class<?> _class = harness.getConstructor().getMethod().getDeclaringClass();
                Map<Invocation,Integer> numbering = getNumbering(harness);

                line();
                line("@JCStressTest");

                harness.getResults().stream()
                    .map(r -> result(harness, r))
                    .distinct()
                    .forEach(r -> {
                        line("@Outcome(id = \"[" + r + "]\", expect = Expect.ACCEPTABLE)");
                    });

                line("@State");
                scope("public static class T" + idx.incrementAndGet(), () -> {
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
                                    line("obj." + ofInvocation(i) + ";");
                                else
                                    line("result.r" + numbering.get(i) + " = ResultAdapter.get(obj." + ofInvocation(i) + ");");
                            }
                        });
                    }
                });
            });
        });
    }

    static String result(Harness h, Map<Integer,Object> r) {
        Map<Invocation,Integer> numbering = h.getNumbering();
        Set<Integer> initials =
            getInitial(h)
            .map(i -> i.getInvocations().stream().map(numbering::get))
            .orElse(Stream.empty())
            .collect(Collectors.toSet());

        Set<Integer> voids =
            numbering.keySet().stream()
            .filter(Invocation::isVoid).map(numbering::get)
            .collect(Collectors.toSet());

        return IntStream.range(1, r.size()+1)
            .filter(i -> !initials.contains(i) && !voids.contains(i))
            .mapToObj(i -> ofResult(r.get(i)))
            .collect(Collectors.joining(", "));
    }

    public String toString() {
        return stringWriter.toString();
    }

    static String ofInvocation(Invocation i) {
        return i.getMethod().getName() + "("
            + Arrays.stream(i.getArguments()).map(JCStressHarnessPrinter::ofArgument)
                .collect(Collectors.joining(", "))
            + ")";
    }

    static String ofArgument(Object a) {
        if (a instanceof Collection)
            return "Arrays.asList("
                + ((Collection) a).stream().map(JCStressHarnessPrinter::ofArgument)
                    .collect(Collectors.joining(", "))
                + ")";
        else
            return a.toString();
    }

    static String ofResult(Object a) {
        if (a instanceof Object[])
            return "[" + Arrays.stream((Object[]) a)
                .map(JCStressHarnessPrinter::ofResult)
                .collect(Collectors.joining(",")) + "]";

        else
            return String.valueOf(a);
    }
}
