package org.mje.blah;

import java.util.*;
import java.util.concurrent.*;

import org.openjdk.jcstress.annotations.*;
import org.openjdk.jcstress.infra.results.*;


public class ConcurrentLinkedQueueTests {

    @JCStressTest
    @Outcome(id = {"[0]", "[2]"}, expect = Expect.ACCEPTABLE)
    @Outcome(id = "[1]", expect = Expect.ACCEPTABLE_INTERESTING)
    @State
    public static class addAllTest {
        Queue<Integer> q = new ConcurrentLinkedQueue<Integer>();

        @Actor
        public void actor1() {
            q.addAll(Arrays.asList(new Integer[]{1,2}));
        }

        @Actor
        public void actor2() {
            q.poll();
        }

        @Arbiter
        public void arbiter(IntResult1 result) {
            result.r1 = q.size();
        }
    }

    @JCStressTest
    @Outcome(id = {"[0]", "[1]"}, expect = Expect.ACCEPTABLE)
    @Outcome(id = "[2]", expect = Expect.ACCEPTABLE_INTERESTING)
    @State
    public static class clearTest {
        Queue<Integer> q = new ConcurrentLinkedQueue<Integer>();

        @Actor
        public void actor1() {
            q.offer(1);
            q.offer(2);
            q.clear();
        }

        @Actor
        public void actor2(IntResult1 result) {
            Integer i = q.peek();
            result.r1 = i == null ? 0 : i;
        }
    }

    @JCStressTest
    @Outcome(id = {"[false]"}, expect = Expect.ACCEPTABLE)
    @Outcome(id = "[true]", expect = Expect.ACCEPTABLE_INTERESTING)
    @State
    public static class containsAllTest {
        Queue<Integer> q = new ConcurrentLinkedQueue<Integer>();

        @Actor
        public void actor1() {
            q.offer(1);
            q.remove();
            q.offer(2);
        }

        @Actor
        public void actor2(BooleanResult1 result) {
            result.r1 = q.containsAll(Arrays.asList(new Integer[]{1,2}));
        }
    }

    @JCStressTest
    @Outcome(id = {"[0]", "[1]"}, expect = Expect.ACCEPTABLE)
    @Outcome(id = "[2]", expect = Expect.ACCEPTABLE_INTERESTING)
    @State
    public static class forEachTest {
        Queue<Integer> q = new ConcurrentLinkedQueue<Integer>();

        @Actor
        public void actor1() {
            q.offer(1);
            q.remove();
            q.offer(2);
        }

        @Actor
        public void actor2(IntResult1 result) {
            result.r1 = 0;
            q.forEach(item -> result.r1++);
        }
    }

    @JCStressTest
    @Outcome(id = {"[0]", "[1]"}, expect = Expect.ACCEPTABLE)
    @Outcome(id = "[2]", expect = Expect.ACCEPTABLE_INTERESTING)
    @State
    public static class iteratorTest {
        Queue<Integer> q = new ConcurrentLinkedQueue<Integer>();

        @Actor
        public void actor1() {
            q.offer(1);
            q.remove();
            q.offer(2);
        }

        @Actor
        public void actor2(IntResult1 result) {
            result.r1 = 0;
            q.iterator().forEachRemaining(item -> result.r1++);
        }
    }

    @JCStressTest
    @Outcome(id = {"[0]", "[1]"}, expect = Expect.ACCEPTABLE)
    @Outcome(id = "[2]", expect = Expect.ACCEPTABLE_INTERESTING)
    @State
    public static class parallelStreamTest {
        Queue<Integer> q = new ConcurrentLinkedQueue<Integer>();

        @Actor
        public void actor1() {
            q.offer(1);
            q.remove();
            q.offer(2);
        }

        @Actor
        public void actor2(LongResult1 result) {
            result.r1 = q.parallelStream().count();
        }
    }

    @JCStressTest
    @Outcome(id = {"[0, 0]", "[1, 2]"}, expect = Expect.ACCEPTABLE)
    @Outcome(id = {"[1, 0]", "[2, 0]"}, expect = Expect.ACCEPTABLE_INTERESTING)
    @State
    public static class removeAllTest {
        Queue<Integer> q = new ConcurrentLinkedQueue<Integer>(Arrays.asList(new Integer[]{1,2}));

        @Actor
        public void actor1() {
            q.removeAll(Arrays.asList(new Integer[]{1,2}));
        }

