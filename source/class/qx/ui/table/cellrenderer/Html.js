/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 OpenHex SPRL, http://www.openhex.org

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Dirk Wellmann (dw(at)piponline.net)

************************************************************************ */

/**
 * This Cellrender is for transparent use, without escaping! Use this Cellrender
 * to output plain HTML content.
 */
qx.Class.define("qx.ui.table.cellrenderer.Html",
{
  extend : qx.ui.table.cellrenderer.Conditional,

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    _getContentHtml : function(cellInfo) {
      return (cellInfo.value || "");
    },

    // overridden
    _getCellClass : function(cellInfo) {
      return "qooxdoo-table-cell";
    }
  }
});
