package org.mje.blah;

import java.lang.reflect.*;
import java.util.*;
import java.util.stream.*;

public class Harness {

    Invocation constructor;
    PartialOrder<InvocationSequence> sequences;
    Map<Invocation,Integer> numbering;
    Set<SortedMap<Integer,Object>> results;

    public Harness(
            Invocation constructor,
            PartialOrder<InvocationSequence> sequences) {

        this.constructor = constructor;
        this.sequences = sequences;

        int count = 0;
        this.numbering = new HashMap<>();
        for (InvocationSequence sequence : sequences.getNodes())
            for (Invocation i : sequence.getInvocations())
                numbering.put(i, ++count);

        this.results = null;
    }

    public Set<SortedMap<Integer,Object>> getResults() {
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

    SortedMap<Integer,Object> collectResult(InvocationSequence sequence) {
        SortedMap<Integer,Object> result = new TreeMap<>();

        try {
            Object obj = constructor.invoke();
            for (Invocation i : sequence.getInvocations())
                result.put(numbering.get(i), i.invoke(obj));

        } catch (Exception e) {
            throw new RuntimeException("BAD CLASSES: " + e);
        }
        return result;
    }
}
