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
 * Mixin for the border radius CSS property.
 * This mixin is usually used by {@link qx.ui.decoration.Decorator}.
 *
 * Keep in mind that this is not supported by all browsers:
 *
 * * Firefox 3,5+
 * * IE9+
 * * Safari 3.0+
 * * Opera 10.5+
 * * Chrome 4.0+
 */
qx.Mixin.define("qx.ui.decoration.MBorderRadius",
{
  properties : {
    /** top left corner radius */
    radiusTopLeft :
    {
      nullable : true,
      check : "Integer",
      apply : "_applyBorderRadius"
    },

    /** top right corner radius */
    radiusTopRight :
    {
      nullable : true,
      check : "Integer",
      apply : "_applyBorderRadius"
    },

    /** bottom left corner radius */
    radiusBottomLeft :
    {
      nullable : true,
      check : "Integer",
      apply : "_applyBorderRadius"
    },

    /** bottom right corner radius */
    radiusBottomRight :
    {
      nullable : true,
      check : "Integer",
      apply : "_applyBorderRadius"
    },

    /** Property group to set the corner radius of all sides */
    radius :
    {
      group : [ "radiusTopLeft", "radiusTopRight", "radiusBottomRight", "radiusBottomLeft" ],
      mode : "shorthand"
    }
  },


  members :
  {
    /**
     * Takes a styles map and adds the border radius styles in place to the
     * given map. This is the needed behavior for
     * {@link qx.ui.decoration.Decorator}.
     *
     * @param styles {Map} A map to add the styles.
     */
    _styleBorderRadius : function(styles)
    {
      // Fixing the background bleed in Webkits
      // http://tumble.sneak.co.nz/post/928998513/fixing-the-background-bleed
      styles["-webkit-background-clip"] = "padding-box";
      styles["background-clip"] = "padding-box";

      // radius handling
      var hasRadius = false;
      var radius = this.getRadiusTopLeft();
      if (radius > 0) {
        hasRadius = true;
        styles["-moz-border-radius-topleft"] = radius + "px";
        styles["-webkit-border-top-left-radius"] = radius + "px";
        styles["border-top-left-radius"] = radius + "px";
      }

      radius = this.getRadiusTopRight();
      if (radius > 0) {
        hasRadius = true;
        styles["-moz-border-radius-topright"] = radius + "px";
        styles["-webkit-border-top-right-radius"] = radius + "px";
        styles["border-top-right-radius"] = radius + "px";
      }

      radius = this.getRadiusBottomLeft();
      if (radius > 0) {
        hasRadius = true;
        styles["-moz-border-radius-bottomleft"] = radius + "px";
        styles["-webkit-border-bottom-left-radius"] = radius + "px";
        styles["border-bottom-left-radius"] = radius + "px";
      }

      radius = this.getRadiusBottomRight();
      if (radius > 0) {
        hasRadius = true;
        styles["-moz-border-radius-bottomright"] = radius + "px";
        styles["-webkit-border-bottom-right-radius"] = radius + "px";
        styles["border-bottom-right-radius"] = radius + "px";
      }

      // Fixing the background bleed in Webkits
      // http://tumble.sneak.co.nz/post/928998513/fixing-the-background-bleed
      if (hasRadius && qx.core.Environment.get("engine.name") == "webkit") {
        styles["-webkit-background-clip"] = "padding-box";
      } else {
    styles["background-clip"] = "padding-box";
      }
    },

    // property apply
    _applyBorderRadius : function()
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
