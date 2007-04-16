/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************


************************************************************************ */

/**
 * Methods to convert colors between different color spaces.
 *
 * TODO: Support for alpha ala RGBA
 */
qx.Class.define("qx.util.ColorUtil",
{
  statics :
  {
    /**
     * Regular expressions for color strings
     */
    REGEXP :
    {
      hex3 : /^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
      hex6 : /^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
      rgb : /^rgb\(\s*([0-9]{1,3}\.{0,1}[0-9]*)\s*,\s*([0-9]{1,3}\.{0,1}[0-9]*)\s*,\s*([0-9]{1,3}\.{0,1}[0-9]*)\s*\)$/
    },


    /**
     * CSS3 system color names.
     */
    SYSTEM :
    {
      activeborder        : 1,
      activecaption       : 1,
      appworkspace        : 1,
      background          : 1,
      buttonface          : 1,
      buttonhighlight     : 1,
      buttonshadow        : 1,
      buttontext          : 1,
      captiontext         : 1,
      graytext            : 1,
      highlight           : 1,
      highlighttext       : 1,
      inactiveborder      : 1,
      inactivecaption     : 1,
      inactivecaptiontext : 1,
      infobackground      : 1,
      infotext            : 1,
      menu                : 1,
      menutext            : 1,
      scrollbar           : 1,
      threeddarkshadow    : 1,
      threedface          : 1,
      threedhighlight     : 1,
      threedlightshadow   : 1,
      threedshadow        : 1,
      window              : 1,
      windowframe         : 1,
      windowtext          : 1
    },


    /**
     * Named colors, only the 16 basic colors plus the following ones:
     * transparent, grey, magenta, orange and brown
     */
    NAMED :
    {
      black       : [ 0, 0, 0 ],
      silver      : [ 192, 192, 192 ],
      gray        : [ 128, 128, 128 ],
      white       : [ 255, 255, 255 ],
      maroon      : [ 128, 0, 0 ],
      red         : [ 255, 0, 0 ],
      purple      : [ 128, 0, 128 ],
      fuchsia     : [ 255, 0, 255 ],
      green       : [ 0, 128, 0 ],
      lime        : [ 0, 255, 0 ],
      olive       : [ 128, 128, 0 ],
      yellow      : [ 255, 255, 0 ],
      navy        : [ 0, 0, 128 ],
      blue        : [ 0, 0, 255 ],
      teal        : [ 0, 128, 128 ],
      aqua        : [ 0, 255, 255 ],

      // Additional values
      transparent : [ -1, -1, -1 ],
      grey        : [ 128, 128, 128 ], // also define 'grey' as a language variant
      magenta     : [ 255, 0, 255 ],   // alias for fuchsia
      orange      : [ 255, 165, 0 ],
      brown       : [ 165, 42, 42 ]
    },


    /**
     * CSS 3 colors (http://www.w3.org/TR/css3-color/#svg-color)
     * This includes all classic HTML Color names (http://www.w3.org/TR/css3-color/#html4) and the <code>transparent</code> keyword.
     */
    EXTENDED :
    {
      transparent          : [ -1, -1, -1 ],
      aliceblue            : [ 240, 248, 255 ],
      antiquewhite         : [ 250, 235, 215 ],
      aqua                 : [ 0, 255, 255 ],
      aquamarine           : [ 127, 255, 212 ],
      azure                : [ 240, 255, 255 ],
      beige                : [ 245, 245, 220 ],
      bisque               : [ 255, 228, 196 ],
      black                : [ 0, 0, 0 ],
      blanchedalmond       : [ 255, 235, 205 ],
      blue                 : [ 0, 0, 255 ],
      blueviolet           : [ 138, 43, 226 ],
      brown                : [ 165, 42, 42 ],
      burlywood            : [ 222, 184, 135 ],
      cadetblue            : [ 95, 158, 160 ],
      chartreuse           : [ 127, 255, 0 ],
      chocolate            : [ 210, 105, 30 ],
      coral                : [ 255, 127, 80 ],
      cornflowerblue       : [ 100, 149, 237 ],
      cornsilk             : [ 255, 248, 220 ],
      crimson              : [ 220, 20, 60 ],
      cyan                 : [ 0, 255, 255 ],
      darkblue             : [ 0, 0, 139 ],
      darkcyan             : [ 0, 139, 139 ],
      darkgoldenrod        : [ 184, 134, 11 ],
      darkgray             : [ 169, 169, 169 ],
      darkgreen            : [ 0, 100, 0 ],
      darkgrey             : [ 169, 169, 169 ],
      darkkhaki            : [ 189, 183, 107 ],
      darkmagenta          : [ 139, 0, 139 ],
      darkolivegreen       : [ 85, 107, 47 ],
      darkorange           : [ 255, 140, 0 ],
      darkorchid           : [ 153, 50, 204 ],
      darkred              : [ 139, 0, 0 ],
      darksalmon           : [ 233, 150, 122 ],
      darkseagreen         : [ 143, 188, 143 ],
      darkslateblue        : [ 72, 61, 139 ],
      darkslategray        : [ 47, 79, 79 ],
      darkslategrey        : [ 47, 79, 79 ],
      darkturquoise        : [ 0, 206, 209 ],
      darkviolet           : [ 148, 0, 211 ],
      deeppink             : [ 255, 20, 147 ],
      deepskyblue          : [ 0, 191, 255 ],
      dimgray              : [ 105, 105, 105 ],
      dimgrey              : [ 105, 105, 105 ],
      dodgerblue           : [ 30, 144, 255 ],
      firebrick            : [ 178, 34, 34 ],
      floralwhite          : [ 255, 250, 240 ],
      forestgreen          : [ 34, 139, 34 ],
      fuchsia              : [ 255, 0, 255 ],
      gainsboro            : [ 220, 220, 220 ],
      ghostwhite           : [ 248, 248, 255 ],
      gold                 : [ 255, 215, 0 ],
      goldenrod            : [ 218, 165, 32 ],
      gray                 : [ 128, 128, 128 ],
      green                : [ 0, 128, 0 ],
      greenyellow          : [ 173, 255, 47 ],
      grey                 : [ 128, 128, 128 ],
      honeydew             : [ 240, 255, 240 ],
      hotpink              : [ 255, 105, 180 ],
      indianred            : [ 205, 92, 92 ],
      indigo               : [ 75, 0, 130 ],
      ivory                : [ 255, 255, 240 ],
      khaki                : [ 240, 230, 140 ],
      lavender             : [ 230, 230, 250 ],
      lavenderblush        : [ 255, 240, 245 ],
      lawngreen            : [ 124, 252, 0 ],
      lemonchiffon         : [ 255, 250, 205 ],
      lightblue            : [ 173, 216, 230 ],
      lightcoral           : [ 240, 128, 128 ],
      lightcyan            : [ 224, 255, 255 ],
      lightgoldenrodyellow : [ 250, 250, 210 ],
      lightgray            : [ 211, 211, 211 ],
      lightgreen           : [ 144, 238, 144 ],
      lightgrey            : [ 211, 211, 211 ],
      lightpink            : [ 255, 182, 193 ],
      lightsalmon          : [ 255, 160, 122 ],
      lightseagreen        : [ 32, 178, 170 ],
      lightskyblue         : [ 135, 206, 250 ],
      lightslategray       : [ 119, 136, 153 ],
      lightslategrey       : [ 119, 136, 153 ],
      lightsteelblue       : [ 176, 196, 222 ],
      lightyellow          : [ 255, 255, 224 ],
      lime                 : [ 0, 255, 0 ],
      limegreen            : [ 50, 205, 50 ],
      linen                : [ 250, 240, 230 ],
      magenta              : [ 255, 0, 255 ],
      maroon               : [ 128, 0, 0 ],
      mediumaquamarine     : [ 102, 205, 170 ],
      mediumblue           : [ 0, 0, 205 ],
      mediumorchid         : [ 186, 85, 211 ],
      mediumpurple         : [ 147, 112, 219 ],
      mediumseagreen       : [ 60, 179, 113 ],
      mediumslateblue      : [ 123, 104, 238 ],
      mediumspringgreen    : [ 0, 250, 154 ],
      mediumturquoise      : [ 72, 209, 204 ],
      mediumvioletred      : [ 199, 21, 133 ],
      midnightblue         : [ 25, 25, 112 ],
      mintcream            : [ 245, 255, 250 ],
      mistyrose            : [ 255, 228, 225 ],
      moccasin             : [ 255, 228, 181 ],
      navajowhite          : [ 255, 222, 173 ],
      navy                 : [ 0, 0, 128 ],
      oldlace              : [ 253, 245, 230 ],
      olive                : [ 128, 128, 0 ],
      olivedrab            : [ 107, 142, 35 ],
      orange               : [ 255, 165, 0 ],
      orangered            : [ 255, 69, 0 ],
      orchid               : [ 218, 112, 214 ],
      palegoldenrod        : [ 238, 232, 170 ],
      palegreen            : [ 152, 251, 152 ],
      paleturquoise        : [ 175, 238, 238 ],
      palevioletred        : [ 219, 112, 147 ],
      papayawhip           : [ 255, 239, 213 ],
      peachpuff            : [ 255, 218, 185 ],
      peru                 : [ 205, 133, 63 ],
      pink                 : [ 255, 192, 203 ],
      plum                 : [ 221, 160, 221 ],
      powderblue           : [ 176, 224, 230 ],
      purple               : [ 128, 0, 128 ],
      red                  : [ 255, 0, 0 ],
      rosybrown            : [ 188, 143, 143 ],
      royalblue            : [ 65, 105, 225 ],
      saddlebrown          : [ 139, 69, 19 ],
      salmon               : [ 250, 128, 114 ],
      sandybrown           : [ 244, 164, 96 ],
      seagreen             : [ 46, 139, 87 ],
      seashell             : [ 255, 245, 238 ],
      sienna               : [ 160, 82, 45 ],
      silver               : [ 192, 192, 192 ],
      skyblue              : [ 135, 206, 235 ],
      slateblue            : [ 106, 90, 205 ],
      slategray            : [ 112, 128, 144 ],
      slategrey            : [ 112, 128, 144 ],
      snow                 : [ 255, 250, 250 ],
      springgreen          : [ 0, 255, 127 ],
      steelblue            : [ 70, 130, 180 ],
      tan                  : [ 210, 180, 140 ],
      teal                 : [ 0, 128, 128 ],
      thistle              : [ 216, 191, 216 ],
      tomato               : [ 255, 99, 71 ],
      turquoise            : [ 64, 224, 208 ],
      violet               : [ 238, 130, 238 ],
      wheat                : [ 245, 222, 179 ],
      white                : [ 255, 255, 255 ],
      whitesmoke           : [ 245, 245, 245 ],
      yellow               : [ 255, 255, 0 ],
      yellowgreen          : [ 154, 205, 50 ]
    },


    /**
     * Whether the incoming value is a named color.
     *
     * @param value {String} the color value to test
     * @return {Boolean} true if the color is a named color
     */
    isNamedColor : function(value) {
      return this.NAMED[value] !== undefined;
    },


    /**
     * Whether the incoming value is a extended named color.
     *
     * @param value {String} the color value to test
     * @return {Boolean} true if the color is a extended named color
     */
    isExtendedColor : function(value) {
      return this.EXTENDED[value] !== undefined;
    },


    /**
     * Whether the incoming value is a system color.
     *
     * @param value {String} the color value to test
     * @return {Boolean} true if the color is a system color
     */
    isSystemColor : function(value) {
      return this.SYSTEM[value] !== undefined;
    },


    /**
     * Whether the incoming value is a themed color.
     *
     * @param value {String} the color value to test
     * @return {Boolean} true if the color is a themed color
     */
    isThemedColor : function(value) {
      return qx.manager.object.ColorManager.getInstance().isThemedColor(value);
    },


    /**
     * Try to convert a incoming string to an RGB array.
     * Supports themed, named and system colors, but also RGB strings,
     * hex3 and hex6 values.
     *
     * @type static
     * @param str {String} any string
     * @return {Array} returns an array of red, green, blue on a successful transformation
     * @throws an error if the string could not be parsed
     */
    stringToRgb : function(str)
    {
      if (this.isThemedColor(str))
      {
        return qx.manager.object.ColorManager.getInstance().themedColorToRgb(str);
      }
      else if (this.isNamedColor(str))
      {
        return this.NAMED[str];
      }
      else if (this.isSystemColor(str))
      {
        throw new Error("Could not convert system colors to RGB: " + value);
      }
      else if (this.isRgbString(str))
      {
        return this.__rgbStringToRgb();
      }
      else if (this.isHex3String(str))
      {
        return this.__hex3StringToRgb();
      }
      else if (this.isHex6String(str))
      {
        return this.__hex6StringToRgb();
      }

      throw new Error("Could not parse color: " + str);
    },


    /**
     * Converts a RGB array to an RGB string
     *
     * @type static
     * @param rgb {Array} an array with red, green and blue
     * @return {String} a RGB string
     */
    rgbToRgbString : function(rgb) {
      return "rgb(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ")";
    },


    /**
     * Detects if a string is a valid hex3 string
     *
     * @type static
     * @param str {String} any string
     * @return {Boolean} true when the incoming value is a valid hex3 string
     */
    isHex3String : function(str) {
      return this.REGEXP.hex3.test(str);
    },


    /**
     * Detects if a string is a valid hex6 string
     *
     * @type static
     * @param str {String} any string
     * @return {Boolean} true when the incoming value is a valid hex6 string
     */
    isHex6String : function(str) {
      return this.REGEXP.hex6.test(str);
    },


    /**
     * Detects if a string is a valid RGB string
     *
     * @type static
     * @param str {String} any string
     * @return {Boolean} true when the incoming value is a valid RGB string
     */
    isRgbString : function(str) {
      return this.REGEXP.rgb.test(str);
    },


    /**
     * Converts a regexp object match of a rgb string to an RGB array.
     *
     * @type static
     * @return {Array} an array with red, green, blue
     */
    __rgbStringToRgb : function()
    {
      var red = parseInt(RegExp.$1);
      var green = parseInt(RegExp.$2);
      var blue = parseInt(RegExp.$3);

      return [red, green, blue];
    },


    /**
     * Converts a regexp object match of a hex3 string to an RGB array.
     *
     * @type static
     * @return {Array} an array with red, green, blue
     */
    __hex3StringToRgb : function()
    {
      var red = parseInt(RegExp.$1, 16) * 17;
      var green = parseInt(RegExp.$2, 16) * 17;
      var blue = parseInt(RegExp.$3, 16) * 17;

      return [red, green, blue];
    },


    /**
     * Converts a regexp object match of a hex6 string to an RGB array.
     *
     * @type static
     * @return {Array} an array with red, green, blue
     */
    __hex6StringToRgb : function()
    {
      var red = (parseInt(RegExp.$1, 16) * 16) + parseInt(RegExp.$2, 16);
      var green = (parseInt(RegExp.$3, 16) * 16) + parseInt(RegExp.$4, 16);
      var blue = (parseInt(RegExp.$5, 16) * 16) + parseInt(RegExp.$6, 16);

      return [red, green, blue];
    },


    /**
     * Converts a hex3 string to an RGB array
     *
     * @type static
     * @param value {String} a hex3 (#xxx) string
     * @return {Array} an array with red, green, blue
     */
    hex3StringToRgb : function(value)
    {
      if (this.isHex3String(value)) {
        return this.__hex3StringToRgb(value);
      }

      throw new Error("Invalid hex3 value: " + value);
    },

    /**
     * Converts a hex6 string to an RGB array
     *
     * @type static
     * @param value {String} a hex6 (#xxxxxx) string
     * @return {Array} an array with red, green, blue
     */
    hex6StringToRgb : function(value)
    {
      if (this.isHex6String(value)) {
        return this.__hex6StringToRgb(value);
      }

      throw new Error("Invalid hex6 value: " + value);
    },


    /**
     * Converts a hex string to an RGB array
     *
     * @type static
     * @param value {String} a hex3 (#xxx) or hex6 (#xxxxxx) string
     * @return {Array} an array with red, green, blue
     */
    hexStringToRgb : function(value)
    {
      if (this.isHex3String(value)) {
        return this.__hex3StringToRgb(value);
      }

      if (this.isHex6String(value)) {
        return this.__hex6StringToRgb(value);
      }

      throw new Error("Invalid hex value: " + value);
    },


    /**
     * Convert RGB colors to HSB
     *
     * @type static
     * @param rgb {Number[]} red, blue and green as array
     * @return {Array} an array with hue, saturation and brightness
     */
    rgbToHsb : function(rgb)
    {
      var hue, saturation, brightness;

      var red = rgb[0];
      var green = rgb[1];
      var blue = rgb[2];

      var cmax = (red > green) ? red : green;

      if (blue > cmax) {
        cmax = blue;
      }

      var cmin = (red < green) ? red : green;

      if (blue < cmin) {
        cmin = blue;
      }

      brightness = cmax / 255.0;

      if (cmax != 0) {
        saturation = (cmax - cmin) / cmax;
      } else {
        saturation = 0;
      }

      if (saturation == 0)
      {
        hue = 0;
      }
      else
      {
        var redc = (cmax - red) / (cmax - cmin);
        var greenc = (cmax - green) / (cmax - cmin);
        var bluec = (cmax - blue) / (cmax - cmin);

        if (red == cmax) {
          hue = bluec - greenc;
        } else if (green == cmax) {
          hue = 2.0 + redc - bluec;
        } else {
          hue = 4.0 + greenc - redc;
        }

        hue = hue / 6.0;

        if (hue < 0) {
          hue = hue + 1.0;
        }
      }

      return [ Math.round(hue * 360), Math.round(saturation * 100), Math.round(brightness * 100) ];
    },


    /**
     * Convert HSB colors to RGB
     *
     * @type static
     * @param hsb {Number[]} an array with hue, saturation and brightness
     * @return {Array} an array with red, green, blue
     */
    hsbToRgb : function(hsb)
    {
      var i, f, p, q, t;

      var hue = hsb[0] / 360;
      var saturation = hsb[1] / 100;
      var brightness = hsb[2] / 100;

      if (hue >= 1.0) {
        hue %= 1.0;
      }

      if (saturation > 1.0) {
        saturation = 1.0;
      }

      if (brightness > 1.0) {
        brightness = 1.0;
      }

      var tov = Math.floor(255 * brightness);
      var rgb = {};

      if (saturation == 0.0)
      {
        rgb.red = rgb.green = rgb.blue = tov;
      }
      else
      {
        hue *= 6.0;

        i = Math.floor(hue);

        f = hue - i;

        p = Math.floor(tov * (1.0 - saturation));
        q = Math.floor(tov * (1.0 - (saturation * f)));
        t = Math.floor(tov * (1.0 - (saturation * (1.0 - f))));

        switch(i)
        {
          case 0:
            rgb.red = tov;
            rgb.green = t;
            rgb.blue = p;
            break;

          case 1:
            rgb.red = q;
            rgb.green = tov;
            rgb.blue = p;
            break;

          case 2:
            rgb.red = p;
            rgb.green = tov;
            rgb.blue = t;
            break;

          case 3:
            rgb.red = p;
            rgb.green = q;
            rgb.blue = tov;
            break;

          case 4:
            rgb.red = t;
            rgb.green = p;
            rgb.blue = tov;
            break;

          case 5:
            rgb.red = tov;
            rgb.green = p;
            rgb.blue = q;
            break;
        }
      }

      return rgb;
    }
  }
});
