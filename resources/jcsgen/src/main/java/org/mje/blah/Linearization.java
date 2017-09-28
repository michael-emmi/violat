package org.mje.blah;

import java.util.*;

public class Linearization {
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

    static List<InvocationSequence> get(PartialOrder<InvocationSequence> sequences) {
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
}
