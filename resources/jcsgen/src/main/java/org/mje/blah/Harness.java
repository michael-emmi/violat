package org.mje.blah;

import java.lang.reflect.*;
import java.util.*;
import java.util.logging.*;
import java.util.stream.*;

public class Harness implements Iterable<InvocationSequence> {
    static Logger logger = Logger.getLogger("harness");

    Invocation constructor;
    PartialOrder<InvocationSequence> sequences;
    PartialOrder<Invocation> happensBefore;

    public Harness(
            Invocation constructor,
            PartialOrder<InvocationSequence> sequences) {

        this.constructor = constructor;
        this.sequences = sequences;

        this.happensBefore = new PartialOrder<>();
        for (InvocationSequence s : sequences)
            for (Invocation i : s)
                this.happensBefore.add(i);

        for (InvocationSequence s : sequences) {
            Invocation prev = null;
            for (Invocation i : s) {
                if (prev != null)
                    this.happensBefore.add(prev, i);
                prev = i;
            }
            for (InvocationSequence t : sequences.getSuccessors(s)) {
                for (Invocation first : t) {
                    this.happensBefore.add(prev, first);
                    break;
                }
            }
        }
        logger.fine("created harness: " + this);
        logger.fine("happens before: " + this.happensBefore);
    }

    public Iterator<InvocationSequence> iterator() {
        return sequences.iterator();
    }

    public Invocation getConstructor() {
        return constructor;
    }

    public PartialOrder<InvocationSequence> getSequences() {
        return sequences;
    }

    public PartialOrder<Invocation> getHappensBefore() {
        return happensBefore;
    }

    public String toString() {
        return sequences.toString();
    }
}
