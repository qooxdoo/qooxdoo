/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 by STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Til Schneider (til132)

************************************************************************ */

/* ************************************************************************

#module(ui_table)

************************************************************************ */

/**
 * A table.
 *
 * @param tableModel {com.ptvag.webcomponent.ui.table.TableModel} The table
 *    model to read the data from.
 *
 * @implements TablePaneScroller
 */
qx.OO.defineClass("qx.ui.table.Table", qx.ui.layout.VerticalBoxLayout,
function(tableModel) {
  qx.ui.layout.VerticalBoxLayout.call(this);

  // Create the child widgets
  this._scrollerParent = new qx.ui.layout.HorizontalBoxLayout;
  this._scrollerParent.setDimension(qx.constant.Core.HUNDREDPERCENT, qx.constant.Core.FLEX);
  this._scrollerParent.setSpacing(1);

  this._statusBar = new qx.ui.basic.Label;
  this._statusBar.setAppearance("table-focus-statusbar");
  this._statusBar.setDimension(qx.constant.Core.HUNDREDPERCENT, qx.constant.Core.AUTO);

  this.add(this._scrollerParent, this._statusBar);

  this._columnVisibilityBt = new qx.ui.toolbar.ToolBarButton(null, "widget/table/selectColumnOrder.png");
  this._columnVisibilityBt.addEventListener("execute", this._onColumnVisibilityBtExecuted, this);

  // Create the models
  this._selectionManager = new qx.ui.table.SelectionManager;

  this.setSelectionModel(new qx.ui.table.SelectionModel);
  this.setTableColumnModel(new qx.ui.table.TableColumnModel);
  this.setTableModel(tableModel);

  // Update the status bar
  this._updateStatusBar();

  // create the main meta column
  this.setMetaColumnCounts([ -1 ]);

  // Make focusable
  this.setTabIndex(1);
  this.addEventListener(qx.constant.Event.KEYDOWN, this._onkeydown);
});

/** The selection model. */
qx.OO.addProperty({ name:"selectionModel", type:qx.constant.Type.OBJECT }); //, instance : "qx.ui.table.SelectionManager" });

/** The table model. */
qx.OO.addProperty({ name:"tableModel", type:qx.constant.Type.OBJECT }); //, instance : "qx.ui.table.TableModel" });

/** The table column model. */
qx.OO.addProperty({ name:"tableColumnModel", type:qx.constant.Type.OBJECT }); //, instance : "qx.ui.table.TableColumnModel" });

/** Whether to show the status bar */
qx.OO.addProperty({ name:"statusBarVisible", type:qx.constant.Type.BOOLEAN, defaultValue:true });

/** Whether to show the column visibility button */
qx.OO.addProperty({ name:"columnVisibilityButtonVisible", type:qx.constant.Type.BOOLEAN, defaultValue:true });

/**
 * {int[]} The number of columns per meta column. If the last array entry is -1,
 * this meta column will get the remaining columns.
 */
qx.OO.addProperty({ name:"metaColumnCounts", type:qx.constant.Type.OBJECT });


// property modifier
qx.Proto._modifySelectionModel = function(propValue, propOldValue, propData) {
  this._selectionManager.setSelectionModel(propValue);

  if (propOldValue != null) {
    propOldValue.removeEventListener("selectionChanged", this._onSelectionChanged, this);
  }
  propValue.addEventListener("selectionChanged", this._onSelectionChanged, this);

  var scrollerArr = this._getPaneScrollerArr();
  for (var i = 0; i < scrollerArr.length; i++) {
    scrollerArr[i].setSelectionModel(propValue);
  }

  return true;
}


// property modifier
qx.Proto._modifyTableModel = function(propValue, propOldValue, propData) {
  this.getTableColumnModel().init(propValue.getColumnCount());

  if (propOldValue != null) {
    propOldValue.removeEventListener(qx.ui.table.TableModel.EVENT_TYPE_META_DATA_CHANGED, this._onTableModelMetaDataChanged, this);
  }
  propValue.addEventListener(qx.ui.table.TableModel.EVENT_TYPE_META_DATA_CHANGED, this._onTableModelMetaDataChanged, this);

  var scrollerArr = this._getPaneScrollerArr();
  for (var i = 0; i < scrollerArr.length; i++) {
    scrollerArr[i].setTableModel(propValue);
  }
  return true;
}


