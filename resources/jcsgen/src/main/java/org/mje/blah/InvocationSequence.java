package org.mje.blah;

import java.util.*;
import java.util.stream.*;

public class InvocationSequence implements Iterable<Invocation> {
    final List<Invocation> invocations;

    public InvocationSequence(List<Invocation> invocations) {
        this.invocations = Collections.unmodifiableList(invocations);
    }

    public InvocationSequence() {
        this(Collections.emptyList());
    }

    public Iterator<Invocation> iterator() {
        return invocations.iterator();
    }

    public String toString() {
        return "sequence " + invocations.stream()
            .map(Invocation::toString)
            .collect(Collectors.joining("; ", "[", "]"));
    }
}
