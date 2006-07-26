/* ************************************************************************

   qooxdoo - the new era of web development

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany
     http://www.1und1.de | http://www.1and1.com
     All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.org

   Authors:
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (ecker)
       <andreas dot ecker at 1und1 dot de>
     * Til Schneider (til132)
       <tilman dot schneider at stz-ida dot de>

************************************************************************ */

/* ************************************************************************

#module(table)
#require(qx.ui.layout.VerticalBoxLayout)
#require(qx.ui.table.SelectionModel)
#require(qx.ui.table.TableModel)
#require(qx.ui.table.TableColumnModel)
#require(qx.ui.table.TablePaneModel)
#use(qx.ui.core.ScrollBar)
#use(qx.constant.Core)
#use(qx.constant.Style)
#use(qx.ui.layout.HorizontalBoxLayout)
#use(qx.ui.basic.Terminator)

************************************************************************ */

/**
 * Shows a whole meta column. This includes a {@link TablePaneHeader},
 * a {@link TablePane} and the needed scroll bars. This class handles the
 * virtual scrolling and does all the mouse event handling.
 *
 * @param scrollerPool {TablePaneScrollerPool} the scroller pool the scroller
 *        belongs to.
 */
qx.OO.defineClass("qx.ui.table.TablePaneScroller", qx.ui.layout.VerticalBoxLayout,
function(scrollerPool) {
  qx.ui.layout.VerticalBoxLayout.call(this);

  this._scrollerPool = scrollerPool;

  // init scrollbars
  this._verScrollBar = new qx.ui.core.ScrollBar(false);
  this._horScrollBar = new qx.ui.core.ScrollBar(true);

  var scrollBarWidth = this._verScrollBar.getPreferredBoxWidth();

  this._verScrollBar.setWidth(qx.constant.Core.AUTO);
  this._horScrollBar.setHeight(qx.constant.Core.AUTO);
  this._horScrollBar.setPaddingRight(scrollBarWidth);
  //this._verScrollBar.setMergeEvents(true);

  this._horScrollBar.addEventListener("changeValue", this._onScrollX, this);
  this._verScrollBar.addEventListener("changeValue", this._onScrollY, this);

  // init header
  this._header = new qx.ui.table.TablePaneHeader;
  this._header.set({ width:qx.constant.Core.AUTO, height:qx.constant.Core.AUTO });

  this._headerClipper = new qx.ui.layout.CanvasLayout;
  with (this._headerClipper) {
    setDimension(qx.constant.Core.FLEX, qx.constant.Core.AUTO);
    setOverflow(qx.constant.Style.OVERFLOW_HIDDEN);
    add(this._header);
  }

  this._spacer = new qx.ui.basic.Terminator;
  this._spacer.setWidth(scrollBarWidth);

  this._top = new qx.ui.layout.HorizontalBoxLayout;
  with (this._top) {
    setHeight(qx.constant.Core.AUTO);
    add(this._headerClipper, this._spacer);
  }

  // init pane
  this._tablePane = new qx.ui.table.TablePane;
  this._tablePane.set({ width:qx.constant.Core.AUTO, height:qx.constant.Core.AUTO });

  this._focusIndicator = new qx.ui.layout.HorizontalBoxLayout;
  this._focusIndicator.setAppearance("table-focus-indicator");
  this._focusIndicator.hide();

  // Workaround: If the _focusIndicator has no content if always gets a too
  //       high hight in IE.
  var dummyContent = new qx.ui.basic.Terminator;
  dummyContent.setWidth(0);
  this._focusIndicator.add(dummyContent);

  this._paneClipper = new qx.ui.layout.CanvasLayout;
  with (this._paneClipper) {
    setWidth(qx.constant.Core.FLEX);
    setOverflow(qx.constant.Style.OVERFLOW_HIDDEN);
    add(this._tablePane, this._focusIndicator);
    addEventListener(qx.constant.Event.MOUSEWHEEL, this._onmousewheel, this);
  }

  // add all child widgets
  var scrollerBody = new qx.ui.layout.HorizontalBoxLayout;
  scrollerBody.setHeight(qx.constant.Core.FLEX);
  scrollerBody.add(this._paneClipper, this._verScrollBar);

  this.add(this._top, scrollerBody, this._horScrollBar);

  // init managers
  this._selectionManager = new qx.ui.table.SelectionManager;

  // init event handlers
  this.addEventListener(qx.constant.Event.MOUSEMOVE, this._onmousemove, this);
  this.addEventListener(qx.constant.Event.MOUSEDOWN, this._onmousedown, this);
  this.addEventListener(qx.constant.Event.MOUSEUP,   this._onmouseup,   this);
  this.addEventListener(qx.constant.Event.CLICK,     this._onclick,     this);
  this.addEventListener(qx.constant.Event.DBLCLICK,  this._ondblclick,  this);
  this.addEventListener(qx.constant.Event.MOUSEOUT,  this._onmouseout,  this);
});

/** Whether to show the horizontal scroll bar */
qx.OO.addProperty({ name:"horizontalScrollBarVisible", type:qx.constant.Type.BOOLEAN, defaultValue:true });

