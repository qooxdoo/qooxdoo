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

************************************************************************ */

/**
 * Contains methods to control and query the element's text-overflow property.
 *
 * Supported values:
 *
 * * "clip": Clips the viewable content to the area defined by the rendering box,
 *      the ‘overflow’, and ‘clip’ property values.
 *
 * * "ellipsis":  If text content will overflow, display the string “…” in the
 *      visibly-rendered region for content outside the visible area.
 */
qx.Class.define("qx.bom.element.TextOverflow",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Compiles the given text overflow into a CSS compatible string.
     *
     * @type static
     * @signature function(value)
     * @param value {String} Valid CSS box-sizing value
     * @return {String} CSS string
     */
    compile : qx.core.Variant.select("qx.client",
    {
      "opera" : function(value)
      {
        // Opera as of 9.2.x only supports -o-text-overflow
        return "-o-text-overflow:" + value + ";text-overflow:" + value + ";";
      },

      "default" : function(value) {
        return "text-overflow:" + value + ";";
      }
    }),


    /**
     * Returns the text overflow for the given element.
     *
     * @type static
     * @signature function(element)
     * @param element {Element} The element to query
     * @return {String} Box sizing value of the given element.
     */
    get : qx.core.Variant.select("qx.client",
    {
      "opera" : function(element)
      {
        return (
          qx.bom.element.Style.get(element, "-o-text-overflow", null, false) ||
          qx.bom.element.Style.get(element, "text-overflow", null, false)
        )
      },

      "default" : function(element)
      {
        return qx.bom.element.Style.get(element, "text-overflow", null, false)
      }
    }),


    /**
     * Applies the text overflow to the given element
     *
     * @type static
     * @signature function(element, value)
     * @param element {Element} The element to modify
     * @param value {String} New box sizing value to set
     * @return {void}
     */
    set : qx.core.Variant.select("qx.client",
    {
      "opera" : function(element, value)
      {
        element.style.OTextOverflow = value;
        element.style.textOverflow = value;
      },

      "default" : function(element, value) {
        element.style.textOverflow = value;
      }
    }),


    /**
     * Removes the local text overflow applied to the element
     *
     * @param element {Element} The element to modify
     * @return {void}
     */
    reset : function(element) {
      this.set(element, "");
    }
  }
});
