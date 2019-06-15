# compile.json

Compile.json controls the `qx compile` command, and while you can use command
line parameters to compile an application, most applications will require one.

The key concepts of a compilation are that:

- source code exists in **Libraries** (the Qooxdoo framework is a Library,
qooxdoo packages contain one or more libraries, and also *your own application
source code is a Library*)

- source code is compiled into one or more **Applications** (ie something that
the end-user interacts with using their web browser)

- when an Application is compiled, it is compiled to **Target** a particular
usage, EG the "source" Target is for debugging the source code, and the "build"
Target is for production use and is optimised and minified

These key concepts appear in every compile.json, for example:

```json5
{
    /** Applications */
    "applications": [
        {
            "class": "demoapp.Application",
            "theme": "demoapp.theme.Theme",
            "name": "demoapp"
        }
    ],
    
    /** Targets */
    "targets": [
        {
            "type": "source",
            "outputPath": "compiled/source"
        },
        {
            "type": "build",
            "outputPath": "compiled/build"
        }
    ],
    "defaultTarget": "source",
    
    /** Path Mappings */
    "path-mappings": {
        "../qooxdoo": "/some/folder/qooxdoo"
    },
    
    /** optional web server */
    serve: {
        listenPort: 8082
    }
}
```

That's a basic (but completely functional) compile.json; optional settings are below.

## Applications
The `applications` key is an array of objects, and each object can contain:
- `class` - this is the class name of your main application (it typically inherits from `qx.application.Standalone` for web applications)
- `theme` - this is the theme class for your application
- `name` - this is an arbitrary, but unique, short name for your application and should be filename and URL friendly - IE no spaces or special characters
- `title` - (**optional**) this is the human readable, customer facing description used to set the `<title>` tag of the application web page, i.e. in the application's index.html 
- `environment` - (**optional**) this is a set of application-specific environment settings that override all other settings when compiling this application (see below)
- `outputPath` - (**optional**) the directory to place the application files (e.g. boot.js and resource.js), relative to the target output directory
- `bootPath` - (**optional**) the directory to find the template `index.html` and other files required for booting the application
- `uri` - (**optional**) this sets the URI used to access the application directory, i.e. the directory containing boot.js and resource.js; the default is to assume that it is "."
- `include` - (**optional**) this is an array of class names which are to be included in the compilation, regardless of whether the compiler can detect if they are needed (for example, your application dynamically choose class names on the fly).  Wildcards are supported by adding a `*`, for example `"include": [ "qx.util.format.*" ]`
- `exclude` - (**optional**) this is an array of class names which are to be excluded from the application, regardless of whether the compiler thinks that they are needed.  Wildcards are supported by adding a `*`, for example `"exclude": [ "qx.util.format.NumberFormat" ]`.  Note that `exclude` takes priority over `include`
- `type` - (**optional**, **advanced**) this is "browser" (the default) for the typical, web browser based, application or "node" for a node.js server application.
- `loaderTemplate` - (**optional**, **advanced**) this is the boot loader template file, usually determined automatically from the application `type` 
- `minify` - (**optional**) determines the minification to be used for this application, if the target supports it; overrides other settings.  Can be `off`, `minify`, `mangle` or `beautify`; takes precedence over the target's `minify` setting.
- `default` - (**optional** ) if true, this application is considered the default when serving the application; if not provided then the first browser app is the default application.  When applications are generated, each application has it's own directory inside the target directory and also has it's own `index.html`.  However, there is an `index.html` which is generated in the target output directory that runs the "default" application.  

A complete example is:
```json5
{
    /** Applications */
    "applications": [
        {
            "class": "demoapp.Application",
            "theme": "demoapp.theme.Theme",
            "name": "demoapp",
            "environment": {
                "qx.icontheme": "Oxygen"
            },
            "include": [ "qx.util.format.*", "qx.utils.Base64" ],
            "exclude": [ "qx.util.format.NumberFormat" ]
        }
    ],
```

