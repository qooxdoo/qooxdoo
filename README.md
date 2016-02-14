#QxCompiler

QxCompiler is a compiler for Qooxdoo (http://qooxdoo.org) applications, written in Node.JS Javascript it adds these key 
improvements over the standard python generator:

* Includes Babel for adding ES6 to all Qooxdoo applications 
* Fast (up to 24x faster) and low resource usage (tiny cache, low CPU usage)
* Backward compatible with existing Qooxdoo apps (you can use it out-of-the-box, no changes to your code required)
* Written in 100% Javascript
* API based, easily extended and with dependency information available at runtime

**NOTE** While QxCompiler is backward compatible with generate.py and does not require changes to your code, ES6 support
requires that strict mode is enabled and this can introduce a few minor compatibility issues; also, QxCompiler uses a new
trick for managing dependencies and for both of these reasons you must use my fork of Qooxdoo (https://github.com/johnspackman/qooxdoo 
and use the **qxcompiler** branch).  My fork is based on Qooxdoo 5.0.1.


##Current state of play
QxCompiler is an alpha release - it runs all of the tests in the demo browser and looks solid, but there are likely to
be bugs.  It is included in the web framework I use internally and is likely to be in use on production servers by the
end of March 2016.

There are some basic functions which need to be built to make this project more accessible, EG a command line application,
an easy npm-based installation, and a continuous compilation app.

One of the top goals of this project is to be very fast and lightweight - fast enough to detect code changes and recompile 
applications on the fly on a production server, with an application recompile costing a few hundreds of milliseconds.


##Getting Started
Checkout the QxCompiler repository:

```
git clone https://github.com/johnspackman/qxcompiler.git
```

*(Note: this includes my fork of Qooxdoo in the "qooxdoo" subdirectory)*

and then initialise the npm modules:

```
cd qxcompiler
npm install
```

There is no command line application (yet) but it's easy to write a small app to compile with the API; there is a sample
in test/compile-app-demo.js that builds the skeleton app in testdata/qxt.  Once you make this work, you can write
code in your Qooxdoo app like this:

```javascript
      // Add an event listener
      button1.addListener("execute", () => alert("Hello World!"));
```


###Demo Browser
The Demo Browser is compiled by running test/compile-demo-browser.js - it will create the Demo Browser in testdata/demobrowser/


##Gotchas
Number one gotcha is that you have to run the compiler every time you change your code, because it's being transpiled.
This will get easy "real soon now" with a continuous compilation, but for the moment you have to run the compiler manually.


##Documentation
The documentation is a bit thin right now, but I'm working on it - please get in touch if you need help (see 
"Contributing and Getting In Touch" below)
* [API - Overview](docs/API.md)
* [Dependencies - How they are handled in QxCompiler](docs/Dependencies.md)


##Is QxCompiler a complete replacement for generate.py?
Not quite - QxCompiler is focused on compiling applications (including collecting resources) whereas generate.py includes features 
for building and running test suites, creating API documentatino, building distributions, creating skeleton applications, etc.
It would not be hard to replicate those extra facilities provided by generate.py using QxCompiler as a base, but it's not the 
focus of this project.

##What about config.json?  QOOXDOO_PATH?
config.json is not used by QxCompiler

##Contributing and Getting In Touch
Please get stuck in to any aspects you'd like to work on - I'm open to pull requests, and you can contact me to chat 
about features you'd like to see or help on using or extending QxCompiler.  Send me an email at john.spackman@zenesis.com
or Skype me on johnspackman1 but the *best* place to talk about it is on the Qooxdoo mailing list at 
https://lists.sourceforge.net/lists/listinfo/qooxdoo-devel


##Feature TODO list
* Enable source maps
* Lint processing
* Part loading
* Translation

