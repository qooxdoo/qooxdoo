# Using non-Qooxdoo, third-party libraries

Aside from normal Qooxdoo libraries and [packages](../cli/packages.md) there may
be times when you want to include a third-party Javascript library in your
application. It may come as a Node module, or possibly just comes as a (potentially minified)
`.js` file. (This could e.g. be a graphics or charting library.) There are basically three ways to
integrate such a library into your application:

- Using `require` to include a Node module
- Using the third-party library like a resource of your app.
- Wrapping the third-party code in a custom Qooxdoo library.

Here is how each of them works.

## Using `require` to include a Node module

Starting with Qooxdoo 7.1 the compiler will resolve `require` calls automatically, pulling in packages from the local `node_modules` tree.

If you want to use the `semver` package in your application, this is pretty simple. First install `semver`

```sh
$ npm install semver
```

then `require` it in your qooxdoo app

```javascript
const semver = require('semver')
semver.valid('1.2.3') // '1.2.3'
semver.valid('a.b.c') // null
semver.clean('  =v1.2.3   ') // '1.2.3'
```

done.

## Using the third-party library like a resource of your application

Let's assume you found charting library, called PonyCharts. It is available as
minified `ponycharts.js` download from the project's website. It exposes an
API for creating and manipulating charts, and you want to use such charts as
part of your Qooxdoo application. This means calling into the library's API from
your Qooxdoo code, which in turn means the library has to be loaded ahead of
your code in the browser.

As a first step, copy the `.js` file into your app's resource tree, e.g. as
`source/resource/ponycharts/ponycharts.js`

### Compiler Hints
There are two ways that you can arrange for that `.js` file to be loaded - the first,
and possibly the simplest, is to use the `@external` hint, for example:

```javascript
/**
 * This is the main class of your custom application "foo".
 *
 * @asset(foo/*)
 * @external(ponycharts/ponycharts.js)
 */
qx.Class.define("foo.Application",
    //...
```

In that example, the class is the main Application class and so that class will always
be loaded - but as Qooxdoo only loads those classes that you actually need, if you have
an `@external` on a class which is not used, then the .js file will not be loaded.  This
makes it easy to write (for example) a widget class which only loads the extra .js if
you're using the widget.

You can do the same with CSS files, just use something like `@external(ponycharts/ponycharts.css)`

### Using Manifest.json
There is another, older, way to achieve the same thing, and that is to add it into your
`Manifest.json` for your application or library; the disadvantage of this approach is that
the .js and .css files are *always* loaded, regardless of which classes use them.

If you want to use this approach, you need to make sure your new resource is used by your 
application code. The main consequence of this is that the `.js` file will be copied over 
to the build tree of your application, and is being made known to Qooxdoo's ResourceManager. 
You achieve that by adding an `@asset` hint to the main class of your application or library.

```javascript
/**
 * This is the main class of your custom application "foo".
 *
 * @asset(foo/*)
 * @asset(ponycharts/ponycharts.js)
 */
qx.Class.define("foo.Application",
    //...
```

Sometimes, it makes sense to add the `.js` file under its own directory, thereby
creating a namespace for it. This allows you to use wildcards should the
third-party lib consist of multiple files (e.g. comes with an `.css` file,
images, etc.). You could then write

```javascript
/**
 * ...
 * @asset(ponycharts/*)
 */
```

Then, make sure the PonyCharts `.js` file is loaded before your application code.
A simple way to achieve this is to use the command
`npx qx add script path/to/ponycharts.js`. This is the same as adding to the
`externalResources.script` array in
[Manifest.json](../compiler/configuration/Manifest.md) . This will assure
the lib is loaded in source and build versions of your app before your code
starts. You can now code happily against PonyChart's API.

### Inlining the code
When you build your application with the compiler, the compiler will by default
just add ordinary `<script>` tags to load the third party code when compiling a
"source" target, and will insert the code inline into the single, minimised 
javascript file when compiling a "build" target.

If you want to override this, edit your `compile.json` and in the target definition
set the `inline-external-scripts` property to `true` or `false`, or use the `--inline-external-scripts`
command line option.

## Wrapping the third-party code in an own Qooxdoo library

There is a more elaborate way to use an external Javascript library, by wrapping
it in its own Qooxdoo library. Although more work, this has some advantages:

- Easier reuse, e.g. when you want to use the external package in multiple
  Qooxdoo projects.
- Single point of concern, e.g. when the external package needs configuration or
  certain steps to initialize it.
- Exposing the package's API through a Qooxdoo class.
- Automatic dependency management wherever the wrapper class is used.

### Step-by-Step Instructions

1.  Create a [new Qooxdoo project](../cli/commands.md#create-a-new-project) .

2.  As in the approach above, copy the external package's files to a suitable
    place under the resource folder, e.g.
    source/resource/ponycharts/ponycharts.js.

3.  Likewise, add an @asset hint in the library's main class to include the
    external package as a resource (full example further below).

4.  Add code to this class that loads the external package, does necessary
    initialization and potentially adds a Qooxdoo-ish API to it.

There is a framework class to help you with the loading part,  
[qx.util.DynamicScriptLoader](apps://apiviewer/#qx.util.DynamicScriptLoader) ,
which does most of the work to make the package available in the current browser
context. Using this, here is how your wrapper class may look like:

```javascript
/**
 * This is the main class of the PonyCharts wrapper.
 *
 * @asset(ponycharts/*)
 */
qx.Class.define("ponycharts.PonyCharts", {
  extend: qx.core.Object,

  construct () {
    // initialize the script loading
    const dynLoader = new qx.util.DynamicScriptLoader([
      "ponycharts/ponycharts.js"
    ]);

    dynLoader.addListenerOnce("ready", function (e) {
      console.log("all scripts have been loaded!");
      ThePonyChartsTopLevelSymbol.initialize();
    });

    dynLoader.addListener("failed", function (e) {
      const data = e.getData();
      console.log("failed to load " + data.script);
    });

    dynLoader.start();
  },

  members: {
    paint() {
      ThePonyChartsTopLevelSymbol.paint_demo();
    }
  }
});
```

See <u>qx.util.DynamicScriptLoader</u> for full details.

5.  Add the new Qooxdoo library to your main application's configuration. In its
    _compile.json_, add under the _libraries_ key

```json5
{
  //...
  "libraries": [
    "path": "<path to dir containting the library>"
  ],
  //...
}
```

Better still, publish the library as a
[package](../cli/packages.md#create-a-new-package) , so that others can use it
in their application, too.

6.  In the using Qooxdoo application, call the corresponding methods of the
    wrapper class.

```javascript
qx.Class.define("foo.Application", {
  extend: qx.core.Application,

  construct() {
    const myPonyCharts = new ponyCharts.PonyCharts();
    myPonyCharts.paint();
  }
});
```

This should give you a basic outline how you can wrap an external package as a
Qooxdoo library. You can now use the library for multiple projects, or even
publish it as a contribution.
