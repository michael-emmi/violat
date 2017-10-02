package org.mje.blah;

import java.util.*;
import java.util.logging.*;
import java.util.stream.*;

public class Outcome {
    static Logger logger = Logger.getLogger("outcome");

    final SortedMap<Invocation,String> results;

    public Outcome() {
        this.results = new TreeMap<>();
    }

    public Outcome(Outcome that) {
        this.results = new TreeMap<>(that.results);
    }

    public int hashCode() {
        return this.results.hashCode();
    }

    public boolean equals(Object that) {
        return (that instanceof Outcome)
            ? this.results.equals(((Outcome) that).results)
            : false;
    }

    public void put(Invocation i, String result) {
        this.results.put(i, result);
    }

    public boolean isEmpty() {
        return this.results.isEmpty();
    }

    public boolean containsKey(Invocation key) {
        return this.results.containsKey(key);
    }

    public Set<Invocation> keySet() {
        return this.results.keySet();
    }

    public String get(Invocation key) {
        return this.results.get(key);
    }

    public Collection<String> values() {
        return this.results.values();
    }

    public String toString() {
        return "outcome " + results.entrySet().stream()
            .map(e -> e.getKey() + " => " + e.getValue())
            .collect(Collectors.joining(", ", "{ ", " }"));
    }
}
