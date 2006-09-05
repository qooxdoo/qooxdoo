/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Volker Pauli

************************************************************************ */

/* ************************************************************************

#module(ui_splitpane)

************************************************************************ */

/**
 *
 * Creates a new instance of a vertical SplitPane.<br /><br />
 *
 * new qx.ui.splitpane.VerticalSplitPane()<br />
 * new qx.ui.splitpane.VerticalSplitPane(firstProportion, secondProportion)
 *
 * @param firstProportion {string} The proportion of the left (top) pane. Allowed values are any by {@see qx.ui.core.Widget} supported unit.
 * @param secondProportion {string} The proportion of the right (bottom) pane. Allowed values are any by {@see qx.ui.core.Widget} supported unit.
 */
qx.OO.defineClass("qx.ui.splitpane.VerticalSplitPane", qx.ui.splitpane.SplitPane,
function(firstProportion, secondProportion) {
  qx.ui.splitpane.SplitPane.call(this, qx.constant.Layout.ORIENTATION_VERTICAL, firstProportion, secondProportion);
});
