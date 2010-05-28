.. _pages/generator_config_howto#generator_config_howto:

Generator Config Howto
**********************

.. note::

  This is highly experimental info around qooxdoo 1.2. So it may need modification and improvement to be applied to newer qooxdoo versions.

.. _pages/generator_config_howto#how_can_i_create_an_all-in-one_qooxdoo_library:

How can I create an "all-in-one" qooxdoo library?
=================================================

Sometimes you may wish to create a library-style build of just qooxdoo framework classes (Reasons for this could be development situations where you don't have the tool chain available, or when you create dynamic qooxdoo code on the server that has to rely on a pre-build class library). Also see the blog post about an `qooxdoo "all-in-one" <http://news.qooxdoo.org/qooxdoo-all-in-one>`_.

You roughly have to take these steps to accomplish that:

#. define a set of classes you want to include
#. An important thing to keep in mind here is that the architecture of qooxdoo is designed around :ref:`running whole applications <pages/generator_config_background#application_startup>`, not just providing a set of library classes. That means that once the qooxdoo runtime starts it will

  * create a runtime environment (vars, core classes and objects, etc.)
  * look for a main application class to run

In order to do so, for example certain global variables have to be in place.

All these things define a certain set up that has to be in place for a qooxdoo application to run. Providing this environment is also necessary for your qooxdoo application when you are using a pre-build library.

This set up includes:

* define the main application class

You could build a pre-build qooxdoo library, either using Petr's qxbuild or roll your own.  And then compile your classes in an "application-stuff-only" package, which could be source or build, as you see fit. Then load one after the other.

E.g., provided you had those two packages and an index.html, in it you 
could say

::

  <!-- you need some inline stuff first -->
    <script type="text/javascript">
      qxsettings = { "qx.application" : "Application" };  // if that's 
  your main app class
    </script>

    <script type="text/javascript" src="path/to/qx.js"></script>  <!-- 
  this for the qooxdoo lib -->

    <script type="text/javascript" 
  src="path/to/yourappstuff.js"/></script> <!-- this for you app classes -->

To create the qx.js library you just need a tailored job for your 
config.json file which I could send you.

To create the yourappstuff.js lib, you just have to limit which classes 
go into the source/build job output. If you are working against trunk, 
put these two job definitions in your config.json:

::

  "source" : {
       "=include" : [ "=${APPLICATION}.*" ]
    },
    "build" : {
       "=include" : [ "=${APPLICATION}.*" ]
    }

assuming your classes are under source/class/<name space>/. Otherwise, 
you can just list their names in the array as strings.

This all is actually quite manageable. The hairy part is to synchronize 
the two libs sufficently, since qooxdoo establishes e.g. global vars and 
expects other things, in order to work properly and to tailor its 
workings. There is a bit of convention involved, which the build system 
manages out of the box, and which you have then to maintain on your own. 
I don't have much experience with this approach, so it might take some 
effort on your side to sort things out.

(Old quickstart config.json)

::

  {
    "jobs" :
    {
      "build" :
      {
        "library" :
        [
          {
            "manifest" : "../../framework/Manifest.json",
            "uri"      : "../../../framework"
          }
        ],

        // use qooxdoo wide cache folder
        "cache" :
        {
          "compile" : "../../cache"
        },

        // hard include all qooxdoo classes, except legacy stuff
        "include" : ["qx.*"],
        "exclude" : ["=qx.legacy.*"],

        // enable debug build
        "variants" :
        {
          "qx.debug" : ["on"],
          "qx.aspects" : ["off"]
        },

        // Static application class (which is not included in build)
        "settings" :
        {
          "qx.application" : "Application"
        },

        // only support compile target
        "compile-dist" :
        {
          "target" : "build",
          "file" : "build/script/qx.js",
          "uri"  : "script/qx.js",
          "format" : "on",
          "optimize" : ["basecalls", "variables", "privates"],
          "root" : "build"
        },

        "copy-files" :
        {
          "files" : ["index.html", "button.png", "Application.js"],
          "target" : "build"
        },

        "copy-resources" :
        {
          "target" : "build"
        }
      }
    }
  }

