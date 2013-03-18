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
 * Border implementation with two CSS borders. Both borders can be styled
 * independent of each other.
 * This mixin is usually used by {@link qx.ui.decoration.Decorator}.
 */
qx.Mixin.define("qx.ui.decoration.MDoubleBorder",
{
  include : [qx.ui.decoration.MSingleBorder, qx.ui.decoration.MBackgroundImage],

  construct : function() {
    // override the methods of single border and background image
    this._getDefaultInsetsForBorder = this.__getDefaultInsetsForDoubleBorder;
    this._styleBorder = this.__styleDoubleBorder;
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /*
    ---------------------------------------------------------------------------
      PROPERTY: INNER WIDTH
    ---------------------------------------------------------------------------
    */

    /** top width of border */
    innerWidthTop :
    {
      check : "Number",
      init : 0,
      apply : "_applyDoubleBorder"
    },

    /** right width of border */
    innerWidthRight :
    {
      check : "Number",
      init : 0,
      apply : "_applyDoubleBorder"
    },

    /** bottom width of border */
    innerWidthBottom :
    {
      check : "Number",
      init : 0,
      apply : "_applyDoubleBorder"
    },

    /** left width of border */
    innerWidthLeft :
    {
      check : "Number",
      init : 0,
      apply : "_applyDoubleBorder"
    },

    /** Property group to set the inner border width of all sides */
    innerWidth :
    {
      group : [ "innerWidthTop", "innerWidthRight", "innerWidthBottom", "innerWidthLeft" ],
      mode : "shorthand"
    },




    /*
    ---------------------------------------------------------------------------
      PROPERTY: INNER COLOR
    ---------------------------------------------------------------------------
    */

    /** top inner color of border */
    innerColorTop :
    {
      nullable : true,
      check : "Color",
      apply : "_applyDoubleBorder"
    },

    /** right inner color of border */
    innerColorRight :
    {
      nullable : true,
      check : "Color",
      apply : "_applyDoubleBorder"
    },

    /** bottom inner color of border */
    innerColorBottom :
    {
      nullable : true,
      check : "Color",
      apply : "_applyDoubleBorder"
    },

    /** left inner color of border */
    innerColorLeft :
    {
      nullable : true,
      check : "Color",
      apply : "_applyDoubleBorder"
    },

    /**
     * Property group for the inner color properties.
     */
    innerColor :
    {
      group : [ "innerColorTop", "innerColorRight", "innerColorBottom", "innerColorLeft" ],
      mode : "shorthand"
    },

    /**
     * The opacity of the inner border.
     */
    innerOpacity :
    {
      check : "Number",
      init : 1,
      apply : "_applyDoubleBorder"
    }
  },


  members :
  {

    /**
     * Takes a styles map and adds the outer border styles in place
     * to the given map. This is the needed behavior for
     * {@link qx.ui.decoration.Decorator}.
     *
     * @param styles {Map} A map to add the styles.
     */
    __styleDoubleBorder : function(styles)
    {
      var color,
          innerColor,
          innerWidth;
      if (qx.core.Environment.get("qx.theme"))
      {
        var Color = qx.theme.manager.Color.getInstance();

        color = {
          top : Color.resolve(this.getColorTop()),
          right : Color.resolve(this.getColorRight()),
          bottom : Color.resolve(this.getColorBottom()),
          left : Color.resolve(this.getColorLeft())
        };

        innerColor = {
          top : Color.resolve(this.getInnerColorTop()),
          right : Color.resolve(this.getInnerColorRight()),
          bottom : Color.resolve(this.getInnerColorBottom()),
          left : Color.resolve(this.getInnerColorLeft())
        };
      }
      else
      {
        color = {
          top : this.getColorTop(),
          right : this.getColorRight(),
          bottom : this.getColorBottom(),
          left : this.getColorLeft()
        };

        innerColor = {
          top : this.getInnerColorTop(),
          right : this.getInnerColorRight(),
          bottom : this.getInnerColorBottom(),
          left : this.getInnerColorLeft()
        };
      }

      innerWidth = {
        top : this.getInnerWidthTop(),
        right : this.getInnerWidthRight(),
        bottom : this.getInnerWidthBottom(),
        left : this.getInnerWidthLeft()
      };

      // Add outer borders
      var width = this.getWidthTop();
      if (width > 0) {
        styles["border-top"] = width + "px " + this.getStyleTop() + " " + color.top;
      }

      width = this.getWidthRight();
      if (width > 0) {
        styles["border-right"] = width + "px " + this.getStyleRight() + " " + color.right;
      }

      width = this.getWidthBottom();
      if (width > 0) {
        styles["border-bottom"] = width + "px " + this.getStyleBottom() + " " + color.bottom;
      }

      width = this.getWidthLeft();
      if (width > 0) {
        styles["border-left"] = width + "px " + this.getStyleLeft() + " " + color.left;
      }

      var innerOpacity = this.getInnerOpacity();

      if (innerOpacity < 1) {
        this.__processInnerOpacity(innerColor, innerOpacity);
      }

      // Add inner borders
      var shadowStyle = [];

      if (innerColor.top && innerWidth.top &&
          innerColor.top == innerColor.bottom &&
          innerColor.top == innerColor.right &&
          innerColor.top == innerColor.left &&
          innerWidth.top == innerWidth.bottom &&
          innerWidth.top == innerWidth.right &&
          innerWidth.top == innerWidth.left)
      {
        shadowStyle.push("inset 0 0 0 " + innerWidth.top + "px " + innerColor.top);
      }
      else {
        if (innerColor.top) {
          shadowStyle.push("inset 0 " + (innerWidth.top || 0) + "px " + innerColor.top);
        }
        if (innerColor.right) {
          shadowStyle.push("inset -" + (innerWidth.right || 0) + "px 0 " + innerColor.right);
        }
        if (innerColor.bottom) {
          shadowStyle.push("inset 0 -" + (innerWidth.bottom || 0) + "px " + innerColor.bottom);
        }
        if (innerColor.left) {
          shadowStyle.push("inset " + (innerWidth.left || 0) + "px 0 " + innerColor.left);
        }
      }

      // apply or append the box shadow styles
      if (shadowStyle.length > 0) {
        if (!styles["box-shadow"]) {
          styles["box-shadow"] = shadowStyle.join(",");
        } else {
          styles["box-shadow"] += "," + shadowStyle.join(",");
        }
      }

      // Do not set the line-height on IE6, IE7, IE8 in Quirks Mode and IE8 in IE7 Standard Mode
      // See http://bugzilla.qooxdoo.org/show_bug.cgi?id=3450 for details
      if (
        (qx.core.Environment.get("engine.name") == "mshtml" &&
         parseFloat(qx.core.Environment.get("engine.version")) < 8) ||
        (qx.core.Environment.get("engine.name") == "mshtml" &&
         qx.core.Environment.get("browser.documentmode") < 8)
      ) {
        styles["line-height"] = '';
      }
    },


    /**
     * Converts the inner border's colors to rgba.
     *
     * @param innerColor {Map} map of top, right, bottom and left colors
     * @param innerOpacity {Number} alpha value
     */
    __processInnerOpacity : function(innerColor, innerOpacity)
    {
      if (!qx.core.Environment.get("css.rgba")) {
          if (qx.core.Environment.get("qx.debug")) {
          qx.log.Logger.warn("innerOpacity is configured but the browser doesn't support RGBA colors.");
        }
        return;
      }

      for (var edge in innerColor) {
        var rgb = qx.util.ColorUtil.stringToRgb(innerColor[edge]);
        rgb.push(innerOpacity);
        var rgbString = qx.util.ColorUtil.rgbToRgbString(rgb);
        innerColor[edge] = rgbString;
      }
    },


    _applyDoubleBorder : function()
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        if (this._isInitialized()) {
          throw new Error("This decorator is already in-use. Modification is not possible anymore!");
        }
      }
    },


   /**
    * Implementation of the interface for the double border.
    *
    * @return {Map} A map containing the default insets.
    *   (top, right, bottom, left)
    */
    __getDefaultInsetsForDoubleBorder : function()
    {
      return {
        top : this.getWidthTop() + this.getInnerWidthTop(),
        right : this.getWidthRight() + this.getInnerWidthRight(),
        bottom : this.getWidthBottom() + this.getInnerWidthBottom(),
        left : this.getWidthLeft() + this.getInnerWidthLeft()
      };
    }
  }
});
