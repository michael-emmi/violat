package org.mje.blah;

import java.lang.reflect.*;
import java.util.*;
import java.util.stream.*;

public class InvocationFactory {

    Class<?> _class;

    public InvocationFactory(Class<?> _class) {
        this._class = _class;
    }

    public InvocationFactory(String className) throws ClassNotFoundException {
        this(Class.forName(className));
    }

    public Invocation get(Executable method, Object... args) {
        return new Invocation(method, args);
    }

    public Invocation get(Class<?>[] params, Object... args)
    throws NoSuchMethodException {
        return get(_class.getConstructor(params), args);
    }

    public Invocation get(Object... args)
    throws NoSuchMethodException {
        Class<?>[] types =
            Arrays.stream(args).map(a -> a.getClass()).toArray(Class<?>[]::new);

        Constructor<?>[] constructors =
            Arrays.stream(_class.getConstructors())
            .filter(c -> isAssignableFrom(c.getParameterTypes(), types))
            .toArray(Constructor<?>[]::new);

        if (constructors.length != 1)
            throw new NoSuchMethodException("unknown or ambiguous constructor");

        return get(constructors[0], args);

    }

    public Invocation get(String methodName, Class<?>[] params, Object... args)
    throws NoSuchMethodException {
        return get(_class.getMethod(methodName, params), args);
    }

    public Invocation get(String methodName, Object... args)
    throws NoSuchMethodException {
        Class<?>[] types =
            Arrays.stream(args).map(a -> a.getClass()).toArray(Class<?>[]::new);

        Method[] methods =
            Arrays.stream(_class.getMethods())
            .filter(m -> m.getName().matches(methodName))
            .filter(m -> isAssignableFrom(m.getParameterTypes(), types))
            .toArray(Method[]::new);

        if (methods.length != 1)
            throw new NoSuchMethodException("unknown or ambiguous method: " + methodName);

        return get(methods[0], args);
    }

    boolean isAssignableFrom(Class<?>[] params, Class<?>[] args) {
        if (params.length != args.length)
            return false;
        for (int i = 0; i < params.length; i++)
            if (!params[i].isAssignableFrom(args[i]))
                return false;
        return true;
    }
}
