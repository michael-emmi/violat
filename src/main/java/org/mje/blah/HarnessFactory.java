package org.mje.blah;

import java.lang.reflect.*;
import java.util.*;

public class HarnessFactory {

    public static Harness allAgainstOne(Invocation cons, Invocation... invocations) {
        Class<?> c = cons.getMethod().getDeclaringClass();
        return new Harness(
            cons,
            Arrays.asList(invocations),
            Arrays.asList(new List[]{
                Arrays.asList(new Integer[]{0, 1, 2}),
                Arrays.asList(new Integer[]{3})
            }),
            Arrays.asList(new List[]{
                Arrays.asList(new Integer[]{0,1})
            })
        );
    }
}
