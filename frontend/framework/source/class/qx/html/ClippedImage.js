/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Sebastian Werner (swerner)

************************************************************************ */

/**
 * A ClippedImage wraps a DOM element, which displays a clipped image.
 * All images shown with this class must be registered using
 * {@link qx.io.image.IconManager#register} before.
 *
 * Also have a look at the class {@link qx.html.ClippedImage} for network
 * efficient clipped image support.
 */
qx.Class.define("qx.html.ClippedImage",
{
  extend : qx.html.Element,



  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Get the CSS styles to display the image. The arguments
     * <code>yOffset</code> and <code>yOffset</code> have no effect for
     * PNG files in IE6.
     *
     * @static
     * @signature function(source, xOffset, yOffset)
     * @param source {String} The URL of the image to display
     * @param xOffset {Integer?0} The horizontal offset of the image inside of
     *     the image element.
     * @param yOffset {Integer?0} The vertical offset of the image inside of
     *     the image element.
     * @return {Map} a mapping of CSS property names to CSS values
     */
    getStyles : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(source, xOffset, yOffset)
      {
        var filter = "";
        var styles = {};

        var isPng = qx.lang.String.endsWith(source, ".png");
        var Engine = qx.bom.client.Engine;
        var isIE6 = Engine.MSHTML && Engine.VERSION < 7;

        // IE 6 can display PNGs with alpha channel only using the
        // alpha image loader. Since the alpha image loader has no offset
        // property the IconManager will map all images to themself in IE6.

        if (isPng && isIE6) {
          filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + source + "',sizingMethod='crop')";
        } else {
          var styles = this.__getStylesStandardCss(source, xOffset, yOffset);
        }

        if (isIE6) {
          styles.filter = filter;
        }

        return styles;
      },

      "default" : function(source, xOffset, yOffset) {
        return this.__getStylesStandardCss(source, xOffset, yOffset);
      }
    }),


    /**
     * Get the CSS styles to display the image (using standard CSS)
     *
     * @static
     * @param source {String} The URL of the image to display
     * @param xOffset {Integer?0} The horizontal offset of the image inside of
     *     the image element.
     * @param yOffset {Integer?0} The vertical offset of the image inside of
     *     the image element.
     * @return {Map} a mapping of CSS property names to CSS values
     */
    __getStylesStandardCss : function(source, xOffset, yOffset)
    {
      xOffset = xOffset || 0;
      yOffset = yOffset || 0;

      var styles = {
        backgroundImage: "url(" + source + ")",
        backgroundPosition: xOffset + "px " + yOffset + "px",
        backgroundRepeat: "repeat"
      };

      return styles;
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __width : 0,
    __height : 0,


    /**
     * Sets the image source. The image must be registered using
     * {@link qx.io.image.IconManager#register} before.
     *
     * @param source {String} the image URL
     * @param resize {Boolean?true} Whether the element should be resized to
     *     the image size
     */
    setSource : function(source, resize)
    {
      var sprite = qx.io.image.IconManager.getInstance().resolve(source);
      if (!sprite) {
        throw new Error("The image '" + source + "' must be registered at the qx.io.image.IconManager!");
      }

      this.__width = sprite[3];
      this.__height = sprite[4];

      this.setStyles(qx.html.ClippedImage.getStyles(sprite[0], sprite[1], sprite[2]));

      if (resize !== false)
      {
        this.setStyle("width", this.__width);
        this.setStyle("height", this.__width);
      }

      this._source = source;
      return this;
    },


    /**
     * Resets the image source
     */
    resetSource : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function()
      {
        this.removeStyle("filter", filter);
        this.removeStyle("backgroundImage", filter);
      },

      "default" : function() {
        this.removeStyle("backgroundImage", filter);
      }
    }),


    /**
     * Get the image source
     *
     * @return {String} The image source
     */
    getSource : function() {
      return this._source;
    },


    /**
     * Get the image width
     *
     * @return {String} The image width
     */
    getWidth : function() {
      return this.__width;
    },


    /**
     * Get the image height
     *
     * @return {String} The image height
     */
    getHeight : function() {
      return this.__height;
    }
  }
});
