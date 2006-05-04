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
#require(qx.constant.Type)
#require(qx.util.format.NumberFormat)

************************************************************************ */

/**
 * The default data cell renderer.
 */
qx.OO.defineClass("qx.ui.table.DefaultDataCellRenderer", qx.ui.table.AbstractDataCellRenderer, 
function() {
  qx.ui.table.AbstractDataCellRenderer.call(this);
});


/**
 * Whether the alignment should automatically be set according to the cell value.
 * If true numbers will be right-aligned.
 */
qx.OO.addProperty({ name:"useAutoAlign", type:qx.constant.Type.BOOLEAN, defaultValue:true, allowNull:false });


// overridden
qx.Proto._createCellWidget = function() {
  return new qx.ui.embed.TextEmbed();
};


// overridden
qx.Proto._updateDataCellContent = function(cellInfo, cellWidget) {
  cellWidget.setText(this._formatValue(cellInfo.value));

  if (this.getUseAutoAlign()) {
    if (typeof cellInfo.value == qx.constant.Type.NUMBER) {
      cellWidget.setTextAlign("right");
    } else {
      cellWidget.setTextAlign("left");
    }
  }
};


qx.Proto._getCellStyle = function(cellInfo) {
  var style = qx.ui.table.AbstractDataCellRenderer.prototype._getCellStyle(cellInfo);

  if (this.getUseAutoAlign()) {
    if (typeof cellInfo.value == qx.constant.Type.NUMBER) {
      style += '; text-align:right';
    }
  }

  return style;
};


qx.Proto._getContentHtml = function(cellInfo) {
  return this._formatValue(cellInfo.value);
};


qx.Proto.updateDataCellElement = function(cellInfo, cellElement) {
  cellElement.firstChild.nodeValue = this._formatValue(cellInfo.value);
};


/**
 * Formats a value.
 *
 * @param value {var} the value to format.
 * @return {string} the formatted value.
 */
qx.Proto._formatValue = function(value) {
  if (value == null) {
    return "";
  } else if (typeof value == qx.constant.Type.NUMBER) {
    return qx.ui.table.DefaultDataCellRenderer._numberFormat.format(value);
  } else if (value instanceof Date) {
    return qx.util.format.DateFormat.getDateInstance().format(value);
  } else {
    return value;
  }
};


qx.Class._numberFormat = new qx.util.format.NumberFormat();
qx.Class._numberFormat.setMaximumFractionDigits(2);
