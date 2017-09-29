package org.mje.blah;

import java.util.*;
import java.util.stream.*;
import java.util.logging.*;

public class Linearization {
    static Logger logger = Logger.getLogger("linearization");

    static class PartialLinearization {
        final InvocationSequence sequence;
        final PartialOrder<Invocation> remainder;
        public PartialLinearization(
                InvocationSequence sequence,
                PartialOrder<Invocation> remainder) {
            this.sequence = sequence;
            this.remainder = remainder;
        }
    }

    static List<InvocationSequence> enumerate(
            PartialOrder<Invocation> happensBefore,
            boolean relaxHappensBefore) {

        logger.fine("computing linearizations of: " + happensBefore);

        List<InvocationSequence> linearizations = new LinkedList<>();
        Queue<PartialLinearization> partials = new LinkedList<>();

        if (relaxHappensBefore) {
            for (Invocation i : happensBefore) {
                if (!i.isAtomic()) {
                    logger.finest("relaxing happens before for invocation: " + i);
                    happensBefore = happensBefore.drop(i);
                    happensBefore.add(i);
                }
            }
            logger.finer("relaxed happens before: " + happensBefore);
        }

        partials.add(new PartialLinearization(new InvocationSequence(), happensBefore));

        while (!partials.isEmpty()) {
            PartialLinearization p = partials.poll();

            if (p.remainder.isEmpty()) {
                logger.finer("got complete linearization: " + p.sequence);
                linearizations.add(p.sequence);

            } else {
                logger.finest("got partial linearization: " + p.sequence);
                logger.finest("with remainder: " + p.remainder);

                for (Invocation i : p.remainder.getMinimals())
                    partials.offer(new PartialLinearization(
                        p.sequence.snoc(i),
                        p.remainder.drop(i)));
            }
        }

        if (logger.isLoggable(Level.FINE)) {
            logger.fine("computed " + linearizations.size() + " linearizations");
            for (InvocationSequence s : linearizations)
                logger.fine("" + s);
        }
        return linearizations;
    }
}