// property modifier
qx.Proto._modifyTableColumnModel = function(propValue, propOldValue, propData) {
  if (propOldValue != null) {
    propOldValue.removeEventListener("visibilityChanged", this._onColVisibilityChanged, this);
    propOldValue.removeEventListener("widthChanged", this._onColWidthChanged, this);
    propOldValue.removeEventListener("orderChanged", this._onOrderChanged, this);
  }
  propValue.addEventListener("visibilityChanged", this._onColVisibilityChanged, this);
  propValue.addEventListener("widthChanged", this._onColWidthChanged, this);
  propValue.addEventListener("orderChanged", this._onOrderChanged, this);

  var scrollerArr = this._getPaneScrollerArr();
  for (var i = 0; i < scrollerArr.length; i++) {
    scrollerArr[i].setTableColumnModel(propValue);
  }
  return true;
};


// property modifier
qx.Proto._modifyStatusBarVisible = function(propValue, propOldValue, propData) {
  this._statusBar.setDisplay(propValue);

  if (propValue) {
    this._updateStatusBar();
  }
  return true;
};


// property modifier
qx.Proto._modifyColumnVisibilityButtonVisible = function(propValue, propOldValue, propData) {
  this._columnVisibilityBt.setDisplay(propValue);

  return true;
};


// property modifier
qx.Proto._modifyMetaColumnCounts = function(propValue, propOldValue, propData) {
  var metaColumnCounts = propValue;
  var scrollerArr = this._getPaneScrollerArr();

  // Remove the panes not needed any more
  this._cleanUpMetaColumns(metaColumnCounts.length);

  // Update the old panes
  var leftX = 0;
  for (var i = 0; i < scrollerArr.length; i++) {
    var paneScroller = scrollerArr[i];
    var paneModel = paneScroller.getTablePaneModel();
    paneModel.setFirstColumnX(leftX);
    paneModel.setMaxColumnCount(metaColumnCounts[i]);
    leftX += metaColumnCounts[i];
  }

  // Add the new panes
  if (metaColumnCounts.length > scrollerArr.length) {
    var selectionModel = this.getSelectionModel();
    var tableModel = this.getTableModel();
    var columnModel = this.getTableColumnModel();

    for (var i = scrollerArr.length; i < metaColumnCounts.length; i++) {
      var paneModel = new qx.ui.table.TablePaneModel(columnModel);
      paneModel.setFirstColumnX(leftX);
      paneModel.setMaxColumnCount(metaColumnCounts[i]);
      leftX += metaColumnCounts[i];

      var paneScroller = new qx.ui.table.TablePaneScroller(this);
      paneScroller.setSelectionModel(selectionModel);
      paneScroller.setTableModel(tableModel);
      paneScroller.setTableColumnModel(columnModel);
      paneScroller.setTablePaneModel(paneModel);

      // Register event listener for vertical scrolling
      paneScroller.addEventListener("changeScrollY", this._onScrollY, this);

      this._scrollerParent.add(paneScroller);
    }
  }

  // calculate the new row height
  var maxHeaderHeight = 0;
  var maxRowHeight = 0;
  for (var i = 0; i < scrollerArr.length; i++) {
    var headerHeight = scrollerArr[i].getHeader().calculateHeaderHeight();
    maxHeaderHeight = Math.max(headerHeight, maxHeaderHeight);

    var rowHeight = scrollerArr[i].getTablePane().calculateTableRowHeight();
    maxRowHeight = Math.max(rowHeight, maxRowHeight);
  }

  // Update all meta columns
  for (var i = 0; i < scrollerArr.length; i++) {
    var paneScroller = scrollerArr[i];
    var isLast = (i == (scrollerArr.length - 1));

    // Set the right header height
    paneScroller.getHeader().setHeight(maxHeaderHeight);

    // Set the right row height
    paneScroller.getTablePane().setTableRowHeight(maxRowHeight);

    // Put the _columnVisibilityBt in the top right corner of the last meta column
    paneScroller.setTopRightWidget(isLast ? this._columnVisibilityBt : null);
  }

  this._updateScrollerWidths();
  this._updateScrollBarVisibility();

  return true;
}