## Targets
The `targets` key is an array of objects, one for each possible target that can be compiled.  Each object can contain:
- `type` - this is either "source", "build", or a class name in `@qooxdoo/compiler`; using a class name is advanced usage, but ultimately the standard names just shortcuts to class names anyway ("source" is `qxcompiler.targets.SourceTarget`, etc)
- `outputPath` the folder where the compilation outputs to, and will be created if it does not already exist
- `targetClass` - (**optional**) see below 
- `uri` - (**optional**) this sets the URI used to access the target output directory, i.e. the directory which will contain `resources/` and `transpiled/`.  
- `environment` (**optional**) additional environment settings that override any in the top level `environment` object (if there is one); these can be overridden by the Application's own `environment` block
- `writeCompileInfo` (**optional**) if true, the target will write a `compile-info.json` and `resources.json` into the application's output directory, containing the data structures required to generate an application
- `uri` (**optional**) the URI used to load resources for this target; by default, this is assumed to be relative to the application's index.html
- `typescript` - see below
- `minify` - (**optional**) determines the minification to be used for applications, if the target supports it; can be overridden on a per application basis.  Can be `off`, `minify`, `mangle`, or `beautify`.
- `addCreatedAt` - (**optional**) if true, this will cause every object to have a hidden property called `$$createdAt` which points to an object containing `filename`, `lineNumber`, and `column` properties
- `babelOptions` - (**optional**) options given to @babel/preset-env. With this options the output type of babel can be defined. For details see here: https://babeljs.io/docs/en/babel-preset-env#options
If you add the `babelOptions` block at the top level of the compile.json, it will effect every application regardless of the target. They ´both will be merged so that the target `babelOptions` takes prescedence over Target's `babelOptions`.
Here is an example how to disable translation for modern browsers in source mode:

    "targets": [
        {
            "type": "source",
            "outputPath": "compiled/source",
			"babelOptions": {
				"targets": "Chrome >= 73, Firefox >= 66, edge >= 18"
			}
        },
        {
            "type": "build",
            "outputPath": "compiled/build"
        }
    ],

If you want to use more than the three default target types and/or use custom target classes, you can use the `targetClass` key to supply the name of the class as a string. 

```
targets: [
   { 
      type: "source-abc", 
      targetClass: "qx.tool.compiler.targets.SourceTarget",
      environment: { someValue: "abc" }
   },
   { 
      type: "source-def", 
      targetClass: "qx.tool.compiler.targets.SourceTarget",
      environment: { someValue: "def" }
   },
   { 
      type: "source-ghi", 
      targetClass: "my.custom.SpecialSourceTarget",
      environment: { someValue: "ghi" }
   }
]
```

This is also useful if you want to have two or more targets of the same basic type. Incidentally, as a convenience, the current code automatically prepends "qx.tool.compiler.targets." to the class name if there is no package specified:

```
targets: [
   { 
      type: "source-abc", 
      targetClass: "SourceTarget",
      environment: { someValue: "abc" }
   },
   { 
      type: "source-def", 
      targetClass: "SourceTarget",
      environment: { someValue: "def" }
   },
   { 
      type: "build-ghi", 
      targetClass: "BuildTarget",
      environment: { someValue: "ghi" }
   },
   { 
      type: "build-jkl", 
      targetClass: "BuildTarget",
      environment: { someValue: "jkl" }
   }
]
```

### Bundling source files together (previous called Hybrid Targets)
In addition to source or build targets, the generator (ie not QxCompiler) supports hybrid targets which is effectively a source target but with the ability combine multiple source files into a larger javascript file - this can have a significant reduction on the time it takes to load an application during development, especially if the application is running via a webserver.

The equivalent in QxCompiler is to specify the `bundle`, which you can do globally or on a per-application basis.  The `bundle` allows
you to use wildcards to select classes which are to be bundled together into as few files as possible - a common choice would be to
include `qx.*` in the bundle, and leave your own application code to be loaded as individual files.

Here's an example which includes most of the Qooxdoo framework, plus some other classes but excludes `qx.util.*` classes from bundling together.  

```
    "bundle": {
       "include": [ "qx.*", "myapp.some.package.*" ],
       "exclude": [ "qx.util.*" ]
    },
```


## Libraries

If you don't specify a `libraries` key, then by default it uses the current directory (provided that there is a `Manifest.json` file) as a library; this makes sense for most applications.  The compiler also needs to have access to a copy of the Qooxdoo framework library to compile your application, and by default it will auto detect Qooxdoo and use it.

