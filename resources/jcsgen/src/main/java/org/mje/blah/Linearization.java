package org.mje.blah;

import java.util.*;
import java.util.stream.*;
import java.util.logging.*;

public class Linearization implements Iterable<Invocation> {
    static Logger logger = Logger.getLogger("linearization");

    final List<Invocation> sequence;
    final PartialOrder<Invocation> remainder;
    final boolean weak;

    Linearization(PartialOrder<Invocation> remainder) {
        this(remainder, false);
    }

    Linearization(PartialOrder<Invocation> remainder, boolean weak) {
        this.sequence = new LinkedList<>();
        this.remainder = remainder;
        this.weak = weak;
    }

    boolean isComplete() {
        return remainder.isEmpty();
    }

    boolean isWeak() {
        return weak;
    }

    Linearization extend(Invocation i) {
        return extend(i, false);
    }

    Linearization extend(Invocation i, boolean weak) {
        assert remainder.contains(i);
        Linearization that = new Linearization(this.remainder.drop(i), this.weak || weak);
        for (Invocation j : this.sequence)
            that.sequence.add(j);
        that.sequence.add(i);
        return that;
    }

    public Iterator<Invocation> iterator() {
        return sequence.iterator();
    }

    public String toString() {
        return "linearization { sequence: " + sequence + ", " +
            (isComplete() ? "" : "remainder: " + remainder + ", ") +
            "weak: " + this.weak + " }";
    }

    static List<Linearization> enumerate(
            PartialOrder<Invocation> happensBefore,
            boolean relaxHappensBefore) {

        logger.fine("computing linearizations of: " + happensBefore);

        List<Linearization> linearizations = new LinkedList<>();
        Queue<Linearization> partials = new LinkedList<>();

        PartialOrder<Invocation> relaxedHappensBefore = happensBefore;
        if (relaxHappensBefore) {
            for (Invocation i : relaxedHappensBefore) {
                if (!i.isAtomic()) {
                    logger.finest("relaxing happens before for invocation: " + i);
                    relaxedHappensBefore = relaxedHappensBefore.drop(i);
                    relaxedHappensBefore.add(i);
                }
            }
            logger.finer("relaxed happens before: " + relaxedHappensBefore);
        }

        partials.add(new Linearization(relaxedHappensBefore));

        while (!partials.isEmpty()) {
            Linearization p = partials.poll();
            logger.finer("processing: " + p);

            if (p.isComplete()) {
                linearizations.add(p);

            } else {
                Set<Invocation> minimals = p.remainder.getMinimals();
                for (Invocation i : minimals) {
                    boolean weak = minimals.stream()
                        .anyMatch(j -> happensBefore.isBefore(j,i));
                    partials.offer(p.extend(i, weak));
                }
            }
        }

        if (logger.isLoggable(Level.FINE)) {
            logger.fine("computed " + linearizations.size() + " linearizations");
            for (Linearization s : linearizations)
                logger.fine("" + s);
        }
        return linearizations;
    }
}
