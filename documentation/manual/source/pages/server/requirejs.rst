RequireJS Support
*****************

.. note::
  experimental


It is possible to use the generator to build a `RequireJS <http://requirejs.org/>`_ compatible library using qooxdoo. Here is the description of RequireJS taken from the homepage.

  "RequireJS is a JavaScript file and module loader. It is optimized for in-browser use, but it can be used in other JavaScript environments, like Rhino and Node. Using a modular script loader like RequireJS will improve the speed and quality of your code."

  -- `http://requirejs.org/ <http://requirejs.org/>`_

There are a couple of steps you need to do to get that done:

  * You need a class which represents the common interface you want to offer as require.js module.
  * You need to have your own config file for the generaot to build that library.

Represental interface
---------------------
Lets asume you have implemented a class like the following.

::

  qx.Bootstrap.define("my.super.Dog", {
    extend : Object,
    members : {
      bark : function() {
        alert("BARK!");
      }
    }
  });

You want to have that class exported as a module usable with RequireJS. The usage could look something like this:

::

  require("dog.js", function(dog) {
    dog.bark();
  });

But thats all you need to take care of on the JavaScript side.

Config file
-----------
There is some more work in the config part which might change some time. Here is a sample config:

::

  {
    "let" :
    {
      "APPLICATION"  : "library",
      "QOOXDOO_PATH" : "../..",
    },

      "build" :
      {
        "library" : [{
          "manifest" : "${QOOXDOO_PATH}/framework/Manifest.json"
        }],

        "include" : [
          "my.super.Dog"
        ],

        "environment" : {
          "qx.export" : {"dog" : "my.super.Dog"}
        },

        "compile-options" :
        {
          "paths" :
          {
            "file" : "dog.js",
            "app-root" : ".",
            "loader-template" : "${QOOXDOO_PATH}/tool/data/generator/require.loader.tmpl.js"
          },
          "uris" :
          {
            "script"   : ".",
            "resource" : "."
          },
          "code" :
          {
            "format"   : true,
            "optimize" : [ "variants", "base", "string", "privates", "variables" ],
            "except"   : []
          }
        },

        "compile" : { "type" : "build" }
      }
    }
  }

I won't go much into detail here because much of that is covered by the :ref:`Generator Config Keys <pages/tool/generator_config_ref>` page and others. But there are two things I want to draw your attention to. First, a new loader template is set for the compile step. There is a special loader template for RequireJS which uses the next important thing, the ``qx.export`` environment key. It holds a map saying which class should be exported as a module. Running that job will then generate a file named ``dog.js`` which is compatible to RequireJS offering the given dog class as module.