package org.mje.blah;

import java.util.*;
import java.util.logging.*;
import java.util.stream.*;

public class Visibility {
    static Logger logger = Logger.getLogger("visibility");

    Map<Invocation,Set<Invocation>> visibilityMap;

    public Visibility(Iterable<Invocation> invocations) {
        visibilityMap = new HashMap<>();
        invocations.forEach(i -> visibilityMap.put(i, new HashSet<>(Collections.singleton(i))));
    }
    public Visibility(Visibility that) {
        this.visibilityMap = new HashMap<>();
        for (Invocation i : that.visibilityMap.keySet())
            this.visibilityMap.put(i, new HashSet<>(that.visibilityMap.get(i)));
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

    public static Collection<Visibility> enumerate(
            PartialOrder<InvocationSequence> sequences,
            InvocationSequence linearization,
            boolean weakAtomicity,
            boolean relaxHappensBefore) {

        logger.fine("computing visibility for linearization: " + linearization);

        Visibility minimal = minimalVisibility(sequences, !relaxHappensBefore);
        Queue<Visibility> workList = new LinkedList<>();
        workList.offer(minimal);

        List<Invocation> previous = new LinkedList<>();
        for (Invocation i : linearization) {
            for (Invocation j : previous) {
                Queue<Visibility> nextWorkList = new LinkedList<>();
                while (!workList.isEmpty()) {
                    Visibility base = workList.poll();
                    if (weakAtomicity || base.isVisible(i,j))
                        nextWorkList.add(base);

                    if (!base.isVisible(i,j)) {
                        Visibility extension = new Visibility(base);
                        extension.add(i,j);
                        nextWorkList.add(extension);
                    }
                }
                workList = nextWorkList;
            }
            previous.add(i);
        }
        logger.fine("got " + workList.size() + " visibility relations: " + workList);
        return workList;
    }

    static Visibility minimalVisibility(
            PartialOrder<InvocationSequence> sequences,
            boolean includesHappensBefore) {

        Map<Invocation, InvocationSequence> i2s = new HashMap<>();
        for (InvocationSequence s : sequences.getNodes())
            for (Invocation i : s)
                i2s.put(i,s);

        Visibility visibility = new Visibility(i2s.keySet());

        if (includesHappensBefore) {
            logger.finest("including happens before in visibility");
            assert sequences.getNodes().size() == 2 : "TODO: implement general case";
            assert sequences.getMinimals().size() == 2 : "TODO: implement general case";

            for (InvocationSequence s : sequences) {
                List<Invocation> previous = new LinkedList<>();
                for (Invocation i : s) {
                    for (Invocation j : previous)
                        visibility.add(i,j);
                    previous.add(i);
                }
            }
        }
        logger.finest("minimal visibility: " + visibility);
        return visibility;
    }
}
