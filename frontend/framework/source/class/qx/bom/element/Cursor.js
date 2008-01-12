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
     * @param mode {Number} Choose one of the modes {@link qx.bom.element.Style#COMPUTED_MODE},
     *   {@link qx.bom.element.Style#CASCADED_MODE}, {@link qx.bom.element.Style#LOCAL_MODE}.
     *   The computed mode is the default one.
     * @return {String} Computed cursor value of the given element.
     */
    get : function(element, mode) {
      return qx.bom.element.Style.get(element, "cursor", mode, false);
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
      element.style.cursor = this.__map[value] || value;
    },


    /**
     * Removes the local cursor style applied to the element
     *
     * @type static
     * @param element {Element} The element to modify
     * @return {void}
     */
    reset : function(element) {
      element.style.cursor = "";
    }
  }
});
