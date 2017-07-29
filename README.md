#QxCompiler

QxCompiler is a compiler for Qooxdoo (http://qooxdoo.org) applications, written in Node.JS Javascript it adds these key 
improvements over the standard python generator:

* Includes Babel for adding ES6 to all Qooxdoo applications 
* Fast (up to 24x faster) and low resource usage (tiny cache, low CPU usage)
* Backward compatible with existing Qooxdoo apps (you can use it out-of-the-box, no changes to your code required)
* Written in 100% Javascript
* API based, easily extended and with dependency information available at runtime

**NOTE** QxCompiler no longer requires a custom branch of qooxdoo - but you must use the current master branch of Qooxdoo (https://github.com/qooxdoo/qooxdoo).


##Current state of play
QxCompiler is an alpha release - it runs all of the tests in the demo browser and looks solid, but there are likely to
be bugs.

There are some basic functions which need to be built to make this project more accessible, EG a command line application,
an easy npm-based installation, and a continuous compilation app.

One of the top goals of this project is to be very fast and lightweight - fast enough to detect code changes and recompile 
applications on the fly on a production server, with an application recompile costing a few hundreds of milliseconds.


##Getting Started
Checkout the QxCompiler repository:

```
git clone https://github.com/qooxdoo/qxcompiler.git
cd qxcompiler
```


There is a command line application which is work in progress at https://github.com/qooxdoo/qx-cli - please see that
project for more details


###Demo Browser
The Demo Browser is compiled by running test/compile-demo-browser.js - it will create the Demo Browser in testdata/demobrowser/


##Gotchas
Number one gotcha is that you have to run the compiler every time you change your code, because it's being transpiled.
This will get easy "real soon now" with a continuous compilation, but for the moment you have to run the compiler manually.

The old style compiler hints (eg #require, #asset etc) have been deprecated in generate.py for some time now, and they
are not supported in QxCompiler at all (there will be some warnings output "real soon now" but it is a good idea to
do a quick grep through your code)


##Documentation
The documentation is a bit thin right now, but I'm working on it - please get in touch if you need help (see 
"Contributing and Getting In Touch" below)
* [API - Overview](docs/API.md)
* [Dependencies - How they are handled in QxCompiler](docs/Dependencies.md)


##Minimum Requirements
QxCompiler requires Node 8.x; support for LTS versions (currently node 6.x) will be included thanks to Babel.  You also need 
to have ImageMagick installed

```
sudo yum install ImageMagick
```


##Is QxCompiler a complete replacement for generate.py?
Not yet - QxCompiler is focused on compiling applications (including collecting resources) whereas generate.py includes features 
for building and running test suites, creating API documentation, building distributions, creating skeleton applications, etc.
The goal is to move to a 100% Javascript toolchain, and QxCompiler will be used as the base API for implementing all those
other features of generate.py - work is in progress, please see also [qx-cli](https://github.com/qooxdoo/qx-cli)


##What about config.json?  QOOXDOO_PATH?
config.json is not used by QxCompiler; the [qx-cli](https://github.com/qooxdoo/qx-cli) project is using a new, and much simpler
configuration file called compile.json 


##Contributing and Getting In Touch
Please get stuck in to any aspects you'd like to work on - I'm open to pull requests, and you can contact me to chat 
about features you'd like to see or help on using or extending QxCompiler.  Send me an email at john.spackman@zenesis.com
or Skype me on johnspackman1 but the *best* place to talk about it is on Gitter at https://gitter.im/qooxdoo/qooxdoo


##Feature TODO list
* Warnings for unresolved symbols and unsupported compiler hints
* Enable source maps
* Lint processing
* Part loading

