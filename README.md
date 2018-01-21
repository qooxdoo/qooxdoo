# Qooxdoo Compiler and Command Line Interface

**NOTE** If you have previous installed `qooxdoo-cli`, please uninstall it before continuing

[![Gitter chat](https://badges.gitter.im/gitterHQ/gitter.png)](https://gitter.im/qooxdoo/qooxdoo)
[![Build Status](https://travis-ci.org/qooxdoo/qooxdoo-compiler.svg?branch=master)](https://travis-ci.org/qooxdoo/qooxdoo-compiler)

Qooxdoo-Compiler is the new compiler and command line interface for Qooxdoo (http://qooxdoo.org) applications, written in 100% Node.JS Javascript it adds these key improvements over the standard python generator:

* Includes Babel for adding ES6 to all Qooxdoo applications 
* Fast (up to 24x faster) and low resource usage (tiny cache, low CPU usage)
* Flexible and powerful command line tool for compiling and modifying applications
* Backward compatible with existing Qooxdoo apps
* Written in 100% Javascript
* API based, easily extended and with dependency information available at runtime

One of the top goals of this project is to be very fast and lightweight - fast enough to detect code changes and recompile  applications on the fly on a production server, with an application recompile costing a few hundreds of milliseconds.

The included command line utility allows you create, build and manage [qooxdoo](http://www.qooxdoo.org) applications (note that Qooxdoo-Compiler now incorporates the Qooxdoo-CLI project, which used to be a separate repo).

<!-- TOC -->

- [qooxdoo command line interface](#qooxdoo-compiler-and-command-line-interface)
    - [Develoment status](#development-status)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Installation for Development](#installation-for-development)
    - [Example command line usage](#example-command-line-usage)
    - [Current State Of Play](#current-state-of-play)
    - [Demo Browser)[#demo-browser)
    - [Mini Web Server](#mini-web-server)
    - [Frequently Asked Questions](#frequently-asked-questions)
    - CLI Documentation
        - [Commands](docs/cli/commands)
        - [Compiler](docs/cli/compiler)
        - [Web Server](docs/cli/serve)
        - [Create a new project](docs/cli/create-a-new-project)
        - [qooxdoo-contrib system](docs/cli/qooxdoo-contrib-system)
    - Compiler Documentation
        - [API - Overview](docs/compiler/API.md)
        - [Dependencies - How they are handled in Qooxdoo-Compiler](docs/compiler/Dependencies.md)
        - [Custom Application Startup](docs/compiler/CustomAppStartup)
        - [Using Icon Fonts](docs/compiler/IconFonts)
        - [Special Loader URLs](docs/compiler/LoaderUrls)
        - [Manifest.json Changes](docs/compiler/Manifest)
        - [Meta Data Output By The Compiler](docs/compiler/MetaData)


<!-- /TOC -->

## Development status
Beta. The API is still likely to change, but not fundamentally.

## Prerequisites
- **Node** Currently requires NodeJS v8. The released version will be transpiled to support earlier node versions, but whichever version you choose to use we recommend you consider `nvm` to ease installing and switching between node versions - you can find the Linux version at http://nvm.sh and there is a version for Windows at https://github.com/coreybutler/nvm-windows

- **Qooxdoo** Currently requires the latest [master of the Qooxdoo repo](https://github.com/qooxdoo/qooxdoo) - although `master` is cutting edge, we take care to keep it stable and suitable for production use (although use at your own risk, obviously).  Several of the core development team use `master` on live, production sites with real users ... so you know that we're committed to delivering a stable product. 
 

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
npm link
```


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


## Mini Web Server
Although many applications will run perfectly well when loaded via a `file://` URL, browser security means that some applications *must* use an `http://` url and to support this the CLI includes a mini web server which works with the continuous compilation.

See [docs/cli/serve](docs/cli/serve) for more details, but as an example this is all you need to constantly compile your application and start the web server:

```
$ qx serve
```



## Current state of play
Qooxdoo Compiler is a BETA RELEASE - at this stage, the compiler is expected to be able to compile production applications (use at your own risk) but still has some ancillary features such as API viewer and TestRunner maker which would be required in order to be a release candidate for Qooxdoo 6.0.

It is currently (October 2017) in use on one major project which is in pre-production testing with real users, and another is about to be released; Qooxdoo Compiler is used for source and build releases, and while there may be some issues that will crop up it is stable enough for most users.

The command line tools are housed in the [Qooxdoo-Cli](https://github.com/qooxdoo/qooxdoo-cli) project, which includes facilities to manage contribs nd continuous, automatic compilation.



## Demo Browser
The Demo Browser is compiled by running test/compile-demo-browser.js - it will create the Demo Browser in testdata/demobrowser/


## Frequently Asked Questions

### Gotchas
Number one gotcha is that you have to run the compiler every time you change your code, because it's being transpiled.
The `qx compile` command has a `--watch` parameter that enables continuous compilation.  Note that the `qx serve` command
always used continuous compilation.

The old style compiler hints (eg #require, #asset etc) have been deprecated in generate.py for some time now, and they
are not supported in Qooxdoo-Compiler at all (there will be some warnings output "real soon now" but it is a good idea to do a quick grep through your code)



### Is Qooxdoo-Compiler a complete replacement for generate.py?
Not yet - QxCompiler is focused on compiling applications (including collecting resources) whereas generate.py includes features for building and running test suites, creating API documentation, building distributions, creating skeleton applications, etc.

The goal is to move to a 100% Javascript toolchain, and QxCompiler will be used as the base API for implementing all the compilation-related features; by using existing tools like npm, repackaging the API viewer and TestRunner as separate contribs generate.py will be deprecated in 6.0 and removed in 7.0.


### What about config.json?  QOOXDOO_PATH?
config.json is not used by QxCompiler; the `qx` command is using a new, and much simpler configuration file called compile.json


### Contributing and Getting In Touch
Please get stuck in to any aspects you'd like to work on - I'm open to pull requests, and you can contact me to chat 
about features you'd like to see or help on using or extending Qooxdoo-Compiler.  The best place to talk about it is on Gitter at https://gitter.im/qooxdoo/qooxdoo

