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
#require(qx.core.Object)

************************************************************************ */

/**
 * A cell renderer for header cells.
 */
qx.OO.defineClass("qx.ui.table.HeaderCellRenderer", qx.core.Object,
function() {
  qx.core.Object.call(this);
});


/**
 * Creates a header cell.
 * <p>
 * The cellInfo map contains the following properties:
 * <ul>
 * <li>col (int): the model index of the column.</li>
 * <li>xPos (int): the x position of the column in the table pane.</li>
 * <li>name (string): the name of the column.</li>
 * <li>editable (boolean): whether the column is editable.</li>
 * <li>sorted (boolean): whether the column is sorted.</li>
 * <li>sortedAscending (boolean): whether sorting is ascending.</li>
 * </ul>
 *
 * @param cellInfo {Map} A map containing the information about the cell to
 *    create.
 * @return {qx.ui.core.Widget} the widget that renders the header cell.
 */
qx.Proto.createHeaderCell = function(cellInfo) {
  throw new Error("createHeaderCell is abstract");
}


/**
 * Updates a header cell.
 *
 * @param cellInfo {Map} A map containing the information about the cell to
 *    create. This map has the same structure as in {@link #createHeaderCell}.
 * @param cellWidget {qx.ui.core.Widget} the widget that renders the header cell. This is
 *    the same widget formally created by {@link #createHeaderCell}.
 */
qx.Proto.updateHeaderCell = function(cellInfo, cellWidget) {
  throw new Error("updateHeaderCell is abstract");
}