You can override this by specifying a list of directories in the `libraries` key, for example:

```
    /** Libraries */
    "libraries": [
        "../qooxdoo/framework",
        "."
    ],
```

Unless you list it in the `libraries` key, the compiler will first check the `qx.libraryPath` setting (see `qx config set qx.libraryPath`), and if not will look first in your `node_modules` directory and then it's own `node_modules` directory for the `@qooxdoo/framework` npm module. 

## Parts
Parts are supported by adding a `parts` object, either at the top level, inside a target object, or inside an application object.  It looks like this:

```json5
    "parts": {
        "boot": {
            "include": [ "demoapp.Application", "demoapp.theme.Theme" ],
            "exclude": []
        },
        "plugin-framework": {
            "include": [ "demoapp.plugins.pdk.*" ]
        }
    },
```

Each part has an `include` array which is a list of classes (including wildcards) that are to be included; this does not add to the list of classes which are loaded by the application (see `applications[].include` for that), it is used to select the classes which are included into a part.  The `exclude` array is an optional list of class specification to exclude from the part.

The `boot` part is a special name and must be provided (unless you're not specifying any parts at all).  It needs to list the classes which are required for the main application to be loaded - typically this will be your main application class and the theme.  

Unlike the generator, it is permissible to overlap class definitions when using wildcards - however, a class can still only be loaded into a single part, so the compiler will prioritise more specific package names and emit a warning if there is a conflict.

## Environment Settings
Settings can be passed into an application via `qx.core.Environment` by adding an `environment` key, for example:

```json5
{
    /* ... snip ... */
    "defaultTarget": "source",
    "environment": {
        "qx.icontheme": "Oxygen"
        "demoapp.myCustomSetting": 42
    }
}
```

If you add the `environment` block at the top level of the compile.json (as in the example above), they will effect every application regardless of the target.  You can also add `environment` to the Target and/or to the Application, they will be merged so that the Application's environment takes prescedence over Target's environment, which in turn takes prescedence over the top level.  For example:

```json5
{
    "applications": [
        {
            "class": "demoapp.FirstApplication",
            "theme": "demoapp.theme.Theme",
            "name": "appone",
            "environment": {
                "demoapp.myCustomSetting": 3
            }
        },
        {
            "class": "demoapp.SecondApplication",
            "theme": "demoapp.theme.Theme",
            "name": "apptwo"
        }
    ],
    "targets": [
        {
            "type": "source",
            "outputPath": "compiled/source",
            "environment": {
                "demoapp.myCustomSetting": 2
            }
        },
        {
            "type": "build",
            "outputPath": "build-output"
        }
    ],
    "environment": {
        "qx.icontheme": "Oxygen"
        "demoapp.myCustomSetting": 1
    }
}
```
In this example, `demoapp.myCustomSetting` is always 3 for the `appone` Application, and either 1 or 2 for `apptwo` depending on whether you're compile a `source` Target or a `build` Target.

### Code Elimination
When the compiler can absolutely determine, in advance, the values for an environment variable,
it will evaluate the expression in advance and eliminate code which can never be called; for example,
the most common example of this is `qx.debug` which is true for the Source Target and false for Build Targets.

However, the environment variable is compiled into every file, which means that if you set an environmenmt variable
in the application block, it will not be compiled in and code elimination cannot take place.  Code elimination
is only activated if the setting is set in the global or target `environment` blocks.

## Locales
Qooxdoo applications are by default compiled only using the "en" locale for transation strings, but you can change this by adding the `locales` key as an array, for example:

```json5
{
    /* ... snip ... */
    "defaultTarget": "source",
    "locales": [
        "en",
        "es"
    ]
}
```

By default, only translation strings which are used by the classes are included - if you want to copy *all* translation strings you can include `writeAllTranslations: true` at the top level.


## Path Mappings
In many circumstances, you do not need to worry about path mappings because the compiler will copy (or transpile) source code and resources from all libraries into the one output directory.  In production, your application will never need to load files outside of the output directory, but during development your browser will need to have access to the original, untranspiled source files in order to be able to debug your original code.

The `"path-mappings"` configuration is a generic means to locate files on disk inside the URI addsress space of the application; for example, if a library like Qooxdoo is stored outside of your web root you might choose to add a mapping like this:

```json5
    "path-mappings": {
        "../qooxdoo": "/some/virtual/uri/path/qooxdoo"
    }
```

This tells the compiler that when any file in the directory "../qooxdoo" is needed, it should be loaded via the URI "/some/virtual/uri/path/qooxdoo".  Note that the "../qooxdoo" in this example refers to a path on disk (and is relative to the location of `compile.json`), whereas the "/some/virtual/uri/path/qooxdoo" is the URI.

It is up to you to implement the mapping inside your web server so that the "/some/virtual/uri/path/qooxdoo" URI is able to load the files from `../qooxdoo`

## TypeScript
** Note that this has changed: you no longer add a new target **
TypeScript can be output by either using the `--typescript` option to `qx compile`, or by modifying your target(s) to add `typescript: true`; if you use a string instead of `true`, the string is the name of the file which is generated inside the target output directory, for example:

```json5
    /** Targets */
    "targets": [
        {
            "type": "source",
            "outputPath": "compiled/source",
            typescript: true
        }
        /* ... snip ... */
    ]
```

The TypeScript definition is output into `./compiled/source/qooxdoo.d.ts`

## Eslint
The qx lint command is configured by an eslintConfig section in compile.js:

```json5
  "eslintConfig": {
    "parserOptions": {
      "ecmaVersion": 2017,
      "sourceType": "module"
    },
    "globals": {
      "JSZip": false
    }, 
    "extends": [
      "@qooxdoo/qx/browser"          
    ] 
  }
```

The syntax is the same as in in package.json. Explanation can be found here: https://eslint.org/docs/user-guide/configuring.

If you omit the eslintConfig section a default will be used:

```json5
  "eslintConfig": {
    "extends": [
      "@qooxdoo/qx/browser"          
    ] 
  }
```

** The namespaces of all libraries will be added to the globals section automatically! **

## Web Server
If you choose to use the optional web server by running `qx serve`, you can change the default port by specifying the `listenPort` property: 

```
    serve: {
        listenPort: 8082
    }
```

## compile.js
Unlike the python generator's config.json, compile.json does not support processes, job executions, or even macros.  If you want to add 
basic processing (eg for macros), you can use a `compile.js` file to manipulate the data in `compile.json`, or even replace `compile.json`
altogether.  

If you provide a `compile.js`, the compiler will first load the `compile.json` (if there is one) and then load the code in `compile.js` as
though it is a normal node module; the module is required to export either the configuration data as an object, or a single function which 
is called to create the configuration object.
 
When this function in `compile.js` is executed, the compiler will pass the contents of `compile.json` so that it can be manipulated and 
returned (of course, you could chose to construct a brand new object instead). 

When `compile.js` is executed, the first parameter is an object (typically called called `compiler`) which you can use to interact with the 
compiler; this object has these properties:

* `inputData` - set to the contents of `compile.json`, if it exists
* `command` - the CLI command, derived from `qx.tool.cli.commands.Command`

When your configuration function completes, it can return one of: 

* Object - This means that you could rename compile.json to compile.js and have it "just work".
* Promise - the promise must resolve to an object which is the configuration for the compiler to use;
* `undefined` - in which case the callback is expected 

The second parameter to your function is a callback function, but this is only to be used if your function returns `undefined`.


**Example - using an object**
This is just a plain configuration, perhaps created by simply renaming `compile.json` to `compile.js` (and adding the `module.exports=` prefix) 
```
module.exports = {
    /** Applications */
    "applications": [
        {
            "class": "demoapp.Application",
            "theme": "demoapp.theme.Theme",
            "name": "demoapp"
        }
    ] /* ... snip ... */
} 
```

**Example - using callbacks**
```
module.exports = function(compiler, cb) {
    if (someTestIsTrue) {
        cb(null, {
            /** Applications */
            "applications": [
                {
                    "class": "demoapp.Application",
                    "theme": "demoapp.theme.Theme",
                    "name": "demoapp"
                }
            ] /* ... snip ... */
        });
        return;
        
    } else {
        cb(null, { /* ... snip ... */ });
        return;
    }
}
```

**Example - using promises**
```
module.exports = function(compiler) {
    return new Promise((resolve, reject) => {
        /* Do some work ... */
        resolve({
            "locales": [
              "en",
              "en_gb"
            ],
            "environment": {
              "grasshopper.buildType": "source",
              "qx.aspects": false
            } /* ... snip ... */
            );
    });
}
``` 


### How to add sass call for mobile projects:

```javascript
module.exports = async function compile(compiler) {
  /**
 * Adds sass support for current project.
 * Needed for qx.mobile projects.
 * 
 * PreReqs:
 *    - add dependency to project package.json: "runscript": "^1.3.0"
 *    - run npm install in project dir.
 *  
 * @param {*} data       : compiler interface
 * @param {*} callback   : callback for qxcli.  
 */
  debugger;
  const runscript = require('runscript');
  const util = require('util');
  let data = compiler.inputData;
  runScript = async function (cmd) {
    return new Promise((resolve) => runscript(cmd, {
        stdio: 'pipe'
      })
      .then(stdio => {
        console.log('Run "%s"', cmd);
        if (stdio.stdout)
          console.log(stdio.stdout.toString());
        if (stdio.stderr)
          console.log(stdio.stderr.toString());
        resolve();
      })
      .catch(err => {
        console.error(err.toString());
        if (err.stdio.stdout)
          console.error(err.stdio.stdout.toString());
        if (err.stdio.stderr)
          console.error(err.stdio.stderr.toString());
        resolve();
      }));
  }
  let cmd = 'sass -C -t compressed -I %1/source/resource/qx/mobile/scss -I %1/source/resource/qx/scss --%3 source/theme/%2/scss:source/resource/%2/css';
  cmd = qx.lang.String.format(cmd, [data.libraries[0], data.applications[0].name]);
  if (!this.argv.watch) {
    cmd = qx.lang.String.format(cmd, ["", "", "update"]);
  } else {
    cmd = qx.lang.String.format(cmd, ["", "", "watch"]);
  }       
  return await runScript(cmd);
}

```

You can run special code on various steps of the build process if you add an event handler.
Example:

```
function compile(compiler, callback) {
  debugger;
  this.addListener("made",  e => new qx.Promise((fullfiled) => {
      debugger;
      your_special_code;
      fullfiled();
    }));
  callback(null, compiler.inputData);
}
```
Here is a list of possible events, taken from `lib/qx/tool/cli/commands/Compile.js`:

```
    /*** fired when application writing starts */
    "writingApplications": "qx.event.type.Event",
    /** fired when writing of single application starts
     *  data: app {Application}
     */
    "writingApplication": "qx.event.type.Data",
    /** fired when writing of single application is written
     *  data: app {Application}
     */
    "writtenApplication": "qx.event.type.Data",
    /*** fired after writing of all applications */
    "writtenApplications" :"qx.event.type.Event",

    /** 
     * Fired when a class is about to be compiled; data is a map:
     * 
     * dbClassInfo: {Object} the newly populated class info 
     * oldDbClassInfo: {Object} the previous populated class info 
     * classFile - {ClassFile} the qx.tool.compiler.ClassFile instance
     */
    "compilingClass": "qx.event.type.Data",
    
    /** 
     * Fired when a class is compiled; data is a map:
     * dbClassInfo: {Object} the newly populated class info 
     * oldDbClassInfo: {Object} the previous populated class info 
     * classFile - {ClassFile} the qx.tool.compiler.ClassFile instance
     */
    "compiledClass": "qx.event.type.Data",

    /** 
     * Fired when the database is been saved
     * database: {Object} the database to save
     */
    "saveDatabase": "qx.event.type.Data",

    /**
     * Fired after all enviroment data is collected
     *  application {qx.tool.compiler.app.Application} the app 
     *  enviroment: {Object} enviroment data
     */
    "checkEnvironment": "qx.event.type.Data",

    /**
     * Fired when making of apps begins
    */ 
    "making": "qx.event.type.Event",

    /**
     * Fired when making of apps restarts because of 
     * changes
    */ 
   "remaking": "qx.event.type.Event",

    /**
     * Fired when making of apps is done.
    */ 
   "made": "qx.event.type.Event"
```





     




