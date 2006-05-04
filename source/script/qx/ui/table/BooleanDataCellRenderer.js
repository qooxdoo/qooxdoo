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

#require(qx.ui.table.AbstractDataCellRenderer)

************************************************************************ */

/**
 * A data cell renderer for boolean values.
 */
qx.OO.defineClass("qx.ui.table.BooleanDataCellRenderer", qx.ui.table.AbstractDataCellRenderer, 
function() {
  qx.ui.table.AbstractDataCellRenderer.call(this);
});


// overridden
qx.Proto._createCellWidget = function() {
  return new qx.ui.basic.Atom();
};


// overridden
qx.Proto._initCellWidget = function(cellInfo, cellWidget) {
  cellWidget.setHorizontalChildrenAlign("center");
  cellWidget.setVerticalChildrenAlign("middle");

  this.updateDataCell(cellInfo, cellWidget);
};


// overridden
qx.Proto._updateDataCellContent = function(cellInfo, cellWidget) {
  var BooleanDataCellRenderer = qx.ui.table.BooleanDataCellRenderer;
  switch (cellInfo.value) {
    case true:  cellWidget.setIcon(BooleanDataCellRenderer.TRUE_ICON_URL); break;
    case false: cellWidget.setIcon(BooleanDataCellRenderer.FALSE_ICON_URL); break;
    default:    cellWidget.setIcon(BooleanDataCellRenderer.NULL_ICON_URL); break;
  }
};


qx.Proto._getCellStyle = function(cellInfo) {
  var style = qx.ui.table.AbstractDataCellRenderer.prototype._getCellStyle(cellInfo);

  style += '; text-align:center; padding-top:1px';

  return style;
};


qx.Proto._getContentHtml = function(cellInfo) {
  return  '<img src="' + this._getImgUrl(cellInfo) + '"/>';
}


qx.Proto.updateDataCellElement = function(cellInfo, cellElement) {
  cellElement.firstChild.src = this._getImgUrl(cellInfo);
};


qx.Proto._getImgUrl = function(cellInfo) {
  var BooleanDataCellRenderer = qx.ui.table.BooleanDataCellRenderer;
  switch (cellInfo.value) {
    case true:  return BooleanDataCellRenderer.TRUE_ICON_URL; break;
    case false: return BooleanDataCellRenderer.FALSE_ICON_URL; break;
    default:    return BooleanDataCellRenderer.NULL_ICON_URL; break;
  }
};


/** {string} The URL of the icon showing a true value. */
qx.ui.table.BooleanDataCellRenderer.TRUE_ICON_URL = "../../themes/widgets/windows/table/boolean-true.png" // "widgets/table/boolean-true.png";

/** {string} The URL of the icon showing a false value. */
qx.ui.table.BooleanDataCellRenderer.FALSE_ICON_URL = "../../themes/widgets/windows/table/boolean-false.png" // "widgets/table/boolean-false.png";

/** {string} The URL of the icon showing a null value. */
qx.ui.table.BooleanDataCellRenderer.NULL_ICON_URL = null;
