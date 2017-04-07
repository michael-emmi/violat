package org.openjdk.jcstress.infra.results;

import java.util.*;
import java.util.stream.*;

public class ResultAdapter {

    public static String get(Object a) {
        if (a instanceof Exception)
            return String.valueOf(a.getClass().getSimpleName());

        else if (a instanceof Object[])
            return "[" + Arrays.stream((Object[]) a)
                .map(ResultAdapter::get)
                .collect(Collectors.joining(",")) + "]";

        else
            return String.valueOf(a);
    }
}
