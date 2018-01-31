package org.mje.runjobj;

import java.io.*;
import java.lang.reflect.*;
import java.util.*;
import java.util.logging.*;
import java.util.stream.*;
import javax.json.*;

public class Main {
    static Logger logger = Logger.getLogger("runjobj");

    public static void main(String[] args) {
        try {
            BufferedReader reader =
                new BufferedReader(new InputStreamReader(System.in));

            while (true) {
                String line = reader.readLine();
                if (line == null)
                    System.exit(0);
                System.out.println(processRequest(line));
            }
        } catch (Exception e) {
            e.printStackTrace();
            System.exit(-1);
        }
    }

    static String processRequest(String json) throws Exception {
        Object object = null;
        List<String> results = new LinkedList<>();

        logger.fine("request: " + json);

        for (Invocation invocation : Invocation.parse(json)) {
            logger.fine("invocation: " + invocation);

            if (object == null) {
                object = invocation.construct();

            } else {
                String result = Values.toString(invocation.invoke(object));
                logger.fine("result: " + result);
                results.add(result);
            }
        }

        String response = Values.toJson(results).toString();
        logger.fine("response: " + response);

        return response;
    }

    static class Invocation {
        final Executable executable;
        final Object[] arguments;

        static List<Invocation> parse(String json)
        throws ClassNotFoundException, NoSuchMethodException {
            List<Invocation> invocations = new LinkedList<>();

            JsonObject sequence =
                Json.createReader(new StringReader(json)).readObject();

            if (!sequence.containsKey("class") || !sequence.containsKey("invocations"))
                return invocations;

            Class<?> klass = Class.forName(sequence.getString("class"));

            invocations.add(new Invocation(klass,
                getParameterTypes(sequence.getJsonObject("constructor")),
                getArguments(sequence)));

            for (JsonObject invocation : sequence.getJsonArray("invocations")
                    .getValuesAs(JsonObject.class))

                invocations.add(new Invocation(klass,
                    invocation.getJsonObject("method").getString("name"),
                    getParameterTypes(invocation.getJsonObject("method")),
                    getArguments(invocation)));

            return invocations;
        }

        static Class<?>[] getParameterTypes(JsonObject method)
        throws ClassNotFoundException {
            List<Class<?>> parameters = new LinkedList<>();
            for (JsonObject parameter : method
                    .getJsonArray("parameters")
                    .getValuesAs(JsonObject.class))
                parameters.add(getParameterType(parameter.get("type")));
            return parameters.toArray(new Class<?>[0]);
        }

        static Class<?> getParameterType(JsonValue type)
        throws ClassNotFoundException {
            switch (type.getValueType()) {
                case STRING:
                    return getClass(((JsonString) type).getString());
                case ARRAY:
                    return getClass("java.util.Collection");
                case OBJECT:
                    return getClass("java.util.Map");
                default:
                    throw new RuntimeException("Unexpected parameter type: "+ type);
            }
        }

        static Class<?> getClass(String typeName)
        throws ClassNotFoundException {
            switch (typeName) {
                case "byte": return byte.class;
                case "short": return short.class;
                case "int": return int.class;
                case "long": return long.class;
                case "float": return float.class;
                case "double": return double.class;
                case "boolean": return boolean.class;
                case "char": return char.class;
                default: return Class.forName(typeName);
            }
        }

        static Object[] getArguments(JsonObject invocation) {
            List<Object> arguments = new LinkedList<>();
            for (JsonValue argument : invocation.getJsonArray("arguments")
                    .getValuesAs(JsonValue.class))
                arguments.add(Values.toObject(argument));
            return arguments.toArray();
        }

        Invocation(Class<?> klass, Class<?>[] parameters, Object[] arguments)
        throws NoSuchMethodException {
            this(klass.getConstructor(parameters), arguments);
        }

        Invocation(Class<?> klass, String name, Class<?>[] parameters, Object[] arguments)
        throws NoSuchMethodException {
            this(klass.getMethod(name, parameters), arguments);
        }

        Invocation(Executable executable, Object[] arguments) {
            this.executable = executable;
            this.arguments = arguments;
        }

        Object construct()
        throws InstantiationException, IllegalAccessException, InvocationTargetException {
            assert executable instanceof Constructor : "expected constructor invoation";
            return ((Constructor) executable).newInstance(arguments);
        }

        Object invoke(Object target)
        throws IllegalAccessException, InvocationTargetException {
            assert executable instanceof Method : "expected method invocation";
            try {
                return ((Method) executable).invoke(target, arguments);
            } catch (InvocationTargetException e) {
                return e.getCause();
            }
        }

        public String toString() {
            return executable.getName() +
                Stream.of(arguments)
                .map(Object::toString)
                .collect(Collectors.joining(",", "(", ")"));
        }
    }

    static class Values {
        static Object toObject(JsonValue value)
        throws IllegalArgumentException {
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
                        .map(Values::toObject)
                        .collect(Collectors.toList());
                case OBJECT:
                    return ((JsonObject) value).entrySet().stream()
                        .collect(Collectors.toMap(
                            e -> Integer.parseInt(e.getKey()),
                            e -> toObject(e.getValue())
                        ));
            }
            throw new IllegalArgumentException(
                "Cannot convert JSON value '" + value + "' to primitive type");
        }

        static JsonValue toJson(List<String> results) {
            JsonArrayBuilder builder = Json.createArrayBuilder();
            for (String result : results)
                builder.add(result);
            return builder.build();
        }

        static String toString(Object object) {
            if (object instanceof Exception)
                return String.valueOf(object.getClass().getName());

            else if (object instanceof Enumeration)
                return Collections.list((Enumeration<?>) object).stream()
                    .map(Values::toString)
                    .collect(Collectors.joining(",", "[", "]"));

            else if (object instanceof Object[])
                return Arrays.stream((Object[]) object)
                    .map(Values::toString)
                    .collect(Collectors.joining(",", "[", "]"));
            else
                return String.valueOf(object);
        }
    }
}
