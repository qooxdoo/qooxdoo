/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

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
 * @event changeSelection {qx.event.type.Event}
 *
 * WARNING: This widget is in active development and the interface to it is
 *          very likely to change, possibly on a daily basis, for a while.  Do
 *          not use this widget yet.
 *
 */
qx.OO.defineClass("qx.ui.treevirtual.TreeVirtual", qx.ui.table.Table,
function(headings)
{
  // Create a table model
  var tableModel = new qx.ui.treevirtual.SimpleTreeDataModel();

  // Specify the column headings.  We accept a single string (one single
  // column) or an array of strings (one or more columns).
  if (typeof(headings) == "string")
  {
    headings = [ headings ];
  }
  tableModel.setColumns(headings);

  // Call our superclass constructor
  qx.ui.table.Table.call(this, tableModel);

  // Set sizes
  this.setRowHeight(16);
  this.setMetaColumnCounts([1, -1]);

  // Set the data cell render.  We use the SimpleTreeDataCellRenderer for the
  // tree column, and our DefaultDataCellRenderer for all other columns.
  var stdcr = new qx.ui.treevirtual.SimpleTreeDataCellRenderer();
  var ddcr = new qx.ui.treevirtual.DefaultDataCellRenderer();
  var tcm = this.getTableColumnModel();
  var treeCol = this.getTableModel().getTreeColumn();
  for (var i = 0; i < headings.length; i++)
  {
    tcm.setDataCellRenderer(i, i == treeCol ? stdcr : ddcr);
  }

  // Set the data row renderer.
  this.setDataRowRenderer(new qx.ui.treevirtual.SimpleTreeDataRowRenderer());

  // We need our cell renderer called on selection change, to update the icon
  this.setAlwaysUpdateCells(true);

  // Move the focus with the mouse
  this.setFocusCellOnMouseMove(true);

  // We don't want rows selected based on keyboard focus change.  Use our own
  // Selection Manager.
  this._selectionManager = new qx.ui.treevirtual.SelectionManager();

  // Since we reset the selection manager, we need to set the selection model
  // manually.  (It was previously done in the Table constructor.)
  this.setSelectionModel(new qx.ui.table.SelectionModel);

  // Change focus colors.  Make them less obtrusive.
  this.setRowColors(
    {
      bgcolFocused             : "#f0f0f0",
      bgcolFocusedBlur         : "#f0f0f0"
    });

  // Set the cell focus color
  this.setCellFocusAttributes({ backgroundColor : "lightblue" });

/*
  // Use this instead, to help determine which does what
  this.setRowColors(
    {
      bgcolFocusedSelected     : "cyan",
      bgcolFocusedSelectedBlur : "green",
      bgcolFocused             : "yellow",
      bgcolFocusedBlur         : "blue",
      bgcolSelected            : "red",
      bgcolSelectedBlur        : "pink",
    });
*/

  // Get the list of pane scrollers
  var scrollers = this._getPaneScrollerArr();

  // For each scroller...
  for (var i = 0; i < scrollers.length; i++)
  {
    // ... remove the outline on focus, 
    scrollers[i]._focusIndicator.setAppearance("treevirtual-focus-indicator");

    // ... and set the pane scrollers to handle the selection before
    // displaying the focus, so we can manipulate the selected icon.
    scrollers[i].setSelectBeforeFocus(true);
  }

  // Arrange to select events locally. Replace the selection manager's method
  // with one that calls our _handleSelectEvent method first, and if it
  // indicates we should actually select the row, then call the selection
  // manager's method.  Our method handles deciding if the click was on the
  // open/close button, and toggling the opened/closed state as necessary.
  // The selection manager's method handles marking the selected row.
  var _this = this;
  this._getSelectionManager()._handleSelectEvent = function(index, evt)
  {
    var Sm = qx.ui.table.SelectionManager;
    var Tv = qx.ui.treevirtual.TreeVirtual;

    // Call our local method to toggle the open/close state, if necessary
    var bNoSelect = Tv.prototype._handleSelectEvent.call(_this, index, evt);

    // If we haven't been told not to do the selection...
    if (! bNoSelect)
    {
      // then call the Selection Manager's method to do it.
      Sm.prototype._handleSelectEvent.call(_this, index, evt);
    }
  };
});


