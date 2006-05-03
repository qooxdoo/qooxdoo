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

#require(qx.core.Object)

************************************************************************ */

/**
 * A cell renderer for data cells.
 */
qx.OO.defineClass("qx.ui.table.DataCellRenderer", qx.core.Object, 
function() {
  qx.core.Object.call(this);
});

/**
 * Creates a data cell.
 * <p>
 * The cellInfo map contains the following properties:
 * <ul>
 * <li>value (var): the cell's value.</li>
 * <li>row (int): the model index of the row the cell belongs to.</li>
 * <li>col (int): the model index of the column the cell belongs to.</li>
 * <li>xPos (int): the x position of the cell in the table pane.</li>
 * <li>selected (boolean): whether the cell is selected.</li>
 * <li>focusedCol (boolean): whether the cell is in the same column as the
 *   focused cell.</li>
 * <li>focusedRow (boolean): whether the cell is in the same row as the
 *   focused cell.</li>
 * <li>editable (boolean): whether the cell is editable.</li>
 * </ul>
 *
 * @param cellInfo {Map} A map containing the information about the cell to
 *    create.
 * @return {qx.ui.core.Widget} the widget that renders the data cell.
 */
qx.Proto.createDataCell = function(cellInfo) {
  throw new Error("createDataCell is abstract");
};


/**
 * Updates a data cell.
 *
 * @param cellInfo {Map} A map containing the information about the cell to
 *    create. This map has the same structure as in {@link #createDataCell}.
 * @param cellWidget {qx.ui.core.Widget} the widget that renders the data cell. This is
 *    the same widget formally created by {@link #createDataCell}.
 */
qx.Proto.updateDataCell = function(cellInfo, cellWidget) {
  throw new Error("updateDataCell is abstract");
};


qx.Proto.createDataCellHtml = function(cellInfo) {
  throw new Error("createDataCellHtml is abstract");
};


qx.Proto.updateDataCellElement = function(cellInfo, cellElement) {
  throw new Error("updateDataCellElement is abstract");
};
