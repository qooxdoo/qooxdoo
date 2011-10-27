.. _pages/ui_webfonts#webfonts:

Web Fonts
*********

qooxdoo's web fonts implementation is based on the @font-face CSS syntax. It attempts to abstract away cross-browser issues as far as possible, but due to the `browser differences in web font support <http://webfonts.info/wiki/index.php?title=%40font-face_browser_support>`_, it's up to the application developer to provide fonts in the appropriate formats.
Tools like FontForge or services like `FontSquirrel's font-face generator <http://www.fontsquirrel.com/fontface/generator>`_ can be used to convert fonts.

.. _pages/ui_webfonts#theme_definition:

Theme Definition
----------------
Like any font that should be used in a qooxdoo application, web fonts are defined in the :ref:`Font theme <pages/ui_theming#font_theme>`. They simply use an additional **sources** key:

::

    /* ************************************************************************
      #asset(custom/fonts/*)
    ************************************************************************ */
    
    qx.Theme.define("custom.theme.Font",
    {
      fonts :
      {
        "fancy" :
        {
          size : 11,
          lineHeight : 1.4,
          family : [ "Tahoma", "Liberation Sans", "Arial" ],
          sources:
          [
            {
              family : "YanoneKaffeesatzRegular",
              source:
              [
                "custom/fonts/yanonekaffeesatz-regular-webfont.eot",
                "custom/fonts/yanonekaffeesatz-regular-webfont.ttf",
                "custom/fonts/yanonekaffeesatz-regular-webfont.woff",
                "custom/fonts/yanonekaffeesatz-regular-webfont.svg#YanoneKaffeesatzRegular"
              ]
            }
          ]
        }
      }
    });

There are a few things to note here:

* The value of **sources** is an Array. As with regular CSS font-family definitions, the first font in the list that is available at runtime (meaning in this case it has been successfully downloaded) will be applied to widgets using the "fancy" font.
* The value of the **family** key will also be added to the font-family style property of the widget's content element so there is a defined fallback path even if no web font at all could be loaded.
* Between one and four different formats of the same font can be provided depending on which browsers should be supported. For SVG, it is necessary to add the font's ID. This can be found by looking for the path svg/defs/font/@id in the XML definition, or copied from the CSS template created by the FontSquirrel generator.
* Each **source** entry can be either a URI or a :ref:`qooxdoo resource ID <pages/ui_resources#resources>`. The latter is generally preferable since font files will then be copied to the output directory for the build version just like any other application resource. Also, this prevents issues in Firefox which applies Same-Origin Policy restrictions to web fonts.

Once configured, web fonts are applied like any other font, either by referencing them in the Appearance theme, e.g.:

::

    "window/title" :
    {
      style : function(states)
      {
        return {
          cursor : "default",
          font : "fancy",
          marginRight : 20,
          alignY: "middle"
        };
      }
    }

or by calling a widget instance's setFont method:

::

  var label = new qx.ui.basic.Label("A web font label");
  label.setFont("fancy");

Asynchronous loading considerations
-----------------------------------
As web fonts are loaded over HTTP, there can be a noticeable delay between adding the CSS rule to the document and the font style being applied to DOM elements. This means text will be rendered in the first available fallback font, then once the web font has finished downloading, affected widgets will recalculate their content size and trigger a layout update, which can cause a visible "jump" in the GUI. While this effect is far less pronounced (if at all noticeable) once the fonts are cached, it is still advisable to use web fonts sparingly.
Of course, using no more than two or three font-faces in an application is also good advice from a design point of view.