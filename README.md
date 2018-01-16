# Qooxdoo Compiler and Command Line Interface

**NOTE** If you have previous installed `qooxdoo-cli`, please uninstall it before continuing

[![Build Status](https://travis-ci.org/qooxdoo/qooxdoo-cli.svg?branch=master)](https://travis-ci.org/qooxdoo/qooxdoo-cli)

Qooxdoo-Compiler is the new compiler and command line interface for Qooxdoo (http://qooxdoo.org) applications, written in 100% Node.JS Javascript it adds these key improvements over the standard python generator:

* Includes Babel for adding ES6 to all Qooxdoo applications 
* Fast (up to 24x faster) and low resource usage (tiny cache, low CPU usage)
* Backward compatible with existing Qooxdoo apps
* Written in 100% Javascript
* API based, easily extended and with dependency information available at runtime

One of the top goals of this project is to be very fast and lightweight - fast enough to detect code changes and recompile  applications on the fly on a production server, with an application recompile costing a few hundreds of milliseconds.

The included command line utility allows you create, build and manage [qooxdoo](http://www.qooxdoo.org) applications.

<!-- TOC -->

- [qooxdoo command line interface](#qooxdoo-compiler-and-command-line-interface)
    - [Develoment status](#development-status)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Installation for Development](#installation-for-development)
    - [Example command line usage](#example-command-line-usage)
    - [Documentation](#documentation)
        - [Commands](docs/cli/commands)
        - [Compiler](docs/cli/compiler)
        - [Create a new project](docs/cli/create-a-new-project)
        - [qooxdoo-contrib system](docs/cli/qooxdoo-contrib-system)

<!-- /TOC -->

## Development status
Beta. The API is still likely to change, but not fundamentally.

## Prerequisites
- **Node** Currently requires NodeJS v8. The released version will be 
  transpiled to support earlier node versions, but whichever version you 
  choose to use we recommend you consider `nvm` to ease installing and 
  switching between node versions - you can find the Linux version at 
  http://nvm.sh and there is a version for Windows at 
  https://github.com/coreybutler/nvm-windows 

Install `nvm` and then:

```bash
nvm install 8
nvm use 8
```

## Installation
- Install qooxdoo-compiler, create a sample application and compile it
```bash
npm install -g qooxdoo-compiler
qx create myapp
cd myapp
qx compile
```

## Installation for Development
- Install qooxdoo-compiler 
```bash
git clone https://github.com/qooxdoo/qooxdoo-compiler
cd qooxdoo-compiler
npm install
```

- In order to have a globally callable executable, do the following:
```bash
npm link
```

- Pay attention: the linking must be repeated after an `npm install`. `npm install` substitutes the links with the NPM modules.

## Example command line usage
```bash
qx create myapp -I # creates the foo application skeleton non-interactively
cd myapp

# (optional) install contrib libraries
qx contrib update # updates the local cache with information on available contribs 
qx contrib list # lists contribs compatible with myapp's qooxdoo version, determine installation candidate
qx contrib install johnspackman/UploadMgr # install UploadMgr contrib library 

# compile the application, using the compile.json default configuration values 
qx compile
```

Use `--all` if you don't get any contribs listed or if the ones you are 
looking for are missing. The reason is that they might not declare 
compatibility to the qooxdoo version you are using yet, even though they are 
technically compatible. 




## Current state of play
Qooxdoo Compiler is a BETA RELEASE - at this stage, the compiler is expected to be able to compile production applications (use at your own risk) but still has some ancillary features such as API viewer and TestRunner maker which would be required in order to be a release candidate for Qooxdoo 6.0.

It is currently (October 2017) in use on one major project which is in pre-production testing with real users, and another is about to be released; Qooxdoo Compiler is used for source and build releases, and while there may be some issues that will crop up it is stable enough for most users.

The command line tools are housed in the [Qooxdoo-Cli](https://github.com/qooxdoo/qooxdoo-cli) project, which includes facilities to manage contribs nd continuous, automatic compilation.


## Qooxdoo-CLI
Note that Qooxdoo-Compiler now incorporates Qooxdoo-CLI
 



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
* [API - Overview](docs/compiler/API.md)
* [Dependencies - How they are handled in Qooxdoo-Compiler](docs/compiler/Dependencies.md)


## Minimum Requirements
Qooxdoo-Compiler requires Node 8.x; support for LTS versions (currently node 6.x) will be included thanks to Babel.  (Note that there is no longer a dependency on ImageMagick)


## Is Qooxdoo-Compiler a complete replacement for generate.py?
Not yet - QxCompiler is focused on compiling applications (including collecting resources) whereas generate.py includes features for building and running test suites, creating API documentation, building distributions, creating skeleton applications, etc.

The goal is to move to a 100% Javascript toolchain, and QxCompiler will be used as the base API for implementing all the compilation-related features; by using existing tools like npm, repackaging the API viewer and TestRunner as separate contribs generate.py will be deprecated in 6.0 and removed in 7.0.


## What about config.json?  QOOXDOO_PATH?
config.json is not used by QxCompiler; the `qx` command is using a new, and much simpler configuration file called compile.json


## Contributing and Getting In Touch
Please get stuck in to any aspects you'd like to work on - I'm open to pull requests, and you can contact me to chat 
about features you'd like to see or help on using or extending Qooxdoo-Compiler.  The best place to talk about it is on Gitter at https://gitter.im/qooxdoo/qooxdoo


## Feature TODO list
* Warnings for unresolved symbols and unsupported compiler hints
* Enable source maps
* Lint processing
* Part loading

