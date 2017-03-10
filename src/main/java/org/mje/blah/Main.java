package org.mje.blah;

import java.io.*;
import java.nio.file.*;
import java.util.*;
import javax.json.*;

public class Main {

    static String PACKAGE_NAME = "org.mje.auto";
    static String CLASS_NAME_PREFIX = "AutogenHarness";
    static Path ROOT_PATH = Paths.get("src", "jcstress", "java");
    static Path CLASS_PATH = Paths.get(ROOT_PATH.toString(), PACKAGE_NAME.split("[.]"));

    public static void main(String... args) {
        int status = 0;
        int count = 0;

        for (String file : args) {
            try {
                Collection<Harness> harnesses;
                try (JsonReader reader = Json.createReader(new FileReader(file))) {
                    harnesses = HarnessFactory.fromJson(reader.read());
                }

                String className = CLASS_NAME_PREFIX + ++count;
                try (PrintWriter out = new PrintWriter(
                        Paths.get(CLASS_PATH.toString(), className + ".java")
                        .toString())) {

                    out.println(new JCStressHarnessPrinter(
                        PACKAGE_NAME, className, harnesses).toString());
                }

            } catch (Exception e) {
                System.err.println("Caught " + e + " while processing " + file);
                status = 1;
            }
        }

        System.exit(status);
    }
}
