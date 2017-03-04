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
        int count = 0;

        for (String file : args) {
            try {
                Harness harness;
                try (JsonReader reader = Json.createReader(new FileReader(file))) {
                    harness = HarnessFactory.fromJson(reader.readObject());
                }

                String className = CLASS_NAME_PREFIX + ++count;
                try (PrintWriter out = new PrintWriter(
                        Paths.get(CLASS_PATH.toString(), className + ".java")
                        .toString())) {

                    out.println(new JCStressHarnessPrinter(
                        PACKAGE_NAME, className, harness).toString());
                }

            } catch (Exception e) {
                System.err.println("Caught " + e + " while processing " + file);
            }
        }
    }
}
