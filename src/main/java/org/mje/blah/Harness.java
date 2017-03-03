package org.mje.blah;

import java.lang.reflect.*;
import java.util.*;
import java.util.stream.*;

public class Harness {

    String pack;
    String name;
    Invocation constructor;
    Vector<Invocation> invocations;
    Vector<List<Integer>> sequences;
    List<List<Integer>> rounds;
    Set<Map<Integer,Object>> results;

    public Harness(Invocation constructor, List<Invocation> invocations,
            List<List<Integer>> sequences, List<List<Integer>> rounds) {
        this.pack = "org.mje.auto";
        this.name = "AutogenHarness";
        this.constructor = constructor;
        this.invocations = new Vector<>(invocations);
        this.sequences = new Vector<>(sequences);
        this.rounds = rounds;
        this.results = null;
    }

    public String getPackage() {
        return pack;
    }

    public String getName() {
        return name;
    }

    public Invocation getConstructor() {
        return constructor;
    }

    public Vector<Invocation> getInvocations() {
        return invocations;
    }

    public Vector<List<Integer>> getSequences() {
        return sequences;
    }

    public List<List<Integer>> getRounds() {
        return rounds;
    }

    public Set<Map<Integer,Object>> getResults() {
        if (results == null) {
            results = new HashSet<>();

            for (List<Integer> seq : getLinearizations())
                results.add(collectResult(seq));
        }
        return results;
    }

    List<List<Integer>> getLinearizations() {
        List<List<Integer>> linearizations = new LinkedList<>();
        linearizations.add(new LinkedList<>());

        for (List<Integer> seqs : rounds) {
            List<List<Integer>> next = new LinkedList<>();

            Queue<Map.Entry<List<Integer>,Map<Integer,Queue<Integer>>>> partials
                = new LinkedList<>();

            List<Integer> initPartial = new LinkedList<>();
            Map<Integer, Queue<Integer>> initBuffers = new HashMap<>();
            for (int i : seqs)
                initBuffers.put(i, new LinkedList<>(sequences.get(i)));

            partials.offer(new AbstractMap.SimpleEntry<>(initPartial, initBuffers));

            while (!partials.isEmpty()) {
                Map.Entry<List<Integer>,Map<Integer,Queue<Integer>>> e = partials.poll();

                if (e.getValue().isEmpty()) {
                    for (List<Integer> prev : linearizations)
                        next.add(Stream.concat(prev.stream(), e.getKey().stream()).collect(Collectors.toList()));

                } else {
                    for (int i : e.getValue().keySet()) {
                        List<Integer> partial = new LinkedList<>(e.getKey());
                        Map<Integer, Queue<Integer>> buffers = new HashMap<>(e.getValue());
                        buffers.put(i, new LinkedList<>(buffers.get(i)));
                        partial.add(buffers.get(i).poll());
                        if (buffers.get(i).isEmpty())
                            buffers.remove(i);
                        partials.offer(new AbstractMap.SimpleEntry<>(partial, buffers));
                    }
                }
            }
            linearizations = next;
        }

        return linearizations;
    }

    Map<Integer,Object> collectResult(List<Integer> sequence) {
        Map<Integer,Object> result = new HashMap<>();

        try {
            Object obj =
                ((Constructor<?>) constructor.getMethod())
                .newInstance(constructor.getArguments());

            for (int i : sequence)
                result.put(i,
                    ((Method) invocations.get(i).getMethod())
                    .invoke(obj, invocations.get(i).getArguments())
                );

        } catch (Exception e) {
            throw new RuntimeException("BAD CLASSES: " + e);
        }

        return result;
    }
}
