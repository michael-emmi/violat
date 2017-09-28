package org.mje.blah;

import java.util.*;
import java.util.stream.*;

public class Visibility {
    Map<Invocation,Set<Invocation>> visibilityMap;

    public Visibility(Collection<Invocation> invocations) {
        visibilityMap = new HashMap<>();
        invocations.forEach(i -> visibilityMap.put(i, new HashSet<>(Collections.singleton(i))));
    }
    public void add(Invocation source, Invocation target) {
        visibilityMap.get(source).add(target);
    }
    public boolean isVisible(Invocation source, Invocation target) {
        return visibilityMap.get(source).contains(target);
    }
    public Set<Invocation> visibleSet(Invocation source) {
        return visibilityMap.get(source);
    }
    public boolean isComplete() {
        return false;
    }
    public String toString() {
        return visibilityMap.toString();
    }

    static List<Visibility> enumerate(InvocationSequence sequence, boolean weakAtomicity) {
        List<Visibility> relations = new LinkedList<>();

        Visibility v = new Visibility(sequence.getInvocations());
        sequence.getInvocations().forEach(i ->
            sequence.getInvocations().forEach(j -> v.add(i,j)));
        relations.add(v);

        if (weakAtomicity) {
            // TODO add all variations
            relations.add(new Visibility(sequence.getInvocations()));
        }
        return relations;
    }
}
