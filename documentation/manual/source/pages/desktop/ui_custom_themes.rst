.. _pages/desktop/ui_custom_themes#custom_themes:

Custom Themes
*************

There are certain circumstances when the built-in themes are no more sufficient for your application and your needs. You need to create a custom theme because you have either self-written widgets you wish to style or you like to change the theming of your application overall.

Basically you have two choices to create a custom theme depending on your needs and the amount you want to change. The next two sections describe both briefly.

.. _pages/desktop/ui_custom_themes#extending_themes:

Extending Themes
================

If you want to stick with an existing theme and only like to add or modify some appearances, change colors or fonts the best way to go is to extend a theme and to create an own meta theme which sets your extended theme.

For example you like to add some appearances (of your own widgets) to the Modern theme you can simply extend the appearance theme of the Modern theme.

::

  qx.Theme.define("myApplication.theme.Appearance",
  {
    extend : qx.theme.modern.Appearance,
    title : "my appearance theme",

    appearances :
    {
      "my-widget" : 
      {
        alias : "atom",

        style : function(states)
        {
          return {
            width : 250,
            decorator : "main"
          };
        }
      }
    }
  });

To enable your own appearance theme you also have to extend the Meta theme and set your appearance theme.

::

  qx.Theme.define("myApplication.theme.Theme",
  {
    title : "my meta theme",

    meta :
    {
      color : qx.theme.modern.Color,
      decoration : qx.theme.modern.Decoration,
      font : qx.theme.modern.Font,
      icon : qx.theme.icon.Tango,
      appearance : myApplication.theme.Appearance
    }
  });

At last you have to tell the generator to actually use your meta theme. Therefore you have to edit your ``config.json`` file and add/edit the key ``QXTHEME`` in the ``let`` block.

::

  "let" :
    {
      "APPLICATION"  : "myApplication",
      ...
      "QXTHEME"      : "myApplication.theme.Theme"
      ...
    },

After editing your ``config.json`` the very last step is to generate your application sources and you're done. Now you can adjust and extend your appearance theme to suit your needs.

.. note::

  These steps are also applicable for the other themes.

.. _pages/desktop/ui_custom_themes#define_custom_themes:

Define Custom Themes
====================

A custom theme is an own meta theme and the corresponding themes build from scratch. The main part of this work is mainly the appearance theme and the content of the other themes is mostly defined by the appearance theme, since this theme is the one who uses fonts, icons, decorators and colors.

Creating the meta theme is a no-brainer and when creating the several themes you only have to consider some rules:

* every theme has its own root key which also defines its type. ``colors`` for a color theme, ``appearances`` for an appearance theme and so on
* every widget has to be equipped with an appearance, otherwise you'll get a warning at application startup
* every used color, decorator or font has to be defined, otherwise you'll get an error at application startup. So be sure to define all used colors, fonts and decorators and to test your application always in the source version to get the error messages
* be sure to include every image you use in your appearance theme by defining corresponding ``#asset`` directives.
* Be sure to check all build in widgets with all states. A Widget may have a different looks and feel when disabled or invalid.
* Its a good idea to copy a existing appearance theme and edit all the stuff you need. That way, you can be sure that you have all the appearance keys included the framework needs.