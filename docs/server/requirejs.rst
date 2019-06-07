RequireJS Support
*****************

.. note::
  experimental


It is possible to use the generator to build a `RequireJS <http://requirejs.org/>`_ compatible library using %{qooxdoo}. Here is the description of RequireJS taken from the project's website:

  "RequireJS is a JavaScript file and module loader. It is optimized for in-browser use, but it can be used in other JavaScript environments, like Rhino and Node. Using a modular script loader like RequireJS will improve the speed and quality of your code."

  -- `http://requirejs.org/ <http://requirejs.org/>`_

A couple of steps are necessary to accomplish this:

  * You need a class which represents the common interface you want to offer as a require.js module
  * and a customized generator config file to build your library.

Representable interface
-----------------------
Let's assume you've implemented a class like the following:

::

  qx.Bootstrap.define("my.super.Dog", {
    extend : Object,
    members : {
      bark : function() {
        alert("BARK!");
      }
    }
  });

You want to export this class as a module usable with RequireJS. Usage could look something like this:

::

  require("dog.js", function(dog) {
    dog.bark();
  });

That's all you need to take care of on the JavaScript side.

Config file
-----------
There is some more work to be done on the config side (this might change at some point). Here is a sample config:

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

We won't go much into detail here because most of this is covered by the :doc:`Generator Config Keys </pages/tool/generator/generator_config_ref>` page and others. But there are two things you should be aware of. First, a new loader template is set for the compile step. There's a special loader template for RequireJS which uses the other important thing: The ``qx.export`` environment key. It holds a map specifying which class should be exported as a module. Running the ``build`` job will then generate a RequireJS-compatible file named ``dog.js`` which exposes the ``dog`` class as a module.