/**
 * Whether a click on the open/close button should also cause selection of the
 * row.
 */
qx.OO.addProperty(
  {
    name         : "openCloseClickSelectsRow",
    type         : "boolean",
    defaultValue : false,
    getAlias     : "openCloseClickSelectsRow"
  });


/**
 * Return the data model for this tree.
 */
qx.Proto.getDataModel = function()
{
  return this.getTableModel();
};


/**
 * Set whether lines linking tree children shall be drawn on the tree.
 *
 * @param b {Boolean}
 *   <i>true</i> if tree lines should be shown; <i>false</i> otherwise.
 */
qx.Proto.setUseTreeLines = function(b)
{
  var stdcm = this.getTableModel();
  var treeCol = stdcm.getTreeColumn();
  var dcr = this.getTableColumnModel().getDataCellRenderer(treeCol);
  dcr.setUseTreeLines(b);

  // Inform the listeners
  if (stdcm.hasEventListeners(qx.ui.table.TableModel.EVENT_TYPE_DATA_CHANGED))
  {
    var data =
      {
        firstRow        : 0,
        lastRow         : stdcm._rowArr.length - 1,
        firstColumn     : 0,
        lastColumn      : stdcm.getColumnCount() - 1
      };

    stdcm.dispatchEvent(new qx.event.type.DataEvent(
                          qx.ui.table.TableModel.EVENT_TYPE_DATA_CHANGED,
                          data),
                        true);
  }
};


/**
 * Get whether lines linking tree children shall be drawn on the tree.
 *
 * @return {Boolean}
 *   <i>true</i> if tree lines are in use; <i>false</i> otherwise.
 */
qx.Proto.getUseTreeLines = function()
{
  var treeCol = this.getTableModel().getTreeColumn();
  var dcr = this.getTableColumnModel().getDataCellRenderer(treeCol);
  return dcr.getUseTreeLines();
}


/**
 * Set whether the open/close button should be displayed on a branch, even if
 * the branch has no children.
 *
 * @param b {Boolean}
 *   <i>true</i> if the open/close button should be shown; <i>false</i>
 *   otherwise.
 */
qx.Proto.setAlwaysShowOpenCloseSymbol = function(b)
{
  var stdcm = this.getTableModel();
  var treeCol = stdcm.getTreeColumn();
  var dcr = this.getTableColumnModel().getDataCellRenderer(treeCol);
  dcr.setAlwaysShowOpenCloseSymbol(b);

  // Inform the listeners
  if (stdcm.hasEventListeners(qx.ui.table.TableModel.EVENT_TYPE_DATA_CHANGED))
  {
    var data =
      {
        firstRow        : 0,
        lastRow         : stdcm._rowArr.length - 1,
        firstColumn     : 0,
        lastColumn      : stdcm.getColumnCount() - 1
      };

    stdcm.dispatchEvent(new qx.event.type.DataEvent(
                          qx.ui.table.TableModel.EVENT_TYPE_DATA_CHANGED,
                          data),
                        true);
  }
};


/**
 * Set whether drawing of first-level tree-node lines are disabled even if
 * drawing of tree lines is enabled.  (See also @link {#setUseTreeLines})
 *
 * @param b {Boolean}
 *   <i>true</i> if first-level tree lines should be disabled;
 *   <i>false</i> for normal operation.
 */
qx.Proto.setExcludeFirstLevelTreeLines = function(b)
{
  var stdcm = this.getTableModel();
  var treeCol = stdcm.getTreeColumn();
  var dcr = this.getTableColumnModel().getDataCellRenderer(treeCol);
  dcr.setExcludeFirstLevelTreeLines(b);

  // Inform the listeners
  if (stdcm.hasEventListeners(qx.ui.table.TableModel.EVENT_TYPE_DATA_CHANGED))
  {
    var data =
      {
        firstRow        : 0,
        lastRow         : stdcm._rowArr.length - 1,
        firstColumn     : 0,
        lastColumn      : stdcm.getColumnCount() - 1
      };

    stdcm.dispatchEvent(new qx.event.type.DataEvent(
                          qx.ui.table.TableModel.EVENT_TYPE_DATA_CHANGED,
                          data),
                        true);
  }
};


