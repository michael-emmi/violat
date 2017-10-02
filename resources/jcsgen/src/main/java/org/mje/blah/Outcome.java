package org.mje.blah;

import java.util.*;
import java.util.logging.*;
import java.util.stream.*;

public class Outcome {
    static Logger logger = Logger.getLogger("outcome");

    final SortedMap<Invocation,String> results;
    final Properties properties;
    int frequency;

    public Outcome(Properties properties) {
        this(Collections.emptySortedMap(), properties);
    }

    public Outcome(Outcome that) {
        this(that.results, that.properties);
    }

    Outcome(SortedMap<Invocation,String> results, Properties properties) {
        this.results = new TreeMap<>(results);
        this.properties = properties;
        this.frequency = 0;
    }

    public SortedMap<Invocation,String> getResults() {
        return results;
    }

    public boolean combine(Outcome that, Collection<Invocation> overwrite) {
        boolean consistent = true;

        for (Invocation i : that.results.keySet()) {
            String result = that.results.get(i);

            if (this.results.containsKey(i)) {
                if (!this.results.get(i).equals(result))
                    consistent = false;

                if (overwrite.contains(i))
                    this.results.put(i, result);

            } else {
                this.results.put(i, result);
            }
        }
        return consistent;
    }

    public int hashCode() {
        return this.results.hashCode() + this.properties.hashCode();
    }

    public boolean equals(Object object) {
        if (!(object instanceof Outcome))
            return false;
        Outcome that = (Outcome) object;
        return this.results.equals(that.results)
            && this.properties.equals(that.properties);
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
        return "outcome[" +
            properties.entrySet().stream()
                .map(e -> e.getValue().equals(true) ? e.getKey().toString() : "")
                .collect(Collectors.joining("")) +
            "]" + results.entrySet().stream()
                .map(e -> e.getKey() + ": " + e.getValue())
                .collect(Collectors.joining(", ", "{ ", " }"));
    }
}
