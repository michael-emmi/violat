package org.mje.blah;

import java.util.*;
import java.util.logging.*;
import java.util.stream.*;

public class Visibility {
    static Logger logger = Logger.getLogger("visibility");

    final Map<Invocation,Set<Invocation>> visibilityMap;
    final boolean weak;

    public Visibility(Iterable<Invocation> invocations) {
        this.visibilityMap = new HashMap<>();
        invocations.forEach(i -> this.visibilityMap.put(i, new HashSet<>(Collections.singleton(i))));
        this.weak = false;
    }
    public Visibility(Visibility that) {
        this(that, false);
    }
    public Visibility(Visibility that, boolean weak) {
        this.visibilityMap = new HashMap<>();
        for (Invocation i : that.visibilityMap.keySet())
            this.visibilityMap.put(i, new HashSet<>(that.visibilityMap.get(i)));
        this.weak = that.weak || weak;
    }
    public Visibility extend(boolean weak) {
        return new Visibility(this, weak);
    }
    public Visibility extend(Invocation source, Invocation target) {
        Visibility that = new Visibility(this);
        that.visibilityMap.get(source).add(target);
        return that;
    }
    public boolean isVisible(Invocation source, Invocation target) {
        return visibilityMap.get(source).contains(target);
    }
    public Set<Invocation> visibleSet(Invocation source) {
        return visibilityMap.get(source);
    }
    public boolean isWeak() {
        return weak;
    }
    public String toString() {
        return "visibility {\n" + visibilityMap.entrySet()
            .stream()
            .map(e -> "" + e.getKey() + ": " + e.getValue())
            .collect(Collectors.joining("\n  ", "  ", "\n")) +
            "  weak: " + weak + "\n}";
    }

    public static Collection<Visibility> enumerate(
            PartialOrder<Invocation> happensBefore,
            Iterable<Invocation> linearization,
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

                    if (base.isVisible(i,j)) {
                        nextWorkList.add(base);

                    } else {
                        if (weakAtomicity && (!i.isAtomic() || !j.isAtomic()))
                            nextWorkList.add(base.extend(happensBefore.isBefore(j,i)));

                        if (!happensBefore.isBefore(i,j))
                            nextWorkList.add(base.extend(i,j));
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
                visibility.visibilityMap.get(i).add(j);

        logger.finest("minimal visibility: " + visibility);
        return visibility;
    }
}
