# Configuration API

## compile.js
Unlike the python generator's config.json, compile.json does not support processes, job executions, or even macros.  
If you want to add processing, you can use a `compile.js` file to provide code which is called by the compiler and 
will allow you to exert complete, dynamic control over the configuration data and also interact with the compiler
during it's compilation process.

The compiler provides two API classes: `qx.tool.cli.api.CompilerApi` and `qx.tool.cli.api.LibraryApi`.

A key part of the `CompilerApi` class is to provide the configuration data which is normally found in `compile.json` - 
the default implementation of which is to load the `compile.json` and return it without modification, and you can 
choose to override methods to modify that data or to not load it at all and generate it completely on the fly.

Libraries which you have added to your application are also able to contribute to the compilation process via the
`LibraryApi` class; note that your `CompilerApi` implementation has control over which libraries are part of
the compilation process.

All the rules which apply to `compile.json` act as normal, these APIs simply allow you to add processing and create
a dynamic `compile.json` - and although this does not have to be a real file, the configuration data which you output
will be validated against the `compile.json` schema.


## `CompilerApi` vs `LibraryApi`
There is only one `CompilerApi` instance for the compiler, and multiple `LibraryApi` instances, one for each library.

When you write a typical application, you actual use at least two libraries: one is the Qooxdoo framework library and
the other is the library for your own code - ie the current directory will have `compile.js` / `compile.json` and is also
a library (so it also has `Manifest.json` and `source/` directory etc).

The compiler generates one or more application(s) by starting with your Application class(es) and compiling all the 
code necessary to make it run.  It doesn't matter which library the code is in, and more advanced applications will 
pull from multiple libraries.

The `compile.js` / `compile.json` files can exist on their own - they do not need `Manifest.json` or code or 
anything else which is present in a typical application (eg such as the skeleton application created by `qx create ...`);
this is because all those other files are to do with the library that is your project.  It's just that for most people, 
most of the time there will be a close coupling between `compile.js` and their own project library, so the `compile.json` 
is kept in the root of their project.

The point here is that even if you have a basic skeleton application, a `compile.js` provides API access to two independent
things: the compilation process (governed by `CompilerApi`) and separately to the library which contains your code
(governed by `LibraryApi`).


## Using the API
A `compile.js` file is treated as a regular node module, it's loaded via `require()` and interacts by defining Qooxdoo 
classes (which derive from `CompilerApi` and/or `LibraryApi`) and listing these classes in the module's exports; for example:

```
module.exports = {
    LibraryApi: qx.tool.cli.api.LibraryApi,
    CompilerApi: qx.tool.cli.api.CompilerApi
};
```

The above example is telling the compiler which classes to use instead of the default `CompilerApi` and `LibraryApi` 
classes (although the example is using standard classes, this example will give the same behaviour as if you had not 
provided `compile.js` at all!).

A better example would be to define a Qooxdoo class that derives from the standard API classes and return that instead:

```
qx.Class.define("myapp.compile.CompilerApi", {
  extend: qx.tool.cli.api.CompilerApi,
  
  members: {
  }
});

module.exports = {
    CompilerApi: myapp.compile.CompilerApi
};
```

Note that if you do not provide a class (eg you only provide a value for `CompilerApi` like the above example) the compiler
will use the default implementation for anything that's missing.


## How API classes are discovered and used  
The compiler will load your `compile.js` and then create an instance of your `CompilerApi` (unless you havn't provided one,
in which case it will use the default).  The api object's `.load()` method is called to load initial configuration data,
including choosing which libraries are to be included in the compilation process; the default implementation of `.load()`
is to load `compile.json`, but you don't have to do this - you can override `.load()` and just return an object, or load it
from some other source.

The compiler will then discover libraries in it's usual mechanism (eg it auto detects the Qooxdoo library, and adds the
current directory if no libraries are specified) and for each library will look for that library to have it's own `compile.js`.
If a `compile.js` is found, it is loaded and an instance of it's `LibraryApi` is created for that library. 

Note that as a typical project has `compile.js` and is also a library, compiling your project means that `compile.js` is loaded
twice, once to get `CompilerApi` and once to get `LibraryApi`.

Also note, that if a third party library exports it's own `CompilerApi`, that class will be ignored - only the `CompilerApi` 
in your project's `compile.js` is used; if the third party library wants to interact, it must export the `LibraryApi` class.

