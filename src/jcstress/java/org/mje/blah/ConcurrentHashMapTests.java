package org.mje.blah;

import java.util.*;
import java.util.concurrent.*;

import org.openjdk.jcstress.annotations.*;
import org.openjdk.jcstress.infra.results.*;


public class ConcurrentHashMapTests {

    @JCStressTest
    @Outcome(id = {"[false]"}, expect = Expect.ACCEPTABLE)
    @Outcome(id = "[true]", expect = Expect.ACCEPTABLE_INTERESTING)
    @State
    public static class clearTest {
        ConcurrentMap<Integer,Integer> m =
            new ConcurrentHashMap<Integer,Integer>();

        @Actor
        public void actor1() {
            m.put(0,0);
            m.put(1,1);
        }

        @Actor
        public void actor2() {
            m.clear();
        }

        @Arbiter
        public void arbiter(BooleanResult1 result) {
            result.r1 = m.containsKey(0) && !m.containsKey(1);
        }
    }

    @JCStressTest
    @Outcome(id = {"[true]"}, expect = Expect.ACCEPTABLE)
    @Outcome(id = "[false]", expect = Expect.ACCEPTABLE_INTERESTING)
    @State
    public static class containsValueTest {
        ConcurrentMap<Integer,Integer> m =
            new ConcurrentHashMap<Integer,Integer>(
                Collections.singletonMap(2,0)
            );

        @Actor
        public void actor1() {
            m.put(1,0);
            m.remove(2);
        }

        @Actor
        public void actor2(BooleanResult1 result) {
            result.r1 = m.containsValue(0);
        }
    }

    @JCStressTest
    @Outcome(id = {"[0]", "[1]"}, expect = Expect.ACCEPTABLE)
    @Outcome(id = "[2]", expect = Expect.ACCEPTABLE_INTERESTING)
    @State
    public static class entrySetTest {
        ConcurrentMap<Integer,Integer> m =
            new ConcurrentHashMap<Integer,Integer>();

        @Actor
        public void actor1() {
            m.put(0,0);
            m.remove(0);
            m.put(1,1);
        }

        @Actor
        public void actor2(IntResult1 result) {
            result.r1 = new ArrayList(m.entrySet()).size();
        }
    }

    @JCStressTest
    @Outcome(id = {"[0]", "[1]"}, expect = Expect.ACCEPTABLE)
    @Outcome(id = "[2]", expect = Expect.ACCEPTABLE_INTERESTING)
    @State
    public static class forEachTest {
        ConcurrentMap<Integer,Integer> m =
            new ConcurrentHashMap<Integer,Integer>();

        @Actor
        public void actor1() {
            m.put(0,0);
            m.remove(0);
            m.put(1,1);
        }

        @Actor
        public void actor2(IntResult1 result) {
            result.r1 = 0;
            m.forEach((k,v) -> result.r1++);
        }
    }

    @JCStressTest
    @Outcome(id = {"[false]"}, expect = Expect.ACCEPTABLE)
    @Outcome(id = "[true]", expect = Expect.ACCEPTABLE_INTERESTING)
    @State
    public static class isEmptyTest {
        ConcurrentMap<Integer,Integer> m =
            new ConcurrentHashMap<Integer,Integer>();

        @Actor
        public void actor1() {
            m.put(0,0);
        }

        @Actor
        public void actor2(BooleanResult1 result) {
            result.r1 = m.containsKey(0) && m.isEmpty();
        }
    }

    @JCStressTest
    @Outcome(id = {"[0]", "[1]"}, expect = Expect.ACCEPTABLE)
    @Outcome(id = "[2]", expect = Expect.ACCEPTABLE_INTERESTING)
    @State
    public static class keySetTest {
        ConcurrentMap<Integer,Integer> m =
            new ConcurrentHashMap<Integer,Integer>();

        @Actor
        public void actor1() {
            m.put(0,0);
            m.remove(0);
            m.put(1,1);
        }

        @Actor
        public void actor2(IntResult1 result) {
            result.r1 = new ArrayList(m.keySet()).size();
        }
    }

    @JCStressTest
    @Outcome(id = {"[0]", "[1]"}, expect = Expect.ACCEPTABLE)
    @Outcome(id = "[2]", expect = Expect.ACCEPTABLE_INTERESTING)
    @State
    public static class reduceTest {
        ConcurrentHashMap<Integer,Integer> m =
            new ConcurrentHashMap<Integer,Integer>();

        @Actor
        public void actor1() {
            m.put(1,0);
            m.remove(1);
            m.put(2,0);
        }

        @Actor
        public void actor2(IntResult1 result) {
            Integer i = m.reduce(3, (k,v) -> 1, (u1,u2) -> u1 + u2);
            result.r1 = i == null ? 0 : i;
        }
    }

    @JCStressTest
    @Outcome(id = {"[0]", "[1]", "[2]"}, expect = Expect.ACCEPTABLE)
    @Outcome(id = "[3]", expect = Expect.ACCEPTABLE_INTERESTING)
    @State
    public static class reduceKeysTest {
        ConcurrentHashMap<Integer,Integer> m =
            new ConcurrentHashMap<Integer,Integer>();

