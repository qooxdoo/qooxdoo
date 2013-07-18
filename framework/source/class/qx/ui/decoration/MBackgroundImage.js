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
 * This mixin is usually used by {@link qx.ui.decoration.Decorator}.
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

      var id = qx.util.AliasManager.getInstance().resolve(image);
      var source = qx.util.ResourceManager.getInstance().toUri(id);
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
        styles["background-repeat"] = repeat;
      }

      var top = this.getBackgroundPositionY() || 0;
      var left = this.getBackgroundPositionX() || 0;

      if (!isNaN(top)) {
        top += "px";
      }

      if (!isNaN(left)) {
        left += "px";
      }

      styles["background-position"] = left + " " + top;

      if (qx.core.Environment.get("qx.debug") &&
        source &&  qx.lang.String.endsWith(source, ".png") &&
        (repeat == "scale" || repeat == "no-repeat") &&
        qx.core.Environment.get("engine.name") == "mshtml" &&
        qx.core.Environment.get("browser.documentmode") < 9)
      {
        this.warn("Background PNGs with repeat == 'scale' or repeat == 'no-repeat'" +
          " are not supported in this client! The image's resource id is '" + id + "'");
      }
    },


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
        if (this._isInitialized()) {
          throw new Error("This decorator is already in-use. Modification is not possible anymore!");
        }
        if (qx.core.Environment.get("engine.name") == "mshtml" &&
          qx.core.Environment.get("browser.documentmode") < 9)
        {
          this.warn("The backgroundPosition property is not supported by this client!");
        }
      }
    }
  }
});
