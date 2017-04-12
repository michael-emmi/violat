package org.mje.blah;

import java.util.*;
import java.util.stream.*;
import javax.json.*;

public class Results {

    static String of(Object a) {
        if (a instanceof Exception)
            return String.valueOf(a.getClass().getSimpleName());

        else if (a instanceof Enumeration)
            return Collections.list((Enumeration<?>) a).stream()
                .map(Results::of)
                .collect(Collectors.joining(",", "[", "]"));

        else if (a instanceof Object[])
            return Arrays.stream((Object[]) a)
                .map(Results::of)
                .collect(Collectors.joining(",", "[", "]"));
        else
            return String.valueOf(a);
    }

    public static JsonObject add(JsonObject src,
            Collection<SortedMap<Integer,String>> results,
            int numLinearizations) {

        JsonObjectBuilder b0 = Json.createObjectBuilder();
        src.entrySet().forEach(e -> b0.add(e.getKey(), e.getValue()));

        JsonArrayBuilder b1 = Json.createArrayBuilder();
        for (SortedMap<Integer,String> result : results) {
            JsonArrayBuilder b2 = Json.createArrayBuilder();
            for (String x : result.values())
                b2.add(x);
            b1.add(b2.build());
        }
        return b0
            .add("outcomes", b1.build())
            .add("linearizations", numLinearizations)
            .build();
    }

}