/**
 * Get whether drawing of first-level tree lines should be disabled even if
 * drawing of tree lines is enabled.  (See also {@link #getUseTreeLines})
 *
 * @return {Boolean}
 *   <i>true</i> if tree lines are in use; <i>false</i> otherwise.
 */
qx.Proto.getExcludeFirstLevelTreeLines = function()
{
  var treeCol = this.getTableModel().getTreeColumn();
  var dcr = this.getTableColumnModel().getDataCellRenderer(treeCol);
  return dcr.getExcludeFirstLevelTreeLines();
}


/**
 * Set whether the open/close button should be displayed on a branch, even if
 * the branch has no children.
 *
 * @return {Boolean}
 *   <i>true</i> if tree lines are in use; <i>false</i> otherwise.
 */
qx.Proto.getAlwaysShowOpenCloseSymbol = function()
{
  var treeCol = this.getTableModel().getTreeColumn();
  var dcr = this.getTableColumnModel().getDataCellRenderer(treeCol);
  return dcr.getAlwaysShowOpenCloseSymbol();
};


/**
 * Set the selection mode.
 *
 * @param mode {Integer}
 *   The selection mode to be used.  It may be any of:
 *   <pre>
 *     qx.ui.treevirtual.SelectionMode.NONE:
 *        Nothing can ever be selected.
 *
 *     qx.ui.treevirtual.SelectionMode.SINGLE
 *        Allow only one selected item.
 *
 *     qx.ui.treevirtual.SelectionMode.SINGLE_INTERVAL
 *        Allow one contiguous interval of selected items.
 *
 *     qx.ui.treevirtual.SelectionMode.MULTIPLE_INTERVAL
 *        Allow any selected items, whether contiguous or not.
 *   </pre>
 */
qx.Proto.setSelectionMode = function(mode)
{
  this.getSelectionModel().setSelectionMode(mode);
}

/**
 * Get the selection mode currently in use.
 *
 * @return {Integer}
 *   One of the values documented in {@link #setSelectionMode}
 */
qx.Proto.getSelectionMode = function(mode)
{
  return this.getSelectionModel().getSelectionMode();
}


/**
 * Toggle the opened state of the node: if the node is opened, close
 * it; if it is closed, open it.
 *
 * @param node {Object}
 *   The object representing the node to have its opened/closed state
 *   toggled.
 */
