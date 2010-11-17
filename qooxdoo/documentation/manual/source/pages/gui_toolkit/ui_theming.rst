.. _pages/ui_theming#theming:

Theming
*******

qooxdoo includes two themes:

* ``Modern`` - a graphically rich theme, showcasing many UI capabilities of qooxdoo %{version}
* ``Classic`` - a more lightweight, MS Windows oriented theme

Here some screenshots:

|Modern theme|

.. |Modern theme| image:: window_modern_theme.png

|Classic theme|

.. |Classic theme| image:: window_classic_theme.png

While those two themes run out-of-the-box, it is easy to create your own themes. Those custom themes can either be created by  :ref:`extending existing ones <pages/gui_toolkit/ui_custom_themes#extending_themes>` or they can be :ref:`created from scratch <pages/gui_toolkit/ui_custom_themes#custom_themes>`.

A complete theme (a so-called *meta theme*) consists of several special themes, each designed to play a dedicated role and to setup the different parts of the whole theming. These special themes are described at the subsequent sections followed by a description of how to create own themes.

.. _pages/ui_theming#meta_theme:

Meta Theme
==========

A meta theme describes the whole theme itself by defining the specific parts. Each meta theme consists of five keys

* appearance
* color
* decoration
* font
* icon

each of them referencing to a specialized theme. So you can think of a meta theme as of collection whose parts can easily be changed.

Sample of a meta theme:

