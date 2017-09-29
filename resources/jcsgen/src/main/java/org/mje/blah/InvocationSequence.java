package org.mje.blah;

import java.util.*;
import java.util.stream.*;

public class InvocationSequence implements Iterable<Invocation> {
    List<Invocation> invocations;

    public InvocationSequence(List<Invocation> invocations) {
        this.invocations = Collections.unmodifiableList(invocations);
    }

    public InvocationSequence(Invocation... invocations) {
        this(Arrays.asList(invocations));
    }

    public InvocationSequence() {
        this(Collections.emptyList());
    }

    public Iterator<Invocation> iterator() {
        return invocations.iterator();
    }

    public Invocation head() {
        return invocations.get(0);
    }

    public InvocationSequence tail() {
        List<Invocation> invocations = new LinkedList<>(this.invocations);
        invocations.remove(0);
        return new InvocationSequence(invocations);
    }

    public InvocationSequence snoc(Invocation i) {
        List<Invocation> invocations = new LinkedList<>(this.invocations);
        invocations.add(i);
        return new InvocationSequence(invocations);
    }

    public Invocation last() {
        return invocations.isEmpty() ? null : invocations.get(invocations.size() - 1);
    }

    public String toString() {
        return invocations.stream()
            .map(Invocation::toString)
            .collect(Collectors.joining("; ", "[", "]"));
    }

    public int size() {
        return invocations.size();
    }

    public InvocationSequence prefix(int length) {
        return new InvocationSequence(
            invocations.stream().limit(length).collect(Collectors.toList())
        );
    }

    public InvocationSequence projection(Collection<Invocation> invocations) {
        return new InvocationSequence(
            this.invocations.stream().filter(i -> invocations.contains(i)).collect(Collectors.toList())
        );
    }
}
