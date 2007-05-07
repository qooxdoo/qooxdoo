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

/**
 * Methods to convert colors between different color spaces.
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
      activeborder        : true,
      activecaption       : true,
      appworkspace        : true,
      background          : true,
      buttonface          : true,
      buttonhighlight     : true,
      buttonshadow        : true,
      buttontext          : true,
      captiontext         : true,
      graytext            : true,
      highlight           : true,
      highlighttext       : true,
      inactiveborder      : true,
      inactivecaption     : true,
      inactivecaptiontext : true,
      infobackground      : true,
      infotext            : true,
      menu                : true,
      menutext            : true,
      scrollbar           : true,
      threeddarkshadow    : true,
      threedface          : true,
      threedhighlight     : true,
      threedlightshadow   : true,
      threedshadow        : true,
      window              : true,
      windowframe         : true,
      windowtext          : true
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
     * Whether the incoming value is a named color.
     *
     * @param value {String} the color value to test
     * @return {Boolean} true if the color is a named color
     */
    isNamedColor : function(value) {
      return this.NAMED[value] !== undefined;
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
      return qx.manager.object.ColorManager.getInstance().isDynamic(value);
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
        return qx.manager.object.ColorManager.getInstance().resolveDynamic(str);
      }
      else if (this.isNamedColor(str))
      {
        return this.NAMED[str];
      }
      else if (this.isSystemColor(str))
      {
        throw new Error("Could not convert system colors to RGB: " + str);
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
     * Try to convert a incoming string to an RGB array.
     * Support named colors, RGB strings, hex3 and hex6 values.
     *
     * @type static
     * @param str {String} any string
     * @return {Array} returns an array of red, green, blue on a successful transformation
     * @throws an error if the string could not be parsed
     */
    cssStringToRgb : function(str)
    {
      if (this.isNamedColor(str))
      {
        return this.NAMED[str];
      }
      else if (this.isSystemColor(str))
      {
        throw new Error("Could not convert system colors to RGB: " + str);
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
     * Try to convert a incoming string to an RGB string, which can be used
     * for all color properties.
     * Supports themed, named and system colors, but also RGB strings,
     * hex3 and hex6 values.
     *
     * @type static
     * @param str {String} any string
     * @return {String} a RGB string
     * @throws an error if the string could not be parsed
     */
    stringToRgbString : function(str) {
      return this.rgbToRgbString(this.stringToRgb(str));
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
     * Detects if a string is a valid qooxdoo color
     *
     * @type static
     * @param str {String} any string
     * @return {Boolean} true when the incoming value is a valid qooxdoo color
     */
    isValid : function(str) {
      return this.isThemedColor(str) || this.isCssString(str);
    },


    /**
     * Detects if a string is a valid CSS color string
     *
     * @type static
     * @param str {String} any string
     * @return {Boolean} true when the incoming value is a valid CSS color string
     */
    isCssString : function(str) {
      return this.isSystemColor(str) || this.isNamedColor(str) || this.isHex3String(str) || this.isHex6String(str) || this.isRgbString(str);
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
