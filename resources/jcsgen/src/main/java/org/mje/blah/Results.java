package org.mje.blah;

import java.util.*;
import java.util.function.*;
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

    static JsonObject merge(JsonObject... objects) {
        JsonObjectBuilder b = Json.createObjectBuilder();
        for (JsonObject object : objects)
            object.entrySet().forEach(e -> b.add(e.getKey(), e.getValue()));
        return b.build();
    }

    static JsonObject outcomes(Iterable<Outcome> outcomes) {
        JsonObjectBuilder b = Json.createObjectBuilder();
        b.add("outcomes", sequence(outcomes, Results::outcome));
        return b.build();
    }

    static JsonValue outcome(Outcome outcome) {
        JsonObjectBuilder b = Json.createObjectBuilder();
        b.add("sequence", sequence(outcome.values()));
        b.add("properties", properties(outcome.properties));
        b.add("frequency", outcome.frequency);
        return b.build();
    }

    static JsonValue properties(Properties properties) {
        JsonArrayBuilder b = Json.createArrayBuilder();
        for (Object p : properties.keySet())
            if (properties.get(p).equals(true))
                b.add(p.toString());
        return b.build();
    }

    static <T> JsonValue sequence(Iterable<T> items, Function<T,JsonValue> conversion) {
        JsonArrayBuilder b = Json.createArrayBuilder();
        for (T item : items)
            b.add(conversion.apply(item));
        return b.build();
    }

    static JsonValue sequence(Iterable<?> items) {
        JsonArrayBuilder b = Json.createArrayBuilder();
        for (Object item : items)
            b.add(item.toString());
        return b.build();
    }
}
