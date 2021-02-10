/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
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
      var propName = qx.core.Environment.get("css.boxshadow");

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


      // inner border
      if (
        innerWidth.top > 0 ||
        innerWidth.right > 0 ||
        innerWidth.bottom > 0 ||
        innerWidth.left > 0
      ) {

        var borderTop = (innerWidth.top || 0) + "px solid " + innerColor.top;
        var borderRight = (innerWidth.right || 0) + "px solid " + innerColor.right;
        var borderBottom = (innerWidth.bottom || 0) + "px solid " + innerColor.bottom;
        var borderLeft = (innerWidth.left || 0) + "px solid " + innerColor.left;

        styles[":before"] = {
          "width" : "100%",
          "height" : "100%",
          "position" : "absolute",
          "content" : '""',
          "border-top" : borderTop,
          "border-right" : borderRight,
          "border-bottom" : borderBottom,
          "border-left" : borderLeft,
          "left": 0,
          "top" : 0
        };
        var boxSizingKey = qx.bom.Style.getCssName(qx.core.Environment.get("css.boxsizing"));
        styles[":before"][boxSizingKey] = "border-box";

        // make sure to apply the border radius as well
        var borderRadiusKey = qx.core.Environment.get("css.borderradius");
        if (borderRadiusKey) {
          borderRadiusKey = qx.bom.Style.getCssName(borderRadiusKey);
          styles[":before"][borderRadiusKey] = "inherit";
        }

        // Add inner borders as shadows
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
        if (shadowStyle.length > 0 && propName) {
          propName = qx.bom.Style.getCssName(propName);
          if (!styles[propName]) {
            styles[propName] = shadowStyle.join(",");
          } else {
            styles[propName] += "," + shadowStyle.join(",");
          }
        }
      } else {
        styles[":before"] = {
          border: 0
        };
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
