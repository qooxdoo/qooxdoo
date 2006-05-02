/* ************************************************************************

   qooxdoo - the new era of web interface development

   Copyright:
     (C) 2004-2006 by Schlund + Partner AG, Germany
         All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.oss.schlund.de

   Authors:
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (aecker)
       <andreas dot ecker at 1und1 dot de>
     * Til Schneider (til132)
       <tilman dot schneider at stz-ida dot de>

************************************************************************ */

/* ************************************************************************

#require(qx.ui.table.DataCellRenderer)

************************************************************************ */

/**
 * An abstract data cell renderer that does the basic coloring
 * (borders, selected look, ...).
 */
qx.OO.defineClass("qx.ui.table.AbstractDataCellRenderer", qx.ui.table.DataCellRenderer, 
function() {
  qx.ui.table.DataCellRenderer.call(this);
});


// overridden
qx.Proto.createDataCell = function(cellInfo) {
  var cellWidget = this._createCellWidget();
  cellWidget.setAppearance("table-data-cell");
  this._initCellWidget(cellInfo, cellWidget);

  return cellWidget;
};


// overridden
qx.Proto.updateDataCell = function(cellInfo, cellWidget) {
  this._updateDataCellContent(cellInfo, cellWidget);

  cellWidget.setState(qx.ui.table.AbstractDataCellRenderer.STATE_EVEN, cellInfo.row % 2 == 0);
  cellWidget.setState(qx.ui.table.AbstractDataCellRenderer.STATE_SELECTED, cellInfo.selected);
  cellWidget.setState(qx.ui.table.AbstractDataCellRenderer.STATE_FOCUSED_ROW, cellInfo.focusedRow);
};


/**
 * Creates a new cell widget.
 */
qx.Proto._createCellWidget = function() {
  throw new Error("_createCellWidget is abstract");
};


/**
 * Initializes a newly created cell widget. Do all initialization that has to be
 * done after calling setAppearance here.
 *
 * @param cellInfo {Map} The same info Map as passed to {@link #createDataCell}.
 * @param cellWidget {qx.ui.core.Widget} The widget to initialize.
 */
qx.Proto._initCellWidget = function(cellInfo, cellWidget) {
  this.updateDataCell(cellInfo, cellWidget);
};


/**
 * Updates the content of the data cell (especially the value).
 *
 * @param cellInfo {Map} The same info Map as passed to {@link #updateDataCell}.
 * @param cellWidget {qx.ui.core.Widget} The widget to update.
 */
qx.Proto._updateDataCellContent = function(cellInfo, cellWidget) {
  throw new Error("_updateDataCellContent is abstract");
}


/** {string} The state which will be set for even rows. */
qx.Class.STATE_EVEN = "even";

/** {string} The state which will be set for selected cells. */
qx.Class.STATE_SELECTED = "selected";

/**
 * {string} The state which will be set if the cell is in the same row as
 * the focused cell.
 */
qx.Class.STATE_FOCUSED_ROW = "focusedRow";
