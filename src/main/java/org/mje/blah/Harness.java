package org.mje.blah;

import java.lang.reflect.*;
import java.util.*;
import java.util.stream.*;

public class Harness {

    String pack;
    String name;
    Invocation constructor;
    PartialOrder<InvocationSequence> sequences;
    Map<Invocation,Integer> invocations;
    Set<Map<Integer,Object>> results;

    public Harness(
            Invocation constructor,
            PartialOrder<InvocationSequence> sequences) {

        this.pack = "org.mje.auto";
        this.name = "AutogenHarness";

        this.constructor = constructor;
        this.sequences = sequences;

        int count = 0;
        this.invocations = new HashMap<>();
        for (InvocationSequence sequence : sequences.getNodes())
            for (Invocation i : sequence.getInvocations())
                invocations.put(i, ++count);

        this.results = null;
    }

    public String getPackage() {
        return pack;
    }

    public String getName() {
        return name;
    }

    public Invocation getConstructor() {
        return constructor;
    }

    public PartialOrder<InvocationSequence> getSequences() {
        return sequences;
    }

    public Map<Invocation,Integer> getInvocations() {
        return invocations;
    }

    public Set<Map<Integer,Object>> getResults() {
        if (results == null) {
            results = new HashSet<>();

            for (InvocationSequence sequence : getLinearizations())
                results.add(collectResult(sequence));
        }
        return results;
    }

    public String toString() {
        return sequences.toString();
    }

    static class PartialLinearization {
        InvocationSequence sequence;
        PartialOrder<InvocationSequence> remainder;
        public PartialLinearization(InvocationSequence s, PartialOrder<InvocationSequence> o) {
            this.sequence = s;
            this.remainder = o;
        }
        public InvocationSequence getSequence() { return sequence; }
        public PartialOrder<InvocationSequence> getRemainder() { return remainder; }
    }

    List<InvocationSequence> getLinearizations() {
        List<InvocationSequence> linearizations = new LinkedList<>();

        Queue<PartialLinearization> partials = new LinkedList<>();
        partials.add(new PartialLinearization(new InvocationSequence(), sequences));

        while (!partials.isEmpty()) {
            PartialLinearization p = partials.poll();
            InvocationSequence sequence = p.getSequence();
            PartialOrder<InvocationSequence> remainder = p.getRemainder();

            if (remainder.isEmpty())
                linearizations.add(sequence);

            else {
                for (InvocationSequence s : remainder.getMinimals()) {
                    PartialOrder<InvocationSequence> rest = remainder.clone();

                    Invocation head = s.head();
                    InvocationSequence tail = s.tail();

                    partials.offer(new PartialLinearization(
                        sequence.snoc(head),
                        tail.getInvocations().isEmpty()
                            ? rest.drop(s)
                            : rest.replace(s, tail)
                    ));
                }
            }
        }
        return linearizations;
    }

    Map<Integer,Object> collectResult(InvocationSequence sequence) {
        Map<Integer,Object> result = new HashMap<>();

        try {
            Object obj = constructor.invoke();
            for (Invocation i : sequence.getInvocations())
                result.put(invocations.get(i), i.invoke(obj));

        } catch (Exception e) {
            throw new RuntimeException("BAD CLASSES: " + e);
        }
        return result;
    }
}
