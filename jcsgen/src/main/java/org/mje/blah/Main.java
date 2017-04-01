package org.mje.blah;

import java.io.*;
import java.util.*;
import javax.json.*;
import org.apache.commons.cli.*;

public class Main {
    final static String PROGRAM_NAME = "jcsgen";
    final static String DESCRIPTION = "JCStress harness generator";

    static Options getOptions() {
        Options options = new Options();

        options.addOption(Option.builder().longOpt("help")
            .desc("print this message")
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
            while (scanner.hasNext()) {
                try (JsonReader reader = Json.createReader(new StringReader(scanner.next()))) {
                    JsonObject o = reader.readObject();
                    Harness h = HarnessFactory.fromJson(o);
                    JsonWriter writer = Json.createWriter(System.out);
                    System.out.println("---");
                    writer.write(Results.add(o, h.getResults()));
                    System.out.println();
                }
            }
        } catch (Exception e) {
            System.err.println("Caught " + e);
            e.printStackTrace();
            status = 1;
        }

        System.exit(status);
    }
}
