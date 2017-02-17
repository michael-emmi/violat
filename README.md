# Non-Linearizability Tests for Java Concurrent Collections

This project demonstrates that many of the methods in Java’s library of
[concurrent collections][] are non-linearizable. For each non-linearizable
method in the selected collection classes, a small test harness witnesses
linearizability violations via stress testing with OpenJDK’s jcstress tool.
These tests are run with the following command:

    gradle jcstress

After running many tests, this command generates a report located at
`build/reports/jcstress/index.html`. The test results marked as `INTERESTING`
witness linearizability violations. Since some of these violations occur very
infrequently, multiple runs of the above command may be necessary, in case the
first does not witness violations on the first run.

This project depends on the [Java SE Development Kit 8][] and [Gradle][].

[concurrent collections]: https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/package-summary.html
[Java SE Development Kit 8]: http://www.oracle.com/technetwork/java/javase
[Gradle]: http://gradle.org
