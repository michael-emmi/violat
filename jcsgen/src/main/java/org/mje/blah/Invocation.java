package org.mje.blah;

import java.lang.reflect.*;
import java.util.*;
import java.util.stream.*;

public class Invocation {
    Executable method;
    Object[] arguments;

    public Invocation(Executable method, Object... arguments) {
        this.method = method;
        this.arguments = arguments;
    }

    public Executable getMethod() {
        return method;
    }

    public Object[] getArguments() {
        return arguments;
    }

    public boolean isVoid() {
        return (method instanceof Constructor)
            || ((Method) method).getReturnType().equals(Void.TYPE);
    }

    public Object invoke()
    throws InstantiationException,
           IllegalAccessException,
           IllegalArgumentException,
           InvocationTargetException {

        if (method instanceof Constructor)
            return ((Constructor<?>) method).newInstance(arguments);
        else
            throw new InstantiationException("Invalid constructor.");
    }

    public Object invoke(Object target)
    throws IllegalAccessException,
           IllegalArgumentException {

        if (method instanceof Method) {
            try {
                return ((Method) method).invoke(target, arguments);
            } catch (InvocationTargetException e) {
                return e.getCause();
            }
        } else
            throw new IllegalArgumentException("Invalid method.");
    }

    public String toString() {
        return method.getName() + "("
            + Arrays.stream(arguments).map(Object::toString)
                .collect(Collectors.joining(", "))
            + ")";
    }
}
