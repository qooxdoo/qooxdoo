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
 * A pool of TablePaneScrollers.
 */
qx.OO.defineClass("qx.ui.table.TablePaneScrollerPool", qx.core.Object,
function() {
  qx.core.Object.call(this);
});


/**
 * Gets the TablePaneScroller at a certain x position in the page. If there is
 * no TablePaneScroller at this postion, null is returned.
 *
 * @param pageX {int} the position in the page to check (in pixels).
 * @return {TablePaneScroller} the TablePaneScroller or null.
 */
qx.Proto.getTablePaneScrollerAtPageX = function(pageX) {
  throw new Error("getTablePaneForMouseEvent is abstract");
}


/**
 * Sets the currently focused cell.
 *
 * @param col {int} the model index of the focused cell's column.
 * @param row {int} the model index of the focused cell's row.
 * @param scrollVisible {boolean,false} whether to scroll the new focused cell
 *        visible.
 */
qx.Proto.setFocusedCell = function(col, row, scrollVisible) {
  throw new Error("setFocusedCell is abstract");
}
