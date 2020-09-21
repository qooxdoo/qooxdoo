/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Christian Hagendorn (cs)

************************************************************************ */

/**
 * Methods to convert colors between different color spaces.
 *
 * @ignore(qx.theme.*)
 * @ignore(qx.Class)
 * @ignore(qx.Class.*)
 */
qx.Bootstrap.define("qx.util.ColorUtil",
{
  statics :
  {
    /**
     * Regular expressions for color strings
     */
    REGEXP :
    {
      hexShort : /^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])?$/,
      hexLong : /^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})?$/,
      hex3 : /^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/,
      hex6 : /^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])$/,
      rgb : /^rgb\(\s*([0-9]{1,3}\.{0,1}[0-9]*)\s*,\s*([0-9]{1,3}\.{0,1}[0-9]*)\s*,\s*([0-9]{1,3}\.{0,1}[0-9]*)\s*\)$/,
      rgba : /^rgba\(\s*([0-9]{1,3}\.{0,1}[0-9]*)\s*,\s*([0-9]{1,3}\.{0,1}[0-9]*)\s*,\s*([0-9]{1,3}\.{0,1}[0-9]*)\s*,\s*([0-9]{1,3}\.{0,2}[0-9]*)\s*\)$/
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
     * Whether the color theme manager is loaded. Generally
     * part of the GUI of qooxdoo.
     *
     * @return {Boolean} <code>true</code> when color theme support is ready.
     **/
    supportsThemes : function() {
      if (qx.Class) {
        return qx.Class.isDefined("qx.theme.manager.Color");
      }
      return false;
    },


    /**
     * Whether the incoming value is a themed color.
     *
     * @param value {String} the color value to test
     * @return {Boolean} true if the color is a themed color
     */
    isThemedColor : function(value)
    {
      if (!this.supportsThemes()) {
        return false;
      }

      if (qx.theme && qx.theme.manager && qx.theme.manager.Color) {
        return qx.theme.manager.Color.getInstance().isDynamic(value);
      }
      return false;
    },


    /**
     * Try to convert an incoming string to an RGBA array.
     * Supports themed, named and system colors, but also RGBA strings,
     * hex[3468] values.
     *
     * @param str {String} any string
     * @return {Array} returns an array of red, green, blue and optional alpha on a successful transformation
     * @throws {Error} if the string could not be parsed
     */
    stringToRgb : function(str)
    {
      if (this.supportsThemes() && this.isThemedColor(str)) {
        str = qx.theme.manager.Color.getInstance().resolveDynamic(str);
      }
      return this.cssStringToRgb(str);
    },

    /**
     * Try to convert an incoming string to an RGB array with optional alpha.
     * Support named colors, RGB strings, RGBA strings, hex[3468] values.
     *
     * @param str {String} any string
     * @return {Array} returns an array of red, green, blue on a successful transformation
     * @throws {Error} if the string could not be parsed
     */
    cssStringToRgb : function(str)
    {
      var color;
      if (this.isNamedColor(str))
      {
        color = this.NAMED[str].concat();
      }
      else if (this.isSystemColor(str))
      {
          throw new Error("Could not convert system colors to RGB: " + str);
      }
      else if (this.isRgbaString(str)) {
        color = this.__rgbaStringToRgb(str);
      }
      else if (this.isRgbString(str))
      {
        color = this.__rgbStringToRgb();
      }
      else if (this.ishexShortString(str))
      {
        color = this.__hexShortStringToRgb();
      }
      else if (this.ishexLongString(str))
      {
        color = this.__hexLongStringToRgb();
      }
      if (color) {
        // don't mention alpha if the color is opaque
        if (color.length === 3 && color[3] == 1) {
          color.pop();
        }
        return color;
      }
      throw new Error("Could not parse color: " + str);
    },


    /**
     * Try to convert an incoming string to an RGB string, which can be used
     * for all color properties.
     * Supports themed, named and system colors, but also RGB strings,
     * hexShort and hexLong values.
     *
     * @param str {String} any string
     * @return {String} a RGB string
     * @throws {Error} if the string could not be parsed
     */
    stringToRgbString : function(str) {
      return this.rgbToRgbString(this.stringToRgb(str));
    },


    /**
     * Converts a RGB array to an RGB string
     *
     * @param rgb {Array} an array with red, green and blue values and optionally
     * an alpha value
     * @return {String} an RGB string
     */
    rgbToRgbString : function(rgb) {
      return "rgb" + (rgb.length === 4 ? "a" : "") +  "(" + rgb.map(function(v){return Math.round(v*1000)/1000 }).join(",") + ")";
    },


    /**
     * Converts a RGB array to a hex[68] string
     *
     * @param rgb {Array} an array with red, green, blue and optional alpha
     * @return {String} a hex[68] string (#xxxxxx)
     */
    rgbToHexString : function(rgb)
    {
      return (
        "#" +
        qx.lang.String.pad(rgb[0].toString(16).toUpperCase(), 2) +
        qx.lang.String.pad(rgb[1].toString(16).toUpperCase(), 2) +
        qx.lang.String.pad(rgb[2].toString(16).toUpperCase(), 2) +
        ( rgb.length === 4 && rgb[3] !== 1
          ? qx.lang.String.pad(
              Math.round(rgb[3]*255).toString(16).toUpperCase(),2
            )
          : ""
        )
      );
    },


    /**
     * Detects if a string is a valid qooxdoo color
     *
     * @param str {String} any string
     * @return {Boolean} true when the incoming value is a valid qooxdoo color
     */
    isValidPropertyValue : function(str) {
      return (
        this.isThemedColor(str) ||
        this.isNamedColor(str) ||
        this.ishexShortString(str) ||
        this.ishexLongString(str) ||
        this.isRgbString(str) ||
        this.isRgbaString(str));
    },


    /**
     * Detects if a string is a valid CSS color string
     *
     * @param str {String} any string
     * @return {Boolean} true when the incoming value is a valid CSS color string
     */
    isCssString : function(str) {
      return (
        this.isSystemColor(str) ||
        this.isNamedColor(str) ||
        this.ishexShortString(str) ||
        this.ishexLongString(str) ||
        this.isRgbString(str) ||
        this.isRgbaString(str));
    },

    /**
     * Detects if a string is a valid hexShort string
     *
     * @param str {String} any string
     * @return {Boolean} true when the incoming value is a valid hexShort string
     */
    ishexShortString : function(str) {
      return this.REGEXP.hexShort.test(str);
    },
    /**
     * Detects if a string is a valid hex3 string
     *
     * @param str {String} any string
     * @return {Boolean} true when the incoming value is a valid hex3 string
     */
    isHex3String : function(str) {
      return this.REGEXP.hex3.test(str);
    },

    /**
     * Detects if a string is a valid hex6 string
     *
     * @param str {String} any string
     * @return {Boolean} true when the incoming value is a valid hex6 string
     */
    isHex6String : function(str) {
      return this.REGEXP.hex6.test(str);
    },

    /**
     * Detects if a string is a valid hex6/8 string
     *
     * @param str {String} any string
     * @return {Boolean} true when the incoming value is a valid hex8 string
     */
    ishexLongString : function(str) {
      return this.REGEXP.hexLong.test(str);
    },

    /**
     * Detects if a string is a valid RGB string
     *
     * @param str {String} any string
     * @return {Boolean} true when the incoming value is a valid RGB string
     */
    isRgbString : function(str) {
      return this.REGEXP.rgb.test(str);
    },


    /**
     * Detects if a string is a valid RGBA string
     *
     * @param str {String} any string
     * @return {Boolean} true when the incoming value is a valid RGBA string
     */
    isRgbaString : function(str) {
      return this.REGEXP.rgba.test(str);
    },


   /**
    * Converts a regexp object match of a rgb string to an RGBA array.
    *
    * @return {Array} an array with red, green, blue
    */
    __rgbStringToRgb : function()
    {
      var red = parseInt(RegExp.$1, 10);
      var green = parseInt(RegExp.$2, 10);
      var blue = parseInt(RegExp.$3, 10);

      return [red, green, blue];
    },

    /**
    * Converts a regexp object match of a rgba string to an RGB array.
    *
    * @return {Array} an array with red, green, blue
    */
    __rgbaStringToRgb : function()
    {
      var red = parseInt(RegExp.$1, 10);
      var green = parseInt(RegExp.$2, 10);
      var blue = parseInt(RegExp.$3, 10);
      var alpha = parseFloat(RegExp.$4, 10);

      if (red === 0 && green === 0 & blue === 0 && alpha === 0) {
        // this is the (pre-alpha) representation of transparency
        // in qooxdoo
        return [-1, -1, -1];
      }

      return alpha == 1 ? [red,green,blue] : [red, green, blue, alpha];
    },



    /**
     * Converts a regexp object match of a hexShort string to an RGB array.
     *
     * @return {Array} an array with red, green, blue
     */
    __hexShortStringToRgb : function()
    {
      var red = parseInt(RegExp.$1, 16) * 17;
      var green = parseInt(RegExp.$2, 16) * 17;
      var blue = parseInt(RegExp.$3, 16) * 17;
      var alpha = Math.round(parseInt(( RegExp.$4 || 'f' ), 16) / 15*1000)/1000;
      return alpha == 1 ? [red,green,blue] : [red, green, blue, alpha];
    },


    /**
     * Converts a regexp object match of a hex3 string to an RGB array.
     *
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
     * Converts a regexp object match of a hexLong string to an RGB array.
     *
     * @return {Array} an array with red, green, blue
     */
    __hexLongStringToRgb : function()
    {
      var red = parseInt(RegExp.$1, 16);
      var green = parseInt(RegExp.$2, 16);
      var blue = parseInt(RegExp.$3, 16);
      var alpha = Math.round(parseInt((RegExp.$4 || 'ff'), 16) / 255 * 1000)/1000;
      return alpha == 1 ? [red,green,blue] : [red, green, blue, alpha];
    },


    /**
     * Converts a hex3 string to an RGB array
     *
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
     * Converts a hex3 (#xxx) string to a hex6 (#xxxxxx) string.
     *
     * @param value {String} a hex3 (#xxx) string
     * @return {String} The hex6 (#xxxxxx) string or the passed value when the
     *   passed value is not an hex3 (#xxx) value.
     */
    hex3StringToHex6String : function(value)
    {
      if (this.isHex3String(value)) {
        return this.rgbToHexString(this.hex3StringToRgb(value));
      }
      return value;
    },


    /**
     * Converts a hex6 string to an RGB array
     *
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
     * @param value {String} a hexShort (#rgb/#rgba) or hexLong (#rrggbb/#rrggbbaa) string
     * @return {Array} an array with red, green, blue and alpha
     */
    hexStringToRgb : function(value)
    {
      if (this.ishexShortString(value)) {
        return this.__hexShortStringToRgb(value);
      }

      if (this.ishexLongString(value)) {
        return this.__hexLongStringToRgb(value);
      }

      throw new Error("Invalid hex value: " + value);
    },


    /**
     * Convert RGB colors to HSB/HSV
     *
     * @param rgb {Number[]} red, blue and green as array
     * @return {Array} an array with hue, saturation and brightness/value
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
     * Convert HSB/HSV colors to RGB
     *
     * @param hsb {Number[]} an array with hue, saturation and brightness/value
     * @return {Integer[]} an array with red, green, blue
     */
    hsbToRgb : function(hsb)
    {
      var i, f, p, r, t;

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
        r = Math.floor(tov * (1.0 - (saturation * f)));
        t = Math.floor(tov * (1.0 - (saturation * (1.0 - f))));

        switch(i)
        {
          case 0:
            rgb.red = tov;
            rgb.green = t;
            rgb.blue = p;
            break;

          case 1:
            rgb.red = r;
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
            rgb.green = r;
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
            rgb.blue = r;
            break;
        }
      }

      return [rgb.red, rgb.green, rgb.blue];
    },

    /**
     * Convert RGB colors to HSL
     *
     * @param rgb {Number[]} red, blue and green as array
     * @return {Array} an array with hue, saturation and lightness
     */
    rgbToHsl: function(rgb){
      var r = rgb[0]/255;
      var g = rgb[1]/255;
      var b = rgb[2]/255;
      // implementation from
      // https://stackoverflow.com/questions/2348597/why-doesnt-this-javascript-rgb-to-hsl-code-work/54071699#54071699
      var a = Math.max(r,g,b);
      var n = a-Math.min(r,g,b);
      var f = (1-Math.abs(a+a-n-1));
      var h = n && ((a==r) ? (g-b)/n : ((a==g) ? 2+(b-r)/n : 4+(r-g)/n));
      return [60*(h<0?h+6:h), 100 * (f ? n/f : 0), 100*(a+a-n)/2];
    },
    /**
     * Convert HSL colors to RGB
     *
     * @param hsl {Number[]} an array with hue, saturation and lightness
     * @return {Integer[]} an array with red, green, blue
     */
    hslToRgb: function(hsl){
      var h = hsl[0];
      var s = hsl[1]/100;
      var l = hsl[2]/100;
      // implementation from
      // https://stackoverflow.com/questions/36721830/convert-hsl-to-rgb-and-hex/54014428#54014428
      var a = s*Math.min(l,1-l);
      var f = function(n){
        var k = (n+h/30)%12;
        return l - a*Math.max(Math.min(k-3,9-k,1),-1);
      };
      return [f(0),f(8),f(4)].map(function(v){ return Math.round(v*2550)/10});
    },
    /**
     * Creates a random color.
     *
     * @return {String} a valid qooxdoo/CSS rgb color string.
     */
    randomColor : function()
    {
      var r = Math.round(Math.random() * 255);
      var g = Math.round(Math.random() * 255);
      var b = Math.round(Math.random() * 255);

      return this.rgbToRgbString([r, g, b]);
    },

    /**
     * Tune a color string according to the tuneMap
     *
     * @param color {String} a valid qooxdoo/CSS rgb color string
     * @param scaleMap {Map}  as described above
     * @param tuner {Function}  function
     * @param hue_tuner {Function}  function
     * @return {String} a valid CSS rgb color string.*
     */
    __tuner: function(color,tuneMap,tuner,hue_tuner){
      var rgba = this.stringToRgb(color);
      for (var key in tuneMap) {
        if (tuneMap[key] == 0) {
            continue;
        }
        switch (key) {
          case 'red':
            rgba[0] = tuner(rgba[0],tuneMap[key],255);
            break;
          case 'green':
            rgba[1] = tuner(rgba[1],tuneMap[key],255);
            break;
          case 'blue':
            rgba[2] = tuner(rgba[2],tuneMap[key],255);
            break;
          case 'alpha':
            rgba[3] = tuner(rgba[3]||1,tuneMap[key],1);
            break;
          case 'hue':
            if (hue_tuner){
              var hsb = this.rgbToHsb(rgba);
              hsb[0] = hue_tuner(hsb[0],tuneMap[key]);
              var rgb = this.hsbToRgb(hsb);
              rgb[3] = rgba[3];
              rgba = rgb;
            }
            else {
              throw new Error("Invalid key in map: " + key);
            }
            break;
          case 'saturation':
            var hsb = this.rgbToHsb(rgba);
            hsb[1] = tuner(hsb[1],tuneMap[key],100);
            rgb = this.hsbToRgb(hsb);
            rgb[3] = rgba[3];
            rgba = rgb;
            break;
          case 'brightness':
            var hsb = this.rgbToHsb(rgba);
            hsb[2] = tuner(hsb[2],tuneMap[key],100);
            rgb = this.hsbToRgb(hsb);
            rgb[3] = rgba[3];
            rgba = rgb;
            break;
          case 'lightness':
            var hsl = this.rgbToHsl(rgba);
            hsl[2] = tuner(hsl[2],tuneMap[key],100);
            rgb = this.hslToRgb(hsl);
            rgb[3] = rgba[3];
            rgba = rgb;
            break;
          default:
            throw new Error("Invalid key in tune map: " + key);
        }
      }
      if (rgba.length === 4){
          if ( rgba[3] === undefined || rgba[3] >= 1){
            rgba.pop();
          }
          else if ( rgba[3] < 0){
            rgba[3] = 0
          }
      }
      [0,1,2].forEach(function(i){
        if (rgba[i] < 0){
          rgba[i] = 0;
          return;
        }
        if (rgba[i] > 255){
          rgba[i] = 255;
          return;
        }
      });
      return this.rgbToRgbString(rgba);
    },
    /**
     * Scale
     *

     * Scale the given properties of the input color according to the
     * configuration given in the `scaleMap`. Each key argument must point to a
     * number between -100% and 100% (inclusive). This indicates how far the
     * corresponding property should be moved from its original position
     * towards the maximum (if the argument is positive) or the minimum (if the
     * argument is negative). This means that, for example, `lightness: "50%"`
     * will make all colors 50% closer to maximum lightness without making them
     * fully white.
     *
     * Supported keys are:
     * `red`, `green`, `blue`, `alpha`, `saturation`,
     * `brightness`, `value`, `lightness`.
     *
     * @param color {String}  a valid qooxdoo/CSS rgb color string
     * @param scaleMap {Map}  as described above
     * @return {String} a valid CSS rgb color string.
     */
    scale: function(color,scaleMap){
      return this.__tuner(color,scaleMap,function(value,scale,max) {
        if (value > max){
          value = max;
        }
        if (scale > 0){
          if (scale > 100){
            scale = 100;
          }
          return value + (max - value) * scale / 100;
        }
        // scale < 0
        if (scale < -100){
          scale = -100;
        }
        return value + value * scale / 100;
      });
    },
    /**
     * Adjust
     *
     * Increases or decreases one or more properties of the input color
     * by fixed amounts according to the configuration given in the
     * `adjustMap`. The value of the corresponding key is added to the
     * original value and the final result is adjusted to stay within legal
     * bounds. Hue values can go full circle.a1
     *
     * Supported keys are:
     * `red`, `green`, `blue`, `alpha`, `hue`, `saturation`, `brightness`,
     * `lightness`
     *
     * @param color {String} a valid qooxdoo/CSS rgb color string
     * @param scaleMap {Map} as described above
     * @return {String} a valid CSS rgb color string.
     */
    adjust: function(color,adjustMap){
      return this.__tuner(color,adjustMap, function(value,offset,max) {
        value += offset;
        if (value > max){
          return max;
        }
        if (value < 0){
          return 0;
        }
        return value;
      },
      function(value,offset) {
        value += offset;
        while (value >= 360){
          value -= 360;
        }
        while (value < 0){
          value += 360;
        }
        return value;
      });
    },
    /**
     * RgbToLuminance
     *
     * Calculate the [luminance](https://www.w3.org/TR/WCAG20-TECHS/G17.html#G17-tests) of the given rgb color.
     *
     * @param color {String} a valid qooxdoo/CSS rgb color string
     * @return {Number} luminance
     */
    luminance: function(color){
      var rgb = this.stringToRgb(color);
      var lum = function(i) {
        var c = rgb[i] / 255;
        return c < 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      }
      return .2126 * lum(0) + .7152 * lum(1) + .0722 * lum(2);
    },
    /**
     * contrast
     *
     * Calculate the contrast of two given rgb colors.
     *
     * @param back {String} a valid qooxdoo/CSS rgb color string
     * @param front {String} a valid qooxdoo/CSS rgb color string
     * @return {Number} contrast
     */
    contrast: function(back,front){
        var bl = this.luminance(back) + .05;
        var fl = this.luminance(front) + 0.5;
        return Math.max(bl,fl) / Math.min(bl,fl);
    }
  }
});
