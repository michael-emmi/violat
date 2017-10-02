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

        options.addOption(Option.builder().longOpt("weak")
            .desc("use weak atomicity")
            .build());

        options.addOption(Option.builder().longOpt("weak-relax-lin-happens-before")
            .desc("relax happens before in linearizability for weak atomicity")
            .build());

        options.addOption(Option.builder().longOpt("weak-relax-vis-happens-before")
            .desc("relax happens before in visibility for weak atomicity")
            .build());

        options.addOption(Option.builder().longOpt("weak-relax-returns")
            .desc("relax return values for weak atomicity")
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
        OutcomeCollector collector = new OutcomeCollector(
            line.hasOption("weak"),
            line.hasOption("weak-relax-lin-happens-before"),
            line.hasOption("weak-relax-vis-happens-before"),
            line.hasOption("weak-relax-returns"));
        int status = 0;
        try {
            while (scanner.hasNext()) {
                try (JsonReader reader = Json.createReader(new StringReader(scanner.next()))) {
                    JsonObject o = reader.readObject();
                    Harness h = HarnessFactory.fromJson(o);
                    JsonWriter writer = Json.createWriter(System.out);
                    System.out.println("---");
                    writer.write(Results.merge(o, Results.outcomes(collector.collect(h))));
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
