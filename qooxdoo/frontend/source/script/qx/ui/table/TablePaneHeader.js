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
#require(qx.ui.layout.HorizontalBoxLayout)
#use(qx.constant.Type)
#use(qx.ui.table.TableModel)
#use(qx.ui.table.TableColumnModel)
#use(qx.ui.table.TablePaneModel)

************************************************************************ */

/**
 * Shows the header of a table.
 */
qx.OO.defineClass("qx.ui.table.TablePaneHeader", qx.ui.layout.HorizontalBoxLayout,
function() {
  qx.ui.layout.HorizontalBoxLayout.call(this);
});


/** The table model. */
qx.OO.addProperty({ name:"tableModel", type:qx.constant.Type.OBJECT }); //, instance : "qx.ui.table.TableModel" });

/** The table column model. */
qx.OO.addProperty({ name:"tableColumnModel", type:qx.constant.Type.OBJECT }); //, instance : "qx.ui.table.TableColumnModel" });

/** The table pane model. */
qx.OO.addProperty({ name:"tablePaneModel", type:qx.constant.Type.OBJECT }); //, instance : "qx.ui.table.TablePaneModel" });


// property modifier
qx.Proto._modifyTableModel = function(propValue, propOldValue, propData) {
  if (propOldValue != null) {
    propOldValue.removeEventListener(qx.ui.table.TableModel.EVENT_TYPE_META_DATA_CHANGED, this._onTableModelMetaDataChanged, this);
  }
  propValue.addEventListener(qx.ui.table.TableModel.EVENT_TYPE_META_DATA_CHANGED, this._onTableModelMetaDataChanged, this);

  return true;
}


// property modifier
qx.Proto._modifyTableColumnModel = function(propValue, propOldValue, propData) {
  if (propOldValue != null) {
    propOldValue.removeEventListener("widthChanged", this._onWidthChanged, this);
    propOldValue.removeEventListener("orderChanged", this._onOrderChanged, this);
  }
  propValue.addEventListener("widthChanged", this._onWidthChanged, this);
  propValue.addEventListener("orderChanged", this._onOrderChanged, this);
  return true;
}


// property modifier
qx.Proto._modifyTablePaneModel = function(propValue, propOldValue, propData) {
  if (propOldValue != null) {
    propOldValue.removeEventListener("modelChanged", this._onPaneModelChanged, this);
  }
  propValue.addEventListener("modelChanged", this._onPaneModelChanged, this);
  return true;
}


/**
 * Event handler. Called when the width of a column has changed.
 *
 * @param evt {Map} the event.
 */
qx.Proto._onWidthChanged = function(evt) {
  var data = evt.getData();
  this.setColumnWidth(data.col, data.newWidth);
}


/**
 * Event handler. Called the column order has changed.
 *
 * @param evt {Map} the event.
 */
qx.Proto._onOrderChanged = function(evt) {
  this._updateContent(true);
}


/**
 * Event handler. Called when the pane model has changed.
 *
 * @param evt {Map} the event.
 */
qx.Proto._onPaneModelChanged = function(evt) {
  this._updateContent(true);
}


/**
 * Event handler. Called when the table model meta data has changed.
 *
 * @param evt {Map} the event.
 */
qx.Proto._onTableModelMetaDataChanged = function(evt) {
  this._updateContent();
}


/**
 * Sets the column width. This overrides the width from the column model.
 *
 * @param col {int} the column to change the width for.
 * @param width {int} the new width.
 */
qx.Proto.setColumnWidth = function(col, width) {
  var x = this.getTablePaneModel().getX(col);
  var children = this.getChildren();
  if (children[x] != null) {
    children[x].setWidth(width);
  }
}


/**
 * Sets the column the mouse is currently over.
 *
 * @param col {int} the model index of the column the mouse is currently over or
 *    null if the mouse is over no column.
 */
qx.Proto.setMouseOverColumn = function(col) {
  if (col != this._lastMouseOverColumn) {
    var paneModel = this.getTablePaneModel();
    var children = this.getChildren();

    if (this._lastMouseOverColumn != null) {
      var widget = children[paneModel.getX(this._lastMouseOverColumn)];
      if (widget != null) {
        widget.removeState("mouseover");
      }
    }
    if (col != null) {
      children[paneModel.getX(col)].addState("mouseover");
    }

    this._lastMouseOverColumn = col;
  }
}


/**
 * Shows the feedback shown while a column is moved by the user.
 *
 * @param col {int} the model index of the column to show the move feedback for.
 * @param x {int} the x position the left side of the feeback should have
 *    (in pixels, relative to the left side of the header).
 */
