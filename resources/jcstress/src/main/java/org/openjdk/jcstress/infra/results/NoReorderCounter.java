package org.openjdk.jcstress.infra.results;

import java.util.*;
import java.util.stream.*;

public class NoReorderCounter {
    int counter = 0;

    public int get() {
        return counter;
    }

    public void increment() {
        counter++;
    }
}
