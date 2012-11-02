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
 * Contains methods to control and query the element's cursor property
 */
qx.Bootstrap.define("qx.bom.element.Cursor",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** Internal helper structure to map cursor values to supported ones */
    __map : {},


    /**
     * Compiles the given cursor into a CSS compatible string.
     *
     * @param cursor {String} Valid CSS cursor name
     * @return {String} CSS string
     */
    compile : function(cursor) {
      return "cursor:" + (this.__map[cursor] || cursor) + ";";
    },


    /**
     * Returns the computed cursor style for the given element.
     *
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
     * @param element {Element} The element to modify
     * @param value {String} New cursor value to set
     */
    set : function(element, value) {
      element.style.cursor = this.__map[value] || value;
    },


    /**
     * Removes the local cursor style applied to the element
     *
     * @param element {Element} The element to modify
     */
    reset : function(element) {
      element.style.cursor = "";
    }
  },


  defer : function(statics) {
    // < IE 9
    if (qx.core.Environment.get("engine.name") == "mshtml" &&
         ((parseFloat(qx.core.Environment.get("engine.version")) < 9 ||
          qx.core.Environment.get("browser.documentmode") < 9) &&
          !qx.core.Environment.get("browser.quirksmode"))
    ) {
      statics.__map["nesw-resize"] = "ne-resize";
      statics.__map["nwse-resize"] = "nw-resize";

      // < IE 8
      if (((parseFloat(qx.core.Environment.get("engine.version")) < 8 ||
          qx.core.Environment.get("browser.documentmode") < 8) &&
          !qx.core.Environment.get("browser.quirksmode"))
      ) {
        statics.__map["ew-resize"] = "e-resize";
        statics.__map["ns-resize"] = "n-resize";
      }

    // Opera < 12
    } else if (
      qx.core.Environment.get("engine.name") == "opera" &&
      parseInt(qx.core.Environment.get("engine.version")) < 12
    ) {
      statics.__map["nesw-resize"] = "ne-resize";
      statics.__map["nwse-resize"] = "nw-resize";
    }
  }
});
