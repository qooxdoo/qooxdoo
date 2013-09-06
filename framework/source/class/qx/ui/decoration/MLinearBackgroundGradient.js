/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * Mixin for the linear background gradient CSS property.
 * This mixin is usually used by {@link qx.ui.decoration.Decorator}.
 *
 * Keep in mind that this is not supported by all browsers:
 *
 * * Safari 4.0+
 * * Chrome 4.0+
 * * Firefox 3.6+
 * * Opera 11.1+
 * * IE 10+
 * * IE 5.5+ (with limitations)
 *
 * For IE 5.5 to IE 8,this class uses the filter rules to create the gradient. This
 * has some limitations: The start and end position property can not be used. For
 * more details, see the original documentation:
 * http://msdn.microsoft.com/en-us/library/ms532997(v=vs.85).aspx
 *
 * For IE9, we create a gradient in a canvas element and render this gradient
 * as background image.
 */
qx.Mixin.define("qx.ui.decoration.MLinearBackgroundGradient",
{
  properties :
  {
    /**
     * Start color of the background gradient.
     * Note that alpha transparency (rgba) is not supported in IE 8.
     */
    startColor :
    {
      nullable : true,
      apply : "_applyLinearBackgroundGradient"
    },

    /**
     * End color of the background gradient.
     * Note that alpha transparency (rgba) is not supported in IE 8.
     */
    endColor :
    {
      nullable : true,
      apply : "_applyLinearBackgroundGradient"
    },

    /** The orientation of the gradient. */
    orientation :
    {
      init : "vertical",
      apply : "_applyLinearBackgroundGradient"
    },

    /** Position in percent where to start the color. */
    startColorPosition :
    {
      init : 0,
      apply : "_applyLinearBackgroundGradient"
    },

    /** Position in percent where to start the color. */
    endColorPosition :
    {
      init : 100,
      apply : "_applyLinearBackgroundGradient"
    },

    /** Defines if the given positions are in % or px.*/
    colorPositionUnit :
    {
      init : "%",
      apply : "_applyLinearBackgroundGradient"
    },


    /** Property group to set the start color including its start position. */
    gradientStart :
    {
      group : ["startColor", "startColorPosition"],
      mode : "shorthand"
    },

    /** Property group to set the end color including its end position. */
    gradientEnd :
    {
      group : ["endColor", "endColorPosition"],
      mode : "shorthand"
    }
  },


  members :
  {
    __colorResolver: null,

    /**
     * Takes a styles map and adds the linear background styles in place to the
     * given map. This is the needed behavior for
     * {@link qx.ui.decoration.Decorator}.
     *
     * @param styles {Map} A map to add the styles.
     */
    _styleLinearBackgroundGradient : function(styles) {
      var backgroundStyle = [];

      var startColors = this.getStartColor();
      if(!startColors) { return; }
      if(!qx.lang.Type.isArray(startColors)) startColors = [startColors];
      var endColors = this.getEndColor();
      if(!endColors) { return; }
      if(!qx.lang.Type.isArray(endColors)) endColors = [endColors];
      var units = this.getColorPositionUnit();
      if(!qx.lang.Type.isArray(units)) units = [units];
      var orientations = this.getOrientation();
      if(!qx.lang.Type.isArray(orientations)) orientations = [orientations];
      var startColorPositions = this.getStartColorPosition();
      if(!qx.lang.Type.isArray(startColorPositions)) startColorPositions = [startColorPositions];
      var endColorPositions = this.getEndColorPosition();
      if(!qx.lang.Type.isArray(endColorPositions)) endColorPositions = [endColorPositions];

      var items = Math.max(startColors.length, endColors.length, units.length, orientations.length);
      qx.lang.Array.prolong(startColors, items);
      qx.lang.Array.prolong(endColors, items);
      qx.lang.Array.prolong(units, items);
      qx.lang.Array.prolong(orientations, items);
      qx.lang.Array.prolong(startColorPositions, items);
      qx.lang.Array.prolong(endColorPositions, items);
            
      var styleImpl = this.__styleLinearBackgroundGradientAccordingToSpec;

      if (qx.core.Environment.get("css.gradient.legacywebkit")) {
        styleImpl = this.__styleLinearBackgroundGradientForLegacyWebkit;
      } else if (qx.core.Environment.get("css.gradient.filter") &&
        !qx.core.Environment.get("css.gradient.linear") && qx.core.Environment.get("css.borderradius")) {
        styleImpl = this.__styleLinearBackgroundGradientWithMSFilter;
      } else if (qx.core.Environment.get("css.gradient.filter") &&
        !qx.core.Environment.get("css.gradient.linear")) {
        styleImpl = this.__styleLinearBackgroundGradientWithMSFilter;
      }
      
      for(var i=0;i<items;i++) {
        var startColor = this.__getColor(startColors[i]);
        var endColor = this.__getColor(endColors[i]);
        var unit = units[i];
        var orientation = orientations[i];
        var startColorPosition = startColorPositions[i];
        var endColorPosition = endColorPositions[i];
        
        if(!styleImpl(startColor, endColor, unit, orientation, startColorPosition, endColorPosition, styles, backgroundStyle)) {
          break;
        }
      }
      
      if("background" in styles) {
        if(!qx.lang.Type.isArray(styles['background'])) {
          styles['background'] = [styles['background']];
        }
      } else {
        styles['background'] = [];
      }
      var orderGradientsFront = 'getOrderGradientsFront' in this ? this.getOrderGradientsFront() : false;
      var operation = orderGradientsFront ? Array.prototype.unshift : Array.prototype.push;
      operation.apply(styles['background'], backgroundStyle);
    },
    
    // new implementation for webkit is available since chrome 10 --> version
    __styleLinearBackgroundGradientForLegacyWebkit: function me(startColor, endColor, unit, orientation, startColorPosition, endColorPosition, styles, backgroundStyle) {
      // webkit uses px values if non are given
      unit = unit === "px" ? "" : unit;

      if (orientation == "horizontal") {
        var startPos = startColorPosition + unit +" 0" + unit;
        var endPos = endColorPosition + unit + " 0" + unit;
      } else {
        var startPos = "0" + unit + " " + startColorPosition + unit;
        var endPos = "0" + unit +" " + endColorPosition + unit;
      }

      var color =
        "from(" + startColor +
        "),to(" + endColor + ")";

      backgroundStyle.push("-webkit-gradient(linear," + startPos + "," + endPos + "," + color + ")");
      return true;
    },

    // IE9 canvas solution
    __styleLinearBackgroundGradientWithCanvas: function me(startColor, endColor, unit, orientation, startColorPosition, endColorPosition, styles, backgroundStyle) {
      if (!me.__canvas) {
        me.__canvas = document.createElement("canvas");
      }

      var isVertical = orientation == "vertical";

      var height = isVertical ? 200 : 1;
      var width = isVertical ? 1 : 200;

      me.__canvas.width = width;
      me.__canvas.height = height;
      var ctx = me.__canvas.getContext('2d');

      if (isVertical) {
        var lingrad = ctx.createLinearGradient(0, 0, 0, height);
      } else {
        var lingrad = ctx.createLinearGradient(0, 0, width, 0);
      }

      lingrad.addColorStop(startColorPosition / 100, startColor);
      lingrad.addColorStop(endColorPosition / 100, endColor);

      //Clear the rect before drawing to allow for semitransparent colors
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = lingrad;
      ctx.fillRect(0, 0, width, height);

      backgroundStyle.push("url(" + me.__canvas.toDataURL() + ") 100% 100%");
      return true;
    },
    
      // old IE filter fallback
    __styleLinearBackgroundGradientWithMSFilter: function(startColor, endColor, unit, orientation, startColorPosition, endColorPosition, styles, backgroundStyle) {
      var type = orientation == "horizontal" ? 1 : 0;

      // convert rgb, hex3 and named colors to hex6
      if (!qx.util.ColorUtil.isHex6String(startColor)) {
        startColor = qx.util.ColorUtil.stringToRgb(startColor);
        startColor = qx.util.ColorUtil.rgbToHexString(startColor);
      }
      if (!qx.util.ColorUtil.isHex6String(endColor)) {
        endColor = qx.util.ColorUtil.stringToRgb(endColor);
        endColor = qx.util.ColorUtil.rgbToHexString(endColor);
      }

      // get rid of the starting '#'
      startColor = startColor.substring(1, startColor.length);
      endColor = endColor.substring(1, endColor.length);

      var value = "progid:DXImageTransform.Microsoft.Gradient" +
        "(GradientType=" + type + ", " +
        "StartColorStr='#FF" + startColor + "', " +
        "EndColorStr='#FF" + endColor + "';)";
      if (styles["filter"]) {
        styles["filter"] += ", " + value;
      } else {
        styles["filter"] = value;
      }

      // Elements with transparent backgrounds will not receive receive mouse
      // events if a Gradient filter is set.
      if (!styles["background-color"] ||
          styles["background-color"] == "transparent")
      {
        // We don't support alpha transparency for the gradient color stops
        // so it doesn't matter which color we set here.
        styles["background-color"] = "white";
      }
      return false;
    },
    
    // spec-compliant syntax
    __styleLinearBackgroundGradientAccordingToSpec: function(startColor, endColor, unit, orientation, startColorPosition, endColorPosition, styles, backgroundStyle) {
      // WebKit, Opera and Gecko interpret 0deg as "to right"
      var deg = orientation == "horizontal" ? 0 : 270;

      var start = startColor + " " + startColorPosition + unit;
      var end = endColor + " " + endColorPosition + unit;

      var prefixedName = qx.core.Environment.get("css.gradient.linear");
      // Browsers supporting the unprefixed implementation interpret 0deg as
      // "to top" as defined by the spec [BUG #6513]
      if (prefixedName === "linear-gradient") {
        deg = orientation == "horizontal" ? deg + 90 : deg - 90;
      }

      backgroundStyle.push(prefixedName + "(" + deg + "deg, " + start + "," + end + ")");
      return true;
    },
    
    /**
     * Helper to get a resolved color from a name
     * @return {String} The resolved color
     */
    __getColor : function(color) {
      if(this.colorResolver === null) {
        if(qx.core.Environment.get("qx.theme")) {
          this.colorResolver = qx.theme.manager.Color.getInstance();
        } else {
          this.colorResolver = false;
        }
      }
      return this.colorResolver ? this.colorResolver.resolve(color) : color;
    },

    // property apply
    _applyLinearBackgroundGradient : function()
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        if (this._isInitialized()) {
          throw new Error("This decorator is already in-use. Modification is not possible anymore!");
        }
      }
    }
  }
});
