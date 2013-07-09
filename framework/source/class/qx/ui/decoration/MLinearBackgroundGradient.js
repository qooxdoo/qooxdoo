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
      check : "Color",
      nullable : true,
      apply : "_applyLinearBackgroundGradient"
    },

    /**
     * End color of the background gradient.
     * Note that alpha transparency (rgba) is not supported in IE 8.
     */
    endColor :
    {
      check : "Color",
      nullable : true,
      apply : "_applyLinearBackgroundGradient"
    },

    /** The orientation of the gradient. */
    orientation :
    {
      check : ["horizontal", "vertical"],
      init : "vertical",
      apply : "_applyLinearBackgroundGradient"
    },

    /** Position in percent where to start the color. */
    startColorPosition :
    {
      check : "Number",
      init : 0,
      apply : "_applyLinearBackgroundGradient"
    },

    /** Position in percent where to start the color. */
    endColorPosition :
    {
      check : "Number",
      init : 100,
      apply : "_applyLinearBackgroundGradient"
    },

    /** Defines if the given positions are in % or px.*/
    colorPositionUnit :
    {
      check : ["px", "%"],
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
    __canvas : null,


    /**
     * Takes a styles map and adds the linear background styles in place to the
     * given map. This is the needed behavior for
     * {@link qx.ui.decoration.Decorator}.
     *
     * @param styles {Map} A map to add the styles.
     */
    _styleLinearBackgroundGradient : function(styles) {
      var colors = this.__getColors();
      var startColor = colors.start;
      var endColor = colors.end;
      var value;

      if (!startColor || !endColor) {
        return;
      }

      var unit = this.getColorPositionUnit();

      // new implementation for webkit is available since chrome 10 --> version
      if (qx.core.Environment.get("css.gradient.legacywebkit")) {
        // webkit uses px values if non are given
        unit = unit === "px" ? "" : unit;

        if (this.getOrientation() == "horizontal") {
          var startPos = this.getStartColorPosition() + unit +" 0" + unit;
          var endPos = this.getEndColorPosition() + unit + " 0" + unit;
        } else {
          var startPos = "0" + unit + " " + this.getStartColorPosition() + unit;
          var endPos = "0" + unit +" " + this.getEndColorPosition() + unit;
        }

        var color =
          "from(" + startColor +
          "),to(" + endColor + ")";

        value = "-webkit-gradient(linear," + startPos + "," + endPos + "," + color + ")";
        styles["background"] = value;

      // IE9 canvas solution
      } else if (qx.core.Environment.get("css.gradient.filter") &&
        !qx.core.Environment.get("css.gradient.linear") && qx.core.Environment.get("css.borderradius")) {

          if (!this.__canvas) {
            this.__canvas = document.createElement("canvas");
          }

          var isVertical = this.getOrientation() == "vertical";

          var colors = this.__getColors();
          var height = isVertical ? 200 : 1;
          var width = isVertical ? 1 : 200;

          this.__canvas.width = width;
          this.__canvas.height = height;
          var ctx = this.__canvas.getContext('2d');

          if (isVertical) {
            var lingrad = ctx.createLinearGradient(0, 0, 0, height);
          } else {
            var lingrad = ctx.createLinearGradient(0, 0, width, 0);
          }

          lingrad.addColorStop(this.getStartColorPosition() / 100, colors.start);
          lingrad.addColorStop(this.getEndColorPosition() / 100, colors.end);

          ctx.fillStyle = lingrad;
          ctx.fillRect(0, 0, width, height);

          var value = "url(" + this.__canvas.toDataURL() + ")";
          styles["background-image"] = value;
          styles["background-size"] = "100% 100%";

      // old IE filter fallback
      } else if (qx.core.Environment.get("css.gradient.filter") &&
        !qx.core.Environment.get("css.gradient.linear"))
      {
        var colors = this.__getColors();
        var type = this.getOrientation() == "horizontal" ? 1 : 0;

        var startColor = colors.start;
        var endColor = colors.end;

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

        value = "progid:DXImageTransform.Microsoft.Gradient" +
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

      // spec like syntax
      } else {
        // WebKit, Opera and Gecko interpret 0deg as "to right"
        var deg = this.getOrientation() == "horizontal" ? 0 : 270;

        var start = startColor + " " + this.getStartColorPosition() + unit;
        var end = endColor + " " + this.getEndColorPosition() + unit;

        var prefixedName = qx.core.Environment.get("css.gradient.linear");
        // Browsers supporting the unprefixed implementation interpret 0deg as
        // "to top" as defined by the spec [BUG #6513]
        if (prefixedName === "linear-gradient") {
          deg = this.getOrientation() == "horizontal" ? deg + 90 : deg - 90;
        }

        value = prefixedName + "(" + deg + "deg, " + start + "," + end + ")";
        if (styles["background-image"]) {
          styles["background-image"] += ", " + value;
        }
        else {
          styles["background-image"] = value;
        }
      }
    },


    /**
     * Helper to get start and end color.
     * @return {Map} A map containing start and end color.
     */
    __getColors : function() {
      if (qx.core.Environment.get("qx.theme"))
      {
        var Color = qx.theme.manager.Color.getInstance();
        var startColor = Color.resolve(this.getStartColor());
        var endColor = Color.resolve(this.getEndColor());
      }
      else
      {
        var startColor = this.getStartColor();
        var endColor = this.getEndColor();
      }
      return {start: startColor, end: endColor};
    },


    /**
     * Helper for IE which applies the filter used for the gradient to a separate
     * DIV element which will be put into the decorator. This is necessary in case
     * the decorator has rounded corners.
     * @return {String} The HTML for the inner gradient DIV.
     */
    _getContent : function() {
      // IE filter syntax
      // http://msdn.microsoft.com/en-us/library/ms532997(v=vs.85).aspx
      // It needs to be wrapped in a separate div bug #6318
      if (qx.core.Environment.get("css.gradient.filter") &&
        !qx.core.Environment.get("css.gradient.linear")) {

        var colors = this.__getColors();
        var type = this.getOrientation() == "horizontal" ? 1 : 0;

        // convert all hex3 to hex6
        var startColor = qx.util.ColorUtil.hex3StringToHex6String(colors.start);
        var endColor = qx.util.ColorUtil.hex3StringToHex6String(colors.end);

        // get rid of the starting '#'
        startColor = startColor.substring(1, startColor.length);
        endColor = endColor.substring(1, endColor.length);

        // filter gradients block the box shadow implementation ->
        // we need to set them explicitly [BUG #6761]
        var shadow = "";
        if (this.classname.indexOf("MBoxShadow") != -1) {
          var styles = {};
          this._styleBoxShadow(styles);
          shadow = "<div style='width: 100%; height: 100%; position: absolute;" +
            qx.bom.element.Style.compile(styles) +
            "'></div>";
        }

        return "<div style=\"position: absolute; width: 100%; height: 100%; " +
          "filter:progid:DXImageTransform.Microsoft.Gradient" +
          "(GradientType=" + type + ", " +
          "StartColorStr='#FF" + startColor + "', " +
          "EndColorStr='#FF" + endColor + "';)\">" + shadow + "</div>";
      }
      return "";
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