::

    qx.Theme.define("qx.theme.Modern",
    {
      meta :
      {
        color : qx.theme.modern.Color,
        decoration : qx.theme.modern.Decoration,
        font : qx.theme.modern.Font,
        appearance : qx.theme.modern.Appearance,
        icon : qx.theme.icon.Tango
      }
    }

This section describes the different types of themes which are used for theming a whole application.

.. _pages/ui_theming#color_theme:

Color Theme
===========

A color theme defines all colors used by the framework. Each color is defined by an unique name and a value which can be written as hex, rgb or named color. This defined name is usable throughout the whole framework and your application.

.. note::

    The best way to organize your color names is to use **semantic ones** like ``background``, ``text-input`` or ``text-disabled``. This way it is easier to use one color for multiple widgets.

Part of a sample color theme:

::

    /**
     * sample color theme
     */
    qx.Theme.define("myApplication.theme.sample.Color",
    {
      colors :
      {
        /*
        ----------------------------------------------------------------------
          SAMPLE COLORS
        ----------------------------------------------------------------------
        */

        // color as hex value
        "background-application" : "#DFDFDF",

        // color as rgb array
        "background-pane" : [ 128, 128, 128 ],

        // color as named color
        "background-light" : "gray",
      }
    });

Following names are recognized as named colors: ``black``, ``white``, ``silver``, ``gray``, ``maroon``, ``red``, ``purple``, ``fuchsia``, ``green``, ``lime``, ``olive``, ``yellow``, ``navy``, ``blue``, ``teal``, ``aqua``, ``orange``, ``brown``.

The color values are set in the class `qx.util.ColorUtil <http://demo.qooxdoo.org/%{version}/apiviewer/#qx.util.ColorUtil>`_

.. _pages/ui_theming#decoration_theme:

Decoration Theme
================

Each widget can be equipped with an independent decoration which can be used to set a background-color or -image, define a border or add a shadow. 
In a decoration theme you can use several different decorators depending on the results you wish to achieve. Please take a look at the :doc:`decorator article <ui_decorators>` to get more information.

.. note::

    It is recommend to define the decorations inside the theme instead of creating manually decorator instances inside your application code. This way the created decorators can be used by multiple widgets.

What a decoration theme can look like:

::

    /* *********************************************

    #asset(sample/decoration/myDecorationTheme/*)

    ************************************************/

    /**
     * sample decoration theme.
     */
    qx.Theme.define("myApplication.theme.sample.Decoration",
    {
      resource : "sample/decoration/MyDecorationTheme",

      decorations :
     {
        "uniform" :
        {
          decorator: qx.ui.decoration.Uniform,

          style :
          {
            width : 1,
            color : "border-main"
          }
        },

       "single" :
        {
          decorator: qx.ui.decoration.Single,

          style :
          {
            width : 1,

            color : "red",
            colorLeft : "black",
            colorRight : "white",

            style : "solid"
          }
        },

        "double" :
        {
          decorator : qx.ui.decoration.Double,

          style :
          {
            width : 1,
            innerWidth: 1,
            color : [ "border-dark-shadow", "border-light", "border-light", "border-dark-shadow" ],
            innerColor : [ "border-dark", "border-light-shadow", "border-light-shadow", "border-dark" ]
          }
        },

        "background" :
        {
          decorator : qx.ui.decoration.Background,

          style :
          {
            backgroundImage  : "decoration/background.png",
            backgroundRepeat : "scale"
          }
        },

        "beveled" :
        {
          decorator : qx.ui.decoration.Beveled,

          style : {
            backgroundImage : "decoration/beveled.png",
            backgroundRepeat : "scale",
            outerColor : "border-main",
            innerColor : "white",
            innerOpacity : 0.5
          }
        },

        "grid" :
        {
          decorator : qx.ui.decoration.Grid,

          style :
          {
            baseImage : "decoration/pane/grid.png"
          }
        }
    });

Noted the ``#asset`` at the top and the ``resource`` key inside the theme declaration? This is needed to for the images used within the theme. A description of how to work with resources is available :ref:`here <pages/ui_resources#declaring_resources_in_the_code>`.

.. _pages/ui_theming#font_theme:

Font Theme
==========

This theme is all about the information of the fonts used throughout your application. As the number of types/variants of fonts used with application isn't that big the font theme is normally a compact one. 

.. note::

    It is always a good idea to limit the number of types or variants of fonts to create a homogenous look.

To demonstrate how compact and powerful a font theme can look like, take a look at the **complete** font theme of the Modern theme:

::

    /**
     * The modern font theme.
     */
    qx.Theme.define("qx.theme.modern.Font",
    {
      fonts :
      {
        "default" :
        {
          size : qx.bom.client.System.WINVISTA ? 12 : 11,
          lineHeight : 1.4,
          family : qx.bom.client.Platform.MAC ? [ "Lucida Grande" ] :
            qx.bom.client.System.WINVISTA ? [ "Segoe UI", "Candara" ] :
            [ "Tahoma", "Liberation Sans", "Arial" ]
        },

        "bold" :
        {
          size : qx.bom.client.System.WINVISTA ? 12 : 11,
          lineHeight : 1.4,
          family : qx.bom.client.Platform.MAC ? [ "Lucida Grande" ] :
            qx.bom.client.System.WINVISTA ? [ "Segoe UI", "Candara" ] :
            [ "Tahoma", "Liberation Sans", "Arial" ],
          bold : true
        },

        "small" :
        {
          size : qx.bom.client.System.WINVISTA ? 11 : 10,
          lineHeight : 1.4,
          family : qx.bom.client.Platform.MAC ? [ "Lucida Grande" ] :
            qx.bom.client.System.WINVISTA ? [ "Segoe UI", "Candara" ] :
            [ "Tahoma", "Liberation Sans", "Arial" ]
        },

        "monospace" :
        {
          size: 11,
          lineHeight : 1.4,
          family : qx.bom.client.Platform.MAC ? [ "Lucida Grande" ] :
            qx.bom.client.System.WINVISTA ? [ "Consolas" ] :
            [ "Consolas", "DejaVu Sans Mono", "Courier New", "monospace" ]
        }
      }
    });

.. _pages/ui_theming#icon_theme:

Icon Theme
==========

This theme is to define which icon set is used and normally consists only of 3 main keys (title, resource and icons).

The important one is the ``resource`` key which points the generator to the location of the icon set. The ``icon`` alias, which is used to reference icons in qooxdoo applications, is set to the value of this key. The ``icons`` key is to define additional icons which are not part of the icon theme. 
As qooxdoo uses the free available `Tango <http://tango.freedesktop.org/Tango_Desktop_Project>`_ and `Oxygen <http://www.oxygen-icons.org>`_ icon sets it is not necessary to extend these.

Complete code for the ``tango`` icon theme:

::

    /**
     * Tango icons
     */
    qx.Theme.define("qx.theme.icon.Tango",
    {
      resource : "qx/icon/Tango",
      icons : {}
    });

.. _pages/ui_theming#appearance_theme:

Appearance Theme
================

The appearance theme is by far the biggest theme. Its task is to describe every themable widget and their child controls. Since the widgets are styled using decorators, colors, fonts and icons the appearance theme uses the definitions of all the other themes namely the decoration, color, font and icon theme. You can think of the appearance theme as the central meeting point where the other themes (decorator, color, font and icon) get together.

To discover the power of the appearance theme please take a look at the :doc:`corresponding article <ui_appearance>` which should let you get an idea of the whole picture.

.. _pages/ui_theming#applying_themes:

Applying Themes
===============

Typically, your application will have a certain, pre-defined theme known *at build-time*. The best way to associate such a default outlook with your application is to use the config.json variable ``QXTHEME`` inside the "let" section. Setting this variable to a fully-qualified meta theme class lets the build process handle the proper inclusion and linkage of the theme classes automatically. E.g.:

::

    ...
    QXTHEME : my.theme.Cool,
    ...

It is also possible to set a certain appearance *at runtime*:

::

    qx.theme.manager.Meta.getInstance().setTheme(my.theme.Cool); 

For appearance, color, border, icon and widget themes, you can use similar classes in the `qx.theme.manager <http://demo.qooxdoo.org/current/apiviewer/#qx.theme.manager>`_ package.

