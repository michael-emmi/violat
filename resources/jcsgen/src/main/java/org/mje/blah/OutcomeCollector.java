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

    public Set<Outcome> collect(Harness harness) {
        logger.fine("computing outcomes for harness: " + harness);
        logger.fine("weak atomicity: " + weakAtomicity);
        logger.fine("relax happens before for linearization: " + relaxLinHappensBefore);
        logger.fine("relax happens before for visibility: " + relaxVisHappensBefore);
        logger.fine("relax returns: " + relaxReturns);

        Set<Outcome> outcomes = collect(
            harness.getConstructor(), harness.getHappensBefore(), harness.getNumbering());


        if (logger.isLoggable(Level.FINE)) {
            logger.fine("computed " + outcomes.size() + " unique outcomes");
            for (Outcome outcome : outcomes)
                logger.fine("" + outcome);
        }
        return outcomes;
    }

    Set<Outcome> collect(
            Invocation constructor,
            PartialOrder<Invocation> happensBefore,
            Map<Invocation,Integer> numbering) {

        Set<Outcome> outcomes = new HashSet<>();

        for (InvocationSequence linearization : Linearization.enumerate(happensBefore, relaxLinHappensBefore)) {
            logger.finer("linearization: " + linearization);

            for (Visibility visibility : Visibility.enumerate(happensBefore, linearization, weakAtomicity, relaxVisHappensBefore)) {
                logger.finer("visibility: " + visibility);

                Outcome outcome = execute(constructor, linearization, visibility, numbering);
                logger.finer("outcome: " + outcome);
                if (outcome != null)
                    outcomes.add(outcome);
            }
        }
        return outcomes;
    }

    Outcome execute(
            Invocation constructor,
            InvocationSequence sequence,
            Visibility visibility,
            Map<Invocation,Integer> numbering) {

        if (visibility.isComplete()) {
            return execute(constructor, sequence, numbering);

        } else {
            Outcome outcome = new Outcome();

            for (int i=1; i<=sequence.size(); i++) {
                InvocationSequence prefix = sequence.prefix(i);
                Invocation last = prefix.last();
                InvocationSequence projection = prefix.projection(visibility.visibleSet(last));
                logger.finest("prefix: " + prefix);
                logger.finest("projection: " + projection);

                Outcome newOutcome = execute(constructor, projection, numbering);
                logger.finest("projected: " + newOutcome);

                outcome = combineOutcomes(outcome, newOutcome);
                logger.finest("cummulative: " + outcome);

                if (outcome == null)
                    return null;
            }
            return outcome;
        }
    }

    Outcome execute(
            Invocation constructor,
            InvocationSequence sequence,
            Map<Invocation,Integer> numbering) {

        Outcome outcome = new Outcome();
        try {
            Object obj = constructor.invoke();
            for (Invocation i : sequence)
                outcome.put(numbering.get(i), Results.of(i.invoke(obj)));

        } catch (Exception e) {
            throw new RuntimeException("BAD CLASSES: " + e);
        }
        return outcome;
    }

    Outcome combineOutcomes(Outcome base, Outcome extension) {
        if (base.isEmpty())
            return extension;

        Outcome combined = new Outcome(base);
        for (int id : extension.keySet()) {
            if (!base.containsKey(id))
                combined.put(id, extension.get(id));
            else if (!compatibleReturnValue(id, extension.get(id), base.get(id)))
                return null;
        }
        return combined;
    }

    boolean compatibleReturnValue(Integer id, String r1, String r2) {
        return relaxReturns || r1.equals(r2);
    }
}