qx.Proto.showColumnMoveFeedback = function(col, x) {
  var elem = this.getElement();
  if (this._moveFeedback == null) {
    var xPos = this.getTablePaneModel().getX(col);
    var cellWidget = this.getChildren()[xPos];

    // Create the feedback
    // Workaround: Since a cloned widget throws an exception when it is
    //       added to another component we have to create a new one
    //       using the renderer
    //this._moveFeedback = cellWidget.clone();
    var tableModel = this.getTableModel();
    var columnModel = this.getTableColumnModel();
    var cellInfo = { xPos:xPos, col:col, name:tableModel.getColumnName(col) }
    var cellRenderer = columnModel.getHeaderCellRenderer(col);
    this._moveFeedback = cellRenderer.createHeaderCell(cellInfo);

    // Configure the feedback
    with (this._moveFeedback) {
      setWidth(cellWidget.getBoxWidth());
      setHeight(cellWidget.getBoxHeight());
      setZIndex(1000000);
      setOpacity(0.8);
      setTop(qx.dom.DomLocation.getClientBoxTop(elem));
    }
    this.getTopLevelWidget().add(this._moveFeedback);
  }

  this._moveFeedback.setLeft(qx.dom.DomLocation.getClientBoxLeft(elem) + x);
}


/**
 * Hides the feedback shown while a column is moved by the user.
 */
qx.Proto.hideColumnMoveFeedback = function() {
  if (this._moveFeedback != null) {
    this.getTopLevelWidget().remove(this._moveFeedback);
    this._moveFeedback.dispose();
    this._moveFeedback = null;
  }
}


/**
 * Calculates the preferred height of the header cells.
 */
qx.Proto.calculateHeaderHeight = function() {
  // TODO: The following code works with qx.ui.basic.Label, but it fails with qx.ui.basic.Atom....
  return 16;

  this._updateContent();

  var maxHeight = 0;
  var children = this.getChildren();
  for (var i = 0; i < children.length; i++) {
    var height = children[i].getPreferredBoxHeight();
    maxHeight = Math.max(height, maxHeight);
  }

  return maxHeight;
}


/**
 * Updates the content of the header.
 *
 * @param completeUpdate {boolean} if true a complete update is performed. On a
 *    complete update all header widgets are recreated.
 */
qx.Proto._updateContent = function(completeUpdate) {
  var tableModel = this.getTableModel();
  var columnModel = this.getTableColumnModel();
  var paneModel = this.getTablePaneModel();

  var children = this.getChildren();
  var oldColCount = children.length;
  var colCount = paneModel.getColumnCount();

  var sortedColum = tableModel.getSortColumnIndex();

  // Remove all widgets on the complete update
  if (completeUpdate) {
    this._cleanUpCells();
  }

  // Update the header
  var cellInfo = {}
  cellInfo.sortedAscending = tableModel.isSortAscending();
  for (var x = 0; x < colCount; x++) {
    var col = paneModel.getColumnAtX(x);

    var colWidth = columnModel.getColumnWidth(col);

    // TODO: Get real cell renderer
    var cellRenderer = columnModel.getHeaderCellRenderer(col);

    cellInfo.xPos = x;
    cellInfo.col = col;
    cellInfo.name = tableModel.getColumnName(col);
    cellInfo.editable = tableModel.isColumnEditable(col);
    cellInfo.sorted = (col == sortedColum);

    // Get the cached widget
    var cachedWidget = children[x];

    // Create or update the widget
    if (cachedWidget == null) {
      // We have no cached widget -> create it
      cachedWidget = cellRenderer.createHeaderCell(cellInfo);
      cachedWidget.set({ width:colWidth, height:qx.constant.Core.HUNDREDPERCENT });

      this.add(cachedWidget);
    } else {
      // This widget already created before -> recycle it
      cellRenderer.updateHeaderCell(cellInfo, cachedWidget);
    }
  }
}


/**
 * Cleans up all header cells.
 */
qx.Proto._cleanUpCells = function() {
  var children = this.getChildren();
  for (var x = children.length - 1; x >= 0; x--) {
    var cellWidget = children[x];
    //this.debug("disposed:" + cellWidget.getDisposed() + ",has parent: " + (cellWidget.getParent() != null) + ",x:"+x);
    this.remove(cellWidget);
    cellWidget.dispose();
  }
}


// overridden
qx.Proto.dispose = function() {
  if (this.getDisposed()) {
    return true;
  }

  if (this._tableModel != null) {
    this._tableModel.removeEventListener(qx.ui.table.TableModel.EVENT_TYPE_META_DATA_CHANGED, this._onTableModelMetaDataChanged, this);
  }

  if (this._tableColumnModel != null) {
    this._tableColumnModel.removeEventListener("widthChanged", this._onWidthChanged, this);
    this._tableColumnModel.removeEventListener("orderChanged", this._onOrderChanged, this);
  }

  if (this._tablePaneModel != null) {
    this._tablePaneModel.removeEventListener("modelChanged", this._onPaneModelChanged, this);
  }

  this._cleanUpCells();

  return qx.ui.layout.HorizontalBoxLayout.prototype.dispose.call(this);
}
