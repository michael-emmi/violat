package org.mje.blah;

import java.util.*;

public class PartialOrder<N> {

    HashMap<N,Set<N>> before;
    HashMap<N,Set<N>> after;

    public static class Edge<N> {
        N source, sink;
        public Edge(N n1, N n2) { source = n1; sink = n2; }
        public N getSource() { return source; }
        public N getSink() { return sink; }
    }

    public PartialOrder(Collection<Edge<N>> edges) {
        this.before = new HashMap<>();
        this.after = new HashMap<>();
        for (Edge<N> edge : edges)
            add(edge);
    }

    public PartialOrder() {
        this(Collections.emptyList());
    }

    public void add(N n1, N n2) {
        add(new Edge<>(n1,n2));
    }

    public void add(Edge<N> edge) {
        addOnly(edge);
        addClosure(edge);
    }

    void addOnly(Edge<N> edge) {
        N n1 = edge.getSource();
        N n2 = edge.getSink();

        if (!before.containsKey(n1)) {
            before.put(n1, new HashSet<>());
            after.put(n1, new HashSet<>());
        }
        if (!before.containsKey(n2)) {
            before.put(n2, new HashSet<>());
            after.put(n2, new HashSet<>());
        }
        before.get(n1).add(n2);
        after.get(n2).add(n1);
    }

    void addClosure(Edge<N> edge) {
        Queue<Edge<N>> workList = new LinkedList<>();
        workList.add(edge);

        while (!workList.isEmpty()) {
            Edge<N> e = workList.poll();
            N n1 = e.getSource();
            N n2 = e.getSink();

            for (N n3 : before.get(n2))
                if (!isBefore(n1,n3)) {
                    before.get(n1).add(n3);
                    after.get(n3).add(n1);
                    workList.add(new Edge<>(n1,n2));
                }
            for (N n0 : after.get(n1))
                if (!isAfter(n2,n0)) {
                    before.get(n0).add(n2);
                    after.get(n2).add(n0);
                    workList.add(new Edge<>(n0,n2));
                }
        }
    }

    public boolean isBefore(N n1, N n2) {
        return before.get(n1).contains(n2);
    }

    public boolean isAfter(N n1, N n2) {
        return isBefore(n2,n1);
    }

    public Set<N> getNodes() {
        return before.keySet();
    }

    public Set<N> getMinimals() {
        Set<N> minimals = new HashSet<>();
        for (N n : after.keySet())
            if (after.get(n).isEmpty())
                minimals.add(n);
        return minimals;
    }
}
