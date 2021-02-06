/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 Derrell Lipman

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/**
 * A debug cell editor.  This displays cellInfo.value using
 * {@link qx.dev.Debug#debugObjectToString} so is useful as a starting point
 * during development of a table, before writing each of the cell renderers.
 */
qx.Class.define("qx.ui.table.cellrenderer.Debug",
{
  extend : qx.ui.table.cellrenderer.Abstract,

  members :
  {
    // overridden
    _getContentHtml : function(cellInfo)
    {
      var html =
        "<div style='height:" + cellInfo.styleHeight + "px;overflow:auto;'>" +
        qx.dev.Debug.debugObjectToString(
          cellInfo.value,
          "row=" + cellInfo.row + ", col=" + cellInfo.col,
          10,
          true) +
        "</div>";
      return html;
    }
  }
});
