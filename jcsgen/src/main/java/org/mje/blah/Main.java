package org.mje.blah;

import java.io.*;
import java.nio.file.*;
import java.util.*;
import javax.json.*;
import org.apache.commons.cli.*;

public class Main {
    final static String PROGRAM_NAME = "jcsgen";
    final static String DESCRIPTION = "generate ";
    final static String PACKAGE_NAME = "org.mje.auto";
    final static String CLASS_NAME_PREFIX = "AutogenHarness";

    static Options getOptions() {
        Options options = new Options();

        options.addOption(Option.builder().longOpt("help")
            .desc("print this message")
            .build());

        options.addOption(Option.builder().longOpt("output")
            .desc("path to output file (required)")
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
                || line.getArgs().length != 1
                || !line.hasOption("output")) {

            new HelpFormatter().printHelp(
                PROGRAM_NAME + " [options] <HARNESS-SPEC-FILE>.json",
                DESCRIPTION + System.lineSeparator() + "options:",
                getOptions(),
                System.lineSeparator());
            return;
        }

        String file = line.getArgs()[0];
        int status = 0;

        try {
            Collection<Harness> harnesses;
            try (JsonReader reader = Json.createReader(new FileReader(file))) {
                harnesses = HarnessFactory.fromJson(reader.read());
            }

            String className = CLASS_NAME_PREFIX;
            try (PrintWriter out = new PrintWriter(line.getOptionValue("output"))) {
                out.println(new JCStressHarnessPrinter(
                    PACKAGE_NAME, className, harnesses).toString());
            }

        } catch (Exception e) {
            System.err.println("Caught " + e + " while processing " + file);
            status = 1;
        }

        System.exit(status);
    }
}
