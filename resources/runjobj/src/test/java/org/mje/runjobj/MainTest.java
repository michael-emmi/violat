package org.mje.runjobj;

import java.io.*;
import java.util.*;

import org.junit.*;
import org.junit.runner.*;
import org.junit.runners.Parameterized;
import org.junit.runners.Parameterized.*;

@RunWith(value = Parameterized.class)
public class MainTest  {
    ClassLoader classLoader = getClass().getClassLoader();

    String example;

    public MainTest(String example) {
        this.example = example;
    }

    String get(String resource) throws Exception {
        InputStream stream = classLoader.getResourceAsStream(resource);
        Scanner scanner = new Scanner(stream, "utf-8");
        return scanner.useDelimiter("\\Z").next();
    }

    @Parameters(name = "{0}")
    public static Collection<String> examples() {
        return Arrays.asList(new String[]{
            "linked-list"
        });
    }

    @Test
    public void test() throws Exception {
        assert Main
            .processRequest(get(example + ".in"))
            .equals(get(example + ".out"));
    }
}
