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
 * A "virtual" tree
 */
qx.OO.defineClass("qx.ui.treevirtual.TreeVirtual", qx.ui.table.Table,
function(heading)
{
  // Create a table model
  var tableModel = new qx.ui.treevirtual.SimpleTreeDataModel();
  tableModel.setColumns([ heading ]);

  // Call our superclass constructor
  qx.ui.table.Table.call(this, tableModel);

  // Set sizes
  this.setRowHeight(16);
  this.setMetaColumnCounts([1, -1]);

  // Set the data cell render
  var Stdcr = new qx.ui.treevirtual.SimpleTreeDataCellRenderer();
  this.getTableColumnModel().setDataCellRenderer(0, Stdcr);
});


qx.Proto.getDataModel = function()
{
  return this.getTableModel();
};


qx.Proto.setDataWidth = function(width)
{
  this.setColumnWidth(0, width);
};
