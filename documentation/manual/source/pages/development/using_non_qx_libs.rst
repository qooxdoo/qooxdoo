Using non-qooxdoo, third-party libraries
*****************************************

Aside from normal qooxdoo libraries like contributions there may be times when you want to include a third-party %{JS} library in your application that just comes as a (potentially minified) *.js* file. (This could e.g. be a graphics or charting library.) There are basically two ways to integrate such a library into your application:

- Using the third-party library like a resource of your app.
- Wrapping the third-party code in an own %{qooxdoo} library.

Here is how each of them works.

Using the third-party library like a resource of your application
==================================================================

Let's assume you found this wonderful %{JS} library for charting, called *PonyCharts*. It is available as minified *ponycharts.js* download from the project's web site. It exposes an API for creating and manipulating charts, and you want ot use such charts as part of your %{qooxdoo} application. This means calling into the library's API from your %{qooxdoo} code, which in turn means the library has to be loaded ahead of your code in the browser.

1. As a first step, copy the *.js* file into your app's resource tree, e.g. as

    ::

        source/resource/ponycharts/ponycharts.js

2. Then, make sure your new resource is used by your application code. The main consequence of this is that the *.js* file will be copied over to the build tree of your application, and is being made known to ${qooxdoo}'s ResourceManager. You achieve that by adding an *@asset* hint to the main class of your application or library.

    ::

        /**
         * This is the main class of your custom application "foo".
         *
         * @asset(foo/*)
         * @asset(ponycharts/ponycharts.js)
         */
        qx.Class.define("foo.Application",
            ...
                
It makes sense to add the *.js* file under its own directory, thereby creating a namespace for it. This allows you to use wildcards should the third-party lib consist of multiple files (e.g. comes with an *.css* file, images, etc.). You could then write

    ::

        /**
         * ...
         * @asset(ponycharts/*)
         */

3. Make sure the PonyCharts *.js* file is loaded before your application code. A simple way to achieve this is to use the :ref:`add-script <pages/tool/generator/generator_config_ref#add-script>` config key. In your `config.json`, under *jobs*, add a *common* job like this.

    ::

        "common" : {
            "add-script" : [
                {
                    "uri" : "resource/ponycharts/ponycharts.js"
                }
            ]
        }

This will assure the lib is loaded in source and build versions of your app before your code starts. You can now code happily against PonyChart's API.


Wrapping the third-party code in an own %{qooxdoo} library
===========================================================

There is a more elaborate way to use an external %{JS} package, by wrapping it in its own qooxdoo library. Although more work, this has some advantages:

- Easier reuse, e.g. when you want to use the external package in multiple qooxdoo projects.
- Single point of concern, e.g. when the external package needs configuration or certain steps to initialize it.
- Exposing the package's API through a qooxdoo class.
- Automatic dependency management wherever the wrapper class is used.

Here are the necessary steps.

1. Create a fresh %{qooxdoo} project using `create-application.py`.
2. As before, copy the external package's files to a suitable place under the `resource` folder, e.g. `source/resource/ponycharts/ponycharts.js`
3. Add an `@asset` hint in the project's main class

    ::

        /**
         * This is the main class of the PonyCharts wrapper.
         *
         * @asset(ponycharts/ponycharts.js)
         */
        qx.Class.define("ponycharts.PonyCharts",
            ...

4. Add code this class that loads `ponycharts.js`, does necessary initialization, and adds a %{qooxdoo}-ish API to it.

    ::

        TBD

5. In the using %{qooxdoo} application, call the correpsonding methods of the wrapper class.

    ::

        TBD
 
