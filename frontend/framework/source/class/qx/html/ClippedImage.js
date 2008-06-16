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
 */
qx.Class.define("qx.html.ClippedImage",
{
  extend : qx.html.Element,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this.setStyle("overflow", "hidden");
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Sets the image source.
     *
     * @param source {String} the image URL
     * @param resize {Boolean?true} Whether the element should be resized to
     *     the image size
     */
    setSource : function(source, resize)
    {
      var data = qx.util.ResourceManager.getData(source);
      if (!data) {
        throw new Error("The image '" + source + "' must be registered at qx.util.ResourceManager!");
      }

      // TODO: Use ImageLoader instead of forced registry!

      this.__width = data[0];
      this.__height = data[1];

      // Have clipped data available
      if (data.length > 4)
      {
        source = data[4];

        var left = data[5];
        var top = data[6];
      }
      else
      {
        var left = 0;
        var top = 0;
      }

      var styles = qx.bom.element.Background.getStyles(source, "repeat", left, top);
      this.setStyles(styles);

      if (resize !== false)
      {
        this.setStyle("width", this.__width + "px");
        this.setStyle("height", this.__height + "px");
      }

      this.__source = source;
      return this;
    },


    /**
     * Resets the image source
     */
    resetSource : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function()
      {
        this.removeStyle("filter");
        this.removeStyle("backgroundImage");
        this.__source = null;
      },

      "default" : function()
      {
        this.removeStyle("backgroundImage");
        this.__source = null;
      }
    }),


    /**
     * Get the image source
     *
     * @return {String} The image source
     */
    getSource : function() {
      return this.__source || null;
    },


    /**
     * Get the image width
     *
     * @return {String} The image width
     */
    getWidth : function() {
      return this.__width || 0;
    },


    /**
     * Get the image height
     *
     * @return {String} The image height
     */
    getHeight : function() {
      return this.__height || 0;
    }
  }
});