/** Whether to show the vertical scroll bar */
qx.OO.addProperty({ name:"verticalScrollBarVisible", type:qx.constant.Type.BOOLEAN, defaultValue:true });

/** The selection model. */
qx.OO.addProperty({ name:"selectionModel", type:qx.constant.Type.OBJECT, instance : "qx.ui.table.SelectionModel" });

/** The table model. */
qx.OO.addProperty({ name:"tableModel", type:qx.constant.Type.OBJECT, instance : "qx.ui.table.TableModel" });

/** The table column model. */
qx.OO.addProperty({ name:"tableColumnModel", type:qx.constant.Type.OBJECT, instance : "qx.ui.table.TableColumnModel" });

/** The table pane model. */
qx.OO.addProperty({ name:"tablePaneModel", type:qx.constant.Type.OBJECT, instance : "qx.ui.table.TablePaneModel" });

/** The current position of the the horizontal scroll bar. */
qx.OO.addProperty({ name:"scrollX", type:qx.constant.Type.NUMBER, allowNull:false, defaultValue:0 });

/** The current position of the the vertical scroll bar. */
qx.OO.addProperty({ name:"scrollY", type:qx.constant.Type.NUMBER, allowNull:false, defaultValue:0 });

/**
 * Whether column resize should be live. If false, during resize only a line is
 * shown and the real resize happens when the user releases the mouse button.
 */
qx.OO.addProperty({ name:"liveResize", type:qx.constant.Type.BOOLEAN, defaultValue:false });


// property modifier
qx.Proto._modifyHorizontalScrollBarVisible = function(propValue, propOldValue, propData) {
  // Workaround: We can't use setDisplay, because the scroll bar needs its
  //       correct height in order to check its value. When using
  //       setDisplay(false) the height isn't relayouted any more
  if (propValue) {
    this._horScrollBar.setHeight(qx.constant.Core.AUTO);
  } else {
    this._horScrollBar.setHeight(0);
  }
  this._horScrollBar.setVisibility(propValue);

  // NOTE: We have to flush the queues before updating the content so the new
  //     layout has been applied and _updateContent is able to work with
  //     correct values.
  qx.ui.core.Widget.flushGlobalQueues();
  this._updateContent();

  return true;
}


// property modifier
qx.Proto._modifyVerticalScrollBarVisible = function(propValue, propOldValue, propData) {
  // Workaround: See _modifyHorizontalScrollBarVisible
  if (propValue) {
    this._verScrollBar.setWidth(qx.constant.Core.AUTO);
  } else {
    this._verScrollBar.setWidth(0);
  }
  this._verScrollBar.setVisibility(propValue);

  var scrollBarWidth = propValue ? this._verScrollBar.getPreferredBoxWidth() : 0;
  this._horScrollBar.setPaddingRight(scrollBarWidth);
  this._spacer.setWidth(scrollBarWidth);

  return true;
}


// property modifier
qx.Proto._modifySelectionModel = function(propValue, propOldValue, propData) {
  this._selectionManager.setSelectionModel(propValue);
  this._tablePane.setSelectionModel(propValue);
  return true;
}


// property modifier
qx.Proto._modifyTableModel = function(propValue, propOldValue, propData) {
  this._header.setTableModel(propValue);
  this._tablePane.setTableModel(propValue);
  return true;
}


// property modifier
qx.Proto._modifyTableColumnModel = function(propValue, propOldValue, propData) {
  this._header.setTableColumnModel(propValue);
  this._tablePane.setTableColumnModel(propValue);

  if (propOldValue != null) {
    propOldValue.removeEventListener("visibilityChanged", this._onColVisibilityChanged, this);
    propOldValue.removeEventListener("widthChanged", this._onColWidthChanged, this);
    propOldValue.removeEventListener("orderChanged", this._onOrderChanged, this);
  }
  propValue.addEventListener("visibilityChanged", this._onColVisibilityChanged, this);
  propValue.addEventListener("widthChanged", this._onColWidthChanged, this);
  propValue.addEventListener("orderChanged", this._onOrderChanged, this);

  return true;
}


// property modifier
qx.Proto._modifyTablePaneModel = function(propValue, propOldValue, propData) {
  this._header.setTablePaneModel(propValue);
  this._tablePane.setTablePaneModel(propValue);
  return true;
}


// property modifier
qx.Proto._modifyScrollX = function(propValue, propOldValue, propData) {
  this._horScrollBar.setValue(propValue);
  return true;
}


// property modifier
qx.Proto._modifyScrollY = function(propValue, propOldValue, propData) {
  this._verScrollBar.setValue(propValue);
  return true;
}


/**
 * Event handler. Called when the visibility of a column has changed.
 *
 * @param evt {Map} the event.
 */
qx.Proto._onColVisibilityChanged = function(evt) {
  this._updateHorScrollBarMaximum();
  this._updateFocusIndicator();
}


/**
 * Event handler. Called when the width of a column has changed.
 *
 * @param evt {Map} the event.
 */
qx.Proto._onColWidthChanged = function(evt) {
  var data = evt.getData();
  var paneModel = this.getTablePaneModel();
  var x = paneModel.getX(data.col);
  if (x != -1) {
    // The change was in this scroller
    this._updateHorScrollBarMaximum();
    this._updateFocusIndicator();
  }
}


