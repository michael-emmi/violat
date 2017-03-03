package org.mje.blah;

import java.lang.reflect.*;

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
           IllegalArgumentException,
           InvocationTargetException {

        if (method instanceof Method)
            return ((Method) method).invoke(target, arguments);
        else
            throw new IllegalArgumentException("Invalid method.");
    }

    public String toString() {
        StringBuilder s = new StringBuilder();
        s.append(method.getName() + "(");
        for (Object a : arguments)
            s.append(a.toString());
        s.append(")");
        return s.toString();
    }
}