/**
 * Returns an array containing all TablePaneScrollers in this table.
 *
 * @return {TablePaneScroller[]} all TablePaneScrollers in this table.
 */
qx.Proto._getPaneScrollerArr = function() {
  return this._scrollerParent.getChildren();
}


/**
 * Returns a TablePaneScroller of this table.
 *
 * @param metaColumn {int} the meta column to get the TablePaneScroller for.
 * @return {TablePaneScroller} the TablePaneScroller.
 */
qx.Proto._getPaneScroller = function(metaColumn) {
  return this._getPaneScrollerArr()[metaColumn];
}


/**
 * Cleans up the meta columns.
 *
 * @param fromMetaColumn {int} the first meta column to clean up. All following
 *    meta columns will be cleaned up, too. All previous meta columns will
 *    stay unchanged. If 0 all meta columns will be cleaned up.
 */
qx.Proto._cleanUpMetaColumns = function(fromMetaColumn) {
  var scrollerArr = this._getPaneScrollerArr();
  if (scrollerArr != null) {
    for (var i = scrollerArr.length - 1; i >= fromMetaColumn; i--) {
      var paneScroller = scrollerArr[i];
      paneScroller.removeEventListener("changeScrollY", this._onScrollY, this);
      this._scrollerParent.remove(paneScroller);
      paneScroller.dispose();
    }
  }
}


/**
 * Event handler. Called when the selection has changed.
 *
 * @param evt {Map} the event.
 */
qx.Proto._onSelectionChanged = function(evt) {
  this._updateStatusBar();
}


/**
 * Event handler. Called when the table model meta data has changed.
 *
 * @param evt {Map} the event.
 */
qx.Proto._onTableModelMetaDataChanged = function(evt) {
  this._updateStatusBar();
}


/**
 * Event handler. Called when a TablePaneScroller has been scrolled vertically.
 *
 * @param evt {Map} the event.
 */
qx.Proto._onScrollY = function(evt) {
  if (! this._internalChange) {
    this._internalChange = true;

    // Set the same scroll position to all meta columns
    var scrollerArr = this._getPaneScrollerArr();
    for (var i = 0; i < scrollerArr.length; i++) {
      scrollerArr[i].setScrollY(evt.getData());
    }

    this._internalChange = false;
  }
}


/**
 * Event handler. Called when a key was pressed.
 *
 * @param evt {Map} the event.
 */
