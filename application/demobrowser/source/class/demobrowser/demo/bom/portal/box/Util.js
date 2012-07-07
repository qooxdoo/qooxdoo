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
     * Alexander Steitz (aback)
     * David Werner (psycledw)

************************************************************************ */


/**
 * Utilty class for DOM elements
 */
qx.Class.define("demobrowser.demo.bom.portal.box.Util",
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
      var zIndex = qx.bom.element.Style.get(element, "zIndex");
      zIndex = zIndex == "auto" ? 0 : zIndex;

      qx.bom.element.Style.set(element, "zIndex", zIndex + this.__zIndexOffset);
    },


    /**
     * Sends the given element to the back.
     *
     * @param element {Element} Element to manipulate.
     * @return {void}
     */
    sendToBack : function(element)
    {
      var zIndex = qx.bom.element.Style.get(element, "zIndex");
      qx.bom.element.Style.set(element, "zIndex", zIndex - this.__zIndexOffset);
    }
  }
});
