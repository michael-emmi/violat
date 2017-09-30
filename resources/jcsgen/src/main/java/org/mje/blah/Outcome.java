package org.mje.blah;

import java.util.*;
import java.util.logging.*;
import java.util.stream.*;

public class Outcome {
    static Logger logger = Logger.getLogger("outcome");

    final SortedMap<Integer,String> results;

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

    public void put(Integer id, String result) {
        this.results.put(id, result);
    }

    public boolean isEmpty() {
        return this.results.isEmpty();
    }

    public boolean containsKey(int key) {
        return this.results.containsKey(key);
    }

    public Set<Integer> keySet() {
        return this.results.keySet();
    }

    public String get(int key) {
        return this.results.get(key);
    }

    public Collection<String> values() {
        return this.results.values();
    }

    public String toString() {
        return "outcome " + results.toString();
    }
}
