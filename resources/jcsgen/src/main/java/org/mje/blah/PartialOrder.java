package org.mje.blah;

import java.util.*;

public class PartialOrder<N> implements Iterable<N> {

    public static class Edge<N> {
        N source, sink;
        public Edge(N n1, N n2) { source = n1; sink = n2; }
        public N getSource() { return source; }
        public N getSink() { return sink; }
        public boolean equals(Object that) {
            return (that instanceof Edge)
                && this.source.equals(((Edge) that).source)
                && this.sink.equals(((Edge) that).sink);
        }
        public int hashCode() {
            return source.hashCode() + sink.hashCode();
        }
    }

    Set<N> nodes;
    Set<Edge<N>> basis;
    HashMap<N,Set<N>> before;
    HashMap<N,Set<N>> after;

    public PartialOrder(Collection<N> nodes, Collection<Edge<N>> edges) {
        this.nodes = new LinkedHashSet<>();
        this.basis = new LinkedHashSet<>(edges);
        this.before = new HashMap<>();
        this.after = new HashMap<>();
        for (N n : nodes)
            add(n);
        for (Edge<N> edge : edges)
            add(edge);
    }

    public PartialOrder(Collection<N> nodes) {
        this(nodes, Collections.emptyList());
    }

    public PartialOrder() {
        this(Collections.emptySet(), Collections.emptyList());
    }

    public Iterator<N> iterator() {
        return nodes.iterator();
    }

    public void add(N n) {
        nodes.add(n);
        if (!before.containsKey(n)) {
            before.put(n, new HashSet<>());
            after.put(n, new HashSet<>());
        }
    }

    public void add(N n1, N n2) {
        add(new Edge<>(n1,n2));
    }

    public void add(Edge<N> edge) {
        basis.add(edge);
        addOnly(edge);
        addClosure(edge);
    }

    void addOnly(Edge<N> edge) {
        N n1 = edge.getSource();
        N n2 = edge.getSink();
        add(n1);
        add(n2);
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

    public Set<N> getSuccessors(N n) {
        return before.get(n);
    }

    public Set<N> getPredecessors(N n) {
        return after.get(n);
    }

    public boolean isBefore(N n1, N n2) {
        return before.get(n1).contains(n2);
    }

    public boolean isAfter(N n1, N n2) {
        return isBefore(n2,n1);
    }

    public Set<N> getNodes() {
        return nodes;
    }

    public Set<N> getMinimals() {
        Set<N> minimals = new LinkedHashSet<>();
        for (N n : nodes)
            if (after.get(n).isEmpty())
                minimals.add(n);
        return minimals;
    }

    public Set<N> getMaximals() {
        Set<N> maximals = new LinkedHashSet<>();
        for (N n : nodes)
            if (before.get(n).isEmpty())
                maximals.add(n);
        return maximals;
    }

    public boolean isEmpty() {
        return nodes.isEmpty();
    }

    public Set<Edge<N>> getBasis() {
        return basis;
    }

    public PartialOrder<N> clone() {
        return new PartialOrder<>(getNodes(), getBasis());
    }

    public PartialOrder<N> drop(Edge<N> edge) {
        Set<Edge<N>> edges = new HashSet<>(getBasis());
        edges.remove(edge);
        return new PartialOrder<>(getNodes(), edges);
    }

    public PartialOrder<N> replace(N n1, N n2) {
        Set<N> nodes = new LinkedHashSet<>(getNodes());
        nodes.remove(n1);
        nodes.add(n2);

        Set<Edge<N>> edges = new LinkedHashSet<>(getBasis());
        for (Edge<N> edge : getBasis()) {
            N src = edge.getSource();
            N snk = edge.getSink();
            if (src.equals(n1)) {
                edges.remove(edge);
                edges.add(new Edge<>(n2,snk));
            } else if (snk.equals(n1)) {
                edges.remove(edge);
                edges.add(new Edge<>(src,n2));
            }
        }
        return new PartialOrder<>(nodes, edges);
    }

    public PartialOrder<N> drop(N n) {
        Set<N> nodes = new LinkedHashSet<>(getNodes());
        nodes.remove(n);

        Set<Edge<N>> edges = new LinkedHashSet<>(getBasis());
        for (Edge<N> edge : getBasis())
            if (edge.getSource().equals(n) || edge.getSink().equals(n))
                edges.remove(edge);
        return new PartialOrder<>(nodes, edges);
    }

    public String toString() {
        StringBuilder s = new StringBuilder();
        Map<N,Integer> ids = new HashMap<>();
        int count = 0;
        for (N n : nodes) {
            ids.put(n, ++count);
            s.append("n" + count + ": " + n + "\n");
        }
        for (Edge<N> edge : basis)
            s.append("edge: n" + ids.get(edge.getSource()) + " < n" + ids.get(edge.getSink()) + "\n");
        return s.toString();
    }
}
