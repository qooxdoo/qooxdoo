# compile.json

**Content**

 - [Applications](#applications)
 - [Targets](#targets)
 - [Multiple Applications and Targets](#multiple-applications-and-targets)
 - [Bundling ("hybrid targets")](#bundling-source-files-together-previous-called-hybrid-targets)
 - [Libraries](#libraries)
 - [Parts](#parts)
 - [Environment settings](#environment-settings)
 - [Code elimination](#code-elimination)
 - [Locales](#locales)
 - [Path Mappings](#path-mappings)
 - [Type Script](#typescript)
 - [Linting](#eslint)
 - [Built-in web server](#web-server)
 - [Running server applications](#running-applications)
 - [Building for Production and Deployment](#building-for-production-and-deployment)
 - [Schema definition](compile-1-0-0.md)
 
## Basics

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
    },
    
    /** optional server application */
    run: {
          "application": "my-server-app"
    }    
}
```

That's a basic (but completely functional) compile.json; optional settings are below.

## Applications
The `applications` key is an array of objects, and each object can contain:
- `class` - this is the class name of your main application (it typically
inherits from `qx.application.Standalone` for web applications)

- `theme` - this is the theme class for your application

- `name` - this is an arbitrary, but unique, short name for your application and
should be filename and URL friendly - IE no spaces or special characters

- `title` - (**optional**) this is the human readable, customer facing
description used to set the `<title>` tag of the application web page, i.e. in
the application's index.html

- `environment` - (**optional**) this is a set of application-specific
environment settings that override all other settings when compiling this
application (see below)

- `outputPath` - (**optional**) the directory to place the application files
(e.g. boot.js and resource.js), relative to the target output directory

- `bootPath` - (**optional**) the directory to find the template `index.html`
and other files required for booting the application

- `uri` - (**optional**) this sets the URI used to access the application
directory, i.e. the directory containing boot.js and resource.js; the default is
to assume that it is "."

- `include` - (**optional**) this is an array of class names which are to be
included in the compilation, regardless of whether the compiler can detect if
they are needed (for example, your application dynamically choose class names on
the fly).  Wildcards are supported by adding a `*`, for example `"include": [
"qx.util.format.*" ]`

- `exclude` - (**optional**) this is an array of class names which are to be
excluded from the application, regardless of whether the compiler thinks that
they are needed.  Wildcards are supported by adding a `*`, for example
`"exclude": [ "qx.util.format.NumberFormat" ]`.  Note that `exclude` takes
priority over `include`

- `type` - (**optional**, **advanced**) this is "browser" (the default) for the
typical, web browser based, application or "node" for a node.js server
application.

- `loaderTemplate` - (**optional**, **advanced**) this is the boot loader
template file, usually determined automatically from the application `type`

- `minify` - (**optional**) determines the minification to be used for this
application, if the target supports it; overrides other settings.  Can be `off`,
`minify`, `mangle` or `beautify`; takes precedence over the target's `minify`
setting.

- `default` - (**optional**) if true, this application is considered the default
when serving the application; if not provided then the first browser app is the
default application.  When applications are generated, each application has it's
own directory inside the target directory and also has it's own `index.html`. 
However, there is an `index.html` which is generated in the target output
directory that runs the "default" application.

- `publish` - (**optional**) if true (default), publish the application in
package catalogs such as the PackageBrowser application

- `standalone` - (**optional**) Whether this application can be opened
in a browser on its own (true, default) or is part of a different application
(false)

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

- `type` - this is either "source", "build", or a class name in
`@qooxdoo/compiler`; using a class name is advanced usage, but ultimately the
standard names just shortcuts to class names anyway ("source" is
`qxcompiler.targets.SourceTarget`, etc)

- `outputPath` the folder where the compilation outputs to, and will be created
if it does not already exist

- `targetClass` - (**optional**) see below 

- `uri` - (**optional**) this sets the URI used to access the target output
directory, i.e. the directory which will contain `resources/` and `transpiled/`.

- `environment` (**optional**) additional environment settings that override any
in the top level `environment` object (if there is one); these can be overridden
by the Application's own `environment` block

- `writeCompileInfo` (**optional**) if true, the target will write a
`compile-info.json` and `resources.json` into the application's output
directory, containing the data structures required to generate an application

- `uri` (**optional**) the URI used to load resources for this target; by
default, this is assumed to be relative to the application's index.html

- `typescript` - see below

- `minify` - (**optional**) determines the minification to be used for
applications, if the target supports it; can be overridden on a per application
basis.  Can be `off`, `minify`, `mangle`, or `beautify`.

- `addCreatedAt` - (**optional**) if true, this will cause every object to have
a hidden property called `$$createdAt` which points to an object containing
`filename`, `lineNumber`, and `column` properties

- `babelOptions` - (**optional**) options given to @babel/preset-env. With this
options the output type of babel can be defined. For details see here:
https://babeljs.io/docs/en/babel-preset-env#options
When setting `babelOptions` on a target, they will be merged into the top-level `babel.options`
Here is an example how to disable translation for modern browsers in source mode:
```json5
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
```
You can also add plugins to babel (at the top level only), for example:
```json5
  "babel": {
    "plugins": {
      "@babel/plugin-proposal-optional-chaining": true
    }
  },
  "targets": [
```
The `babel.plugins` is a map, the key of which is the NPM name of the plugin, and the value of which is either `true` (to enable),
or `false` (to not add the plugin), or an object configuring the plugin.

There is risk in adding support for additional, non-standard babel plugins - EG the @babel/plugin-proposal-* plug ins which add 
early proposed additions to javascript.

Not surprisingly this comes with caveats, first of which is that changes to the language may well require an upgrade to QxCompiler 
itself so that it can recognise the new language construct and act accordingly.

In many cases, turning on a new plugin that QxCompiler does not support will just cause extra warnings, usually about unresolved 
symbols because (EG) QxCompiler did not understand a new syntax of declaring the variable in the first place. But there may be other 
side effects where the plugin simply cannot work without an upgrade.

So, adding in babel plugins that extend the language is at your own risk, but should be useful. 


- `application-types` and `application-names` - (**optional**) these settings
filter which applications that this target can compile and is used in situations
where you want to have multiple targets simultaneously (see below)

### Multiple Applications and Targets
In most applications all you will need to define is two targets, one for "source" compilation during development, and one for
"build" compilation for deployment onto your production server.  

If you have more than one application, it's important to note that all of the applications which are compiled by a given target 
will share the environment settings and babel options; if all of your applications are for web browsers, this works out fine - but
if you target different platforms (eg a NodeJS based application and a web browser application, or you want to compile a version 
targeted at old browsers and another version for bleeding edge browsers) you may want to use different target settings for each 
application.

If you specify multiple targets, each with the same type (eg "source" and "build") you're instructing the compiler to generate
applications several times over.  This allows you to specify different environment settings or Babel options for each target.  Note 
that each target has to have a separate output directory.

The compiler looks at each target for the `application-names` and `application-types` fields and uses these values (if present) to
select which applications to compiler using that target.  For example, if your target has `"application-types": [ "node" ]` it will 
only be used to compile node applications.

The exception here is if the target does not specify either `application-names` or `application-types` - these kinds of targets are
the default target, and only applications which do not match any other target will be given these default targets.  This is so that
you can just add a simple target for specialisations (such as NodeJS) and have everything else operate as it was before.  For example,
add these targets:

```
    {
      "type": "source",
      "outputPath": "compiled/source-node",
      "application-types": [ "node" ],
      "babelOptions": {
        "targets": "node >= 11"
      }
    },
    {
      "type": "build",
      "outputPath": "compiled/build-node",
      "application-types": [ "node" ],
      "babelOptions": {
        "targets": "node >= 11"
      }
    },
```

and you will now have a NodeJS-specific target directory that is used only for your node applications - and because that target
is focused on Node v11 and later it will use native support for language features like `async` and `await` etc.

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

Also by default, the locales and translation data are loaded automatically when the application starts; this is helpful,
but sometimes the translation data can be quite large and if you support a lot of languages, your application would be
loading all translations for all languages.  If you set the `"i18AsParts": true`, this behaviour changes so that 
each locale has its own part and none of the locales are loaded automatically.  Your application code will need to determine
the locale to load during startup and then load the appropriate locale, EG:

```json5
{
    /* ... in your compile.json ... */
    "locales": [
        "en",
        "fr"
    ],
    "i18nAsParts": true
}
```

```
    // ...Somewhere in your Application.main()
    //
    qx.io.PartLoader.require("fr", () => {
      qx.core.Assert.assertTrue(this.tr("hello") == "bonjour");
    });
```


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


## Running applications
The compiler can automatically stop and start your server applications, while simultaneously watching for changes and compiling.
First, configure the `"run"` section of `compile.json` so that it lists the name of the application (and optionally any arguments),
and then use `qx run` to run it.  Every time the compilation completes, the application will be terminated (if it's running) and
restarted.

For example:

```json5
    run: {
          "application": "my-server-app",
          "arguments": "my command line arguments"
    }    
```

In this example, the application with the "my-server-app" is run, with a command line similar to: 
`node compiled/source/my-server-app/my-server-app.js my command line arguments`


## Building for Production and Deployment
When you compile your application using `qx compile`, you'll notice that there's quite a lot of files generated
and the total application size is quite large; most of these files are temporary files needed only during development,
either because they speed up compilation to keep them around or because it's easier for you to debug.

By using `qx compile --target=build`, the compiler will produce a completely seperate compilation with all debug
code automatically removed and where the Javascript source code is minified and reduced to as small a number of
files as possible.

This "build target" compilation is the version you can do final testing on before publishing it to your users; but
while this is minified and stripped down, there are still a number of temporary files which you do not want to copy 
onto your webserver.

When you're ready to distribute the application(s) to your web server, use `qx deploy`, EG:

```
  $ qx deploy --out=/var/www --source-maps
```

Note that by default source maps are not copied - this is to make sure that information is about filing systems
is not leaked, but this will make it hard to debug any problems when in production.  If you want to include source
maps, use the `--source-maps` parameter
 

 
