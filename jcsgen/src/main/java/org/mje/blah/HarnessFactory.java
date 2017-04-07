package org.mje.blah;

import java.lang.reflect.*;
import java.util.*;
import java.util.stream.*;
import javax.json.*;

public class HarnessFactory {

    public static Harness fromJson(JsonObject object)
    throws ClassNotFoundException, NoSuchMethodException {
        Map<Integer, InvocationSequence> numbering = new HashMap<>();

        InvocationFactory f = new InvocationFactory(object.getString("class"));

        for (JsonObject sequence : object.getJsonArray("sequences")
                .getValuesAs(JsonObject.class)) {

            List<Invocation> invocations = new LinkedList<>();
            for (JsonObject i : sequence.getJsonArray("invocations")
                    .getValuesAs(JsonObject.class))

                invocations.add(f.get(
                    i.getString("method"),
                    i.getJsonArray("arguments").stream()
                        .map(HarnessFactory::fromJsonValue).toArray()));

            numbering.put(
                sequence.getInt("index"),
                new InvocationSequence(invocations));
        }

        PartialOrder<InvocationSequence> p = new PartialOrder<>(numbering.values());

        for (JsonArray ordering : object.getJsonArray("order")
                .getValuesAs(JsonArray.class))

            p.add(
                numbering.get(ordering.getInt(0)),
                numbering.get(ordering.getInt(1)));

        return new Harness(f.get(
            object.getJsonArray("parameters").stream()
                .map(HarnessFactory::fromJsonValue).toArray()),
            p);
    }

    static Object fromJsonValue(JsonValue value) {
        switch (value.getValueType()) {
            case NULL:
                return null;
            case TRUE:
                return new Boolean(true);
            case FALSE:
                return new Boolean(false);
            case NUMBER:
                return new Integer(((JsonNumber) value).intValue());
            case STRING:
                return ((JsonString) value).getString();
            case ARRAY:
                return ((JsonArray) value).stream()
                    .map(HarnessFactory::fromJsonValue)
                    .collect(Collectors.toList());
        }

        throw new RuntimeException("Unexpected JSON value: " + value);
    }
}
