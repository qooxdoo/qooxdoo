.. _pages/snippets/different_application_root#setting_a_different_application_root:

Setting a different application root
************************************

It is ``strongly recommended`` that you stick with the skeleton file structure, but sometimes you are faced with an (already defined) different setup you have to cope with. So if you have your HTML file (the one which is including your qooxdoo source file) in another location as in the skeleton structure you should read on.

.. note::

    The ``application root`` is defined as the relative path to the directory containing the application’s HTML based on the directory the configuration file (typically ``config.json``) is located. Changing the ``application root`` is only relevant within the ``source`` version.

.. _pages/snippets/different_application_root#adjusting_the_config.json:

Adjusting the config.json
=========================

The whole magic is done within the ``config.json`` file of your application. 

To setup the needed jobs and to not interfere with already defined ones you have to include the defined jobs with an own scope. This is owed to the fact that it is not possible to define a job twice. 

::

    {
      "name"    : "MyApplication config.json",

      "include" :
      [
        // include the defined jobs from the application.json file 
        // with the scope "appconf"
        {
          "path" : "../../tool/data/config/application.json",
          "as"   : "appconf"
        }
      ],

      // define all needed macros
      "let" :
      {
        "APPLICATION"  : "myApplication",
        "QOOXDOO_PATH" : "PATH_TO_FRAMEWORK_FOLDER",
        "QOOXDOO_URI"  : "../${QOOXDOO_PATH}",
        "CACHE"        : "PATH_TO_CACHE",
        // default is Modern theme
        "QXTHEME"      : "qx.theme.Modern",
        "LOCALES"      : ["en", "de", "es", "fr", "it", "sv"],
        "ROOT"         : "."
      },

      "jobs" :
      {
        "common" :
        {
          // pull in all libraries
          // the framework and your application sources
          "library" :
          [
            {
              "manifest" : "${QOOXDOO_PATH}/Manifest.json",
              "uri"      : "${QOOXDOO_URI}"
            },

            {
              "manifest" : "${ROOT}/Manifest.json",
              "uri"      : "${APPLICATION_URI}"
            }
          ],

          // include application class as starting point for
          // dependency resolving.
          // theme class is included manually because it has no
          // dependency to other classes.
          "include" :
          [
            "${APPLICATION}.Application",
            "${QXTHEME}"
          ],

          // path to your cache folder
          "cache" :
          {
            "compile" :  "${CACHE}"
          },

          // define needed settings
          "settings" :
          {
            "qx.version"     : "${QXVERSION}",
            "qx.theme"       : "${QXTHEME}",
            "qx.application" : "${APPLICATION}.Application"
          },

          // define a macro for use in #asset directives
          "themes" :
          {
            "qx.icontheme" : "${QXICONTHEME}"
          }      
        },

        // adjusted "source" job - only executes the "source-script" job
        "source" :
        {
          "run" : ["source-script"]
        },

        // adjusted job to set another application root
        "source-script" :
        {
          "extend" : ["common"],

          "compile-source" :
          {
            "file" : "${ROOT}/source/script/${APPLICATION}.js",
            "locales" : "${LOCALES}",

            // THIS IS THE IMPORTANT KEY TO ADJUST 
            "root" : "PATH_TO_DIRECTORY_OF_YOUR_HTML_FILE"
          }
        },

        // these jobs are only redirections to the defined ones
        "api" :
        {
          "extend" : ["appconf::api"]
        },

        "build" :
        {
          "extend" : ["common", "appconf::build"]
        },

        "clean" :
        {
          "extend" : ["appconf::clean"]
        },

        "distclean" :
        {
          "extend" : ["appconf::distclean"]
        },

        "fix" :
        {
          "extend" : ["appconf::fix"]
        },

        "lint" :
        {
          "extend" : ["appconf::lint"]
        },

        "migration" :
        {
          "extend" : ["appconf::migration"]
        },

        "pretty" :
        {
          "extend" : ["appconf::pretty"]
        },

        "publish" :
        {
          "extend" : ["appconf::publish"]
        },

        "test" :
        {
          "extend" : ["appconf::test"]
        },

        "test-source" :
        {
          "extend" : ["appconf::test-source"]
        },

        "translation" :
        {
          "extend" : ["appconf::translation"]
        }
      }
    }

To summarize the above: 

  * include the jobs from the ``application.json`` with an own scope to create own jobs
  * set up the ``common`` job with all needed data
  * adjust the ``source`` job - currently only runs the ``source-script`` job, but this way you are safe for later modifications/extensions
  * adjust the ``source-script`` job to your needs - the important key is ``app-root`` (see :ref:`here <pages/tool/generator_config_ref#compile-options>` for details)

If you choose this approach you have additionally setup a config which allows you to simply change every default job you need to. Hopefully the default jobs will do the job as they are set up with sensible defaults.

