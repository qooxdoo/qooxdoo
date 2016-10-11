.. _pages/icon_fonts#icon_fonts:

Using icon fonts
****************

Qooxdoo integrates the support for icon fonts like `FontAwesome <http://fontawesome.io/>`_. The
itegration is generic, so that it does not collide with the frameworks :doc:`appearance themes
</pages/desktop/ui_theming>`.

Font icons can be addressed using ``@FontName/GlyphName`` or ``@FontName/HexUnicode`` in the source
property of your ``qx.ui.basic.Image``.

.. _pages/icon_fonts#setup:

Configuration
=============

.. note::

    To be able to use font map generation, you need a locally installed
    :doc:`FontForge </pages/introduction/third_party_components>` and its python
    package.


To use this feature you have to configure a dedicated generator job to extract
the available glyph-names and a character aspect ratio from the defined fonts.
You can add this job to your standard ``config.json`` file, or, as the
configuration for these tasks is fairly self-contained, put them in an own file
 like ``fonts.json``, as we do in the framework.

Here is the general layout for the image manipulating jobs configuration::

    {
      "jobs" :
      {
        "common" :
        {
          "let" :
          {
             "RESPATH" : "./source/resource"
          },

          "cache" :
          {
             "compile" : "../../cache"
          }
        },

        "make-font-map" : { ... }
      }
    }

The ``common`` job is used to set up the basic settings which are shared between
the specific jobs, described in the following sections.

.. _pages/icon_fonts#make_font_map:

Creating a font map
-------------------

Creating a font map is needed whenever you add or change a font that is intended
to be used as an icon font.

::

    "make-font-map" :
    {
      "extend" : ["common"],
      "desc" : "Build a font mapping from glyphname to unicode id",

      "font-map" :
      {
        "fonts" :
        {
          "${RESPATH}/project/fonts/fontawesome-webfont.ttf" :
          {
            "prefix": [ "${RESPATH}" ],
            "alias" : "FontAwesome",
            "size" : 40
          }
        }
      }
    }

* The key has to be the path to the *source* font. It is recommended to use
  a TTF font here.
* The ``prefix`` entry will set the base file path for all the result map.
* The entry ``size`` sets the default size of the font icons, since qooxdoo
  expects icons to have a specific size. It is possible to set a specific
  size for icon font based images, of course.

See the :ref:`make-font-map reference
<pages/tool/generator/generator_config_ref#font_map_ref>` for all configuration
details.


.. _pages/icon_fonts#run_image_jobs:

Running font jobs
=================

If you are finished with the definition of your fonts to generate a font map for,
you can use the ``generator`` to let it be created for you.

::

    ./generate.py make-font-map


.. _pages/icon_fonts#drawbacks:

Drawbacks
=========

Only qx.ui.basic.Image and qx.ui.table.cellrenderer.Image support icon
fonts. It is not possible to use these icon font based images in decorators.

.. _pages/icon_fonts#benefits:

Benefits
========

There are several benefits for using icon fonts.

* Fewer HTTP requests mean better performance when using icon fonts.
* State changes are faster, because just the character needs to be changed.
* They have no color and can be styled according to your needs.

