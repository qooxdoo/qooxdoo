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
     * the value is taken as CSS value. CSS the values are "center", "left" and
     * "right".
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
     * This method just uses the settings in the properties and the
     * {@link qx.ui.decoration.Util#generateBackgroundMarkup} method to generate
     *  the markup.
     *
     * @param styles {String} CSS styles as string
     * @return {String} The generated HTML fragment
     */
    _generateBackgroundMarkup: function(styles) {
      // Generate markup
      var html = qx.ui.decoration.Util.generateBackgroundMarkup(
        this.getBackgroundImage(),
        this.getBackgroundRepeat(),
        this.getBackgroundPositionX(),
        this.getBackgroundPositionY(),
        styles
      );
      return html;
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
