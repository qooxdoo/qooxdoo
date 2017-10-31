# Qooxdoo-Compiler

Qooxdoo-Compiler is the new compiler for Qooxdoo (http://qooxdoo.org) applications, written in 100% Node.JS Javascript it adds these key 
improvements over the standard python generator:

* Includes Babel for adding ES6 to all Qooxdoo applications 
* Fast (up to 24x faster) and low resource usage (tiny cache, low CPU usage)
* Backward compatible with existing Qooxdoo apps
* Written in 100% Javascript
* API based, easily extended and with dependency information available at runtime

One of the top goals of this project is to be very fast and lightweight - fast enough to detect code changes and recompile  applications on the fly on a production server, with an application recompile costing a few hundreds of milliseconds.


## Current state of play
Qooxdoo Compiler is a BETA RELEASE - at this stage, the compiler is expected to be able to compile production applications (use at your own risk) but still has some ancillary features such as API viewer and TestRunner maker which would be required in order to be a release candidate for Qooxdoo 6.0.

It is currently (October 2017) in use on one major project which is in pre-production testing with real users, and another is about to be released; Qooxdoo Compiler is used for source and build releases, and while there may be some issues that will crop up it is stable enough for most users.

The command line tools are housed in the [Qooxdoo-Cli](https://github.com/qooxdoo/qooxdoo-cli) project, which includes facilities to manage contribs nd continuous, automatic compilation.


## Getting Started
Checkout the QxCompiler repository:

```
git clone https://github.com/qooxdoo/qooxdoo-compiler.git
cd qooxdoo-compiler
```



## Demo Browser
The Demo Browser is compiled by running test/compile-demo-browser.js - it will create the Demo Browser in testdata/demobrowser/


## Gotchas
Number one gotcha is that you have to run the compiler every time you change your code, because it's being transpiled.
The [Qooxdoo-Cli](https://github.com/qooxdoo/qooxdoo-cli) application has a `--watch` parameter that enables continuous compilation.

The old style compiler hints (eg #require, #asset etc) have been deprecated in generate.py for some time now, and they
are not supported in Qooxdoo-Compiler at all (there will be some warnings output "real soon now" but it is a good idea to do a quick grep through your code)


## Documentation
The documentation is a bit thin right now, but I'm working on it - please get in touch if you need help (see 
"Contributing and Getting In Touch" below)
* [API - Overview](docs/API.md)
* [Dependencies - How they are handled in QxCompiler](docs/Dependencies.md)


## Minimum Requirements
Qooxdoo-Compiler requires Node 8.x; support for LTS versions (currently node 6.x) will be included thanks to Babel.  (Note that there is no longer a dependency on ImageMagick)


## Is Qooxdoo-Compiler a complete replacement for generate.py?
Not yet - QxCompiler is focused on compiling applications (including collecting resources) whereas generate.py includes features for building and running test suites, creating API documentation, building distributions, creating skeleton applications, etc.

The goal is to move to a 100% Javascript toolchain, and QxCompiler will be used as the base API for implementing all the compilation-related features; by using existing tools like npm, repackaging the API viewer and TestRunner as separate contribs, and of course [Qooxdoo-Cli](https://github.com/qooxdoo/qooxdoo-cli) generate.py will be deprecated in 6.0 and removed in 7.0.


## What about config.json?  QOOXDOO_PATH?
config.json is not used by QxCompiler; the [qx-cli](https://github.com/qooxdoo/qx-cli) project is using a new, and much simpler configuration file called compile.json


## Contributing and Getting In Touch
Please get stuck in to any aspects you'd like to work on - I'm open to pull requests, and you can contact me to chat 
about features you'd like to see or help on using or extending Qooxdoo-Compiler.  The best place to talk about it is on Gitter at https://gitter.im/qooxdoo/qooxdoo


## Feature TODO list
* Warnings for unresolved symbols and unsupported compiler hints
* Enable source maps
* Lint processing
* Part loading

