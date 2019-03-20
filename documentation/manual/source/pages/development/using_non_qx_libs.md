Using non-qooxdoo, third-party libraries
========================================

Aside from normal qooxdoo libraries like contributions there may be times when you want to include a third-party %{JS} library in your application that just comes as a (potentially minified) *.js* file. (This could e.g. be a graphics or charting library.) There are basically two ways to integrate such a library into your application:

-   Using the third-party library like a resource of your app.
-   Wrapping the third-party code in an own %{qooxdoo} library.

Here is how each of them works.

Using the third-party library like a resource of your application
-----------------------------------------------------------------

Let's assume you found this wonderful %{JS} library for charting, called *PonyCharts*. It is available as minified *ponycharts.js* download from the project's web site. It exposes an API for creating and manipulating charts, and you want ot use such charts as part of your %{qooxdoo} application. This means calling into the library's API from your %{qooxdoo} code, which in turn means the library has to be loaded ahead of your code in the browser.

1.  As a first step, copy the *.js* file into your app's resource tree, e.g. as

        source/resource/ponycharts/ponycharts.js

2.  Then, make sure your new resource is used by your application code. The main consequence of this is that the *.js* file will be copied over to the build tree of your application, and is being made known to %{qooxdoo}'s ResourceManager. You achieve that by adding an <*@asset>\* hint to the main class of your application or library.

        /**
         * This is the main class of your custom application "foo".
         *
         * @asset(foo/*)
         * @asset(ponycharts/ponycharts.js)
         */
        qx.Class.define("foo.Application",
            ...

    It makes sense to add the *.js* file under its own directory, thereby creating a namespace for it. This allows you to use wildcards should the third-party lib consist of multiple files (e.g. comes with an *.css* file, images, etc.). You could then write

        /**
         * ...
         * @asset(ponycharts/*)
         */

3.  Make sure the PonyCharts *.js* file is loaded before your application code. A simple way to achieve this is to use the add-script \<pages/tool/generator/generator\_config\_ref\#add-script\> config key. In your config.json, under *jobs*, add a *common* job like this.

        "common" : {
            "add-script" : [
                {
                    "uri" : "resource/ponycharts/ponycharts.js"
                }
            ]
        }

    This will assure the lib is loaded in source and build versions of your app before your code starts. You can now code happily against PonyChart's API.

Wrapping the third-party code in an own %{qooxdoo} library
----------------------------------------------------------

There is a more elaborate way to use an external %{JS} package, by wrapping it in its own qooxdoo library. Although more work, this has some advantages:

-   Easier reuse, e.g. when you want to use the external package in multiple qooxdoo projects.
-   Single point of concern, e.g. when the external package needs configuration or certain steps to initialize it.
-   Exposing the package's API through a qooxdoo class.
-   Automatic dependency management wherever the wrapper class is used.

### Step-by-Step Instructions

1.  Create a fresh %{qooxdoo} project using create-application.py.
2.  As in the approach above, copy the external package's files to a suitable place under the resource folder, e.g. source/resource/ponycharts/ponycharts.js.
3.  Likewise, add an @asset hint in the library's main class to include the external package as a resource (full example further below).
4.  Add code to this class that loads the external package, does necessary initialization and potentially adds a %{qooxdoo}-ish API to it.

    There is a framework class to help you with the loading part, [qx.util.DynamicScriptLoader](http://demo.qooxdoo.org/%{version}/apiviewer/#qx.util.DynamicScriptLoader), which does most of the work to make the package available in the current browser context. Using this, here is how your wrapper class may look like:

        /**
         * This is the main class of the PonyCharts wrapper.
         *
         * @asset(ponycharts/*)
         */
        qx.Class.define("ponycharts.PonyCharts",
        {
          extend: qx.core.Object,

          construct: function() {
            // initialize the script loading
            var dynLoader = new qx.util.DynamicScriptLoader([
                "ponycharts/ponycharts.js"
            ]);

            dynLoader.addListenerOnce('ready',function(e){
              console.log("all scripts have been loaded!");
              ThePonyChartsTopLevelSymbol.initialize();
            });

            dynLoader.addListener('failed',function(e){
              var data = e.getData();
              console.log("failed to load " + data.script);
            });

            dynLoader.start();
          },

          members: {
            paint: function() {
              ThePonyChartsTopLevelSymbol.paint_demo();
            }
          }
        }

    See qx.util.DynamicScriptLoader\_ for full details.

5.  Add the new %{qooxdoo} library to your main application's configuration. In its *config.json*, add under the *jobs* key

        "libraries" : {
          "library" : [
            "path" : "<path_to_ponycharts_lib>/Manifest.json"
          ]
        }

6.  In the using %{qooxdoo} application, call the correpsonding methods of the wrapper class.

        qx.Class.define("foo.Application",
        {
          extend: qx.core.Application,

          construct: function() {
            var myPonyCharts = new ponyCharts.PonyCharts();
            myPonyCharts.paint();
          }
        }

This should give you a basic outline how you can wrap an external package as a %{qooxdoo} library. You can now use the library for multiple projects, or even publish it as a contribution.
