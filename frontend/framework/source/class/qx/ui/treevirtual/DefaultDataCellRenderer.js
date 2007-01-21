/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 by Derrell Lipman

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/* ************************************************************************

#module(treevirtual)

************************************************************************ */

/**
 * The default data cell renderer for a virtual tree (columns other than the
 * tree column)
 */
qx.OO.defineClass("qx.ui.treevirtual.DefaultDataCellRenderer",
                  qx.ui.table.DefaultDataCellRenderer,
function()
{
  qx.ui.table.DefaultDataCellRenderer.call(this);
});


// overridden
qx.Proto._getCellStyle = function(cellInfo)
{
  // Return the style for the div for the cell.  If there's cell-specific
  // style information provided, append it.
  var html = qx.ui.treevirtual.SimpleTreeDataCellRenderer.MAIN_DIV_STYLE;
  return html;
};
