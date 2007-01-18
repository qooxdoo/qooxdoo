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
 *
 * @event treeOpenWithContent {qx.event.type.DataEvent}
 * @event treeOpenWhileEmpty {qx.event.type.DataEvent}
 * @event treeClose {qx.event.type.DataEvent}
 *
 * WARNING: This widget is in active development and the interface to it is
 *          very likely to change, possibly on a daily basis, for a while.  Do
 *          not use this widget yet.
 *
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
  var stdcr = new qx.ui.treevirtual.SimpleTreeDataCellRenderer();
  this.getTableColumnModel().setDataCellRenderer(0, stdcr);

  // Move the focus with the mouse
  this.setFocusCellOnMouseMove(true);

  // Arrange to handle mouse clicks. Replace the selection manager's method
  // with one that calls our handleClick method (with this TreeVirtual object
  // as 'this' instead of the selection manager).
  var _this = this;
  this._getSelectionManager().handleClick = function(index, evt)
  {
    qx.ui.treevirtual.TreeVirtual.prototype._handleClick.call(_this,
                                                              index,
                                                              evt);
  };
});


qx.Proto.getDataModel = function()
{
  return this.getTableModel();
};


qx.Proto.setDataWidth = function(width)
{
  this.setColumnWidth(0, width);
};


qx.Proto.setAlwaysShowPlusMinusSymbol = function(b)
{
  var dcr = this.getTableColumnModel().getDataCellRenderer(0);
  dcr.setAlwaysShowPlusMinusSymbol(b);
};


/*
 * Toggle the expanded state of the node: if the node is expanded, contract
 * it; if it is contracted, expand it.
 */
qx.Proto.toggleExpanded = function(node)
{
  // Ignore toggle request if 'expanded' is not a boolean (i.e. we've been
  // told explicitely not to display the expand/contract button).
  if (node.expanded !== true && node.expanded !== false)
  {
    return;
  }

  // Are we expanding or contracting?
  if (node.expanded)
  {
    // We're contracting.  If there are listeners, generate a treeClose event.
    this.createDispatchDataEvent("treeClose", node);
  }
  else
  {
    // We're expanding.  Are there any children?
    if (node.children.length > 0)
    {
      // Yup.  If there any listeners, generate a "treeOpenWithContent" event.
      this.createDispatchDataEvent("treeOpenWithContent", node);
    }
    else
    {
      // No children.  If there are listeners, generate a "treeOpenWhileEmpty"
      // event.
      this.createDispatchDataEvent("treeOpenWhileEmpty", node);
    }
  }

  // Toggle the state
  node.expanded = ! node.expanded;

  // Re-render the row data since formerly visible rows may now be invisible,
  // or vice versa.
  this.getTableModel()._render();
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

      this.toggleExpanded(node);
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


/**
 * Handles the mouse click event.
 *
 * @param index {Integer}
 *   The row index the mouse is pointing at.
 *
 * @param evt {Map}
 *   The mouse event.
 */
qx.Proto._handleClick = function(index, evt)
{
  // Get the node to which this click applies
  var node = this.getTableModel().getValue(this.getFocusedColumn(),
                                           this.getFocusedRow());

  // Was the click on the expand/contract button?  That button begins at
  // (node.level - 1) * 19 + 2 (the latter for padding), and has width 19.  We
  // add a bit of latitude to that.
  var x = evt.getClientX();
  var latitude = 2;
  var buttonPos = (node.level - 1) * 19 + 2;
  if (x >= buttonPos - latitude && x <= buttonPos + 19 + latitude)
  {
    // Yup.  Toggle the expanded state for this node.
    this.toggleExpanded(node);
  }
};
