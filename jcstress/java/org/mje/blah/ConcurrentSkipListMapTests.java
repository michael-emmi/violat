package org.mje.blah;

import java.util.*;
import java.util.concurrent.*;

import org.openjdk.jcstress.annotations.*;
import org.openjdk.jcstress.infra.results.*;


public class ConcurrentSkipListMapTests {

    @JCStressTest
    @Outcome(id = {"[false]"}, expect = Expect.ACCEPTABLE)
    @Outcome(id = "[true]", expect = Expect.ACCEPTABLE_INTERESTING)
    @State
    public static class clearTest {
        ConcurrentMap<Integer,Integer> m = new ConcurrentSkipListMap<Integer,Integer>();

        @Actor
        public void actor1() {
            m.put(2,2);
            m.put(1,1);
            m.put(3,3);
        }

        @Actor
        public void actor2() {
            m.clear();
        }

        @Arbiter
        public void arbiter(BooleanResult1 result) {
            m.put(4,4);
            result.r1 = m.isEmpty();
        }
    }

    @JCStressTest
    @Outcome(id = {"[true]"}, expect = Expect.ACCEPTABLE)
    @Outcome(id = "[false]", expect = Expect.ACCEPTABLE_INTERESTING)
    @State
    public static class containsValueTest {
        ConcurrentMap<Integer,Integer> m =
            new ConcurrentSkipListMap<Integer,Integer>(
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
    @Outcome(id = {"[1]", "[2]"}, expect = Expect.ACCEPTABLE)
    @Outcome(id = "[3]", expect = Expect.ACCEPTABLE_INTERESTING)
    @State
    public static class entrySetTest {
        ConcurrentMap<Integer,Integer> m =
            new ConcurrentSkipListMap<Integer,Integer>(
                Collections.singletonMap(0,0)
            );

        @Actor
        public void actor1() {
            m.put(1,1);
            m.remove(0);
            m.put(2,2);
        }

        @Actor
        public void actor2(IntResult1 result) {
            result.r1 = new ArrayList<Map.Entry<Integer,Integer>>(m.entrySet()).size();
        }
    }

    @JCStressTest
    @Outcome(id = {"[1]", "[2]"}, expect = Expect.ACCEPTABLE)
    @Outcome(id = "[3]", expect = Expect.ACCEPTABLE_INTERESTING)
    @State
    public static class forEachTest {
        ConcurrentMap<Integer,Integer> m =
            new ConcurrentSkipListMap<Integer,Integer>(
                Collections.singletonMap(0,0)
            );

        @Actor
        public void actor1() {
            m.put(1,1);
            m.remove(0);
            m.put(2,2);
        }

        @Actor
        public void actor2(IntResult1 result) {
            result.r1 = 0;
            m.forEach((k,v) -> result.r1++);
        }
    }

    @JCStressTest
    @Outcome(id = {"[1]", "[2]"}, expect = Expect.ACCEPTABLE)
    @Outcome(id = "[3]", expect = Expect.ACCEPTABLE_INTERESTING)
    @State
    public static class keySetTest {
        ConcurrentMap<Integer,Integer> m =
            new ConcurrentSkipListMap<Integer,Integer>(
                Collections.singletonMap(0,0)
            );

        @Actor
        public void actor1() {
            m.put(1,1);
            m.remove(0);
            m.put(2,2);
        }

        @Actor
        public void actor2(IntResult1 result) {
            result.r1 = new ArrayList<Integer>(m.keySet()).size();
        }
    }

    @JCStressTest
    @Outcome(id = {"[false]"}, expect = Expect.ACCEPTABLE)
    @Outcome(id = "[true]", expect = Expect.ACCEPTABLE_INTERESTING)
    @State
    public static class replaceAllTest {
        ConcurrentMap<Integer,Integer> m =
            new ConcurrentSkipListMap<Integer,Integer>();

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
    @Outcome(id = {"[0]", "[1]", "[2]"}, expect = Expect.ACCEPTABLE)
    @Outcome(id = "[3]", expect = Expect.ACCEPTABLE_INTERESTING)
    @State
    public static class sizeTest {
        ConcurrentMap<Integer,Integer> m =
            new ConcurrentSkipListMap<Integer,Integer>(
                Collections.singletonMap(0,0)
            );

        @Actor
        public void actor1() {
            m.put(1,1);
            m.remove(0);
            m.put(2,2);
        }

        @Actor
        public void actor2(IntResult1 result) {
            result.r1 = m.size();
        }
    }

    @JCStressTest
    @Outcome(id = {"[{0=0}]", "[{0=0, 1=1}]", "[{1=1}]", "[{1=1, 2=2}]"}, expect = Expect.ACCEPTABLE)
    @Outcome(id = "[{0=0, 1=1, 2=2}]", expect = Expect.ACCEPTABLE_INTERESTING)
    @State
    public static class toStringTest {
        ConcurrentMap<Integer,Integer> m =
            new ConcurrentSkipListMap<Integer,Integer>(
                Collections.singletonMap(0,0)
            );

        @Actor
        public void actor1() {
            m.put(1,1);
            m.remove(0);
            m.put(2,2);
        }

        @Actor
        public void actor2(StringResult1 result) {
            result.r1 = m.toString();
        }
    }

    @JCStressTest
    @Outcome(id = {"[1]", "[2]"}, expect = Expect.ACCEPTABLE)
    @Outcome(id = "[3]", expect = Expect.ACCEPTABLE_INTERESTING)
    @State
    public static class valuesTest {
        ConcurrentMap<Integer,Integer> m =
            new ConcurrentSkipListMap<Integer,Integer>(
                Collections.singletonMap(0,0)
            );

        @Actor
        public void actor1() {
            m.put(1,1);
            m.remove(0);
            m.put(2,2);
        }

        @Actor
        public void actor2(IntResult1 result) {
            result.r1 = new ArrayList<Integer>(m.values()).size();
        }
    }
}