qx.Proto.toggleOpened = function(node)
{
  // Ignore toggle request if 'opened' is not a boolean (i.e. we've been
  // told explicitely not to display the open/close button).
  if (node.opened !== true && node.opened !== false)
  {
    return;
  }

  // Are we opening or closing?
  if (node.opened)
  {
    // We're closing.  If there are listeners, generate a treeClose event.
    this.createDispatchDataEvent("treeClose", node);
  }
  else
  {
    // We're opening.  Are there any children?
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

  // Event handler may have modified the opened state.  Check before toggling.
  if (node.opened === true || node.opened === false)
  {
    // It's still boolean.  Toggle the state
    node.opened = ! node.opened;

    // Get the selection model
    var sm = this.getSelectionModel();

    // Get the data model
    var dm = this.getTableModel();

    // Determine if this node was selected
    var rowIndex = dm.getNodeRowMap()[node.nodeId];

    // Is this row already selected?
    var bSelected = sm.isSelectedIndex(rowIndex);

    // Clear the old selections in the tree
    this.getSelectionModel()._clearSelection();

    // Clear the old selections in the data model
    dm._clearSelections();

    // If this row was selected, re-select it
    if (bSelected)
    {
      this.setState(node.nodeId, { bSelected : true });
    }
  }

  // Re-render the row data since formerly visible rows may now be invisible,
  // or vice versa.
  this.getTableModel().setData();
};


/**
 * Set state attributes of a tree node.
 *
 * @param nodeId {Integer}
 *   The node identifier (returned by addBranch() or addLeaf()) representing
 *   the node for which attributes are being set.
 *
 * @param attributes {Map}
 *   Map with the node properties to be set.  The map may contain any of the
 *   properties described in {@link qx.ui.treevirtual.SimpleTreeDataModel}
 */
qx.Proto.setState = function(nodeId, attributes)
{
  this.getTableModel().setState(nodeId, attributes);
};


/**
 * Allow setting the tree row colors.
 *
 * @param colors {Map}
 *    The value of each property in the map is a string containing either a
 *    number (e.g. "#518ad3") or color name ("white") representing the color
 *    for that type of display.  The map may contain any or all of the
 *    following properties:
 *    <ul>
 *      <li>bgcolFocusedSelected</li>
 *      <li>bgcolFocusedSelectedBlur</li>
 *      <li>bgcolFocused</li>
 *      <li>bgcolFocusedBlur</li>
 *      <li>bgcolSelected</li>
 *      <li>bgcolSelectedBlur</li>
 *      <li>bgcolEven</li>
 *      <li>bgcolOdd</li>
 *      <li>colSelected</li>
 *      <li>colNormal</li>
 *    </ul>
 */
qx.Proto.setRowColors = function(colors)
{
  this.getDataRowRenderer().setRowColors(colors);
};


/**
 * Set the attributes used to indicate the cell that has the focus.
 *
 * @param attributes {Map}
 *   The set of attributes that the cell focus indicator should have.  This is
 *   in the format required to call the <i>set()</i> method of a widget, e.g.
 *   <p>
 *   { backgroundColor: blue }
 *   <p>
 *   If not otherwise specified, the opacity is set to 0.2 so that the cell
 *   data can be seen "through" the cell focus indicator which overlays it.
 *   <p>
 *   For no visible focus indicator, use { backgroundColor : "transparent" }
 *   <p>
 *   The focus indicator is a box the size of the cell, which overlays the
 *   cell itself.  There is no text in the focus indicator itself, so it makes
 *   no sense to set the color attribute or any other attribute that affects
 *   fonts.
 */
qx.Proto.setCellFocusAttributes = function(attributes)
{
  // Add an opacity attribute so what's below the focus can be seen
  if (! attributes.opacity)
  {
    attributes.opacity = 0.2;
  }

  var scrollers = this._getPaneScrollerArr();
  for (var i = 0; i < scrollers.length; i++)
  {
    scrollers[i]._focusIndicator.set(attributes);
  }  
};


/**
 * Event handler. Called when a key was pressed.
 *
 * We handle the Enter key to toggle opened/closed tree state.  All
 * other keydown events are passed to our superclass.
 *
 * @param evt {Map} the event.
 */
qx.Proto._onkeydown = function(evt)
{
  var identifier = evt.getKeyIdentifier();

  var consumed = false;
  var modifiers = evt.getModifiers();
  if (modifiers == 0)
  {
    switch (identifier)
    {
    case "Enter":
      // Get the data model
      var dm = this.getTableModel();

      // Get the focused node
      var focusedRow = this.getFocusedRow();
      var treeCol = dm.getTreeColumn();
      var node = dm.getValue(treeCol, focusedRow);

      this.toggleOpened(node);
      consumed = true;
      break;

    case "Left":
      this.moveFocusedCell(-1, 0);
      break;

    case "Right":
      this.moveFocusedCell(1, 0);
      break;
    }
  }
  else if (modifiers == qx.event.type.DomEvent.CTRL_MASK)
  {
    switch (identifier)
    {
    case "Left":
      // Get the data model
      var dm = this.getTableModel();

      // Get the focused node
      var focusedRow = this.getFocusedRow();
      var treeCol = dm.getTreeColumn();
      var node = dm.getValue(treeCol, focusedRow);

      // If it's an open branch...
      if (node.type == qx.ui.treevirtual.SimpleTreeDataModel.Type.BRANCH &&
          node.opened)
      {
        // ... then close it
        this.toggleOpened(node);
      }
    
      // Reset the focus to the current node
      this.setFocusedCell(treeCol, focusedRow, true);

      consumed = true;
      break;

    case "Right":
      // Get the data model
      var dm = this.getTableModel();

      // Get the focused node
      var focusedRow = this.getFocusedRow();
      var treeCol = dm.getTreeColumn();
      var node = dm.getValue(treeCol, focusedRow);

      // If it's a closed branch...
      if (node.type == qx.ui.treevirtual.SimpleTreeDataModel.Type.BRANCH &&
          ! node.opened)
      {
        // ... then open it
        this.toggleOpened(node);
      }

      // Reset the focus to the current node
      this.setFocusedCell(treeCol, focusedRow, true);
    
      consumed = true;
      break;
    }
  }
  else if (modifiers == qx.event.type.DomEvent.SHIFT_MASK)
  {
    switch (identifier)
    {
      case "Left":
      // Get the data model
      var dm = this.getTableModel();

      // Get the focused node
      var focusedRow = this.getFocusedRow();
      var treeCol = dm.getTreeColumn();
      var node = dm.getValue(treeCol, focusedRow);

      // If we're not at the top-level already...
      if (node.parentNodeId)
      {
        // Find out what rendered row our parent node is at
        var rowIndex = dm.getNodeRowMap()[node.parentNodeId];
      
        // Set the focus to our parent
        this.setFocusedCell(this._focusedCol, rowIndex, true);
      }
      
      consumed = true;
      break;

      case "Right":
      // Get the data model
      var dm = this.getTableModel();

      // Get the focused node
      var focusedRow = this.getFocusedRow();
      var treeCol = dm.getTreeColumn();
      var node = dm.getValue(treeCol, focusedRow);

      // If we're on a branch...
      if (node.type == qx.ui.treevirtual.SimpleTreeDataModel.Type.BRANCH)
      {
        // ... then first ensure the branch is open
        if (! node.opened)
        {
          this.toggleOpened(node);
        }

        // If this node has children...
        if (node.children.length > 0)
        {
          // ... then move the focus to the first child
          this.moveFocusedCell(0, 1);
        }
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


qx.Proto._onkeypress = function(evt)
{
  var consumed = false;

  // Handle keys that are independant from the modifiers
  var identifier = evt.getKeyIdentifier();
  switch (identifier)
  {
    // Ignore events we already handled in _onkeydown
    case "Left":
    case "Right":
      consumed = true;
      break;
  }

  if (consumed)
  {
    evt.preventDefault();
    evt.stopPropagation();
  }
  else
  {
    // Let our superclass handle this event
    qx.ui.table.Table.prototype._onkeypress.call(this, evt);
  }
};



/**
 * Event handler. Called when the selection has changed.
 *
 * @param evt {Map} the event.
 */
qx.Proto._onSelectionChanged = function(evt)
{
  // Clear the old list of selected nodes
  this.getTableModel()._clearSelections();

  // If selections are allowed, pass an event to our listeners
  if (this.getSelectionMode() !=
      qx.ui.treevirtual.TreeVirtual.SelectionMode.NONE)
  {
    var selectedNodes = this._calculateSelectedNodes();

    // Get the now-focused
    this.createDispatchDataEvent("changeSelection", selectedNodes);
  }

  // Call the superclass method
  qx.ui.table.Table.prototype._onSelectionChanged.call(this, evt);
};


/**
 * Handles the a selection event
 *
 * @param index {Integer}
 *   The row index the mouse is pointing at.
 *
 * @param evt {Map}
 *   The mouse event.
 *
 * @return {Boolean}
 *   Returns <i>true</i> if the event was a click on the open/close button,
 *   <i>false</i> otherwise.
 */
qx.Proto._handleSelectEvent = function(index, evt)
{
  // Get the node to which this event applies
  var node = this.getTableModel().getValue(this.getFocusedColumn(),
                                           this.getFocusedRow());
  if (! node)
  {
    return false;
  }

  // Was this a mouse event?
  if (evt instanceof qx.event.type.MouseEvent)
  {
    // Yup.  Get the order of the columns
    var tcm = this.getTableColumnModel();
    var columnPositions = tcm._getColToXPosMap();

    // Calculate the position of the beginning of the tree column
    var treeCol = this.getTableModel().getTreeColumn();
    var left = qx.html.Location.getClientBoxLeft(this.getElement());
    for (i = 0; i < columnPositions[treeCol].visX; i++)
    {
      left += tcm.getColumnWidth(columnPositions[i].visX);
    }

    // Was the click on the open/close button?  That button begins at
    // (node.level - 1) * 19 + 2 (the latter for padding), and has width 19.
    // We add a bit of latitude to that.
    var x = evt.getClientX();
    var latitude = 2;

    var buttonPos = left + (node.level - 1) * 19 + 2;

    if (x >= buttonPos - latitude && x <= buttonPos + 19 + latitude)
    {
      // Yup.  Toggle the opened state for this node.
      this.toggleOpened(node);
      return this.openCloseClickSelectsRow() ? false : true;
    }
    else
    {
      return false;
    }
  }
  else
  {
    // See which key generated the event
    var identifier = evt.getKeyIdentifier();
    switch (identifier)
    {
    case "Space":
      // This should only select the row, not toggle the opened state
      return false;

    case "Enter":
      // Here we want to toggle the open state
      this.toggleOpened(node);
      return this.openCloseClickSelectsRow() ? false : true;

    default:
      // Unrecognized key.  Ignore it.
      return true;
    }
  }
};


/**
 * Obtain the entire hierarchy of labels from the root down to the specified
 * node.
 *
 * @param nodeId {Integer}
 *   The node id of the node for which the hierarchy is desired.
 *
 * @return {Array}
 *   The returned array contains one string for each label in the hierarchy of
 *   the node specified by the parameter.  Element 0 of the array contains the
 *   label of the root node, element 1 contains the label of the node
 *   immediately below root in the specified node's hierarchy, etc., down to
 *   the last element in the array contain the label of the node referenced by
 *   the parameter.
 */
qx.Proto.getHierarchy = function(nodeId)
{
  var _this = this;
  var components = [ ];

  function addHierarchy(nodeId)
  {
    // If we're at the root...
    if (! nodeId)
    {
      // ... then we're done
      return;
    }

    // Get the requested node
    var node = _this.getTableModel().getData()[nodeId];

    // Add its label to the hierarchy components
    components.unshift(node.label);

    // Call recursively to our parent node.
    addHierarchy(node.parentNodeId);
  }

  addHierarchy(nodeId);
  return components;
}


/**
 * Calculate and return the set of nodes which are currently selected by the
 * user, on the screen.  In the process of calculating which nodes are
 * selected, the nodes corresponding to the selected rows on the screen are
 * marked as selected by setting their <i>bSelected</i> property to true, and
 * all previously-selected nodes have their <i>bSelected</i> property reset to
 * false.
 *
 * @return {Array}
 *   An array of nodes matching the set of rows which are selected on the
 *   screen. 
 */
qx.Proto._calculateSelectedNodes = function()
{
  // Create an array of nodes that are now selected
  var stdcm = this.getTableModel();
  var selectedRanges = this.getSelectionModel().getSelectedRanges();
  var selectedNodes = [ ];
  var node;

  for (var i = 0; i < selectedRanges.length; i++)
  {
    for (var j = selectedRanges[i].minIndex;
         j <= selectedRanges[i].maxIndex;
         j++)
    {
      node = stdcm.getValue(stdcm.getTreeColumn(), j);
      stdcm.setState(node.nodeId, { bSelected : true });
      selectedNodes.push(node);
    }
  }

  return selectedNodes;
};


/**
 * Return the nodes that are currently selected.
 *
 * @return {Array}
 *   An array containing the nodes that are currently selected.
 */
qx.Proto.getSelectedNodes = function()
{
  return this.getTableModel().getSelectedNodes();
};


/*
 * Selection Modes {int}
 *
 *   NONE
 *     Nothing can ever be selected.
 *
 *   SINGLE
 *     Allow only one selected item.
 *
 *   SINGLE_INTERVAL
 *     Allow one contiguous interval of selected items.
 *
 *   MULTIPLE_INTERVAL
 *     Allow any set of selected items, whether contiguous or not.
 */
qx.Class.SelectionMode =
{
  NONE              :
    qx.ui.table.SelectionModel.NO_SELECTION,

  SINGLE            :
    qx.ui.table.SelectionModel.SINGLE_SELECTION,

  SINGLE_INTERVAL   :
    qx.ui.table.SelectionModel.SINGLE_INTERVAL_SELECTION,

  MULTIPLE_INTERVAL :
    qx.ui.table.SelectionModel.MULTIPLE_INTERVAL_SELECTION
};
