# Compiler Configuration Overview

The compiler is called on the commandline with `npx qx
compile`. You can pass configuration values by using the
command line options (see `npx qx compile --help` for more). Usually, though, the 
compiler is fully configured using compiler hints in the source code and, most
importantly, through its configuration files.

## Compiler hints 

You can use the [`@require` and `@use` compiler
hints](class_dependencies.md) in the docblock of a class to
specify which on which other classes this class depends. For other resources such 
as images, use the [`@asset` compiler hint](../../../desktop/gui/resources.md).

## CommonJS (Node) modules use in browser applications
Many Node modules, e.g., those available via `npm`, are not Node-specific, and can run
in the browser. You may use these modules in browser-based applications, and Qooxdoo handles
getting these modules to the browser for you automatically. If the compiler finds any calls
to the global function `require` while compiling an application destined for the browser (see
the documentation for `application.type` in [`compile.json`](compile.md)
), such as this call:
```javascript
const semver = require("semver");
```
the compiler will create a bundle containing a `require` function, the required
modules, and all of those required modules' dependencies, and add that bundle to the
Javascript code that implements your app and gets loaded into the browser.

It is the developer's responsibility to ensure that any modules referenced in a call to
`require` already exist in the `node_modules` path, when the compiler is run.

## Local CommonJS and ES6 Modules
In addition to the automatic detection of calls to `require()` to
bundle CommonJS modules, local modules -- either CommonJS modules or
ES6 modules -- may be bundled and included in the application. To do
so, include a `localModules` map in an element of the applications array
in `compile.json`. The keys in the `localModules` map are the names by
which the local module may be `require()`d in qooxdoo code. The value
for each of those keys is the path, from where `compile.json` is
located, to the module to be included. The following example shows how
this can be used:

`compile.json`:

```json5
...
  "applications": [
    {
      "class": "xxx.Application",
      "theme": "xxx.theme.Theme",
      "name": "xxx",
      "bootPath": "source/boot",
      "localModules": {
        "testes6": "./test/testes6.js",
        "testcommonjs": "./test/testcommonjs.js"
      }
    }
  ]
...
```

`./test/testes6.js`:
```javascript
export default "hello world";

import { included } from "./included.js";
export { included };
```

`./test/testcommonjs.js`:
```javascript
module.exports = "hi there";
```

`./test/included.js`:
```javascript
export let included = "INCLUDED";
```

`source/class/xxx/Application.js`:
```javascript
qx.Class.define("xxx.Application",
{
  extend : qx.application.Standalone,

  members :
  {
    main : function()
    {
      let test;

      this.base(arguments);

      // `testes6` is listed in `localModules` so is bundled from
      // `./test/testes6.js`
      test = require("testes6").default;
      console.log("test es6=", test);

      test = require("testes6").included;
      console.log("testes6: included=", test);

      // `testejscommon` is listed in `localModules` so is bundled from
      // `./test/testjscommon.js`
      test = require("testcommonjs");
      console.log("test commonjs=", test);

      // `semver` is automtically discovered by virtue of this `require()`
      // call, and bundled from node_modules
      const semver = require("semver");
      console.log("expect '1.2.3': " + semver.valid("1.2.3"));
      console.log("expect null: " + semver.valid("a.b.c"));
      console.log("expect '1.2.3': " + semver.clean(" =v1.2.3 "));
    }
  }
});
```

Notice that `compile.json` includes only local modules `testes6.js` and `testcommon.js`. It does not include `included.js` but since `testes6.js` `import`s `included.js`, and `testes6.js` is explicitly listed in `localModules`, `included.js` will be bundled as well.

## Configuration Files

The Qooxdoo tooling and package management systems rely on these configuration
files:

- [`Manifest.json`](Manifest.md): This mandatory file contains basic information
  on the library, such as name, namespace, version, dependencies, etc.
- [`compile.json`](compile.md) and [`compile.js`](api.md): These files configure
  the compiler and are responsible how the build of a project will be structured
  and what it will contain.
- [`qx-lock.json`](../../cli/packages.md#lockfile-qx-lockjson): This is a library's
  lockfile which contains information on the version of the dependencies
- [`Qooxdoo.json`](../../cli/packages.md#multi-library-repositories): serves as a
  registry of libraries in a package (normally not needed)

`Manifest.json`, `compile.json` and `Qooxdoo.json`are validated against
[JSON-schemas](https://github.com/qooxdoo/qooxdoo/tree/master/source/resource/qx/tool/schema)
. In contrast, `qx-lock.json` is not, and you should not code against the
lockfile's structure, since it can change any time.

You should not read or write the configuration files directly, but use the API
instead. This ensures that all the toolchain can automatically validate, and, if
necessary and possible, migrate the content automatically.

In the following, this is demonstrated using `qx.tool.config.Manifest` . The
other classes are `qx.tool.config.Compile`, `qx.tool.config.Registry` (for
`Qooxdoo.json`) and `qx.tool.config.Lockfile`.

1.  Load the model for the configuration file like so:
    `const manifestModel = await (qx.tool.config.Manifest.getInstance()).load();`
    This can be done from anywhere in the code. In non-async code, you need to
    use
    `qx.tool.config.Manifest.getInstance().load().then(manifestModel => {...});`
2.  Read properties using the `getValue()` method and manipulate the data using
    the `setValue`, `transform()` and `unset()` methods. If you change a value
    outside this API (such as an array item or a sub-key of a reference), you
    must call the `validate()` method afterwards to ensure that the data is
    correct.
3.  At the end of the script, check if the model content has changed and, if
    yes, store the file's content to disk:
    `if (manifestModel.isDirty() { manifestModel.save() };`

This API is not only useful for Qooxdoo purposes. In fact, you can use it for
your own applications by extending `qx.tool.config.Abstract` to write your
[own config file models](https://github.com/qooxdoo/qooxdoo/tree/master/source/class/qx/tool/config)
.

## CLI Configuration API

While the configuration is typically read from `compile.json`, an API is exposed
by the CLI which allows the configuration to be manipulated before it is
processed and to interact with the compiler as it works.

See [the configuration API](api.md) and the [compiler API](../internals/API.md) 
for more details.
