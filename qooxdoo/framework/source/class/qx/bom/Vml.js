
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
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Helper class to work with VML . If this class is used, it initialized VML
 * support.
 *
 *  <em>Note: This class is only available in Internet Explorer!</em>
 */
qx.Class.define("qx.bom.Vml",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Create VML element
     *
     * @param type {String} The VML element type
     * @param attributes {Map?null} An optional map of element attributes
     * @param win {var?null} The browser window element, in which the element
     *     should be created.
     */
    create : function(type, attributes, win)
    {
      var win = win || window;
      var el = win.document.createElement("v:" + (type || "shape"));

      if (attributes)
      {
        for (var key in attributes) {
          el.setAttribute(key, attributes[key]);
        }
      }

      return el;
    },


    /**
     * Creates an VML image and configures it. The image is always tiled.
     *
     * @param source {String?} The URL of the image to display
     * @param width {Integer?} The desired width of the image element
     * @param height {Integer?} The desired height of the image element
     * @param xOffset {Integer?0} The horizontal offset of the image inside of
     *     the image element.
     * @param yOffset {Integer?0} The vertical offset of the image inside of
     *     the image element.
     * @param imageWidth {Integer?null} The full width of the image. This value
     *     is required, when an xOffset is given.
     * @param imageHeight {Integer?null} The full height of the image. This value
     *     is required, when an yOffset is given.
     * @return {Element} the VML element of the image
     */
    createImage : function(source, width, height, xOffset, yOffset, imageWidth, imageHeight)
    {
      var shape = qx.bom.Vml.create("rect", {
        "stroked": "False"
      });

      var fill = qx.bom.Vml.create("fill", {
        "type": "tile"
      });

      shape.appendChild(fill);

      if (source || width || height) {
        this.updateImage(shape, source, width, height, xOffset, yOffset, imageWidth, imageHeight)
      }

      return shape;
    },


    /**
     * Sets the image source and configures the image. The image element size
     * resized to the given size and the image is always tiled.
     *
     * @signature function(image, source, width, height, xOffset, yOffset, imageWidth, imageHeight)
     * @param image {Element} The image VML element created by {@link #createImage}.
     * @param source {String} The URL of the image to display
     * @param width {Integer} The desired width of the image element
     * @param height {Integer} The desired height of the image element
     * @param xOffset {Integer?0} The horizontal offset of the image inside of
     *     the image element.
     * @param yOffset {Integer?0} The vertical offset of the image inside of
     *     the image element.
     * @param imageWidth {Integer?null} The full width of the image. This value
     *     is required, when an xOffset is given.
     * @param imageHeight {Integer?null} The full height of the image. This value
     *     is required, when an yOffset is given.
     */
    updateImage : function(image, source, width, height, xOffset, yOffset, imageWidth, imageHeight)
    {
      var Style = qx.bom.element.Style;
      var Attribute = qx.bom.element.Attribute;

      Style.set(image, "width", width, false);
      Style.set(image, "height", height, false);

      var fill = image.firstChild;
      Attribute.set(fill, "src", source, false);

      var xOrigin = xOffset ? (-xOffset) / (imageWidth) : 0;
      var yOrigin = yOffset ? (-yOffset) / (imageHeight) : 0;

      Attribute.set(fill, "origin", xOrigin.toFixed(2) + "," + yOrigin ,false);
    }
  },




  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics)
  {
    if (qx.core.Variant.isSet("qx.client", "mshtml"))
    {
      qx.bom.Stylesheet.createElement("v\\: * { behavior:url(#default#VML);display:inline-block; }");

      if (!document.namespaces["v"]) {
        document.namespaces.add("v", "urn:schemas-microsoft-com:vml");
      }
    }
  }
});
