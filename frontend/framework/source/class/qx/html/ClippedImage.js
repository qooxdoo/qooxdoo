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
 * {@link qx.util.ImageRegistry#register} before.
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
     * Sets the image source. The image must be registered using
     * {@link qx.util.ImageRegistry#register} before.
     *
     * @param source {String} the image URL
     * @param resize {Boolean?true} Whether the element should be resized to
     *     the image size
     */
    setSource : function(source, resize)
    {
      var data = qx.util.ImageRegistry.getInstance().get(source);
      if (!data) {
        throw new Error("The image '" + source + "' must be registered at qx.util.ImageRegistry!");
      }
      
      this.__width = data[0];
      this.__height = data[1];
      
      // Have clipped data available
      if (data.length > 4)
      {
        source = data[4];
        
        var xpos = data[5];
        var ypos = data[6];
        var format = data[7];
      }
      else
      {
        var xpos = 0;
        var ypos = 0;
        var format = data[2];
      }
      
      var url = qx.util.ImageRegistry.getInstance().toUri(source);
      var styles = qx.bom.element.Background.getStyles(url, "repeat", xpos, ypos, format);
      
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
      },

      "default" : function() {
        this.removeStyle("backgroundImage");
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