qx.Proto._onkeydown = function(evt) {
  var keyCode = evt.getKeyCode();

  if (keyCode == qx.event.type.KeyEvent.keys.space) {
    if (! this.isEditing()) {
      // No editing mode
      this._selectionManager.handleKeyDown(this._focusedRow, evt);
    }
  } else if (evt.getModifiers() == 0) {
    if (this.isEditing()) {
      // Editing mode
      switch (keyCode) {
        case qx.event.type.KeyEvent.keys.enter:
          this.stopEditing();
          var oldFocusedRow = this._focusedRow;
          this.moveFocusedCell(0, 1);
          if (this._focusedRow != oldFocusedRow) {
            this.startEditing();
          }
          break;
        case qx.event.type.KeyEvent.keys.esc:
          this.cancelEditing();
          this.focus();
          break;
      }
    } else {
      // No editing mode
      switch (keyCode) {
        case qx.event.type.KeyEvent.keys.left:
          this.moveFocusedCell(-1, 0);
          break;
        case qx.event.type.KeyEvent.keys.right:
          this.moveFocusedCell(1, 0);
          break;
        case qx.event.type.KeyEvent.keys.up:
          this.moveFocusedCell(0, -1);
          break;
        case qx.event.type.KeyEvent.keys.down:
          this.moveFocusedCell(0, 1);
          break;
        case qx.event.type.KeyEvent.keys.pageup:
        case qx.event.type.KeyEvent.keys.pagedown:
          var scroller = this._getPaneScroller(0);
          var pane = scroller.getTablePane();
          var rowCount = pane.getVisibleRowCount() - 1;
          var rowHeight = pane.getTableRowHeight();
          var direction = (keyCode == qx.event.type.KeyEvent.keys.pageup) ? -1 : 1;
          scroller.setScrollY(scroller.getScrollY() + direction * rowCount * rowHeight);
          this.moveFocusedCell(0, direction * rowCount);
          break;
        case qx.event.type.KeyEvent.keys.home:
          this.setFocusedCell(0, this._focusedRow, true);
          break;
        case qx.event.type.KeyEvent.keys.end:
          var colCount = this.getTableColumnModel().getVisibleColumnCount();
          this.setFocusedCell(colCount - 1, this._focusedRow, true);
          break;
        case qx.event.type.KeyEvent.keys.f2:
        case qx.event.type.KeyEvent.keys.enter:
          this.startEditing();
          break;
      }
    }
  } else if (evt.getModifiers() == qx.event.type.DomEvent.CTRL_MASK) {
    if (! this.isEditing()) {
      // No editing mode
      switch (keyCode) {
        case qx.event.type.KeyEvent.keys.home:
          this.setFocusedCell(this._focusedCol, 0, true);
          break;
        case qx.event.type.KeyEvent.keys.end:
          var rowCount = this.getTableModel().getRowCount();
          this.setFocusedCell(this._focusedCol, rowCount - 1, true);
          break;
      }
    }
  }
}


/**
 * Event handler. Called when the visibility of a column has changed.
 *
 * @param evt {Map} the event.
 */
qx.Proto._onColVisibilityChanged = function(evt) {
  this._updateScrollerWidths();
  this._updateScrollBarVisibility();
}


/**
 * Event handler. Called when the width of a column has changed.
 *
 * @param evt {Map} the event.
 */
qx.Proto._onColWidthChanged = function(evt) {
  this._updateScrollerWidths();
  this._updateScrollBarVisibility();
}


/**
 * Event handler. Called when the column order has changed.
 *
 * @param evt {Map} the event.
 */
qx.Proto._onOrderChanged = function(evt) {
  // A column may have been moved between meta columns
  this._updateScrollerWidths();
  this._updateScrollBarVisibility();
}


/**
 * Gets the TablePaneScroller at a certain x position in the page. If there is
 * no TablePaneScroller at this postion, null is returned.
 *
 * @param pageX {int} the position in the page to check (in pixels).
 * @return {TablePaneScroller} the TablePaneScroller or null.
 *
 * @see TablePaneScrollerPool
 */
// overridden from qx.ui.table.TablePaneScrollerPool
qx.Proto.getTablePaneScrollerAtPageX = function(pageX) {
  var metaCol = this._getMetaColumnAtPageX(pageX);
  return (metaCol != -1) ? this._getPaneScroller(metaCol) : null;
}


/**
 * Sets the currently focused cell.
 *
 * @param col {int} the model index of the focused cell's column.
 * @param row {int} the model index of the focused cell's row.
 * @param scrollVisible {boolean,false} whether to scroll the new focused cell
 *        visible.
 *
 * @see TablePaneScrollerPool
 */
// overridden from qx.ui.table.TablePaneScrollerPool
qx.Proto.setFocusedCell = function(col, row, scrollVisible) {
  if (!this.isEditing() && (col != this._focusedCol || row != this._focusedRow)) {
    this._focusedCol = col;
    this._focusedRow = row;

    var scrollerArr = this._getPaneScrollerArr();
    for (var i = 0; i < scrollerArr.length; i++) {
      scrollerArr[i].setFocusedCell(col, row);
    }

    if (scrollVisible) {
      this.scrollCellVisible(col, row);
    }
  }
}