/**
 * Event handler. Called when the column order has changed.
 *
 * @param evt {Map} the event.
 */
qx.Proto._onOrderChanged = function(evt) {
  this._updateHorScrollBarMaximum();
}


/**
 * Updates the maximum of the horizontal scroll bar, so it corresponds to the
 * total width of the columns in the table pane.
 */
qx.Proto._updateHorScrollBarMaximum = function() {
  this._horScrollBar.setMaximum(this.getTablePaneModel().getTotalWidth());
}


// overridden
qx.Proto._changeInnerHeight = function(newValue, oldValue) {
  // The height has changed -> Update content
  this._postponedUpdateContent();

  return qx.ui.layout.VerticalBoxLayout.prototype._changeInnerHeight.call(this, newValue, oldValue);
}


// overridden
qx.Proto._afterAppear = function() {
  qx.ui.layout.VerticalBoxLayout.prototype._afterAppear.call(this);

  this._updateContent();
  this._header._updateContent();
  this._updateHorScrollBarMaximum();

  var rowCount = this.getTableModel().getRowCount();
  var rowHeight = this._tablePane.getTableRowHeight();
  this._verScrollBar.setMaximum(rowCount * rowHeight);
}


/**
 * Event handler. Called when the horizontal scroll bar moved.
 *
 * @param evt {Map} the event.
 */
qx.Proto._onScrollX = function(evt) {
  // Workaround: See _updateContent
  this._header.setLeft(-evt.getData());

  this._paneClipper.setScrollLeft(evt.getData());
  this.setScrollX(evt.getData());
}


/**
 * Event handler. Called when the vertical scroll bar moved.
 *
 * @param evt {Map} the event.
 */
qx.Proto._onScrollY = function(evt) {
  this._postponedUpdateContent();
  this.setScrollY(evt.getData());
}


/**
 * Event handler. Called when the user moved the mouse wheel.
 *
 * @param evt {Map} the event.
 */
qx.Proto._onmousewheel = function(evt) {
  this._verScrollBar.setValue(this._verScrollBar.getValue()
    - evt.getWheelDelta() * this._tablePane.getTableRowHeight());

  // Update the focus
  if (this._lastMousePageX) {
    this._focusCellAtPagePos(this._lastMousePageX, this._lastMousePageY);
  }
}


/**
 * Event handler. Called when the user moved the mouse.
 *
 * @param evt {Map} the event.
 */
qx.Proto._onmousemove = function(evt) {
  var tableModel = this.getTableModel();
  var columnModel = this.getTableColumnModel();

  var useResizeCursor = false;
  var mouseOverColumn = null;

  var pageX = evt.getPageX();
  var pageY = evt.getPageY();

  // Workaround: In onmousewheel the event has wrong coordinates for pageX
  //       and pageY. So we remember the last move event.
  this._lastMousePageX = pageX;
  this._lastMousePageY = pageY;

  if (this._resizeColumn != null) {
    // We are currently resizing -> Update the position
    var minColumnWidth = qx.ui.table.TablePaneScroller.MIN_COLUMN_WIDTH;
    var newWidth = Math.max(minColumnWidth, this._lastResizeWidth + pageX - this._lastResizeMousePageX);

    if (this.getLiveResize()) {
      columnModel.setColumnWidth(this._resizeColumn, newWidth);
    } else {
      this._header.setColumnWidth(this._resizeColumn, newWidth);

      var paneModel = this.getTablePaneModel();
      this._showResizeLine(paneModel.getColumnLeft(this._resizeColumn) + newWidth);
    }

    useResizeCursor = true;
    this._lastResizeMousePageX += newWidth - this._lastResizeWidth;
    this._lastResizeWidth = newWidth;
  } else if (this._moveColumn != null) {
    // We are moving a column
    this._lastMoveColPos += pageX - this._lastMoveMousePageX;

    this._header.showColumnMoveFeedback(this._moveColumn, this._lastMoveColPos);

    // Get the responsible scroller
    var targetScroller = this._scrollerPool ? this._scrollerPool.getTablePaneScrollerAtPageX(pageX) : this;
    if (this._lastMoveTargetScroller && this._lastMoveTargetScroller != targetScroller) {
      this._lastMoveTargetScroller.hideColumnMoveFeedback();
    }
    if (targetScroller != null) {
      this._lastMoveTargetX = targetScroller.showColumnMoveFeedback(pageX);
    } else {
      this._lastMoveTargetX = null;
    }

    this._lastMoveTargetScroller = targetScroller;
    this._lastMoveMousePageX = pageX;
  } else {
    // This is a normal mouse move
    var row = this._getRowForPagePos(pageX, pageY);
    if (row == -1) {
      // The mouse is over the header
      var resizeCol = this._getResizeColumnForPageX(pageX);
      if (resizeCol != -1) {
        // The mouse is over a resize region -> Show the right cursor
        useResizeCursor = true;
      } else {
        var col = this._getColumnForPageX(pageX);
        if (col != null && tableModel.isColumnSortable(col)) {
          mouseOverColumn = col;
        }
      }
    } else if (row != null) {
      // The mouse is over the data -> update the focus
      this._focusCellAtPagePos(pageX, pageY);
    }
  }

  // Workaround: Setting the cursor to the right widget doesn't work
  //this._header.setCursor(useResizeCursor ? "e-resize" : null);
  this.getTopLevelWidget().setGlobalCursor(useResizeCursor ? qx.ui.table.TablePaneScroller.CURSOR_RESIZE_HORIZONTAL : null);

  this._header.setMouseOverColumn(mouseOverColumn);
}


