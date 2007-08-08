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

#module(html2)

************************************************************************ */

/**
 * Contains methods to control and query the element's cursor property
 */
qx.Class.define("qx.html2.element.Cursor",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
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

    get : function(element) {
      return qx.html2.element.Style.getComputed(element, "cursor");
    },

    set : function(element, value) {
      return qx.html2.element.Style.set(element, this.__map[value] || value);
    }
  }
});