/**
 * Moves the focus.
 *
 * @param deltaX {int} The delta by which the focus should be moved on the x axis.
 * @param deltaY {int} The delta by which the focus should be moved on the y axis.
 */
qx.Proto.moveFocusedCell = function(deltaX, deltaY) {
  var col = this._focusedCol;
  var row = this._focusedRow;

  if (deltaX != 0) {
    var columnModel = this.getTableColumnModel();
    var x = columnModel.getVisibleX(col);
    var colCount = columnModel.getVisibleColumnCount();
    x = qx.lang.Number.limit(x + deltaX, 0, colCount - 1);
    col = columnModel.getVisibleColumnAtX(x);
  }

  if (deltaY != 0) {
    var tableModel = this.getTableModel();
    row = qx.lang.Number.limit(row + deltaY, 0, tableModel.getRowCount() - 1);
  }

  this.setFocusedCell(col, row, true);
}


/**
 * Scrolls a cell visible.
 *
 * @param col {int} the model index of the column the cell belongs to.
 * @param row {int} the model index of the row the cell belongs to.
 */
qx.Proto.scrollCellVisible = function(col, row) {
  var columnModel = this.getTableColumnModel();
  var x = columnModel.getVisibleX(col);

  var metaColumn = this._getMetaColumnAtColumnX(x);
  if (metaColumn != -1) {
    this._getPaneScroller(metaColumn).scrollCellVisible(col, row);
  }
}


/**
 * Returns whether currently a cell is editing.
 *
 * @return whether currently a cell is editing.
 */
qx.Proto.isEditing = function() {
  if (this._focusedCol != null) {
    var x = this.getTableColumnModel().getVisibleX(this._focusedCol);
    var metaColumn = this._getMetaColumnAtColumnX(x);
    return this._getPaneScroller(metaColumn).isEditing();
  }
}


/**
 * Starts editing the currently focused cell. Does nothing if already editing
 * or if the column is not editable.
 *
 * @return {boolean} whether editing was started
 */
qx.Proto.startEditing = function() {
  if (this._focusedCol != null) {
    var x = this.getTableColumnModel().getVisibleX(this._focusedCol);
    var metaColumn = this._getMetaColumnAtColumnX(x);
    return this._getPaneScroller(metaColumn).startEditing();
  }
  return false;
}


/**
 * Stops editing and writes the editor's value to the model.
 */
qx.Proto.stopEditing = function() {
  if (this._focusedCol != null) {
    var x = this.getTableColumnModel().getVisibleX(this._focusedCol);
    var metaColumn = this._getMetaColumnAtColumnX(x);
    this._getPaneScroller(metaColumn).stopEditing();
  }
}


/**
 * Stops editing without writing the editor's value to the model.
 */
qx.Proto.cancelEditing = function() {
  if (this._focusedCol != null) {
    var x = this.getTableColumnModel().getVisibleX(this._focusedCol);
    var metaColumn = this._getMetaColumnAtColumnX(x);
    this._getPaneScroller(metaColumn).cancelEditing();
  }
}


/**
 * Gets the meta column at a certain x position in the page. If there is no
 * meta column at this postion, -1 is returned.
 *
 * @param pageX {int} the position in the page to check (in pixels).
 * @return {int} the index of the meta column or -1.
 */
qx.Proto._getMetaColumnAtPageX = function(pageX) {
  var scrollerArr = this._getPaneScrollerArr();
  for (var i = 0; i < scrollerArr.length; i++) {
    var elem = scrollerArr[i].getElement();
    if (pageX >= qx.dom.DomLocation.getPageBoxLeft(elem)
      && pageX <= qx.dom.DomLocation.getPageBoxRight(elem))
    {
      return i;
    }
  }

  return -1;
}


/**
 * Returns the meta column a column is shown in. If the column is not shown at
 * all, -1 is returned.
 *
 * @param visXPos {int} the visible x position of the column.
 * @return {int} the meta column the column is shown in.
 */