/**
 * Event handler. Called when the user pressed a mouse button.
 *
 * @param evt {Map} the event.
 */
qx.Proto._onmousedown = function(evt) {
  var tableModel = this.getTableModel();
  var columnModel = this.getTableColumnModel();

  var pageX = evt.getPageX();
  var pageY = evt.getPageY();
  var row = this._getRowForPagePos(pageX, pageY);
  if (row == -1) {
    // mouse is in header
    var resizeCol = this._getResizeColumnForPageX(pageX);
    if (resizeCol != -1) {
      // The mouse is over a resize region -> Start resizing
      this._resizeColumn = resizeCol;
      this._lastResizeMousePageX = pageX;
      this._lastResizeWidth = columnModel.getColumnWidth(this._resizeColumn);
      this.setCapture(true);
    } else {
      // The mouse is not in a resize region
      var col = this._getColumnForPageX(pageX);
      if (col != null) {
        // Prepare column moving
        this._moveColumn = col;
        this._lastMoveMousePageX = pageX;
        this._lastMoveColPos = this.getTablePaneModel().getColumnLeft(col);
        this.setCapture(true);
      }
    }
  } else if (row != null) {
    this._selectionManager.handleMouseDown(row, evt);
  }
}


/**
 * Event handler. Called when the user released a mouse button.
 *
 * @param evt {Map} the event.
 */
qx.Proto._onmouseup = function(evt) {
  var columnModel = this.getTableColumnModel();
  var paneModel = this.getTablePaneModel();

  if (this._resizeColumn != null) {
    // We are currently resizing -> Finish resizing
    if (! this.getLiveResize()) {
      this._hideResizeLine();
      columnModel.setColumnWidth(this._resizeColumn, this._lastResizeWidth);
    }

    this._resizeColumn = null;
    this.setCapture(false);

    this.getTopLevelWidget().setGlobalCursor(null);
  } else if (this._moveColumn != null) {
    // We are moving a column -> Drop the column
    this._header.hideColumnMoveFeedback();
    if (this._lastMoveTargetScroller) {
      this._lastMoveTargetScroller.hideColumnMoveFeedback();
    }

    if (this._lastMoveTargetX != null) {
      var fromVisXPos = paneModel.getFirstColumnX() + paneModel.getX(this._moveColumn);
      var toVisXPos = this._lastMoveTargetX;
      if (toVisXPos != fromVisXPos && toVisXPos != fromVisXPos + 1) {
        // The column was really moved to another position
        // (and not moved before or after itself, which is a noop)

        // Translate visible positions to overall positions
        var fromCol = columnModel.getVisibleColumnAtX(fromVisXPos);
        var toCol   = columnModel.getVisibleColumnAtX(toVisXPos);
        var fromOverXPos = columnModel.getOverallX(fromCol);
        var toOverXPos = (toCol != null) ? columnModel.getOverallX(toCol) : columnModel.getOverallColumnCount();

        if (toOverXPos > fromOverXPos) {
          // Don't count the column itself
          toOverXPos--;
        }

        // Move the column
        columnModel.moveColumn(fromOverXPos, toOverXPos);
      }
    }

    this._moveColumn = null;
    this._lastMoveTargetX = null;
    this.setCapture(false);
  } else {
    // This is a normal mouse up
    var row = this._getRowForPagePos(evt.getPageX(), evt.getPageY());
    if (row != -1 && row != null) {
      this._selectionManager.handleMouseUp(row, evt);
    }
  }
}


/**
 * Event handler. Called when the user clicked a mouse button.
 *
 * @param evt {Map} the event.
 */
qx.Proto._onclick = function(evt) {
  var tableModel = this.getTableModel();

  var pageX = evt.getPageX();
  var pageY = evt.getPageY();
  var row = this._getRowForPagePos(pageX, pageY);
  if (row == -1) {
    // mouse is in header
    var resizeCol = this._getResizeColumnForPageX(pageX);
    if (resizeCol == -1) {
      // mouse is not in a resize region
      var col = this._getColumnForPageX(pageX);
      if (col != null && tableModel.isColumnSortable(col)) {
        // Sort that column
        var sortCol = tableModel.getSortColumnIndex();
        var ascending = (col != sortCol) ? true : !tableModel.isSortAscending();

        tableModel.sortByColumn(col, ascending);
        this.getSelectionModel().clearSelection();
      }
    }
  } else if (row != null) {
    this._selectionManager.handleClick(row, evt);
  }
}


/**
 * Event handler. Called when the user double clicked a mouse button.
 *
 * @param evt {Map} the event.
 */
qx.Proto._ondblclick = function(evt) {
  if (! this.isEditing()) {
    this._focusCellAtPagePos(evt.getPageX(), evt.getPageY());
    this.startEditing();
  }
}


