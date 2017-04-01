## find-non-linearizability-tests

Find test harnesses that expose linearizability violations.

This project demonstrates that many of the methods in Java’s library of
[concurrent collections][] are non-linearizable. For each non-linearizable
method in the selected collection classes, a small test harness witnesses
linearizability violations via stress testing with OpenJDK’s jcstress tool.

# Requirements

* [Node.js][]
* [Java SE Development Kit 8][]
* [Gradle][]

# Installation

    npm install find-non-linearizability-tests

# Usage

    $ find-non-linearizability-tests

[Node.js]: https://nodejs.org
[concurrent collections]: https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/package-summary.html
[Java SE Development Kit 8]: http://www.oracle.com/technetwork/java/javase
[Gradle]: http://gradle.org