qx.Proto._getMetaColumnAtColumnX = function(visXPos) {
  var metaColumnCounts = this.getMetaColumnCounts();
  var rightXPos = 0;
  for (var i = 0; i < metaColumnCounts.length; i++) {
    var counts = metaColumnCounts[i];
    rightXPos += counts;

    if (counts == -1 || visXPos < rightXPos) {
      return i;
    }
  }

  return -1;
}


/**
 * Updates the text shown in the status bar.
 */
qx.Proto._updateStatusBar = function() {
  if (this.getStatusBarVisible()) {
    var selectedRowCount = this.getSelectionModel().getSelectedCount();
    var rowCount = this.getTableModel().getRowCount();

    var text;
    if (selectedRowCount == 0) {
      text = rowCount + ((rowCount == 1) ? " row" : " rows");
    } else {
      text = selectedRowCount + " of " + rowCount
        + ((rowCount == 1) ? " row" : " rows") + " selected";
    }
    this._statusBar.setHtml(text);
  }
}


/**
 * Updates the widths of all scrollers.
 */
qx.Proto._updateScrollerWidths = function() {
/*  no longer needed, per Til, and removing it does not appear to add problems.
 *  qx.ui.core.Widget.flushGlobalQueues();
 */

  // Give all scrollers except for the last one the wanted width
  // (The last one has a flex with)
  var scrollerArr = this._getPaneScrollerArr();
  for (var i = 0; i < scrollerArr.length; i++) {
    var isLast = (i == (scrollerArr.length - 1));
    var width = isLast ? qx.constant.Core.FLEX : scrollerArr[i].getTablePaneModel().getTotalWidth();
    scrollerArr[i].setWidth(width);
  }
}


/**
 * Updates the visibility of the scrollbars in the meta columns.
 */
qx.Proto._updateScrollBarVisibility = function() {
  if (this.isSeeable()) {
    var horBar = qx.ui.table.TablePaneScroller.HORIZONTAL_SCROLLBAR;
    var verBar = qx.ui.table.TablePaneScroller.VERTICAL_SCROLLBAR;
    var scrollerArr = this._getPaneScrollerArr();

    // Check which scroll bars are needed
    var horNeeded = false;
    var verNeeded = false;
    for (var i = 0; i < scrollerArr.length; i++) {
      var isLast = (i == (scrollerArr.length - 1));

      // Only show the last vertical scrollbar
      var bars = scrollerArr[i].getNeededScrollBars(horNeeded, !isLast);

      if (bars & horBar) {
        horNeeded = true;
      }
      if (isLast && (bars & verBar)) {
        verNeeded = true;
      }
    }

    // Set the needed scrollbars
    for (var i = 0; i < scrollerArr.length; i++) {
      var isLast = (i == (scrollerArr.length - 1));

      // Only show the last vertical scrollbar
      scrollerArr[i].setHorizontalScrollBarVisible(horNeeded);
      scrollerArr[i].setVerticalScrollBarVisible(isLast && verNeeded);
    }
  }
}


/**
 * Event handler. Called when the column visibiliy button was executed.
 */
qx.Proto._onColumnVisibilityBtExecuted = function() {
  if ((this._columnVisibilityMenuCloseTime == null)
    || (new Date().getTime() > this._columnVisibilityMenuCloseTime + 200))
  {
    this._toggleColumnVisibilityMenu();
  }
}


/**
 * Toggels the visibility of the menu used to change the visibility of columns.
 */
