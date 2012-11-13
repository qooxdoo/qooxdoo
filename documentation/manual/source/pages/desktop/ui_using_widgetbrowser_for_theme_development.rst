.. _pages/ui_using_widgetbrowser_for_theme_development#three_steps_for_efficient_theme_development:


Three steps for efficient theme development
*******************************************

The widgetbrowser application is used by the framework to showcase the widgets and the available themes. With the feature to switch the themes at run-time you can quickly get an overview of the theming capabilities of the desktop widget set.

So this should be a perfect match if you like to develop an own custom theme, right? Every widget is displayed within the widgetbrowser and this would help a lot to develop an own custom them from scratch. 

To turn this into reality the widgetbrowser application got some enhancements and now it is very easy to use it for theme development. This little tutorial will show you the three steps you need.


Kickoff: Create a new contribution
==================================

A skeleton of the ``contribution`` type is perfectly suited to develop an own custom theme. Starting with a contribution you can easily integrate your own theme later on into the contrib infrastructure of qooxdoo and can share your theme with other users.

Creating a contribution skeleton is one command away:

::

      create-application.py -t contribution -n <NAME_OF_YOUR_THEME>



Integration: How the widgetbrowser joins the game
=================================================

Pulling in the widgetbrowser into your application is done by editing two files: the ``config.json`` and the ``Application.js`` of your demo application. 

The configuration has to be edited like this (original values are commented out):

::

    // Point the top-level include to the widgetbrowser configuration
    "include" :
    [
      {
        //"path" : "${QOOXDOO_PATH}/tool/data/config/application.json"
        "path" : "${QOOXDOO_PATH}/application/widgetbrowser/config.json"
      }
    ],


    // Change the default theme of your application
    "let" :
    {     
      // ...

      //"QXTHEME"      : "NAMESPACE.demo.theme.Theme",
      "QXTHEME"      : "NAMESPACE.theme.modern.Theme",

      // ...
    }


    // Add the widgetbrowser as library at the 'libraries' job
    "libraries" : 
    {
      "library" :
      [
        {
          "manifest" : "../../Manifest.json"
        },

        {
          "manifest" : "${QOOXDOO_PATH}/application/widgetbrowser/Manifest.json"
        }
      ]
    }


    // Add a custom 'common' job right after the existing 'libraries' job
    "common" :
    {
      "packages" :
      {
        "parts" :
        {
          "boot" :
          {
            "include" : [ "${APPLICATION}.Application", "${QXTHEME}" ]
          } 
        }
      }
    }


With these modification you pulled the configuration of the widgetbrowser into your own application. Basically your application is now a kind of copy of the widgetbrowser. But wait: how about the JavaScript part?

Well this is done by editing the ``Application.js`` of your application. To keep it simple just replace your existing class by this:

::

    qx.Class.define("NAMESPACE.demo.Application",
    {
      // use the application class of the widgetbrowser as parent class
      extend : widgetbrowser.Application,

      /*
      *******************************************************************
         MEMBERS
      *******************************************************************
      */

      members :
      {
        // extend the 'getThemes' method and add your own theme to the list
        getThemes: function() {
          return ([
            {"Indigo" : "qx.theme.Indigo"},
            {"Modern" : "qx.theme.Modern"},
            {"Simple" : "qx.theme.Simple"},
            {"Classic" : "qx.theme.Classic"},
            {"new theme" : "NAMESPACE.theme.modern.Theme"}
          ]);
        }
      }
    }); 


That's it! Run ``generate.py`` within the ``demo`` folder and open it in your favorite browser.



Final touch: Add your theme name and version
============================================

At the right upper corner of the widgetbrowser application you can easily replace the default name and version with your own to inform the user about the name of the theme and its version.

This is an additional minor adjustment in the ``config.json`` file:

::

    // ...

    // Add these lines to your 'common' job and adapt it to your needs
    "environment" :
    {
      "versionLabel.name" : "YOUR THEME NAME",
      "versionLabel.version" : "YOUR THEME VERSION"
    },

    // ...


Re-run the ``generate.py`` script to get this update into your application and enjoy!