        @Actor
        public void actor1() {
            m.put(1,0);
            m.remove(1);
            m.put(2,0);
        }

        @Actor
        public void actor2(IntResult1 result) {
            Integer i = m.reduceKeys(3, (k1,k2) -> k1+k2);
            result.r1 = i == null ? 0 : i;
        }
    }

    @JCStressTest
    @Outcome(id = {"[false]"}, expect = Expect.ACCEPTABLE)
    @Outcome(id = "[true]", expect = Expect.ACCEPTABLE_INTERESTING)
    @State
    public static class replaceAllTest {
        ConcurrentMap<Integer,Integer> m =
            new ConcurrentHashMap<Integer,Integer>();

        @Actor
        public void actor1() {
            m.put(1,1);
            m.put(2,2);
            m.replaceAll((k, v) -> v * 2);
        }

        @Actor
        public void actor2(BooleanResult1 result) {
            Integer i = m.get(1);
            Integer j = m.get(2);
            result.r1 = i != null && i.equals(j);
        }
    }

    @JCStressTest
    @Outcome(id = {"[true]"}, expect = Expect.ACCEPTABLE)
    @Outcome(id = "[false]", expect = Expect.ACCEPTABLE_INTERESTING)
    @State
    public static class searchTest {
        ConcurrentHashMap<Integer,Integer> m =
            new ConcurrentHashMap<Integer,Integer>(
                Collections.singletonMap(2,0)
            );

        @Actor
        public void actor1() {
            m.put(1,0);
            m.remove(2);
        }

        @Actor
        public void actor2(BooleanResult1 result) {
            result.r1 = m.search(3, (k,v) -> v == 0) != null;
        }
    }

    @JCStressTest
    @Outcome(id = {"[true]"}, expect = Expect.ACCEPTABLE)
    @Outcome(id = "[false]", expect = Expect.ACCEPTABLE_INTERESTING)
    @State
    public static class searchEntriesTest {
        ConcurrentHashMap<Integer,Integer> m =
            new ConcurrentHashMap<Integer,Integer>(
                Collections.singletonMap(2,0)
            );

        @Actor
        public void actor1() {
            m.put(1,0);
            m.remove(2);
        }

        @Actor
        public void actor2(BooleanResult1 result) {
            result.r1 = m.searchEntries(3, e -> e.getValue() == 0) != null;
        }
    }

    @JCStressTest
    @Outcome(id = {"[true]"}, expect = Expect.ACCEPTABLE)
    @Outcome(id = "[false]", expect = Expect.ACCEPTABLE_INTERESTING)
    @State
    public static class searchValuesTest {
        ConcurrentHashMap<Integer,Integer> m =
            new ConcurrentHashMap<Integer,Integer>(
                Collections.singletonMap(2,0)
            );

        @Actor
        public void actor1() {
            m.put(1,0);
            m.remove(2);
        }

        @Actor
        public void actor2(BooleanResult1 result) {
            result.r1 = m.searchValues(3, v -> v == 0) != null;
        }
    }

    @JCStressTest
    @Outcome(id = {"[false]"}, expect = Expect.ACCEPTABLE)
    @Outcome(id = "[true]", expect = Expect.ACCEPTABLE_INTERESTING)
    @State
    public static class sizeTest {
        ConcurrentMap<Integer,Integer> m =
            new ConcurrentHashMap<Integer,Integer>();

        @Actor
        public void actor1() {
            m.put(0,0);
        }

        @Actor
        public void actor2(BooleanResult1 result) {
            result.r1 = m.containsKey(0) && m.size() < 1;
        }
    }

    @JCStressTest
    @Outcome(id = {"[{}]", "[{0=0}]", "[{1=1}]"}, expect = Expect.ACCEPTABLE)
    @Outcome(id = "[{0=0, 1=1}]", expect = Expect.ACCEPTABLE_INTERESTING)
    @State
    public static class toStringTest {
        ConcurrentMap<Integer,Integer> m =
            new ConcurrentHashMap<Integer,Integer>();

        @Actor
        public void actor1() {
            m.put(0,0);
            m.remove(0);
            m.put(1,1);
        }

        @Actor
        public void actor2(StringResult1 result) {
            result.r1 = m.toString();
        }
    }

    @JCStressTest
    @Outcome(id = {"[0]", "[1]"}, expect = Expect.ACCEPTABLE)
    @Outcome(id = "[2]", expect = Expect.ACCEPTABLE_INTERESTING)
    @State
    public static class valuesTest {
        ConcurrentMap<Integer,Integer> m =
            new ConcurrentHashMap<Integer,Integer>();

        @Actor
        public void actor1() {
            m.put(0,0);
            m.remove(0);
            m.put(1,1);
        }

        @Actor
        public void actor2(IntResult1 result) {
            result.r1 = new ArrayList(m.values()).size();
        }
    }
}