qx.Proto._toggleColumnVisibilityMenu = function() {
  if (this._columnVisibilityMenu == null || !this._columnVisibilityMenu.isSeeable()) {
    // Show the menu

    // Create the new menu
    var menu = new qx.ui.menu.Menu;

    menu.addEventListener(qx.constant.Event.DISAPPEAR, function(evt) {
      this._columnVisibilityMenuCloseTime = new Date().getTime();
    }, this);

    var tableModel = this.getTableModel();
    var columnModel = this.getTableColumnModel();
    for (var x = 0; x < columnModel.getOverallColumnCount(); x++) {
      var col = columnModel.getOverallColumnAtX(x);
      var visible = columnModel.isColumnVisible(col);
      var cmd = { col:col }
      var bt = new qx.ui.menu.MenuCheckBox(tableModel.getColumnName(col), null, visible);

      var handler = this._createColumnVisibilityCheckBoxHandler(col);
      bt._handler = handler;
      bt.addEventListener("execute", handler, this);

      menu.add(bt);
    }

    menu.setParent(this.getTopLevelWidget());

    this._columnVisibilityMenu = menu;

    // Show the menu
    var btElem = this._columnVisibilityBt.getElement();
    menu.setTop(qx.dom.DomLocation.getClientBoxBottom(btElem));
    var right = this.getRight();
    if (right === null) {
      // No 'right' available.  Get top-level widget: ClientDocument object.
      // From it, we get the ClientWindow object and from there, 'window'.
      var w = this.getTopLevelWidget().getWindow()._element;

      // Determine 'right' from window width and table width
      right = qx.dom.DomWindow.getInnerWidth(w) - this.getWidth();
    }
    menu.setRight(right);
    menu.show();
  } else {
    // hide the menu
    menu.hide();
    this._cleanupColumnVisibilityMenu();
  }
}


/**
 * Cleans up the column visibility menu.
 */
qx.Proto._cleanupColumnVisibilityMenu = function() {
  if (this._columnVisibilityMenu != null) {
    var scrollerArr = this._columnVisibilityMenu.getChildren();
    for (var i = scrollerArr.length - 1; i >= 0; i++) {
      var bt = scrollerArr[i];
      this._columnVisibilityMenu.remove(bt);
      bt.dispose();
    }

    this._columnVisibilityMenu.dispose();
    this._columnVisibilityMenu = null;
  }
}


/**
 * Creates a handler for a check box of the column visibility menu.
 *
 * @param col {int} the model index of column to create the handler for.
 */
qx.Proto._createColumnVisibilityCheckBoxHandler = function(col) {
  return function(evt) {
    var columnModel = this.getTableColumnModel();
    columnModel.setColumnVisible(col, !columnModel.isColumnVisible(col));
  }
}


/**
 * Sets the width of a column.
 *
 * @param col {int} the model index of column.
 * @param width {int} the new width in pixels.
 */
qx.Proto.setColumnWidth = function(col, width) {
  this.getTableColumnModel().setColumnWidth(col, width);
}


/**
 * Event handler. Called when the real width of the table has changed.
 *
 * @param newValue {int} the new width.
 * @param oldValue {int} the old width.
 */
qx.Proto._changeBoxWidth = function(newValue, oldValue) {
  var self = this;
  window.setTimeout(function() {
    self._updateScrollBarVisibility();
  }, 0);
}


// overridden
qx.Proto._afterAppear = function() {
  qx.ui.layout.VerticalBoxLayout.prototype._afterAppear.call(this);

  this._updateScrollBarVisibility();
}


// overridden
qx.Proto.dispose = function() {
  if (this.getDisposed()) {
    return true;
  }

  if (this._tableModel) {
    this._tableModel.removeEventListener(qx.ui.table.TableModel.EVENT_TYPE_META_DATA_CHANGED, this._onTableModelMetaDataChanged, this);
  }

  this._columnVisibilityBt.removeEventListener("execute", this._onColumnVisibilityBtExecuted, this);
  this._columnVisibilityBt.dispose();

  this._cleanupColumnVisibilityMenu();

  this._cleanUpMetaColumns(0);

  if (this._tableColumnModel) {
    this._tableColumnModel.removeEventListener("visibilityChanged", this._onColVisibilityChanged, this);
    this._tableColumnModel.removeEventListener("widthChanged", this._onColWidthChanged, this);
    this._tableColumnModel.removeEventListener("orderChanged", this._onOrderChanged, this);
  }

  return qx.ui.layout.VerticalBoxLayout.prototype.dispose.call(this);
}