/**
 * Event handler. Called when the mouse moved out.
 *
 * @param evt {Map} the event.
 */
qx.Proto._onmouseout = function(evt) {
  /*
  // Workaround: See _onmousemove
  this._lastMousePageX = null;
  this._lastMousePageY = null;
  */

  // Reset the resize cursor when the mouse leaves the header
  // If currently a column is resized then do nothing
  // (the cursor will be reset on mouseup)
  if (this._resizeColumn != null) {
    this.getTopLevelWidget().setGlobalCursor(null);
  }

  this._header.setMouseOverColumn(null);
}


/**
 * Shows the resize line.
 *
 * @param x {int} the position where to show the line (in pixels, relative to
 *    the left side of the pane).
 */
qx.Proto._showResizeLine = function(x) {
  var resizeLine = this._resizeLine;
  if (resizeLine == null) {
    resizeLine = new qx.ui.basic.Terminator;
    resizeLine.setBackgroundColor("#D6D5D9");
    resizeLine.setWidth(3);
    this._paneClipper.add(resizeLine);
    qx.ui.core.Widget.flushGlobalQueues();

    this._resizeLine = resizeLine;
  }

  resizeLine._applyRuntimeLeft(x - 2); // -1 for the width
  resizeLine._applyRuntimeHeight(this._paneClipper.getBoxHeight() + this._paneClipper.getScrollTop());

  this._resizeLine.removeStyleProperty(qx.constant.Style.PROPERTY_VISIBILITY);
}


/**
 * Hides the resize line.
 */
qx.Proto._hideResizeLine = function() {
  this._resizeLine.setStyleProperty(qx.constant.Style.PROPERTY_VISIBILITY, qx.constant.Core.HIDDEN);
}


/**
 * Shows the feedback shown while a column is moved by the user.
 *
 * @param pageX {int} the x position of the mouse in the page (in pixels).
 * @return {int} the visible x position of the column in the whole table.
 */
qx.Proto.showColumnMoveFeedback = function(pageX) {
  var paneModel = this.getTablePaneModel();
  var columnModel = this.getTableColumnModel();
  var paneLeftX = qx.dom.DomLocation.getClientBoxLeft(this._tablePane.getElement());
  var colCount = paneModel.getColumnCount();

  var targetXPos = 0;
  var targetX = 0;
  var currX = paneLeftX;
  for (var xPos = 0; xPos < colCount; xPos++) {
    var col = paneModel.getColumnAtX(xPos);
    var colWidth = columnModel.getColumnWidth(col);

    if (pageX < currX + colWidth / 2) {
      break;
    }

    currX += colWidth;
    targetXPos = xPos + 1;
    targetX = currX - paneLeftX;
  }

  // Ensure targetX is visible
  var clipperLeftX = qx.dom.DomLocation.getClientBoxLeft(this._paneClipper.getElement());
  var clipperWidth = this._paneClipper.getBoxWidth();
  var scrollX = clipperLeftX - paneLeftX;
  // NOTE: +2/-1 because of feedback width
  targetX = qx.lang.Number.limit(targetX, scrollX + 2, scrollX + clipperWidth - 1);

  this._showResizeLine(targetX);

  // Return the overall target x position
  return paneModel.getFirstColumnX() + targetXPos;
}


/**
 * Hides the feedback shown while a column is moved by the user.
 */
qx.Proto.hideColumnMoveFeedback = function() {
  this._hideResizeLine();
}


/**
 * Sets the focus to the cell that's located at the page position
 * <code>pageX</code>/<code>pageY</code>. If there is no cell at that position,
 * nothing happens.
 *
 * @param pageX {int} the x position in the page (in pixels).
 * @param pageY {int} the y position in the page (in pixels).
 */
qx.Proto._focusCellAtPagePos = function(pageX, pageY) {
  var row = this._getRowForPagePos(pageX, pageY);
  if (row != -1 && row != null) {
    // The mouse is over the data -> update the focus
    var col = this._getColumnForPageX(pageX);
    if (col != null) {
      if (this._scrollerPool != null) {
        this._scrollerPool.setFocusedCell(col, row);
      } else {
        this.setFocusedCell(col, row);
      }
    }
  }
}


/**
 * Sets the currently focused cell.
 *
 * @param col {int} the model index of the focused cell's column.
 * @param row {int} the model index of the focused cell's row.
 */
qx.Proto.setFocusedCell = function(col, row) {
  if (!this.isEditing()) {
    this._tablePane.setFocusedCell(col, row, this._updateContentPlanned);

    this._focusedCol = col;
    this._focusedRow = row;

    // Move the focus indicator
    if (! this._updateContentPlanned) {
      this._updateFocusIndicator();
    }
  }
}


/**
 * Scrolls a cell visible.
 *
 * @param col {int} the model index of the column the cell belongs to.
 * @param row {int} the model index of the row the cell belongs to.
 */
