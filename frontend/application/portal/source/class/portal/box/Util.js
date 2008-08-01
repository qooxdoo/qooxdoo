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
     * Alexander Back (aback)
     * David Werner (psycledw)

************************************************************************ */


/**
 * Utilty class for DOM elements
 */
qx.Class.define("portal.box.Util",
{
  statics :
  {
    /** Default zIndex offset */
    __zIndexOffset : 1000,


    /**
     * Brings the given element to the front.
     *
     * @param element {Element} Element to manipulate
     * @return {void} 
     */
    bringToFront : function(element)
    {
      var zIndex = this.getStyleProperty(element, "zIndex");
      zIndex = zIndex == "auto" ? 0 : zIndex;

      qx.bom.element.Style.set(element, "zIndex", zIndex + portal.box.Util.__zIndexOffset);
    },


    /**
     * Sends the given element to the back.
     *
     * @param element {Element} Element to manipulate.
     * @return {void} 
     */
    sendToBack : function(element)
    {
      var zIndex = this.getStyleProperty(element, "zIndex");
      
      qx.bom.element.Style.set(element, "zIndex", zIndex - portal.box.Util.__zIndexOffset);
    },


    /**
     * Returns the value of the given CSS property of the element.
     *
     * @param element {Element} Element to check.
     * @param property {String} CSS Property name
     * @param asInteger {Boolean} Integer transformation
     * @return {String | Integer} Property value
     */
    getStyleProperty : function(element, property, asInteger) {
      var styleProperty = qx.bom.element.Style.get(element, property);
      
      return asInteger ? parseInt(styleProperty) : styleProperty;
    },


    /**
     * Returns the computed dimension of an element
     *
     * @param element {Node} DOM-Node to work on
     * @return {Map} computed width and height of the given element as a map (keys: 'width' and 'height')
     */
    getComputedDimension : function(element)
    {
      var width  = portal.box.Util.getStyleProperty(element, "width", true);
      var height = portal.box.Util.getStyleProperty(element, "height", true);

      if (qx.core.Variant.isSet("qx.client", "mshtml"))
      {
        width = width == 0 ? element.offsetWidth : width;
        height = height == 0 ? element.offsetHeight : height;
      }

      return { width : width, height : height };
    }    
  }
});
