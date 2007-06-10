// Adopted from Mochikit.Color
qx.Class.define("qx.html2.Color",
{
  statics :
  {
    /**
     * TODOC
     *
     * @type static
     * @return {var} TODOC
     */
    isLight : function() {
      return this.asHSL().b > 0.5;
    },


    /**
     * TODOC
     *
     * @type static
     * @return {var} TODOC
     */
    isDark : function() {
      return (!this.isLight());
    },


    /**
     * TODOC
     *
     * @type static
     * @return {var} TODOC
     */
    toHSLString : function()
    {
      var c = this.asHSL();
      var ccc = MochiKit.Color.clampColorComponent;
      var rval = this._hslString;

      if (!rval)
      {
        var mid = (ccc(c.h, 360).toFixed(0) + "," + ccc(c.s, 100).toPrecision(4) + "%" + "," + ccc(c.l, 100).toPrecision(4) + "%");
        var a = c.a;

        if (a >= 1)
        {
          a = 1;
          rval = "hsl(" + mid + ")";
        }
        else
        {
          if (a <= 0) {
            a = 0;
          }

          rval = "hsla(" + mid + "," + a + ")";
        }

        this._hslString = rval;
      }

      return rval;
    },


    /**
     * TODOC
     *
     * @type static
     * @return {var} TODOC
     */
    toRGBString : function()
    {
      var c = this.rgb;
      var ccc = MochiKit.Color.clampColorComponent;
      var rval = this._rgbString;

      if (!rval)
      {
        var mid = (ccc(c.r, 255).toFixed(0) + "," + ccc(c.g, 255).toFixed(0) + "," + ccc(c.b, 255).toFixed(0));

        if (c.a != 1) {
          rval = "rgba(" + mid + "," + c.a + ")";
        } else {
          rval = "rgb(" + mid + ")";
        }

        this._rgbString = rval;
      }

      return rval;
    },


    /**
     * TODOC
     *
     * @type static
     * @param hexCode {var} TODOC
     * @return {var} TODOC
     */
    fromHexString : function(hexCode)
    {
      if (hexCode.charAt(0) == '#') {
        hexCode = hexCode.substring(1);
      }

      var components = [];
      var i, hex;

      if (hexCode.length == 3)
      {
        for (i=0; i<3; i++)
        {
          hex = hexCode.substr(i, 1);
          components.push(parseInt(hex + hex, 16) / 255.0);
        }
      }
      else
      {
        for (i=0; i<6; i+=2)
        {
          hex = hexCode.substr(i, 2);
          components.push(parseInt(hex, 16) / 255.0);
        }
      }

      var Color = MochiKit.Color.Color;
      return Color.fromRGB.apply(Color, components);
    },


    /**
     * TODOC
     *
     * @type static
     * @param hue {var} TODOC
     * @param saturation {var} TODOC
     * @param value {var} TODOC
     * @param alpha {var} TODOC
     * @return {Map} TODOC
     */
    hsvToRGB : function(hue, saturation, value, alpha)
    {
      if (arguments.length == 1)
      {
        var hsv = hue;
        hue = hsv.h;
        saturation = hsv.s;
        value = hsv.v;
        alpha = hsv.a;
      }

      var red;
      var green;
      var blue;

      if (saturation === 0)
      {
        red = value;
        green = value;
        blue = value;
      }
      else
      {
        var i = Math.floor(hue * 6);
        var f = (hue * 6) - i;
        var p = value * (1 - saturation);
        var q = value * (1 - (saturation * f));
        var t = value * (1 - (saturation * (1 - f)));

        switch(i)
        {
          case 1:
            red = q;
            green = value;
            blue = p;
            break;

          case 2:
            red = p;
            green = value;
            blue = t;
            break;

          case 3:
            red = p;
            green = q;
            blue = value;
            break;

          case 4:
            red = t;
            green = p;
            blue = value;
            break;

          case 5:
            red = value;
            green = p;
            blue = q;
            break;

          case 6:  // fall through
          case 0:
            red = value;
            green = t;
            blue = p;
            break;
        }
      }

      return {
        r : red,
        g : green,
        b : blue,
        a : alpha
      };
    },


    /**
     * TODOC
     *
     * @type static
     * @param hue {var} TODOC
     * @param saturation {var} TODOC
     * @param lightness {var} TODOC
     * @param alpha {var} TODOC
     * @return {Map} TODOC
     */
    hslToRGB : function(hue, saturation, lightness, alpha)
    {
      if (arguments.length == 1)
      {
        var hsl = hue;
        hue = hsl.h;
        saturation = hsl.s;
        lightness = hsl.l;
        alpha = hsl.a;
      }

      var red;
      var green;
      var blue;

      if (saturation === 0)
      {
        red = lightness;
        green = lightness;
        blue = lightness;
      }
      else
      {
        var m2;

        if (lightness <= 0.5) {
          m2 = lightness * (1.0 + saturation);
        } else {
          m2 = lightness + saturation - (lightness * saturation);
        }

        var m1 = (2.0 * lightness) - m2;
        var f = MochiKit.Color._hslValue;
        var h6 = hue * 6.0;
        red = f(m1, m2, h6 + 2);
        green = f(m1, m2, h6);
        blue = f(m1, m2, h6 - 2);
      }

      return {
        r : red,
        g : green,
        b : blue,
        a : alpha
      };
    },


    /**
     * TODOC
     *
     * @type static
     * @param red {var} TODOC
     * @param green {var} TODOC
     * @param blue {var} TODOC
     * @param alpha {var} TODOC
     * @return {Map} TODOC
     */
    rgbToHSV : function(red, green, blue, alpha)
    {
      if (arguments.length == 1)
      {
        var rgb = red;
        red = rgb.r;
        green = rgb.g;
        blue = rgb.b;
        alpha = rgb.a;
      }

      var max = Math.max(Math.max(red, green), blue);
      var min = Math.min(Math.min(red, green), blue);
      var hue;
      var saturation;
      var value = max;

      if (min == max)
      {
        hue = 0;
        saturation = 0;
      }
      else
      {
        var delta = (max - min);
        saturation = delta / max;

        if (red == max) {
          hue = (green - blue) / delta;
        } else if (green == max) {
          hue = 2 + ((blue - red) / delta);
        } else {
          hue = 4 + ((red - green) / delta);
        }

        hue /= 6;

        if (hue < 0) {
          hue += 1;
        }

        if (hue > 1) {
          hue -= 1;
        }
      }

      return {
        h : hue,
        s : saturation,
        v : value,
        a : alpha
      };
    },


    /**
     * TODOC
     *
     * @type static
     * @param red {var} TODOC
     * @param green {var} TODOC
     * @param blue {var} TODOC
     * @param alpha {var} TODOC
     * @return {Map} TODOC
     */
    rgbToHSL : function(red, green, blue, alpha)
    {
      if (arguments.length == 1)
      {
        var rgb = red;
        red = rgb.r;
        green = rgb.g;
        blue = rgb.b;
        alpha = rgb.a;
      }

      var max = Math.max(red, Math.max(green, blue));
      var min = Math.min(red, Math.min(green, blue));
      var hue;
      var saturation;
      var lightness = (max + min) / 2.0;
      var delta = max - min;

      if (delta === 0)
      {
        hue = 0;
        saturation = 0;
      }
      else
      {
        if (lightness <= 0.5) {
          saturation = delta / (max + min);
        } else {
          saturation = delta / (2 - max - min);
        }

        if (red == max) {
          hue = (green - blue) / delta;
        } else if (green == max) {
          hue = 2 + ((blue - red) / delta);
        } else {
          hue = 4 + ((red - green) / delta);
        }

        hue /= 6;

        if (hue < 0) {
          hue += 1;
        }

        if (hue > 1) {
          hue -= 1;
        }
      }

      return {
        h : hue,
        s : saturation,
        l : lightness,
        a : alpha
      };
    }
  }
});
