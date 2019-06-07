Application Skeletons
=====================

qooxdoo comes with several different application templates or *skeletons*. Each is meant for a specific usage scenario and includes a different subset of the qooxdoo framework (see the architecture diagram\<pages/architecture\#architecture\> for reference).

When creating a new application using create-application.py \</pages/tool/create\_application\>, the *-t* or *--type* parameter specifies the type of skeleton to be used, e.g.

    qooxdoo-%{version}-sdk/create-application.py --name=custom --type=mobile

The following skeletons are available (The application types are in fact all lower-case, but are capitalized in the following headings for better readability):

Desktop
-------

For a GUI application that looks & feels like a native desktop application (often called "RIA" – Rich Internet Application).

Such a stand-alone application typically creates and updates all content dynamically. Often it is called a "single-page application", since the document itself is never reloaded or changed.

This is the default choice if the *--type* parameter is not specified.

Inherits from [qx.application.Standalone](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.application.Standalone)

### Included layers

-   Core
-   Runtime Abstraction
-   Low-Level
-   GUI Toolkit

Inline
------

For a GUI application on a traditional, HTML-dominated web page.

The ideal environment for typical portal sites which use just a few qooxdoo widgets, embedded into the page's existing HTML content.

Inherits from [qx.application.Inline](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.application.Inline)

### Included layers

-   Core
-   Runtime Abstraction
-   Low-Level
-   GUI Toolkit

Mobile
------

For a mobile application \<pages/mobile/mobile\_overview\#overview\> running in a WebKit-based browser on iOS or Android (and also on desktop machines). Supports the [mobile widget set](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.ui.mobile).

Inherits from [qx.application.Mobile](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.application.Mobile)

### Included layers

-   Core
-   Runtime Abstraction
-   Mobile UI

Native
------

For applications using custom HTML/CSS-based GUIs instead of qooxdoo's widget layer.

Inherits from [qx.application.Native](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.application.Native)

### Included layers

-   Core
-   Runtime Abstraction
-   Low-Level

Website
-------

This is an alternative to working with the Website \</pages/website\> library directly, which is a single-file download containing all the %{Website} API. If you deploy the download you use its API in your own code in a way that suits you, e.g. by adding custom code in an HTML page that also loads the library.

### Getting started

The 'website' skeleton provides you with the same development model, with additional options. It contains a pre-built version of the Website library. You can just open the contained index.html file in a browser and see the default application running (If this is not the case and you just get an "Application needs generation..." message, just run `generate.py` on the shell). Then you start extending it, either in the index.html file directly or by creating other %{JS} files that use it, and include those in the HTML file.

Both approaches (download or skeleton) pretty much match up, with the skeleton giving you a little head start. In both cases you are using a static library file, and take care of organizing your application code yourself. Beyond that the 'website' skeleton provides you with some additional jobs:

-   *build-min*: You can re-create the library file (located in *script/*), by running the `generate.py [build-min]` job. This is interesting if you e.g. upgrade to a new qooxdoo SDK and want to make sure you are working against the latest code.
-   *build*: You can create a *non-optimized* version of the library, if you want to debug into its code. This is achieved by running the `generate.py build` job. Mind, though, that you then need to include *q-%{version}.js* in your HTML code (rather than *q-%{version}.min.js* which is the minified version).
-   *test, test-source*: You can write unit tests for your custom code, and generate a local version of the Portable Testrunner \<pages/frame\_apps\_testrunner\#portable\_test\_runner\> using `generate.py test` or `generate.py test-source` (The linked description of the Portable Testrunner refers partly to the ready-built download version, hence it says *"no compile step"*). In order to sensibly test your code, you should put it in its own .js file, rather than inline it in the *index.html*. This way, you can load it both in the application *index.html* as well as in *test/index.html* where the unit tests are applied.
-   *api*, *api-data*: These jobs re-create the %{Website} Apiviewer (or just the API data, respectively) in the skeleton. This is useful if you want to have the API documentation close-by.

### Included layers

-   See the /pages/website documentation.

Server
------

For applications running in "browserless" or server-side environments such as node.js and Rhino. The skeleton follows the normal qooxdoo development model, so you have a *source/* folder with classes and resources, and can create *source* and *build* versions of your app. It also supports other development jobs like *"test"*, *"api"* or *"lint"*. The special job *"library"* allows you to re-create the %{Server} library locally.

Inherits from [qx.application.Basic](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.application.Basic).

### Getting started

This skeleton depends on a generated Server library, located in *script/*. If this was not delivered with your SDK you can create it locally, by running `generate.py library`. (If you intend to create multiple 'server' skeletons, you might want to change to *\${QOOXDOO\_PATH}/component/standalone/server* and invoke `generate.py build`. This will generate the library for further 'server' skeletons).

The library will be used together with the application code to make up the final application. You need to generate the application first, e.g. by running `generate.py source`. The generated source file is saved under *source/script/\<custom\>.js*, the build file (with `generate.py build`) under *build/script/\<custom\>.js*. Those files can then be executed.

### Invoking the application

After you have created the *source* or *build* version of a basic application, you can run it through either Node or Rhino. But as they have different loading primitives, Node allows you to run the app from a remote directory, while Rhino needs to run the application from the current working directory. So e.g. after creating the source version of an application *foo*, you can invoke it like this for Node:

``` {.sourceCode .bash}
$ node source/script/foo.js
```

or like this for Rhino:

``` {.sourceCode .bash}
$ cd source/script
$ java -cp path/to/js.jar org.mozilla.javascript.tools.shell.Main foo.js
```

### Included layers

-   See the %{Server} \</pages/server\> documentation.

