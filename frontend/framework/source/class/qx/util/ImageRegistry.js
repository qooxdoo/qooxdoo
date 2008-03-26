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

************************************************************************ */

/**
 * The image registry contains information about image sizes and information about
 * clipped images. The {@link qx.ui.basic.Image} class uses this information to
 * render images.
 */
qx.Class.define("qx.util.ImageRegistry",
{
  extend : qx.core.Object,
  type : "singleton",


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /** {Map} the shared image registry */
    __registry : {},


    /**
     * Register information about an image.
     *
     * @param iconUri {String} The URI of the image to register information about.
     * @param mappedUri {String} The image URI, which should be used to display
     *     the image. This can be either the same as the image URI or the URI
     *     of a combined image containing several images.
     * @param xOffset {Integer} The horizontal start offset of the image.
     * @param yOffset {Integer} The vertical start offset of the image.
     * @param width {Integer} The image width
     * @param height {Integer} The image height
     */
    register : function(iconUri, mappedUri, xOffset, yOffset, width, height)
    {
      var isPng = qx.lang.String.endsWith(iconUri, ".png");

      // use clipped images unless the image is PNG and the browser IE6
      var Engine = qx.bom.client.Engine;
      if (isPng && Engine.MSHTML && Engine.VERSION < 7) {
        this.__registry[iconUri] = [iconUri, 0, 0, width, height];
      } else {
        this.__registry[iconUri] = [mappedUri, xOffset, yOffset, width, height];
      }
    },


    /**
     * Whether the image registry has informations about the given
     * image URL.
     *
     * @type member
     * @param iconUri {String} The icon to get the information for
     * @return {Boolean} <code>true</code> when the image is known.
     */
    has : function(iconUri) {
      return !!this.__registry[iconUri];
    },


    /**
     * Get information about an icon.
     *
     * @param iconUri {String} The icon to get the information for
     * @return {Array} An array containing the following icon properties:
     *   <code>mappedUri</code>, <code>xOffset</code>, <code>yOffset</code>,
     *   <code>width</code>, <code>height</code>.
     */
    resolve : function(iconUri)
    {
      return this.__registry[qx.io.Alias.getInstance().resolve(iconUri)] || null;
    }
  },


  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("__registry");
  }
});