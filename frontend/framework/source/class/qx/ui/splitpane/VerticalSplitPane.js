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

qx.OO.defineClass("qx.ui.splitpane.VerticalSplitPane", qx.ui.splitpane.SplitPane,
function() {
  qx.ui.splitpane.SplitPane.call(this, qx.constant.Layout.ORIENTATION_VERTICAL);
});