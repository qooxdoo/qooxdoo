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
      apply : "_applyBackground"
    },


    /** How the background image should be repeated */
    backgroundRepeat :
    {
      check : ["repeat", "repeat-x", "repeat-y", "no-repeat", "scale"],
      init : "repeat",
      apply : "_applyBackground"
    },


    /**
     * Either a string or a number, which define the vertical position
     * of the background image.
     *
     * If the value is an integer it is interpreted as pixel value otherwise
     * the value is taken as CSS value. CSS the values are "center", "left" and
     * "right".
     */
    backgroundPositionX :
    {
      nullable : true,
      apply : "_applyBackground"
    },


    /**
     * Either a string or a number, which define the horizontal position
     * of the background image.
     *
     * If the value is an integer it is interpreted as pixel value otherwise
     * the value is taken as CSS value. CSS the values are "top", "middle" and
     * "bottom".
     */
    backgroundPositionY :
    {
      nullable : true,
      apply : "_applyBackground"
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
     * Responsible for generating the markup for the background.
     * This method just uses the settings in the properties to generate
     * the markup.
     *
     * @param styles {String} CSS styles as string
     * @return {String} The generated HTML fragment
     *
     * @deprecated Please provide a map for the 'styles' parameter.
     */
    _generateBackgroundMarkup: function(styles)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.lang.Type.isString(styles))
        {
          qx.log.Logger.deprecatedWarning(arguments.callee, "Please provide a map for the 'styles' parameter");
          throw new Error("Wrong type for parameter 'styles'.");
        }
      }

      var markup = "";

      var image = this.getBackgroundImage();
      var repeat = this.getBackgroundRepeat();

      var top = this.getBackgroundPositionY();
      if (top == null) {
        top = 0;
      }

      var left = this.getBackgroundPositionX();
      if (left == null) {
        left = 0;
      }

      styles.backgroundPosition = left + " " + top;

      // Support for images
      if (image)
      {
        var resolved = qx.util.AliasManager.getInstance().resolve(image);
        markup = qx.bom.element.Decoration.create(resolved, repeat, styles);
      }
      else
      {
        if (styles)
        {
          if (qx.core.Variant.isSet("qx.client", "mshtml"))
          {
            /*
             * Internet Explorer as of version 6 for quirks and standards mode,
             * or version 7 in quirks mode adds an empty string to the "div"
             * node. This behavior causes rendering problems, because the node
             * would then have a minimum size determined by the font size.
             * To be able to set the "div" node height to a certain (small)
             * value independent of the minimum font size, an "overflow:hidden"
             * style is added.
             * */
            if (qx.bom.client.Engine.VERSION < 7 || qx.bom.client.Feature.QUIRKS_MODE)
            {
              // Add additionally style
              styles.overflow = "hidden";
            }
          }

          markup = '<div style="' + qx.bom.element.Style.compile(styles) + '"></div>';
        }
      }

      return markup;
    },


    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyBackground : function()
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (this._isInitialized()) {
          throw new Error("This decorator is already in-use. Modification is not possible anymore!");
        }
      }
    }
  }
});