qx.Proto.scrollCellVisible = function(col, row) {
  var paneModel = this.getTablePaneModel();
  var xPos = paneModel.getX(col);

  if (xPos != -1) {
    var columnModel = this.getTableColumnModel();

    var colLeft = paneModel.getColumnLeft(col);
    var colWidth = columnModel.getColumnWidth(col);
    var rowHeight = this._tablePane.getTableRowHeight();
    var rowTop = row * rowHeight;

    var scrollX = this.getScrollX();
    var scrollY = this.getScrollY();
    var viewWidth = this._paneClipper.getBoxWidth();
    var viewHeight = this._paneClipper.getBoxHeight();

    // NOTE: We don't use qx.lang.Number.limit, because min should win if max < min
    var minScrollX = Math.min(colLeft, colLeft + colWidth - viewWidth);
    var maxScrollX = colLeft;
    this.setScrollX(Math.max(minScrollX, Math.min(maxScrollX, scrollX)));

    var minScrollY = rowTop + rowHeight - viewHeight;
    var maxScrollY = rowTop;
    this.setScrollY(Math.max(minScrollY, Math.min(maxScrollY, scrollY)));
  }
}


/**
 * Returns whether currently a cell is editing.
 *
 * @return whether currently a cell is editing.
 */
qx.Proto.isEditing = function() {
  return this._cellEditor != null;
}


/**
 * Starts editing the currently focused cell. Does nothing if already editing
 * or if the column is not editable.
 *
 * @return {boolean} whether editing was started
 */
qx.Proto.startEditing = function() {
  var tableModel = this.getTableModel();
  var col   = this._focusedCol;

  if (!this.isEditing() && (col != null) && tableModel.isColumnEditable(col)) {
    var row   = this._focusedRow;
    var xPos  = this.getTablePaneModel().getX(col);
    var value = tableModel.getValue(col, row);

    this._cellEditorFactory = this.getTableColumnModel().getCellEditorFactory(col);
    var cellInfo = { col:col, row:row, xPos:xPos, value:value }
    this._cellEditor = this._cellEditorFactory.createCellEditor(cellInfo);
    this._cellEditor.set({ width:qx.constant.Core.HUNDREDPERCENT, height:qx.constant.Core.HUNDREDPERCENT });

    this._focusIndicator.add(this._cellEditor);
    this._focusIndicator.addState("editing");

    this._cellEditor.addEventListener("changeFocused", this._onCellEditorFocusChanged, this);

    // Workaround: Calling focus() directly has no effect
    var editor = this._cellEditor;
    window.setTimeout(function() {
      editor.focus();
    }, 0);

    return true;
  }

  return false;
}


/**
 * Stops editing and writes the editor's value to the model.
 */
qx.Proto.stopEditing = function() {
  this.flushEditor();
  this.cancelEditing();
}


/**
 * Writes the editor's value to the model.
 */
qx.Proto.flushEditor = function() {
  if (this.isEditing()) {
    var value = this._cellEditorFactory.getCellEditorValue(this._cellEditor);
    this.getTableModel().setValue(this._focusedCol, this._focusedRow, value);

    // TODO: Use clean API
    if (this._scrollerPool != null) {
      this._scrollerPool.focus();
    }
  }
}


/**
 * Stops editing without writing the editor's value to the model.
 */
qx.Proto.cancelEditing = function() {
  if (this.isEditing()) {
    this._focusIndicator.remove(this._cellEditor);
    this._focusIndicator.removeState("editing");
    this._cellEditor.dispose();

    this._cellEditor.removeEventListener("changeFocused", this._onCellEditorFocusChanged, this);
    this._cellEditor = null;
    this._cellEditorFactory = null;
  }
}


/**
 * Event handler. Called when the focused state of the cell editor changed.
 *
 * @param evt {Map} the event.
 */
qx.Proto._onCellEditorFocusChanged = function(evt) {
  if (!this._cellEditor.getFocused()) {
    this.stopEditing();
  }
}


/**
 * Returns the model index of the column the mouse is over or null if the mouse
 * is not over a column.
 *
 * @param pageX {int} the x position of the mouse in the page (in pixels).
 * @return {int} the model index of the column the mouse is over.
 */
qx.Proto._getColumnForPageX = function(pageX) {
  var headerLeftX = qx.dom.DomLocation.getClientBoxLeft(this._header.getElement());

  var columnModel = this.getTableColumnModel();
  var paneModel = this.getTablePaneModel();
  var colCount = paneModel.getColumnCount();
  var currX = headerLeftX;
  for (var x = 0; x < colCount; x++) {
    var col = paneModel.getColumnAtX(x);
    var colWidth = columnModel.getColumnWidth(col);
    currX += colWidth;

    if (pageX < currX) {
      return col;
    }
  }

  return null;
}


/**
 * Returns the model index of the column that should be resized when dragging
 * starts here. Returns -1 if the mouse is in no resize region of any column.
 *
 * @param pageX {int} the x position of the mouse in the page (in pixels).
 * @return {int} the column index.
 */
qx.Proto._getResizeColumnForPageX = function(pageX) {
  var headerLeftX = qx.dom.DomLocation.getClientBoxLeft(this._header.getElement());

  var columnModel = this.getTableColumnModel();
  var paneModel = this.getTablePaneModel();
  var colCount = paneModel.getColumnCount();
  var currX = headerLeftX;
  var regionRadius = qx.ui.table.TablePaneScroller.RESIZE_REGION_RADIUS;
  for (var x = 0; x < colCount; x++) {
    var col = paneModel.getColumnAtX(x);
    var colWidth = columnModel.getColumnWidth(col);
    currX += colWidth;

    if (pageX >= (currX - regionRadius) && pageX <= (currX + regionRadius)) {
      return col;
    }
  }

  return -1;
}


