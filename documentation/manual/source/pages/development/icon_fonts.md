Using icon fonts
================

Icon fonts in qooxdoo need some preprocessing, because the layout managers need to know the dimensions of 'images'. In this case, we're extracting this information from the glyph's aspect ratio information encoded in the font.

Additionally we use the information placed in the font (glyph names) to automatically assign the font icon to virtual image names. If you for example include the [Ligature Symbols](http://kudakurage.com/ligature_symbols/), you can directly use this code

    var image = new qx.ui.basic.Image('@Ligature/print');

to show the 'print' symbol. Additionally, you have a shortcut for a different size than the font's default size:

    var image = new qx.ui.basic.Image('@Ligature/print/16');

The latter makes the icon 16px in size.

This mechanism heavily depends on how good the font glyph names are maintained. In some cases (i.e. [Font Awesome](http://fontawesome.io/icons/)), the glyph information is either incomplete or missing. You need to use a custom font map in this case to be able to address all the glyphs by their name/alias.

The integration is generic, so that it does not collide with the framework's appearance themes
\</pages/desktop/ui\_theming\>. Font icons can be addressed using `@FontName/GlyphName` or `@FontName/HexUnicode` in the source property of your `qx.ui.basic.Image`. To override the default size, you can also use `@FontName/GlyphName/size` or `@FontName/HexUnicode/size` to scale it to the given number of pixels.

Defining an icon font
---------------------

Use the *Manifest.json* to define the icon font like shown in the example:

    {
      ...

      "provides" : 
      {
        ...
        "webfonts": [
          {
            "name": "FontAwesome",              // mandatory
            "defaultSize": 40,                  // optional
            "mapping": "fontawesome.map",       // optional - if you've a map file
            "resources": [
              "foobar/fontawesome-webfont.ttf", // mandatory - we need one TTF file for parsing
              "foobar/fontawesome-webfont.eot",
              "foobar/fontawesome-webfont.woff2",
              "foobar/fontawesome-webfont.woff"
            ]
          }
        ]
      }
    }

Please note that JSON does not support comments - you'll have to remove them first.

Every map entry in the *webfonts* array needs to have at leasta \_name\_ and one TTF \_resources\_ entry. Resources can be local files or HTTP URLs. The \_name\_ is used to reference the font in the virtual URLs. So if you name it "Foobar" instead of "FontAwesome", you have to use `@Foobar/<glyphname>` instead.

Creating a map file
-------------------

As mentioned before, some fonts do not contain proper glyphnames. As a result, we can't generate the mapping for you and you've to provide an own mapping.

The format of the mapping file is just JSON as shown here:

    {
      'glyphname': codepoint,
      ...
    }

`glpyhname` is the name or alias of the character, `codepoint` is the decimal unicode number for that character in the font.

In case of FontAwesome, you might want to use [a simple script](https://gist.github.com/cajus/b00bbeb629013fb73a1bd8431e88c18a) instead of creating such a file manually.

Using the icons
---------------

For now, the font is not yet automatically added to the project. You have to do something like this in your theme's `Font.js`:

    qx.Theme.define("foobar.theme.Font",
    {
      extend : qx.theme.indigo.Font,

      fonts :
      {
        "FontAwesome": {
          size: 40,
          lineHeight: 1,
          comparisonString : "\uf1e3\uf1f7\uf11b\uf19d",
          family: ["FontAwesome"],
          sources: [
            {
              family: "FontAwesome",
              source: [
                "foobar/fontawesome-webfont.ttf"
              ]
            }
          ]
        }
      }
    });

The need for it will go away until 6.0 will be ready for public use.

To include a font icon somewhere, just use the ordinary image way (i.e. in an Image, Atom) and provide a virtual image name. It starts with an ["@"](mailto:"@"), followed by the defined font name, a slash and the glyph name:

    var atom = new qx.ui.basic.Atom("Look, I'm a font icon", "@FontAwesome/heart");

If you don't have a glyph name (no map file and no definition in the font), you can also use the unicode codepoint (in hex) directly:

    var atom = new qx.ui.basic.Atom("Look, I'm a font icon", "@FontAwesome/f004");

Drawbacks
---------

Only qx.ui.basic.Image and qx.ui.table.cellrenderer.Image support icon fonts. It is not possible to use these icon font based images in decorators.

Benefits
--------

There are several benefits for using icon fonts.

-   Fewer HTTP requests mean better performance when using icon fonts.
-   State changes are faster, because just the character needs to be changed.
-   They have no color and can be styled according to your needs.