        @Actor
        public void actor2(IntResult2 result) {
            Integer i = q.poll();
            Integer j = q.poll();
            result.r1 = i == null ? 0 : i;
            result.r2 = j == null ? 0 : j;
        }
    }

    @JCStressTest
    @Outcome(id = {"[0, 0]", "[1, 2]"}, expect = Expect.ACCEPTABLE)
    @Outcome(id = {"[1, 0]", "[2, 0]"}, expect = Expect.ACCEPTABLE_INTERESTING)
    @State
    public static class removeIfTest {
        Queue<Integer> q = new ConcurrentLinkedQueue<Integer>(Arrays.asList(new Integer[]{1,2}));

        @Actor
        public void actor1() {
            q.removeIf(x -> true);
        }

        @Actor
        public void actor2(IntResult2 result) {
            Integer i = q.poll();
            Integer j = q.poll();
            result.r1 = i == null ? 0 : i;
            result.r2 = j == null ? 0 : j;
        }
    }

    @JCStressTest
    @Outcome(id = {"[1, 2]", "[2, 4]"}, expect = Expect.ACCEPTABLE)
    @Outcome(id = "[2, 3]", expect = Expect.ACCEPTABLE_INTERESTING)
    @State
    public static class retainAllTest {
        Queue<Integer> q = new ConcurrentLinkedQueue<Integer>(Arrays.asList(new Integer[]{1,2,3,4}));

        @Actor
        public void actor1() {
            q.retainAll(Arrays.asList(new Integer[]{2,4}));
        }

        @Actor
        public void actor2(IntResult2 result) {
            result.r1 = q.poll();
            result.r2 = q.poll();
        }
    }

    @JCStressTest
    @Outcome(id = {"[0]", "[1]"}, expect = Expect.ACCEPTABLE)
    @Outcome(id = "[2]", expect = Expect.ACCEPTABLE_INTERESTING)
    @State
    public static class sizeTest {
        Queue<Integer> q = new ConcurrentLinkedQueue<Integer>();

        @Actor
        public void actor1() {
            q.offer(1);
            q.poll();
            q.offer(2);
        }

        @Actor
        public void actor2(IntResult1 result) {
            result.r1 = q.size();
        }
    }

    @JCStressTest
    @Outcome(id = {"[0]", "[1]"}, expect = Expect.ACCEPTABLE)
    @Outcome(id = "[2]", expect = Expect.ACCEPTABLE_INTERESTING)
    @State
    public static class spliteratorTest {
        Queue<Integer> q = new ConcurrentLinkedQueue<Integer>();

        @Actor
        public void actor1() {
            q.offer(1);
            q.remove();
            q.offer(2);
        }

        @Actor
        public void actor2(IntResult1 result) {
            result.r1 = 0;
            q.spliterator().forEachRemaining(item -> result.r1++);
        }
    }

    @JCStressTest
    @Outcome(id = {"[0]", "[1]"}, expect = Expect.ACCEPTABLE)
    @Outcome(id = "[2]", expect = Expect.ACCEPTABLE_INTERESTING)
    @State
    public static class streamTest {
        Queue<Integer> q = new ConcurrentLinkedQueue<Integer>();

        @Actor
        public void actor1() {
            q.offer(1);
            q.remove();
            q.offer(2);
        }

        @Actor
        public void actor2(LongResult1 result) {
            result.r1 = q.stream().count();
        }
    }

    @JCStressTest
    @Outcome(id = {"[0]", "[1]"}, expect = Expect.ACCEPTABLE)
    @Outcome(id = "[2]", expect = Expect.ACCEPTABLE_INTERESTING)
    @State
    public static class toArrayTest {
        Queue<Integer> q = new ConcurrentLinkedQueue<Integer>();

        @Actor
        public void actor1() {
            q.offer(1);
            q.poll();
            q.offer(2);
        }

        @Actor
        public void actor2(IntResult1 result) {
            result.r1 = q.toArray().length;
        }
    }

    @JCStressTest
    @Outcome(id = {"[[]]", "[[1]]", "[[2]]"}, expect = Expect.ACCEPTABLE)
    @Outcome(id = "[[1, 2]]", expect = Expect.ACCEPTABLE_INTERESTING)
    @State
    public static class toStringTest {
        Queue<Integer> q = new ConcurrentLinkedQueue<Integer>();

        @Actor
        public void actor1() {
            q.offer(1);
            q.poll();
            q.offer(2);
        }

        @Actor
        public void actor2(StringResult1 result) {
            result.r1 = q.toString();
        }
    }
}
