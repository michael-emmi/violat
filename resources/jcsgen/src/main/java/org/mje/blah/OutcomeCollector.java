package org.mje.blah;

import java.lang.reflect.*;
import java.util.*;
import java.util.logging.*;
import java.util.stream.*;

public class OutcomeCollector {
    static Logger logger = Logger.getLogger("outcomes");

    boolean weakAtomicity;
    boolean relaxReturns;

    public OutcomeCollector(boolean weakAtomicity, boolean relaxReturns) {
        this.weakAtomicity = weakAtomicity;
        this.relaxReturns = weakAtomicity && relaxReturns;
    }

    public Set<SortedMap<Integer,String>> getOutcomes(Harness harness) {
        Set<SortedMap<Integer,String>> outcomes = new HashSet<>();

        logger.finer("computing outcomes for harness:\n" + harness);
        logger.finer("weak atomicity: " + weakAtomicity);
        logger.finer("relax returns: " + relaxReturns);

        for (InvocationSequence sequence : Linearization.get(harness.getSequences())) {
            logger.finest("sequence: " + sequence);
            outcomes.addAll(getOutcomes(harness, sequence));
        }

        logger.finer("got " + outcomes.size() + " unique outcomes: " + outcomes);

        return outcomes;
    }

    public Set<SortedMap<Integer,String>> getOutcomes(
            Harness harness,
            InvocationSequence sequence) {

        Set<SortedMap<Integer,String>> outcomes = new HashSet<>();

        if (weakAtomicity) {
            for (VisibilityRelation visibility : getVisibilities(sequence)) {
                logger.finest("visibility: " + visibility);
                SortedMap<Integer,String> outcome = getOutcome(harness, sequence, visibility);
                logger.finest("outcome: " + outcome);
                if (outcome != null)
                    outcomes.add(outcome);
            }
        } else {
            SortedMap<Integer,String> outcome = getOutcome(harness, sequence);
            logger.finest("outcome: " + outcome);
            outcomes.add(outcome);
        }
        return outcomes;
    }

    static class VisibilityRelation {
        Map<Invocation,Set<Invocation>> visibilityMap;

        public VisibilityRelation(Collection<Invocation> invocations) {
            visibilityMap = new HashMap<>();
            invocations.forEach(i -> visibilityMap.put(i, new HashSet<>(Collections.singleton(i))));
        }
        public void add(Invocation source, Invocation target) {
            visibilityMap.get(source).add(target);
        }
        public boolean isVisible(Invocation source, Invocation target) {
            return visibilityMap.get(source).contains(target);
        }
        public Set<Invocation> get(Invocation source) {
            return visibilityMap.get(source);
        }
        public String toString() {
            return visibilityMap.toString();
        }
    }

    List<VisibilityRelation> getVisibilities(InvocationSequence sequence) {
        List<VisibilityRelation> relations = new LinkedList<>();

        VisibilityRelation v = new VisibilityRelation(sequence.getInvocations());
        sequence.getInvocations().forEach(i ->
            sequence.getInvocations().forEach(j -> v.add(i,j)));
        relations.add(v);

        if (weakAtomicity) {
            // TODO add all variations
            relations.add(new VisibilityRelation(sequence.getInvocations()));
        }
        return relations;
    }

    boolean compatibleReturnValue(Integer id, String r1, String r2) {
        return relaxReturns || r1.equals(r2);
    }

    SortedMap<Integer,String> combineOutcomes(
            SortedMap<Integer,String> base,
            SortedMap<Integer,String> extension) {

        if (base == null)
            return extension;

        SortedMap<Integer,String> combined = new TreeMap<>(base);
        for (int id : extension.keySet()) {
            if (!base.containsKey(id))
                combined.put(id, extension.get(id));
            else if (!compatibleReturnValue(id, extension.get(id), base.get(id)))
                return null;
        }
        return combined;
    }

    SortedMap<Integer,String> getOutcome(
            Harness harness,
            InvocationSequence sequence,
            VisibilityRelation visibility) {

        SortedMap<Integer,String> outcome = null;

        for (int i=1; i<=sequence.size(); i++) {
            InvocationSequence prefix = sequence.prefix(i);
            Invocation last = prefix.last();
            InvocationSequence projection = prefix.projection(visibility.get(last));
            logger.finest("prefix / projection: " + prefix + " / " + projection);

            outcome = combineOutcomes(outcome, getOutcome(harness, projection));
            logger.finest("partial outcome: " + outcome);
            if (outcome == null)
                return null;
        }
        return outcome;
    }

    SortedMap<Integer,String> getOutcome(Harness harness, InvocationSequence sequence) {
        SortedMap<Integer,String> outcome = new TreeMap<>();
        try {
            Object obj = harness.getConstructor().invoke();
            for (Invocation i : sequence.getInvocations())
                outcome.put(harness.getNumbering().get(i), Results.of(i.invoke(obj)));

        } catch (Exception e) {
            throw new RuntimeException("BAD CLASSES: " + e);
        }
        return outcome;
    }
}
