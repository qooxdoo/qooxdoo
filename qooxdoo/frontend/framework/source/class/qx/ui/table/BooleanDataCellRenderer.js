/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 by STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Til Schneider (til132)
     * Carsten Lergenmueller (carstenl)

************************************************************************ */

/* ************************************************************************

#module(ui_table)

************************************************************************ */

/**
 * A data cell renderer for boolean values.
 */
qx.OO.defineClass("qx.ui.table.BooleanDataCellRenderer", qx.ui.table.IconDataCellRenderer,
function() {
  qx.ui.table.IconDataCellRenderer.call(this);
});

//overridden 
qx.Proto._identifyImage = function(cellInfo) {
  var IconDataCellRenderer = qx.ui.table.IconDataCellRenderer;
  switch (cellInfo.value) {
    case true:  return qx.manager.object.AliasManager.getInstance().resolvePath("widget/table/boolean-true.png"); break;
    case false: return qx.manager.object.AliasManager.getInstance().resolvePath("widget/table/boolean-false.png"); break;
    default:    return qx.manager.object.AliasManager.getInstance().resolvePath("static/image/blank.gif"); break;
  }
}
