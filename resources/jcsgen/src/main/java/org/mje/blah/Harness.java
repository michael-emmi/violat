package org.mje.blah;

import java.lang.reflect.*;
import java.util.*;
import java.util.stream.*;

public class Harness {

    Invocation constructor;
    PartialOrder<InvocationSequence> sequences;
    Map<Invocation,Integer> numbering;

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
    }

    public Invocation getConstructor() {
        return constructor;
    }

    public PartialOrder<InvocationSequence> getSequences() {
        return sequences;
    }

    public Map<Invocation,Integer> getNumbering() {
        return numbering;
    }

    public String toString() {
        return sequences.toString();
    }
}
