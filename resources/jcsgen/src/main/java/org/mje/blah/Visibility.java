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
        return "visibility " + visibilityMap.entrySet()
            .stream()
            .map(e -> "" + e.getKey() + ": " + e.getValue())
            .collect(Collectors.joining("\n  ", "{\n  ", "\n}"));
    }

    public static Collection<Visibility> enumerate(
            PartialOrder<Invocation> happensBefore,
            InvocationSequence linearization,
            boolean weakAtomicity,
            boolean relaxHappensBefore) {

        logger.fine("computing visibility for: " + linearization);

        Visibility minimal = minimalVisibility(happensBefore, relaxHappensBefore);
        Queue<Visibility> workList = new LinkedList<>();
        workList.offer(minimal);

        List<Invocation> previous = new LinkedList<>();
        for (Invocation i : linearization) {
            for (Invocation j : previous) {
                Queue<Visibility> nextWorkList = new LinkedList<>();
                while (!workList.isEmpty()) {
                    Visibility base = workList.poll();

                    if (base.isVisible(i,j) || (weakAtomicity && (!i.isAtomic() || !j.isAtomic())))
                        nextWorkList.add(base);

                    if (!base.isVisible(i,j) && !happensBefore.isBefore(i,j)) {
                        Visibility extension = new Visibility(base);
                        extension.add(i,j);
                        nextWorkList.add(extension);
                    }
                }
                workList = nextWorkList;
            }
            previous.add(i);
        }

        if (logger.isLoggable(Level.FINE)) {
            logger.fine("computed " + workList.size() + " visibilities");
            for (Visibility v : workList)
                logger.fine("" + v);
        }
        return workList;
    }

    static Visibility minimalVisibility(
            PartialOrder<Invocation> happensBefore,
            boolean relaxHappensBefore) {

        Visibility visibility = new Visibility(happensBefore);

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

        logger.finest("including happens before in visibility");
        for (Invocation i : happensBefore)
            for (Invocation j : happensBefore.getPredecessors(i))
                visibility.add(i,j);

        logger.finest("minimal visibility: " + visibility);
        return visibility;
    }
}
