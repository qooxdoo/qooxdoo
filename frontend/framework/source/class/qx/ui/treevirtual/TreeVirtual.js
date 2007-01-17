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


/**
 * Event handler. Called when a key was pressed.
 *
 * We handle the Enter key to toggle expanded/contracted tree state.  All
 * other keydown events are passed to our superclass.
 *
 * @param evt {Map} the event.
 */
qx.Proto._onkeydown = function(evt)
{
  var identifier = evt.getKeyIdentifier();

  var consumed = false;
  if (evt.getModifiers() == 0)
  {
    switch (identifier)
    {
    case "Enter":
      var node = this.getTableModel().getValue(this.getFocusedColumn(),
                                               this.getFocusedRow());
      if (node.expanded == true || node.expanded == false)
      {
        node.expanded = ! node.expanded;
        this.getTableModel().setData(null);
      }
      consumed = true;
      break;
    }
  }

  // Was this one of our events that we handled?
  if (consumed)
  {
    // Yup.  Don't propagate it.
    evt.preventDefault();
    evt.stopPropagation();
  }
  else
  {
    // It's not one of ours.  Let our superclass handle this event
    qx.ui.table.Table.prototype._onkeydown.call(this, evt);
  }
};
