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
#require(qx.ui.table.HeaderCellRenderer)

************************************************************************ */

/**
 * The default header cell renderer.
 */
qx.OO.defineClass("qx.ui.table.DefaultHeaderCellRenderer", qx.ui.table.HeaderCellRenderer,
function() {
  qx.ui.table.HeaderCellRenderer.call(this);
});


// overridden
qx.Proto.createHeaderCell = function(cellInfo) {
  var widget = new qx.ui.basic.Atom();
  widget.setAppearance("table-header-cell");

  this.updateHeaderCell(cellInfo, widget);

  return widget;
}


// overridden
qx.Proto.updateHeaderCell = function(cellInfo, cellWidget) {
  var DefaultHeaderCellRenderer = qx.ui.table.DefaultHeaderCellRenderer;

  cellWidget.setLabel(cellInfo.name);
  cellWidget.setState(DefaultHeaderCellRenderer.STATE_SORTED, cellInfo.sorted);
  cellWidget.setState(DefaultHeaderCellRenderer.STATE_SORTED_ASCENDING, cellInfo.sortedAscending);
}

/**
 * {string} The state which will be set for header cells of sorted columns.
 */
qx.Class.STATE_SORTED = "sorted";

/**
 * {string} The state which will be set when sorting is ascending.
 */
qx.Class.STATE_SORTED_ASCENDING = "sortedAscending";
