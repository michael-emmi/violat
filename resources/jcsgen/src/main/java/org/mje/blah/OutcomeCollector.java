package org.mje.blah;

import java.lang.reflect.*;
import java.util.*;
import java.util.logging.*;
import java.util.stream.*;

public class OutcomeCollector {
    static Logger logger = Logger.getLogger("outcomes");

    boolean weakAtomicity;
    boolean relaxLinHappensBefore;
    boolean relaxVisHappensBefore;
    boolean relaxReturns;

    public OutcomeCollector(
            boolean weakAtomicity,
            boolean relaxLinHappensBefore,
            boolean relaxVisHappensBefore,
            boolean relaxReturns) {

        this.weakAtomicity = weakAtomicity;
        this.relaxLinHappensBefore = weakAtomicity && relaxLinHappensBefore;
        this.relaxVisHappensBefore = weakAtomicity && relaxVisHappensBefore;
        this.relaxReturns = weakAtomicity && relaxReturns;
    }

    public Collection<Outcome> collect(Harness harness) {
        logger.fine("computing outcomes for harness: " + harness);
        logger.fine("weak atomicity: " + weakAtomicity);
        logger.fine("relax happens before for linearization: " + relaxLinHappensBefore);
        logger.fine("relax happens before for visibility: " + relaxVisHappensBefore);
        logger.fine("relax returns: " + relaxReturns);

        Collection<Outcome> outcomes = collect(
            harness.getConstructor(), harness.getHappensBefore());

        if (logger.isLoggable(Level.FINER)) {
            logger.finer("computed " + outcomes.size() + " outcomes");
            for (Outcome outcome : outcomes)
                logger.finer("" + outcome);
        }

        Collection<Outcome> minimals = minimalOutcomes(outcomes);

        if (logger.isLoggable(Level.FINE)) {
            logger.fine("computed " + minimals.size() + " unique outcomes");
            for (Outcome outcome : minimals)
                logger.fine("" + outcome);
        }

        return minimals;
    }

    Collection<Outcome> collect(
            Invocation constructor,
            PartialOrder<Invocation> happensBefore) {

        Collection<Outcome> outcomes = new LinkedList<>();

        for (Linearization linearization : Linearization.enumerate(happensBefore, relaxLinHappensBefore)) {
            logger.finer("linearization: " + linearization);

            for (Visibility visibility : Visibility.enumerate(happensBefore, linearization, weakAtomicity, relaxVisHappensBefore)) {
                logger.finer("visibility: " + visibility);
                Properties properties = new Properties();
                properties.put("W", false);
                properties.put("L", linearization.isWeak());
                properties.put("V", visibility.isWeak());
                properties.put("R", false);
                Outcome outcome = execute(constructor, linearization, visibility, properties);
                logger.finer("outcome: " + outcome);

                if (relaxReturns || properties.get("R").equals(false))
                    outcomes.add(outcome);
            }
        }
        return outcomes;
    }

    Outcome execute(
            Invocation constructor,
            Iterable<Invocation> sequence,
            Visibility visibility,
            Properties properties) {

        Outcome outcome = new Outcome(properties);
        List<Invocation> prefix = new LinkedList<>();

        for (Invocation i : sequence) {
            prefix.add(i);

            Iterable<Invocation> projection = prefix.stream()
                .filter(j -> visibility.visibleSet(i).contains(j))
                .collect(Collectors.toList());

            logger.finest("prefix: " + prefix);
            logger.finest("projection: " + projection);

            if (!prefix.equals(projection))
                properties.put("W", true);

            Outcome projected = execute(constructor, projection, properties);
            logger.finest("projected: " + projected);

            boolean consistent = outcome.combine(projected, Collections.singleton(i));
            if (!consistent)
                properties.put("R", true);

            logger.finest("cummulative: " + outcome);
        }

        return outcome;
    }

    Outcome execute(
            Invocation constructor,
            Iterable<Invocation> sequence,
            Properties properties) {

        Outcome outcome = new Outcome(properties);
        try {
            Object obj = constructor.invoke();
            for (Invocation i : sequence)
                outcome.put(i, Results.of(i.invoke(obj)));

        } catch (Exception e) {
            throw new RuntimeException("BAD CLASSES: " + e);
        }
        return outcome;
    }

    Collection<Outcome> minimalOutcomes(Collection<Outcome> outcomes) {
        Map<SortedMap<Invocation,String>, List<Outcome>> groups = outcomes.stream()
            .collect(Collectors.groupingBy(Outcome::getResults));

        for (List<Outcome> group : groups.values())
            for (Outcome outcome : group)
                outcome.frequency = group.size();

        for (SortedMap<Invocation,String> result : groups.keySet())
            for (Outcome outcome : new ArrayList<>(groups.get(result)))
                groups.get(result).removeIf(o ->  stricter(outcome, o));

        return groups.values().stream()
            .flatMap(l -> l.stream())
            .collect(Collectors.toSet());
    }

    boolean stricter(Outcome o1, Outcome o2) {
        return stricter(o1.properties, o2.properties);
    }

    boolean stricter(Properties p1, Properties p2) {
        return !p1.equals(p2) && p1.entrySet().stream().allMatch(e ->
            e.getValue().equals(false) ||
            e.getValue().equals(p2.get(e.getKey()))
        );
    }
}
