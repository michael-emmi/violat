package org.mje.auto;
import org.openjdk.jcstress.annotations.*;
import org.openjdk.jcstress.infra.results.*;
import java.util.Arrays;
import java.util.concurrent.ConcurrentSkipListMap;

public class AutogenHarness1 {
    
    @JCStressTest
    @Outcome(id = "[false, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T1 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.containsKey(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.containsKey(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T2 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.containsKey(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.containsKey(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T3 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.containsKey(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.containsKey(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T4 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.containsKey(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.containsKey(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T5 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.containsKey(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.get(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T6 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.containsKey(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.get(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T7 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.containsKey(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.get(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T8 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.containsKey(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.get(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[true, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T9 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.containsKey(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(0, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[true, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T10 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.containsKey(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(0, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T11 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.containsKey(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(1, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T12 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.containsKey(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(1, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T13 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.containsKey(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(0, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T14 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.containsKey(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(0, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[true, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T15 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.containsKey(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(1, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[true, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T16 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.containsKey(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(1, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T17 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.get(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.containsKey(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T18 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.get(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.containsKey(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T19 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.get(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.containsKey(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T20 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.get(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.containsKey(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T21 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.get(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.get(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T22 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.get(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.get(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T23 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.get(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.get(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T24 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.get(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.get(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[0, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T25 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.get(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(0, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[1, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T26 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.get(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(0, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T27 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.get(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(1, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T28 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.get(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(1, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T29 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.get(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(0, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T30 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.get(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(0, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[0, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T31 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.get(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(1, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[1, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T32 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.get(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(1, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, true]", expect = Expect.ACCEPTABLE)
    @State
    public static class T33 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.put(0, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.containsKey(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T34 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.put(0, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.containsKey(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, true]", expect = Expect.ACCEPTABLE)
    @State
    public static class T35 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.put(0, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.containsKey(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T36 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.put(0, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.containsKey(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T37 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.put(1, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.containsKey(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, true]", expect = Expect.ACCEPTABLE)
    @State
    public static class T38 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.put(1, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.containsKey(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T39 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.put(1, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.containsKey(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, true]", expect = Expect.ACCEPTABLE)
    @State
    public static class T40 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.put(1, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.containsKey(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, 0]", expect = Expect.ACCEPTABLE)
    @State
    public static class T41 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.put(0, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.get(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T42 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.put(0, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.get(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, 1]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T43 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.put(0, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.get(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T44 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.put(0, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.get(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T45 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.put(1, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.get(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, 0]", expect = Expect.ACCEPTABLE)
    @State
    public static class T46 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.put(1, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.get(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T47 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.put(1, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.get(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, 1]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T48 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.put(1, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.get(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[0, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, 0]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T49 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.put(0, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(0, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, 0]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[1, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T50 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.put(0, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(0, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T51 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.put(0, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(1, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T52 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.put(0, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(1, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, 1]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[0, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T53 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.put(0, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(0, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, 1]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[1, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T54 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.put(0, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(0, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T55 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.put(0, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(1, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T56 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.put(0, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(1, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T57 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.put(1, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(0, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T58 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.put(1, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(0, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[0, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, 0]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T59 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.put(1, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(1, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, 0]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[1, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T60 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.put(1, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(1, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T61 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.put(1, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(0, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T62 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.put(1, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(0, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, 1]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[0, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T63 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.put(1, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(1, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, 1]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[1, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T64 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
            result.r1 = ResultAdapter.get(obj.put(1, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(1, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T65 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(0));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.containsKey(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T66 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(0));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.containsKey(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T67 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(1));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.containsKey(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T68 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(1));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.containsKey(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T69 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(0));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.get(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T70 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(0));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.get(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T71 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(1));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.get(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T72 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(1));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.get(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[true, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T73 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(0));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(0, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[true, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T74 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(0));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(0, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T75 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(0));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(1, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T76 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(0));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(1, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T77 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(1));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(0, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T78 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(1));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(0, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[true, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T79 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(1));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(1, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[true, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T80 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(1));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(1, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T81 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(0));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.containsKey(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T82 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(0));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.containsKey(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T83 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(1));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.containsKey(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T84 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(1));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.containsKey(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T85 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(0));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.get(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T86 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(0));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.get(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T87 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(1));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.get(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T88 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(1));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.get(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[0, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T89 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(0));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(0, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[1, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T90 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(0));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(0, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T91 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(0));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(1, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T92 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(0));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(1, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T93 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(1));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(0, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T94 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(1));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(0, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[0, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T95 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(1));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(1, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[1, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T96 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(1));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(1, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, true]", expect = Expect.ACCEPTABLE)
    @State
    public static class T97 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 0));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.containsKey(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T98 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 0));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.containsKey(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, true]", expect = Expect.ACCEPTABLE)
    @State
    public static class T99 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 1));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.containsKey(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T100 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 1));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.containsKey(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T101 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 0));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.containsKey(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, true]", expect = Expect.ACCEPTABLE)
    @State
    public static class T102 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 0));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.containsKey(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T103 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 1));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.containsKey(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, true]", expect = Expect.ACCEPTABLE)
    @State
    public static class T104 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 1));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.containsKey(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, 0]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T105 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 0));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.get(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T106 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 0));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.get(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, 1]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T107 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 1));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.get(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T108 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 1));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.get(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T109 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 0));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.get(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, 0]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T110 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 0));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.get(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T111 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 1));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.get(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, 1]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T112 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 1));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.get(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, 0]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[0, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T113 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 0));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(0, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[1, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, 0]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T114 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 0));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(0, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T115 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 0));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(1, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T116 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 0));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(1, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, 1]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[0, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T117 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 1));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(0, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, 1]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[1, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T118 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 1));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(0, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T119 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 1));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(1, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T120 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 1));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(1, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T121 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 0));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(0, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T122 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 0));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(0, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, 0]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[0, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T123 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 0));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(1, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[1, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, 0]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T124 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 0));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(1, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T125 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 1));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(0, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T126 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 1));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(0, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, 1]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[0, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T127 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 1));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(1, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, 1]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[1, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T128 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 1));
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(1, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T129 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(0));
            result.r2 = ResultAdapter.get(obj.containsKey(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T130 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(0));
            result.r2 = ResultAdapter.get(obj.containsKey(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T131 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(1));
            result.r2 = ResultAdapter.get(obj.containsKey(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T132 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(1));
            result.r2 = ResultAdapter.get(obj.containsKey(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T133 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(0));
            result.r2 = ResultAdapter.get(obj.get(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T134 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(0));
            result.r2 = ResultAdapter.get(obj.get(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T135 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(1));
            result.r2 = ResultAdapter.get(obj.get(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T136 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(1));
            result.r2 = ResultAdapter.get(obj.get(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T137 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(0));
            result.r2 = ResultAdapter.get(obj.put(0, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T138 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(0));
            result.r2 = ResultAdapter.get(obj.put(0, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T139 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(0));
            result.r2 = ResultAdapter.get(obj.put(1, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T140 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(0));
            result.r2 = ResultAdapter.get(obj.put(1, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T141 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(1));
            result.r2 = ResultAdapter.get(obj.put(0, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T142 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(1));
            result.r2 = ResultAdapter.get(obj.put(0, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T143 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(1));
            result.r2 = ResultAdapter.get(obj.put(1, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T144 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(1));
            result.r2 = ResultAdapter.get(obj.put(1, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T145 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(0));
            result.r2 = ResultAdapter.get(obj.containsKey(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T146 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(0));
            result.r2 = ResultAdapter.get(obj.containsKey(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T147 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(1));
            result.r2 = ResultAdapter.get(obj.containsKey(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T148 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(1));
            result.r2 = ResultAdapter.get(obj.containsKey(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T149 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(0));
            result.r2 = ResultAdapter.get(obj.get(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T150 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(0));
            result.r2 = ResultAdapter.get(obj.get(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T151 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(1));
            result.r2 = ResultAdapter.get(obj.get(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T152 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(1));
            result.r2 = ResultAdapter.get(obj.get(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T153 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(0));
            result.r2 = ResultAdapter.get(obj.put(0, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T154 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(0));
            result.r2 = ResultAdapter.get(obj.put(0, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T155 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(0));
            result.r2 = ResultAdapter.get(obj.put(1, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T156 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(0));
            result.r2 = ResultAdapter.get(obj.put(1, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T157 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(1));
            result.r2 = ResultAdapter.get(obj.put(0, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T158 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(1));
            result.r2 = ResultAdapter.get(obj.put(0, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T159 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(1));
            result.r2 = ResultAdapter.get(obj.put(1, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T160 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(1));
            result.r2 = ResultAdapter.get(obj.put(1, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, true]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T161 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 0));
            result.r2 = ResultAdapter.get(obj.containsKey(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T162 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 0));
            result.r2 = ResultAdapter.get(obj.containsKey(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, true]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T163 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 1));
            result.r2 = ResultAdapter.get(obj.containsKey(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T164 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 1));
            result.r2 = ResultAdapter.get(obj.containsKey(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T165 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 0));
            result.r2 = ResultAdapter.get(obj.containsKey(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, true]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T166 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 0));
            result.r2 = ResultAdapter.get(obj.containsKey(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T167 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 1));
            result.r2 = ResultAdapter.get(obj.containsKey(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, true]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T168 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 1));
            result.r2 = ResultAdapter.get(obj.containsKey(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, 0]", expect = Expect.ACCEPTABLE)
    @State
    public static class T169 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 0));
            result.r2 = ResultAdapter.get(obj.get(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T170 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 0));
            result.r2 = ResultAdapter.get(obj.get(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, 1]", expect = Expect.ACCEPTABLE)
    @State
    public static class T171 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 1));
            result.r2 = ResultAdapter.get(obj.get(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T172 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 1));
            result.r2 = ResultAdapter.get(obj.get(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T173 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 0));
            result.r2 = ResultAdapter.get(obj.get(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, 0]", expect = Expect.ACCEPTABLE)
    @State
    public static class T174 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 0));
            result.r2 = ResultAdapter.get(obj.get(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T175 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 1));
            result.r2 = ResultAdapter.get(obj.get(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, 1]", expect = Expect.ACCEPTABLE)
    @State
    public static class T176 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 1));
            result.r2 = ResultAdapter.get(obj.get(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, 0]", expect = Expect.ACCEPTABLE)
    @State
    public static class T177 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 0));
            result.r2 = ResultAdapter.get(obj.put(0, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, 0]", expect = Expect.ACCEPTABLE)
    @State
    public static class T178 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 0));
            result.r2 = ResultAdapter.get(obj.put(0, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T179 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 0));
            result.r2 = ResultAdapter.get(obj.put(1, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T180 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 0));
            result.r2 = ResultAdapter.get(obj.put(1, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, 1]", expect = Expect.ACCEPTABLE)
    @State
    public static class T181 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 1));
            result.r2 = ResultAdapter.get(obj.put(0, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, 1]", expect = Expect.ACCEPTABLE)
    @State
    public static class T182 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 1));
            result.r2 = ResultAdapter.get(obj.put(0, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T183 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 1));
            result.r2 = ResultAdapter.get(obj.put(1, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T184 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 1));
            result.r2 = ResultAdapter.get(obj.put(1, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T185 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 0));
            result.r2 = ResultAdapter.get(obj.put(0, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T186 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 0));
            result.r2 = ResultAdapter.get(obj.put(0, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, 0]", expect = Expect.ACCEPTABLE)
    @State
    public static class T187 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 0));
            result.r2 = ResultAdapter.get(obj.put(1, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, 0]", expect = Expect.ACCEPTABLE)
    @State
    public static class T188 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 0));
            result.r2 = ResultAdapter.get(obj.put(1, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T189 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 1));
            result.r2 = ResultAdapter.get(obj.put(0, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T190 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 1));
            result.r2 = ResultAdapter.get(obj.put(0, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, 1]", expect = Expect.ACCEPTABLE)
    @State
    public static class T191 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 1));
            result.r2 = ResultAdapter.get(obj.put(1, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, 1]", expect = Expect.ACCEPTABLE)
    @State
    public static class T192 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 1));
            result.r2 = ResultAdapter.get(obj.put(1, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T193 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(0));
            result.r2 = ResultAdapter.get(obj.containsKey(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T194 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(0));
            result.r2 = ResultAdapter.get(obj.containsKey(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T195 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(1));
            result.r2 = ResultAdapter.get(obj.containsKey(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T196 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(1));
            result.r2 = ResultAdapter.get(obj.containsKey(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T197 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(0));
            result.r2 = ResultAdapter.get(obj.get(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T198 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(0));
            result.r2 = ResultAdapter.get(obj.get(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T199 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(1));
            result.r2 = ResultAdapter.get(obj.get(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T200 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(1));
            result.r2 = ResultAdapter.get(obj.get(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T201 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(0));
            result.r2 = ResultAdapter.get(obj.put(0, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T202 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(0));
            result.r2 = ResultAdapter.get(obj.put(0, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T203 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(0));
            result.r2 = ResultAdapter.get(obj.put(1, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T204 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(0));
            result.r2 = ResultAdapter.get(obj.put(1, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T205 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(1));
            result.r2 = ResultAdapter.get(obj.put(0, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T206 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(1));
            result.r2 = ResultAdapter.get(obj.put(0, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T207 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(1));
            result.r2 = ResultAdapter.get(obj.put(1, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T208 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(1));
            result.r2 = ResultAdapter.get(obj.put(1, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T209 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(0));
            result.r2 = ResultAdapter.get(obj.containsKey(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T210 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(0));
            result.r2 = ResultAdapter.get(obj.containsKey(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T211 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(1));
            result.r2 = ResultAdapter.get(obj.containsKey(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T212 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(1));
            result.r2 = ResultAdapter.get(obj.containsKey(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T213 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(0));
            result.r2 = ResultAdapter.get(obj.get(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T214 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(0));
            result.r2 = ResultAdapter.get(obj.get(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T215 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(1));
            result.r2 = ResultAdapter.get(obj.get(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T216 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(1));
            result.r2 = ResultAdapter.get(obj.get(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T217 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(0));
            result.r2 = ResultAdapter.get(obj.put(0, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T218 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(0));
            result.r2 = ResultAdapter.get(obj.put(0, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T219 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(0));
            result.r2 = ResultAdapter.get(obj.put(1, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T220 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(0));
            result.r2 = ResultAdapter.get(obj.put(1, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T221 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(1));
            result.r2 = ResultAdapter.get(obj.put(0, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T222 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(1));
            result.r2 = ResultAdapter.get(obj.put(0, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T223 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(1));
            result.r2 = ResultAdapter.get(obj.put(1, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T224 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(1));
            result.r2 = ResultAdapter.get(obj.put(1, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, true]", expect = Expect.ACCEPTABLE)
    @State
    public static class T225 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 0));
            result.r2 = ResultAdapter.get(obj.containsKey(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T226 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 0));
            result.r2 = ResultAdapter.get(obj.containsKey(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, true]", expect = Expect.ACCEPTABLE)
    @State
    public static class T227 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 1));
            result.r2 = ResultAdapter.get(obj.containsKey(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T228 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 1));
            result.r2 = ResultAdapter.get(obj.containsKey(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T229 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 0));
            result.r2 = ResultAdapter.get(obj.containsKey(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, true]", expect = Expect.ACCEPTABLE)
    @State
    public static class T230 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 0));
            result.r2 = ResultAdapter.get(obj.containsKey(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T231 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 1));
            result.r2 = ResultAdapter.get(obj.containsKey(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, true]", expect = Expect.ACCEPTABLE)
    @State
    public static class T232 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 1));
            result.r2 = ResultAdapter.get(obj.containsKey(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, 0]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T233 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 0));
            result.r2 = ResultAdapter.get(obj.get(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T234 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 0));
            result.r2 = ResultAdapter.get(obj.get(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, 1]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T235 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 1));
            result.r2 = ResultAdapter.get(obj.get(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T236 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 1));
            result.r2 = ResultAdapter.get(obj.get(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T237 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 0));
            result.r2 = ResultAdapter.get(obj.get(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, 0]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T238 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 0));
            result.r2 = ResultAdapter.get(obj.get(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T239 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 1));
            result.r2 = ResultAdapter.get(obj.get(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, 1]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T240 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 1));
            result.r2 = ResultAdapter.get(obj.get(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, 0]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T241 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 0));
            result.r2 = ResultAdapter.get(obj.put(0, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, 0]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T242 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 0));
            result.r2 = ResultAdapter.get(obj.put(0, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T243 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 0));
            result.r2 = ResultAdapter.get(obj.put(1, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T244 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 0));
            result.r2 = ResultAdapter.get(obj.put(1, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, 1]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T245 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 1));
            result.r2 = ResultAdapter.get(obj.put(0, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, 1]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T246 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 1));
            result.r2 = ResultAdapter.get(obj.put(0, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T247 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 1));
            result.r2 = ResultAdapter.get(obj.put(1, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T248 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 1));
            result.r2 = ResultAdapter.get(obj.put(1, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T249 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 0));
            result.r2 = ResultAdapter.get(obj.put(0, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T250 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 0));
            result.r2 = ResultAdapter.get(obj.put(0, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, 0]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T251 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 0));
            result.r2 = ResultAdapter.get(obj.put(1, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, 0]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T252 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 0));
            result.r2 = ResultAdapter.get(obj.put(1, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T253 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 1));
            result.r2 = ResultAdapter.get(obj.put(0, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T254 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 1));
            result.r2 = ResultAdapter.get(obj.put(0, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, 1]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T255 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 1));
            result.r2 = ResultAdapter.get(obj.put(1, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, 1]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T256 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            obj.clear();
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 1));
            result.r2 = ResultAdapter.get(obj.put(1, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T257 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.containsKey(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T258 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.containsKey(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T259 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.containsKey(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T260 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.containsKey(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T261 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.get(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T262 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.get(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T263 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.get(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T264 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.get(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[true, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T265 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.put(0, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[true, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T266 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.put(0, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T267 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.put(1, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T268 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.put(1, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T269 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.put(0, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T270 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.put(0, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[true, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T271 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.put(1, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[true, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T272 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.put(1, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T273 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.containsKey(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T274 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.containsKey(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T275 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.containsKey(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T276 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.containsKey(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T277 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.get(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T278 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.get(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T279 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.get(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T280 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.get(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[0, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T281 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.put(0, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[1, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T282 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.put(0, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T283 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.put(1, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T284 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.put(1, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T285 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.put(0, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T286 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.put(0, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[0, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T287 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.put(1, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[1, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T288 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.put(1, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, true]", expect = Expect.ACCEPTABLE)
    @State
    public static class T289 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.containsKey(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T290 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.containsKey(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, true]", expect = Expect.ACCEPTABLE)
    @State
    public static class T291 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.containsKey(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T292 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.containsKey(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T293 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.containsKey(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, true]", expect = Expect.ACCEPTABLE)
    @State
    public static class T294 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.containsKey(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T295 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.containsKey(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, true]", expect = Expect.ACCEPTABLE)
    @State
    public static class T296 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.containsKey(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, 0]", expect = Expect.ACCEPTABLE)
    @State
    public static class T297 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.get(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T298 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.get(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, 1]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T299 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.get(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T300 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.get(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T301 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.get(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, 0]", expect = Expect.ACCEPTABLE)
    @State
    public static class T302 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.get(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T303 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.get(0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, 1]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T304 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.get(1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, 0]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[0, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T305 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.put(0, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[1, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, 0]", expect = Expect.ACCEPTABLE)
    @State
    public static class T306 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.put(0, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T307 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.put(1, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T308 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.put(1, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, 1]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[0, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T309 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.put(0, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, 1]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[1, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T310 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.put(0, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T311 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.put(1, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T312 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.put(1, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T313 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.put(0, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T314 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.put(0, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, 0]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[0, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T315 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.put(1, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[1, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, 0]", expect = Expect.ACCEPTABLE)
    @State
    public static class T316 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.put(1, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T317 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.put(0, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T318 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.put(0, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, 1]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[0, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T319 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.put(1, 0));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, 1]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[1, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T320 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            obj.clear();
            result.r2 = ResultAdapter.get(obj.put(1, 1));
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T321 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.containsKey(0));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T322 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.containsKey(1));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T323 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.containsKey(0));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T324 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.containsKey(1));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T325 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.get(0));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T326 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.get(1));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T327 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.get(0));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T328 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.get(1));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[true, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T329 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(0, 0));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[true, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T330 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(0, 1));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T331 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(1, 0));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T332 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(1, 1));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T333 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(0, 0));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T334 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(0, 1));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[true, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T335 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(1, 0));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[true, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[false, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T336 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.containsKey(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(1, 1));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T337 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.containsKey(0));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T338 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.containsKey(1));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T339 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.containsKey(0));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T340 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.containsKey(1));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T341 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.get(0));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T342 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.get(1));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T343 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.get(0));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T344 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.get(1));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[0, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T345 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(0, 0));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[1, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T346 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(0, 1));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T347 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(1, 0));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T348 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(1, 1));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T349 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(0, 0));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T350 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(0, 1));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[0, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T351 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(1, 0));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[1, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T352 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.get(1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(1, 1));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, true]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T353 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.containsKey(0));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T354 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.containsKey(1));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, true]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T355 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.containsKey(0));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T356 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.containsKey(1));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T357 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.containsKey(0));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, true]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T358 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.containsKey(1));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T359 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.containsKey(0));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, true]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, false]", expect = Expect.ACCEPTABLE)
    @State
    public static class T360 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.containsKey(1));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, 0]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T361 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.get(0));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T362 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.get(1));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, 1]", expect = Expect.ACCEPTABLE)
    @State
    public static class T363 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.get(0));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T364 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.get(1));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T365 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.get(0));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, 0]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T366 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.get(1));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T367 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.get(0));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, 1]", expect = Expect.ACCEPTABLE)
    @State
    public static class T368 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.get(1));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, 0]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[0, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T369 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(0, 0));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[1, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, 0]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T370 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(0, 1));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T371 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(1, 0));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T372 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(1, 1));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[0, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, 1]", expect = Expect.ACCEPTABLE)
    @State
    public static class T373 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(0, 0));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[1, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, 1]", expect = Expect.ACCEPTABLE)
    @State
    public static class T374 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(0, 1));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T375 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(1, 0));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T376 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(0, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(1, 1));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T377 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(0, 0));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T378 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(0, 1));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, 0]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[0, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T379 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(1, 0));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[1, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, 0]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T380 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 0));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(1, 1));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T381 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(0, 0));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @State
    public static class T382 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(0, 1));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[0, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, 1]", expect = Expect.ACCEPTABLE)
    @State
    public static class T383 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(1, 0));
            obj.clear();
        }
    }
    
    @JCStressTest
    @Outcome(id = "[1, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, null]", expect = Expect.ACCEPTABLE)
    @Outcome(id = "[null, 1]", expect = Expect.ACCEPTABLE)
    @State
    public static class T384 {
        ConcurrentSkipListMap obj = new java.util.concurrent.ConcurrentSkipListMap();
        
        @Actor
        public void actor1(StringResult2 result) {
            result.r1 = ResultAdapter.get(obj.put(1, 1));
        }
        
        @Actor
        public void actor2(StringResult2 result) {
            result.r2 = ResultAdapter.get(obj.put(1, 1));
            obj.clear();
        }
    }
}

