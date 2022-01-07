# Configuration API

## compile.js

Unlike the pre-v6.0.0 python generator's config.json, compile.json does not support
processes, job executions, or even macros.  

If you want to add processing, you can use a `compile.js` file to provide code
which is called by the compiler and will allow you to exert complete, dynamic
control over the configuration data and also interact with the compiler during
it's compilation process.

All the rules which apply to `compile.json` act as normal, the APIs described
below simply allow you to add processing and create a dynamic `compile.json` -
and although this does not have to be a real file, the configuration data which
you output will be validated against the `compile.json` schema.

### Getting Started

The compiler uses two API classes: `qx.tool.cli.api.CompilerApi` and
`qx.tool.cli.api.LibraryApi`; it will create an instance of `CompilerApi` in
order to load the `compile.json` for your application, and in your `compile.js`
you can change how this works by creating your own class which is derived from
`CompilerApi`.

A `compile.js` file is treated as a regular node module, it's loaded via
`require()` and interacts by defining Qooxdoo classes (which derive from
`CompilerApi` and/or `LibraryApi`) and listing these classes in the module's
exports; for example:

For example, this is an empty `compile.js`:

```
module.exports = {
    LibraryApi: qx.tool.cli.api.LibraryApi,
    CompilerApi: qx.tool.cli.api.CompilerApi
};
```

The above example is telling the compiler which classes to use instead of the
default `CompilerApi` and `LibraryApi` classes - as the example is using
standard classes, this example will give the same behaviour as if you had not
provided `compile.js` at all, but you can see that it is just a regular node.js
module.

A better example would be to define a Qooxdoo class that derives from the
standard API classes and return that instead:

```javascript
qx.Class.define("myapp.compile.CompilerApi", {
  extend: qx.tool.cli.api.CompilerApi,

  members: {
    async load() {
      let data = await this.base(arguments);
      return data;
    }
  }
});

module.exports = {
    CompilerApi: myapp.compile.CompilerApi
};
```

Note that if you do not provide a class (eg you only provide a value for
`CompilerApi` like the above example) the compiler will use the default
implementation for anything that's missing.

You still need to have a `compile.json` because all that example above does is
demonstrate how to override the class which is used to load `compile.json`.
Let's do something more interesting, and edit the data on the fly:

```javascript
qx.Class.define("myapp.compile.CompilerApi", {
  extend: qx.tool.cli.api.CompilerApi,

  members: {
    async load() {
      let data = await this.base(arguments);
      if (!data.environment)
        data.environment = {};
      data.environment["myapp.someSetting"] = "hello";
      data.environment["myapp.hostName"] = process.env.HOSTNAME;
      return data;
    }
  }
});

module.exports = {
    CompilerApi: myapp.compile.CompilerApi
};

```

The example above will load configuration from `compile.json` and then add to
the `environment` block on the fly; assuming that the hostname of your computer
is set to "MyDevMachine', this will make it look like your `compile.json`
contained this environment block:

```javascript
  /* ... snip ... */
  "environment": {
      "qx.icontheme": "Tango",
      "myapp.someSetting": "hello",
      "myapp.hostName": "MyDevMachine"
  },
  /* ... snip ... */
}
```

The key method in `CompileApi` is the `load` method - and as it is just node.js
code, you can do anything you like - edit the configuration, maybe download the
`compile.json` from a server instead of loading it from the local disk, or use a
different language altogether like YAML etc. It's your choice, all you have to
do is return a standard JS object.

### How libraries can customise the configuration

While the `CompilerApi` implementation has control over _which_ libraries are
part of the compilation process, those Libraries are able to contribute to the
compilation process via the `LibraryApi` class.

Any library which has a `compile.js` has it's `compile.js` loaded just as in the
above examples, except that this time the compiler looks for `LibraryApi`. For
each library that an application uses, an instance of `LibraryApi` is created,
then added to the `CompilerApi` instance and then the LibraryApi's `.load()`
method is called to do any initialisation. This allows libaries to ship with
code that changes how they will be compiled into an application.

For example:

