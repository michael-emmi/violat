package org.mje.blah;

import java.util.*;
import java.util.logging.*;

public class Linearization {
    static Logger logger = Logger.getLogger("linearization");

    static class PartialLinearization {
        InvocationSequence sequence;
        PartialOrder<Invocation> remainder;
        public PartialLinearization(InvocationSequence s, PartialOrder<Invocation> o) {
            this.sequence = s;
            this.remainder = o;
        }
        public InvocationSequence getSequence() { return sequence; }
        public PartialOrder<Invocation> getRemainder() { return remainder; }
    }

    static List<InvocationSequence> enumerate(PartialOrder<Invocation> happensBefore) {
        logger.fine("computing linearizations of: " + happensBefore);

        List<InvocationSequence> linearizations = new LinkedList<>();
        Queue<PartialLinearization> partials = new LinkedList<>();
        partials.add(new PartialLinearization(new InvocationSequence(), happensBefore));

        while (!partials.isEmpty()) {
            PartialLinearization p = partials.poll();
            InvocationSequence sequence = p.getSequence();
            PartialOrder<Invocation> remainder = p.getRemainder();

            if (remainder.isEmpty()) {
                logger.finer("got complete linearization: " + sequence);
                linearizations.add(sequence);

            } else {
                logger.finest("got partial linearization: " + sequence);
                logger.finest("with remainder: " + remainder);

                for (Invocation i : remainder.getMinimals())
                    partials.offer(new PartialLinearization(
                        sequence.snoc(i),
                        remainder.drop(i)));
            }
        }

        logger.fine("computed " + linearizations.size() + " linearizations: " + linearizations);
        return linearizations;
    }
}
