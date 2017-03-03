package org.mje.blah;

import java.lang.reflect.*;
import java.util.*;

public class HarnessFactory {

    public static Harness allAgainstOne(Invocation cons, Invocation... invocations) {
        PartialOrder<InvocationSequence> po = new PartialOrder<>();
        po.add(new InvocationSequence(Arrays.copyOf(invocations, invocations.length-1)));
        po.add(new InvocationSequence(invocations[invocations.length-1]));
        return new Harness(cons, po);
    }
}