```javascript
qx.Class.define("abc.somepackage.LibraryApi", {
  extend: qx.tool.cli.api.LibraryApi,

  members: {
    async load() {
      let command = this.getCompilerApi().getCommand();
      command.addListener("checkEnvironment", e => this._appCompiling(e.getData().application, e.getData().environment));
    },

    afterLibrariesLoaded() {
      let configJson = this.getCompilerApi().getConfiguration();
      if (!configJson.environment)
        configJson.environment = {};
      configJson.environment["mypackage.someSetting"] = "hello";
    },

    _appCompiling(app, environment) {
      environment["mypackage.hostName"] = process.env.HOSTNAME;
    }
  }
});

module.exports = {
    LibraryApi: qxl.compilertests.testapp.LibraryApi
};

```

In the above example, the library is modifying the environment block in two
different ways - the first is in `afterLibrariesLoaded`, which is called after
all the libraries have been loaded but before compilation starts. The
`compile.json` `environment` block is being modified, much like it was in the
examples above for `CompilerApi`.

In the second example, the `_appCompiling` method is called each time the
`checkEnvironment` event is fired - this shows the LibraryApi interacting with
the compilation process of a single application.

## Events and hook methods

To hook into the compilation lifecycle, there are a number of [events
which are available on the command](../internals/Events.md#cli-commands).
Alternatively you can attach [event handlers](../internals/Events.md)
directly to the [Compiler API](../compiler/API.md). In addition, both APIs provide
hook methods which are triggered by these events:

`qx.tool.cli.api.CompilerApi` [Details](https://qooxdoo.org/qooxdoo-compiler/#qx.tool.cli.api.CompilerApi)
- `load()`: Called to update the compilerConfig
- `afterCommandLoaded()`: Called after the command is known to the CompilerApi. Can be used to register listeners to the command. Instead of overload this function you can add a listener to the `changeCommand` event.
- `afterLibrariesLoaded()`: Called after all libraries have been loaded and added to the compilation data
- `afterDeploy()`: called after deployment happens
- `beforeTests()`: Register compiler test or run your own tests in compile.js.
- `afterProcessFinished()`: runs after the whole process is finished

`qx.tool.cli.api.LibraryApi` [Details](https://qooxdoo.org/qooxdoo-compiler/#qx.tool.cli.api.LibraryApi)
- `load()`: Called to load any library-specific configuration and update the compilerConfig
- `afterLibrariesLoaded()`: Called after all libraries have been loaded and added to the compilation data

## `CompilerApi` vs `LibraryApi`

There is only one `CompilerApi` instance for the compiler, and multiple
`LibraryApi` instances, one for each library.

When you write a typical application, you actual use at least two libraries: one
is the Qooxdoo framework library and the other is the library for your own
code - ie the current directory will have `compile.js` / `compile.json` and is
also a library (so it also has `Manifest.json` and `source/` directory etc).

The compiler generates one or more application(s) by starting with your
Application class(es) and compiling all the code necessary to make it run. It
doesn't matter which library the code is in, and more advanced applications will
pull from multiple libraries.

The `compile.js` / `compile.json` files can exist on their own - they do not
need `Manifest.json` or code or anything else which is present in a typical
application (eg such as the skeleton application created by `qx create ...`);
this is because all those other files are to do with the library that is your
project. It's just that for most people, most of the time there will be a close
coupling between `compile.js` and their own project library, so the
`compile.json` is kept in the root of their project.

The point here is that even if you have a basic skeleton application, a
`compile.js` provides API access to two independent things: the compilation
process (governed by `CompilerApi`) and separately to the library which contains
your code (governed by `LibraryApi`).

## Reusable functionality through code-less libraries

While most libraries exist to contain code, it's not necessarily the case that a
library has to contain any code at all (or any code that your project needs to
use). But if the library is listed in the configuration data and it has a
`compile.js`, then it's `LibraryApi` will still be created as usual and it will
have the usual opportunity to contribute to the compilation process.

This opens the possibility to create libraries which add functionality to the
compiler itself - for example, if you wanted to implement some kind of pre- or
post- processing of resources, you could separate it out into a reusable library
that has no code, just your API calls to hook into the compilation to add
pre/post processing.
