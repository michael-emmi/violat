package org.mje.blah;

import java.io.*;
import java.nio.file.*;
import java.util.*;
import javax.json.*;
import org.apache.commons.cli.*;

public class Main {
    final static String PROGRAM_NAME = "jcsgen";
    final static String DESCRIPTION = "JCStress harness generator";
    final static String CLASS_NAME_SUFFIX = "StressTests";

    static Options getOptions() {
        Options options = new Options();

        options.addOption(Option.builder().longOpt("help")
            .desc("print this message")
            .build());

        options.addOption(Option.builder().longOpt("path")
            .desc("path to output files (required)")
            .hasArg()
            .argName("PATH")
            .build());

        return options;
    }

    public static void main(String... args) {
        CommandLine line;

        try {
            line = new DefaultParser().parse(getOptions(), args);
        } catch (ParseException e) {
            line = null;
        }

        if (line == null
                || line.hasOption("help")
                || line.getArgs().length > 0
                || !line.hasOption("path")
                || System.console() != null) {

            new HelpFormatter().printHelp(
                PROGRAM_NAME + " [options]",
                DESCRIPTION + System.lineSeparator() + "options:",
                getOptions(),
                System.lineSeparator());
            return;
        }

        Scanner scanner = new Scanner(System.in).useDelimiter("---");
        int status = 0;
        try {
            Map<String,Integer> counts = new HashMap<>();

            while (scanner.hasNext()) {
                try (JsonReader reader = Json.createReader(new StringReader(scanner.next()))) {
                    for (Harness h : HarnessFactory.fromJson(reader.read())) {
                        String className = h.getTargetClass().getName();

                        if (!counts.containsKey(className))
                            counts.put(className, 0);

                        int n = counts.get(className) + 1;
                        counts.put(className, n);

                        String testClassName = className + CLASS_NAME_SUFFIX + n;

                        Path path = Paths.get(
                            line.getOptionValue("path"),
                            testClassName.replace(".", "/") + ".java");

                        path.toFile().getParentFile().mkdirs();

                        try (PrintWriter out = new PrintWriter(path.toFile())) {
                            out.println(new JCStressHarnessPrinter(
                                testClassName, Collections.singletonList(h)).toString());
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Caught " + e);
            status = 1;
        }

        System.exit(status);
    }
}