Once a `LibraryApi` instance has been created, it's added to the `CompilerApi` instance and then it's `.load()` method is 
called to do any initialisation.  Finally, the `CompilerApi`'s `.afterLibrariesLoaded()` method is called.  At this point,
the compiler will obtain configuration data from the `CompilerApi` instance (which must conform to the `compile.json` schema)
and continue processing as normal.


## Reusable functionality through code-less libraries
While most libraries exist to contain code, it's not necessarily the case that a library has to contain any code at
all (or any code that your project needs to use).  But if the library is listed in the configuration data and it has a 
`compile.js`, then it's `LibraryApi` will still be created as usual and it will have the usual opportunity to contribute
to the compilation process.

This opens the possibility to create libraries which add functionality to the compiler itself - for example, it's not
unusual for a SASS compilation step to be used for mobile projects, and while you could add that into your project via
the API, you could also separate it out into a reusable library that has no code, just your API calls to enable SASS 
compilation.

The next section contains a working example of a SASS compilation step incorporated via the API - there would be some work
to make it truly reusable and production ready, but it illustrates one way to add functionality to compilation for all 
libraries.


## Working Example: How to add sass call for mobile projects
The code below is a working example that can run the `sass` command to compile `.scss` files into `.css`; this code
is implemented as a `LibraryApi`, which means that it will work irrespective of whether this is your main project
or not.  It's meant as an example only - you might want it to only be part of your project compile in which case 
you could use `CompilerApi` instead of `LibraryApi`; or you might filter it to only work on specific libraries; ... or
you could us it as a generic, cross-library utility. 

(Note that SASS compilation is already integrated into the compiler, this serves as an example of how to perform a
complex task) 

```javascript
const fs = require("fs");
const runscript = require('runscript');

/**
 * Implementation of LibraryApi that adds SASS support for all libraries
 * Needed for qx.mobile projects.
 * 
 * PreReqs:
 *    - add dependency to project package.json: "runscript": "^1.3.0"
 *    - run npm install in project dir.
 */
qx.Class.define("qxl.compilertests.testapp.LibraryApi", {
  extend: qx.tool.cli.api.LibraryApi,
  
  members: {
    __startedSassWatch: false,
    
    async load() {
      let command = this.getCompilerApi().getCommand();
      command.addListener("making", () => this._onMaking());
      command.addListener("checkEnvironment", e => this._appCompiling(e.getData().application, e.getData().environment));
    },
    
    _onMaking() {
      // The "making" event can be fired more than once (eg when watching) so we want to start our own
      //  sass watch once
      if (this.__startedSassWatch)
        return;
      let command = this.getCompilerApi().getCommand();
      let maker = command.getMaker();
      let analyser = maker.getAnalyser();
      
      // Figure out the command line to execute
      let sassType = "update";
      if (command.argv.watch) {
        this.__startedSassWatch = true;
        sassType = "watch";
      }
      
      let qxPath = analyser.getQooxdooPath();
      let cmd = `sass -C -t compressed -I ${qxPath}/source/resource/qx/mobile/scss -I ${qxPath}/source/resource/qx/scss --${sassType}`;
      analyser.getLibraries().forEach(library => {
        let name = library.getNamespace();
        if (fs.existsSync(`source/theme/${name}/scss`))
          cmd += ` source/theme/${name}/scss:source/resource/${name}/css` 
      });
      
      // Helper method to output from the sass command to the console
      const writeOutput = stdio => {
        if (stdio.stdout)
          console.log(stdio.stdout.toString());
        if (stdio.stderr)
          console.log(stdio.stderr.toString());
      };
      
      // Run Sass; we don't wait for the process to end because it won't end if we're using watching
      runscript(cmd, {
          stdio: 'pipe'
        })
        .then(stdio => {
          console.log('Run "%s"', cmd);
          writeOutput(stdio);
        })
        .catch(err => {
          console.error(err.toString());
          writeOutput(err.stdio);
        });

      // Return null to suppress warning about promise created but not waited for
      return null;
    },
    
    _appCompiling(application, environment) {
      environment.testappLibraryApi = "one";
    }
  }
});

module.exports = {
    LibraryApi: qxl.compilertests.testapp.LibraryApi
};

```

The code above listens for an event to know when to start compilation - there are a number of events which are
available on the command [see Compile.js for full details](https://github.com/qooxdoo/qooxdoo-compiler/blob/master/source/class/qx/tool/cli/commands/Compile.js)
or you can attach event handlers directly to the [Compiler API](../compiler/API.md)

