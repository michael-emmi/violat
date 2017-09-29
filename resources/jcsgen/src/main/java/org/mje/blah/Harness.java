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
    Map<Invocation,Integer> numbering;

    public Harness(
            Invocation constructor,
            PartialOrder<InvocationSequence> sequences) {

        this.constructor = constructor;
        this.sequences = sequences;

        int count = 0;
        this.numbering = new HashMap<>();
        for (InvocationSequence sequence : sequences)
            for (Invocation i : sequence)
                numbering.put(i, ++count);

        this.happensBefore = new PartialOrder<>(numbering.keySet());
        for (InvocationSequence s : sequences) {
            Invocation i = null;
            for (Invocation j : s)
                if (i == null) i = j; else this.happensBefore.add(i,j);
            for (InvocationSequence t : sequences.getSuccessors(s))
                this.happensBefore.add(s.last(), t.head());
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

    public Map<Invocation,Integer> getNumbering() {
        return numbering;
    }

    public String toString() {
        return sequences.toString();
    }
}
