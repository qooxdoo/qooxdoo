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

#package(table)
#require(qx.core.Object)

************************************************************************ */

/**
 * A factory creating widgets to use for editing table cells.
 */
qx.OO.defineClass("qx.ui.table.CellEditorFactory", qx.core.Object,
function() {
  qx.core.Object.call(this);
});


/**
 * Creates a cell editor.
 * <p>
 * The cellInfo map contains the following properties:
 * <ul>
 * <li>value (var): the cell's value.</li>
 * <li>row (int): the model index of the row the cell belongs to.</li>
 * <li>col (int): the model index of the column the cell belongs to.</li>
 * <li>xPos (int): the x position of the cell in the table pane.</li>
 * </ul>
 *
 * @param cellInfo {Map} A map containing the information about the cell to
 *    create.
 * @return {qx.ui.core.Widget} the widget that should be used as cell editor.
 */
qx.Proto.createCellEditor = function(cellInfo) {
  throw new Error("createCellEditor is abstract");
};


/**
 * Returns the current value of a cell editor.
 *
 * @param cellEditor {qx.ui.core.Widget} The cell editor formally created by
 *    {@link #createCellEditor}.
 * @return {var} the current value from the editor.
 */
qx.Proto.getCellEditorValue = function(cellEditor) {
  throw new Error("getCellEditorValue is abstract");
};
