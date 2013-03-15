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
    this._resizeBorder = this.__resizeDoubleBorder;
    this._styleBorder = this.__styleDoubleBorder;
    this._generateMarkup = this.__generateMarkupDoubleBorder;
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
      init : 0
    },

    /** right width of border */
    innerWidthRight :
    {
      check : "Number",
      init : 0
    },

    /** bottom width of border */
    innerWidthBottom :
    {
      check : "Number",
      init : 0
    },

    /** left width of border */
    innerWidthLeft :
    {
      check : "Number",
      init : 0
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
      check : "Color"
    },

    /** right inner color of border */
    innerColorRight :
    {
      nullable : true,
      check : "Color"
    },

    /** bottom inner color of border */
    innerColorBottom :
    {
      nullable : true,
      check : "Color"
    },

    /** left inner color of border */
    innerColorLeft :
    {
      nullable : true,
      check : "Color"
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
      init : 1
    }
  },


  members :
  {
    __ownMarkup : null,

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
      if (!styles["box-shadow"]) {
        styles["box-shadow"] = shadowStyle.join(",");
      } else {
        styles["box-shadow"] += "," + shadowStyle.join(",");
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


    /**
     * Special generator for the markup which creates the containing div and
     * the surrounding div as well.
     *
     * @param styles {Map} The styles for the inner
     * @return {String} The generated decorator HTML.
     */
    __generateMarkupDoubleBorder : function(styles) {
      var colorTop,
          colorRight,
          colorBottom,
          colorLeft;
      if (qx.core.Environment.get("qx.theme"))
      {
        var Color = qx.theme.manager.Color.getInstance();

        colorTop = Color.resolve(this.getInnerColorTop());
        colorRight = Color.resolve(this.getInnerColorRight());
        colorBottom = Color.resolve(this.getInnerColorBottom());
        colorLeft = Color.resolve(this.getInnerColorLeft());
      }
      else
      {
        colorTop = this.getInnerColorTop();
        colorRight = this.getInnerColorRight();
        colorBottom = this.getInnerColorBottom();
        colorLeft = this.getInnerColorLeft();
      }

      var innerStyles = qx.lang.Object.clone(styles);
      for (var style in innerStyles) {
        if (style.indexOf("box-shadow") != -1) {
          delete innerStyles[style];
        }
      }

      // Inner styles
      // Inner image must be relative to be compatible with qooxdoo 0.8.x
      // See http://bugzilla.qooxdoo.org/show_bug.cgi?id=3450 for details
      innerStyles.position = "relative";

      var width = this.getInnerWidthTop();
      if (width > 0) {
        innerStyles["border-top"] = width + "px " + this.getStyleTop() + " " + colorTop;
      }

      width = this.getInnerWidthRight();
      if (width > 0) {
        innerStyles["border-right"] = width + "px " + this.getStyleRight() + " " + colorRight;
      }

      width = this.getInnerWidthBottom();
      if (width > 0) {
        innerStyles["border-bottom"] = width + "px " + this.getStyleBottom() + " " + colorBottom;
      }

      width = this.getInnerWidthLeft();
      if (width > 0) {
        innerStyles["border-left"] = width + "px " + this.getStyleLeft() + " " + colorLeft;
      }

      if (qx.core.Environment.get("qx.debug"))
      {
        if (innerStyles["border-top"] == '' && innerStyles["border-right"] == '' &&
          innerStyles["border-bottom"] == '' && innerStyles["border-left"] == '') {
          throw new Error("Invalid Double decorator (zero inner border width). Use qx.ui.decoration.Single instead!");
        }
      }

      var innerHtml = this._generateBackgroundMarkup(
        innerStyles, this._getContent ? this._getContent() : ""
      );

      // Store
      return this.__ownMarkup = this._generateBackgroundMarkup(styles, innerHtml);
    },




    /**
     * Resize function for the decorator. This is suitable for the
     * {@link qx.ui.decoration.Decorator}.
     *
     * @param element {Element} The element which could be resized.
     * @param width {Number} The new width.
     * @param height {Number} The new height.
     * @return {Map} A map containing the desired position and dimension and a
     *   emelent to resize.
     *   (width, height, top, left, elementToApplyDimensions).
     */
    __resizeDoubleBorder : function(element, width, height)
    {
      var insets = this.getInsets();
      width -= insets.left + insets.right;
      height -= insets.top + insets.bottom;

      var left =
        insets.left -
        this.getWidthLeft() -
        this.getInnerWidthLeft();
      var top =
        insets.top -
        this.getWidthTop() -
        this.getInnerWidthTop();

      return {
        left: left,
        top: top,
        width: width,
        height: height,
        elementToApplyDimensions : element.firstChild
      };
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
