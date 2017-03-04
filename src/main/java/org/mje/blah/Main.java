package org.mje.blah;

import java.io.*;
import java.nio.file.*;
import java.util.*;

public class Main {

    static String P = "org.mje.auto";
    static String C = "AutogenHarness";

    public static void main(String... args) {
        try {

            InvocationFactory f = new InvocationFactory("java.util.concurrent.ConcurrentLinkedQueue");
            Harness h = HarnessFactory.allAgainstOne(
                f.get(),
                f.get("add", 1),
                f.get("add", 2),
                f.get("clear"),
                f.get("peek")
            );

            Path root = Paths.get("src", "jcstress", "java");
            Path auto = Paths.get(root.toString(), P.split("[.]"));
            Path file = Paths.get(auto.toString(), C + ".java");

            File dir = new File(auto.toString());
            if (!dir.exists())
                dir.mkdir();

            try(PrintWriter out = new PrintWriter(file.toString())) {
                out.println(new JCStressHarnessPrinter(P, C, h).toString());
            }

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("CLASS PROBLEMS: " + e);
        }
    }
}