/**
 * Returns the model index of the row the mouse is currently over. Returns -1 if
 * the mouse is over the header. Returns null if the mouse is not over any
 * column.
 *
 * @param pageX {int} the mouse x position in the page.
 * @param pageY {int} the mouse y position in the page.
 * @return {int} the model index of the row the mouse is currently over.
 */
qx.Proto._getRowForPagePos = function(pageX, pageY) {
  var paneClipperElem = this._paneClipper.getElement();
  var paneClipperLeftX = qx.dom.DomLocation.getClientBoxLeft(paneClipperElem);
  var paneClipperRightX = qx.dom.DomLocation.getClientBoxRight(paneClipperElem);
  if (pageX < paneClipperLeftX || pageX > paneClipperRightX) {
    // There was no cell or header cell hit
    return null;
  }

  var paneClipperTopY = qx.dom.DomLocation.getClientBoxTop(paneClipperElem);
  var paneClipperBottomY = qx.dom.DomLocation.getClientBoxBottom(paneClipperElem);
  if (pageY >= paneClipperTopY && pageY <= paneClipperBottomY) {
    // This event is in the pane -> Get the row
    var scrollY = this._verScrollBar.getValue();
    var tableY = scrollY + pageY - paneClipperTopY;
    var rowHeight = this._tablePane.getTableRowHeight();
    var row = Math.floor(tableY / rowHeight);

    var rowCount = this.getTableModel().getRowCount();
    return (row < rowCount) ? row : null;
  }

  var headerElem = this._headerClipper.getElement();
  if (pageY >= qx.dom.DomLocation.getClientBoxTop(headerElem)
    && pageY <= qx.dom.DomLocation.getClientBoxBottom(headerElem))
  {
    // This event is in the pane -> Return -1 for the header
    return -1;
  }

  return null;
}


/**
 * Sets the widget that should be shown in the top right corner.
 * <p>
 * The widget will not be disposed, when this table scroller is disposed. So the
 * caller has to dispose it.
 *
 * @param widget {qx.ui.core.Widget} The widget to set. May be null.
 */
qx.Proto.setTopRightWidget = function(widget) {
  var oldWidget = this._topRightWidget;
  if (oldWidget != null) {
    this._top.remove(oldWidget);
  }

  if (widget != null) {
    this._top.remove(this._spacer);
    this._top.add(widget);
  } else if (oldWidget != null) {
    this._top.add(this._spacer);
  }

  this._topRightWidget = widget;
}


/**
 * Returns the header.
 *
 * @return {TablePaneHeader} the header.
 */
qx.Proto.getHeader = function() {
  return this._header;
}


/**
 * Returns the table pane.
 *
 * @return {TablePane} the table pane.
 */
qx.Proto.getTablePane = function() {
  return this._tablePane;
}


/**
 * Returns which scrollbars are needed.
 *
 * @param forceHorizontal {boolean,false} Whether to show the horizontal
 *    scrollbar always.
 * @param preventVertical {boolean,false} Whether tp show the vertical scrollbar
 *    never.
 * @return {int} which scrollbars are needed. This may be any combination of
 *    {@link #HORIZONTAL_SCROLLBAR} or {@link #VERTICAL_SCROLLBAR}
 *    (combined by OR).
 */
qx.Proto.getNeededScrollBars = function(forceHorizontal, preventVertical) {
  var barWidth = this._verScrollBar.getPreferredBoxWidth();

  // Get the width and height of the view (without scroll bars)
  var viewWidth = this._paneClipper.getInnerWidth();
  if (this.getVerticalScrollBarVisible()) {
    viewWidth += barWidth;
  }
  var viewHeight = this._paneClipper.getInnerHeight();
  if (this.getHorizontalScrollBarVisible()) {
    viewHeight += barWidth;
  }

  // Get the (virtual) width and height of the pane
  var paneWidth = this.getTablePaneModel().getTotalWidth();
  var paneHeight = this._tablePane.getTableRowHeight() * this.getTableModel().getRowCount();

  // Check which scrollbars are needed
  var horNeeded = false;
  var verNeeded = false;
  if (paneWidth > viewWidth) {
    horNeeded = true;
    if (paneHeight > viewHeight - barWidth) {
      verNeeded = true;
    }
  } else if (paneHeight > viewHeight) {
    verNeeded = true;
    if (!preventVertical && (paneWidth > viewWidth - barWidth)) {
      horNeeded = true;
    }
  }

  // Create the mask
  var horBar = qx.ui.table.TablePaneScroller.HORIZONTAL_SCROLLBAR;
  var verBar = qx.ui.table.TablePaneScroller.VERTICAL_SCROLLBAR;
  return ((forceHorizontal || horNeeded) ? horBar : 0)
     | ((preventVertical || !verNeeded) ? 0 : verBar);
}


/**
 * Does a postponed update of the content.
 *
 * @see #_updateContent
 */
