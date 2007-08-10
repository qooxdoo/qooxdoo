/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

************************************************************************ */

/* ************************************************************************

#module(bom)

************************************************************************ */

/**
 * Contains methods to control and query the element's cursor property
 */
qx.Class.define("qx.bom.element.Cursor",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** Internal helper structure to map cursor values to supported ones */
    __map : qx.core.Variant.select("qx.client",
    {
      "mshtml" :
      {
        "cursor" : "hand",
        "ew-resize" : "e-resize",
        "ns-resize" : "n-resize",
        "nesw-resize" : "ne-resize",
        "nwse-resize" : "nw-resize"
      },

      "opera" :
      {
        "col-resize" : "e-resize",
        "row-resize" : "n-resize",
        "ew-resize" : "e-resize",
        "ns-resize" : "n-resize",
        "nesw-resize" : "ne-resize",
        "nwse-resize" : "nw-resize"
      },

      "default" : {}
    }),


    /**
     * Returns the computed cursor style for the given element.
     *
     * @type static
     * @param element {Element} The element to query
     * @return {String} Computed cursor value of the given element.
     */
    get : function(element) {
      return qx.bom.element.Style.getComputed(element, "cursor");
    },


    /**
     * Applies a new cursor style to the given element
     *
     * @type static
     * @param element {Element} The element to modify
     * @param value {String} New cursor value to set
     * @return {void}
     */
    set : function(element, value) {
      qx.bom.element.Style.set(element, "cursor", this.__map[value] || value);
    },
    
    
    /**
     * Removes the local cursor style applied to the element
     * 
     * @type static
     * @param element {Element} The element to modify
     * @return {void}
     */
    reset : function(element) {
      qx.bom.element.Style.reset(element, "cursor"); 
    }
  }
});
