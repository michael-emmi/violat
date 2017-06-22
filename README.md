[![Build Status](https://travis-ci.org/michael-emmi/violat.svg?branch=master)](https://travis-ci.org/michael-emmi/violat)
[![npm version](https://badge.fury.io/js/violat.svg)](https://badge.fury.io/js/violat)

## Violat
Find test harnesses that expose atomicity violations.

This project demonstrates that many of the methods in Java’s library of
[concurrent collections][] are non-linearizable. For each non-linearizable
method in the selected collection classes, a small test harness witnesses
violations via stress testing with OpenJDK’s [jcstress][] tool.

# Requirements

* [Node.js][]
* [Java SE Development Kit 8][]
* [Gradle][]
* [Maven][]

# Installation

    $ npm i -g violat

# Usage

    $ violat

# Development

Emulate installation of local repository:

    $ npm link

Release a new version to npm:

    $ npm version [major|minor|patch]
    $ npm publish

[Node.js]: https://nodejs.org
[concurrent collections]: https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/package-summary.html
[Java SE Development Kit 8]: http://www.oracle.com/technetwork/java/javase
[Gradle]: http://gradle.org
[Maven]: https://maven.apache.org
[jcstress]: http://openjdk.java.net/projects/code-tools/jcstress/