qx.Proto._postponedUpdateContent = function() {
  if (! this._updateContentPlanned) {
    var self = this;
    window.setTimeout(function() {
      self._updateContent();
      self._updateContentPlanned = false;
    }, 0);
    this._updateContentPlanned = true;
  }
}


/**
 * Updates the content. Sets the right section the table pane should show and
 * does the scrolling.
 */
qx.Proto._updateContent = function() {
  var paneHeight = this._paneClipper.getInnerHeight();
  var scrollX = this._horScrollBar.getValue();
  var scrollY = this._verScrollBar.getValue();
  var rowHeight = this._tablePane.getTableRowHeight();

  var firstRow = Math.floor(scrollY / rowHeight);
  var oldFirstRow = this._tablePane.getFirstVisibleRow();
  this._tablePane.setFirstVisibleRow(firstRow);

  // NOTE: We don't consider paneOffset, because this may cause alternating
  //     adding and deleting of one row when scolling.
  var rowCount = Math.ceil(paneHeight / rowHeight);
  this._tablePane.setVisibleRowCount(rowCount);

  if (firstRow != oldFirstRow) {
    this._updateFocusIndicator();
  }

  var paneOffset = scrollY % rowHeight;

  // Workaround: We can't use scrollLeft for the header because IE
  //       automatically scrolls the header back, when a column is
  //       resized.
  this._header.setLeft(-scrollX);
  this._paneClipper.setScrollLeft(scrollX);
  this._paneClipper.setScrollTop(paneOffset);

  //this.debug("paneHeight:"+paneHeight+",rowHeight:"+rowHeight+",firstRow:"+firstRow+",rowCount:"+rowCount+",paneOffset:"+paneOffset);
}


/**
 * Updates the location and the visibility of the focus indicator.
 */
qx.Proto._updateFocusIndicator = function() {
  if (this._focusedCol != null) {
    var xPos = this.getTablePaneModel().getX(this._focusedCol);
    if (xPos == -1) {
      this._focusIndicator.hide();
    } else {
      var columnModel = this.getTableColumnModel();
      var paneModel = this.getTablePaneModel();

      var firstRow = this._tablePane.getFirstVisibleRow();
      var rowHeight = this._tablePane.getTableRowHeight();

      this._focusIndicator.setHeight(rowHeight + 3);
      this._focusIndicator.setWidth(columnModel.getColumnWidth(this._focusedCol) + 3);
      this._focusIndicator.setTop((this._focusedRow - firstRow) * rowHeight - 2);
      this._focusIndicator.setLeft(paneModel.getColumnLeft(this._focusedCol) - 2);

      this._focusIndicator.show();
    }
  }
}


// overridden
qx.Proto.dispose = function() {
  if (this.getDisposed()) {
    return true;
  }

  this.cancelEditing();

  this._verScrollBar.dispose();
  this._horScrollBar.dispose();
  this._header.dispose();
  this._headerClipper.dispose();
  this._spacer.dispose();
  this._top.dispose();
  this._tablePane.dispose();
  this._paneClipper.dispose();

  if (this._resizeLine != null) {
    this._resizeLine.dispose();
  }

  this.removeEventListener(qx.constant.Event.MOUSEMOVE, this._onmousemove, this);
  this.removeEventListener(qx.constant.Event.MOUSEDOWN, this._onmousedown, this);
  this.removeEventListener(qx.constant.Event.MOUSEUP, this._onmouseup, this);
  this.removeEventListener(qx.constant.Event.CLICK, this._onclick, this);
  this.removeEventListener(qx.constant.Event.DBLCLICK, this._ondblclick, this);
  this.removeEventListener(qx.constant.Event.MOUSEOUT, this._onmouseout, this);

  if (this._tableColumnModel != null) {
    this._tableColumnModel.removeEventListener("visibilityChanged", this._onColVisibilityChanged, this);
    this._tableColumnModel.removeEventListener("widthChanged", this._onColWidthChanged, this);
    this._tableColumnModel.removeEventListener("orderChanged", this._onOrderChanged, this);
  }

  return qx.ui.layout.VerticalBoxLayout.prototype.dispose.call(this);
}


/** {int} The minimum width a colum could get in pixels. */
qx.Class.MIN_COLUMN_WIDTH = 10;

/** {int} The radius of the resize region in pixels. */
qx.Class.RESIZE_REGION_RADIUS = 5;

/**
 * {int} The mask for the horizontal scroll bar.
 * May be combined with {@link #VERTICAL_SCROLLBAR}.
 *
 * @see #getNeededScrollBars
 */
qx.Class.HORIZONTAL_SCROLLBAR = 1;

/**
 * {int} The mask for the vertical scroll bar.
 * May be combined with {@link #HORIZONTAL_SCROLLBAR}.
 *
 * @see #getNeededScrollBars
 */
qx.Class.VERTICAL_SCROLLBAR = 2;

/**
 * {string} The correct value for the CSS style attribute "cursor" for the
 * horizontal resize cursor.
 */
qx.Class.CURSOR_RESIZE_HORIZONTAL = (qx.sys.Client.isGecko() && (qx.sys.Client.getMajor() > 1 || qx.sys.Client.getMinor() >= 8)) ? "ew-resize" : "e-resize";
