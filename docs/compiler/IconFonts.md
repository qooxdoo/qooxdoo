# Icon Fonts

Icon fonts in qooxdoo need some preprocessing, because the layout managers need to know the
dimensions of 'images'. In this case, we're extracting this information from the glyph's
aspect ratio information encoded in the font.

Additionally we use the information placed in the font (glyph names) to automatically
assign the font icon to virtual image names. If you for example include the [Ligature Symbols](http://kudakurage.com/ligature_symbols/),
you can directly use this code

```javascript
var image = new qx.ui.basic.Image('@Ligature/print');
```

to show the 'print' symbol.

This mechanism heavily depends on how good the font glyph names are maintained. In some
cases (i.e. [Font Awesome](http://fontawesome.io/icons/)), the glyph information is either
incomplete or missing. You need to use a custom font map in this case to be able to
address all the glyphs by their name/alias.

## Defining an icon font

Use the *Manifest.json* to define the icon font like shown in the example:

```json5
{
  ...

  "provides" : 
  {
    ...
    "webfonts": [
      {
        "name": "FontAwesome",              // mandatory
        "defaultSize": 40,                  // optional
        "mapping": "project/fontawesome-map.json",   // optional - if you've a map file
        "comparisonString": "\uf26e\uf368", // string to test if font is loaded
        "resources": [
          "project/fontawesome-webfont.ttf",  // mandatory - we need one TTF file for parsing
          "project/fontawesome-webfont.eot",
          "project/fontawesome-webfont.woff2",
          "project/fontawesome-webfont.woff"
        ]
      }
    ]
  }
}
```

Please note that JSON does not support comments - you'll have to remove them first.

Every map entry in the *webfonts* array needs to have at least a _name_ and one
TTF _resources_ entry. Resources can be local files or HTTP URLs. The _name_ is
used to reference the font in the virtual URLs. So if you name it "Jipieh" instead
of "FontAwesome", you have to use `@Jipieh/<glyphname>` instead.

The qooxdoo-compiler uses fontkit to read the content of the ttf file and will therefore
automatically determine all the relevant css properties of the font, like fontFamily,
fontWeight, fontStyle and even character names. For some icon fonts the character names are not properly
stored or do not match the names users expect to see based on popular css integrations of the font.
For these cases you you can provide a json fontmap file.

## Creating a map file

As mentioned before, some fonts do not contain proper glyphnames. As a result,
we can't generate the mapping for you and you've to provide an own mapping.

The format of the mapping file is just JSON as shown here:

```json5
{
  "glyphname": "hex-codepoint",
  ...
}
```

`glpyhname` is the name or alias of the character, `codepoint` is the hexadecimal unicode
number for that character in the font.

In case of FontAwesome, for example you could use the following script to generate the maps
for the 3 variants of the font from the `fa.yml` file provided on the fontawesome github repo:

```javascript
const yaml = require('js-yaml');
const fs = require('fs');

let res = {};
let doc = yaml.safeLoad(fs.readFileSync('fa.yml', 'utf8'));
for (let key in doc) {
   doc[key].styles.forEach((style) => {
      if (res[style] == undefined){
         res[style]= {};
      }
      res[style][key] = doc[key].unicode;
   });
}
for (let key in res) {
    fs.writeFileSync('fa-' + key + '-map.json', JSON.stringify(res[key]));
}
```

## Using the icons

After adding the fonts to the Manifest, they will automatically get loaded and integrated
into your qooxdoo appliaction. It is not necessary to add a separate entry via en entry via 
`qx.Theme.define` to load the icon font. 

The font icons can now be used in qooxdoo image widgets like Image or Atom. Just start the image name with a `@`, followed by the defined font name, a slash
and the glyph name:

```javascript
var atom = new qx.ui.basic.Atom("Look, I'm a font icon", "@FontAwesome/heart");
```

If you don't have a glyph name (no map file and no definition in the font), you can also use the
unicode codepoint (in hex) directly:

```javascript
var atom = new qx.ui.basic.Atom("Look, I'm a font icon", "@FontAwesome/f004");
```
