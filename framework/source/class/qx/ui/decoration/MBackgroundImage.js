/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (martinwittemann)

************************************************************************ */
/**
 * Mixin for supporting the background images on decorators.
 * This mixin is usually used by {@link qx.ui.decoration.DynamicDecorator}.
 */
qx.Mixin.define("qx.ui.decoration.MBackgroundImage",
{
  properties :
  {
    /** The URL of the background image */
    backgroundImage :
    {
      check : "String",
      nullable : true,
      apply : "_applyBackgroundImage"
    },


    /** How the background image should be repeated */
    backgroundRepeat :
    {
      check : ["repeat", "repeat-x", "repeat-y", "no-repeat", "scale"],
      init : "repeat",
      apply : "_applyBackgroundImage"
    },


    /**
     * Either a string or a number, which defines the horizontal position
     * of the background image.
     *
     * If the value is an integer it is interpreted as a pixel value, otherwise
     * the value is taken to be a CSS value. For CSS, the values are "center",
     * "left" and "right".
     */
    backgroundPositionX :
    {
      nullable : true,
      apply : "_applyBackgroundPosition"
    },


    /**
     * Either a string or a number, which defines the vertical position
     * of the background image.
     *
     * If the value is an integer it is interpreted as a pixel value, otherwise
     * the value is taken to be a CSS value. For CSS, the values are "top",
     * "center" and "bottom".
     */
    backgroundPositionY :
    {
      nullable : true,
      apply : "_applyBackgroundPosition"
    },


    /**
     * Property group to define the background position
     */
    backgroundPosition :
    {
      group : ["backgroundPositionY", "backgroundPositionX"]
    }
  },


  members :
  {
    /**
     * Adds the background-image styles to the given map
     * @param styles {Map} CSS style map
     */
    _styleBackgroundImage : function(styles)
    {
      var image = this.getBackgroundImage();
      if(!image) {
        return;
      }

      var source = qx.util.AliasManager.getInstance().resolve(image);
      source = qx.util.ResourceManager.getInstance().toUri(source);
      if (styles["background-image"]) {
        styles["background-image"] +=  ', url(' + source + ')';
      } else {
        styles["background-image"] = 'url(' + source + ')';
      }

      var repeat = this.getBackgroundRepeat();
      if (repeat === "scale") {
        styles["background-size"] = "100% 100%";
      }
      else {
        styles.backgroundRepeat = repeat;
      }

      var top = this.getBackgroundPositionY() || 0;
      var left = this.getBackgroundPositionX() || 0;
      styles["background-position"] = left + "px " + top + "px";
    },


    /**
     * Whether an info was already displayed for browsers using the AlphaImageLoader (IE6 - IE9)
     * together with the 'backgroundPosition' property. The AlphaImageLoader is not able to make use
     * of this CSS property. So the developer should be informed about this *once*.
     */
    __infoDisplayed : false,


    // property apply
    _applyBackgroundImage : function()
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        if (this._isInitialized()) {
          throw new Error("This decorator is already in-use. Modification is not possible anymore!");
        }
      }
    },

    // property apply
    _applyBackgroundPosition : function()
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        if (qx.bom.element.Decoration.isAlphaImageLoaderEnabled() && !this.__infoDisplayed)
        {
          this.info("Applying a background-position value has no impact when using the 'AlphaImageLoader' to display PNG images!");
          this.__infoDisplayed = true;
        }
      }
    }
  }
});
