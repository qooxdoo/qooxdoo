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
qx.Proto._getCellStyle = function(cellInfo) {
  var style = qx.ui.table.AbstractDataCellRenderer.prototype._getCellStyle(cellInfo);

  if (this.getUseAutoAlign()) {
    if (typeof cellInfo.value == qx.constant.Type.NUMBER) {
      style += qx.ui.table.DefaultDataCellRenderer.STYLE_ALIGN_RIGHT;
    }
  }

  return style;
}


// overridden
qx.Proto._getContentHtml = function(cellInfo) {
  return this._formatValue(cellInfo.value);
}


// overridden
qx.Proto.updateDataCellElement = function(cellInfo, cellElement) {
  cellElement.firstChild.nodeValue = this._formatValue(cellInfo.value);
}


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
}


qx.Proto._createCellStyle_array_join = function(cellInfo, htmlArr) {
  qx.ui.table.AbstractDataCellRenderer.prototype._createCellStyle_array_join(cellInfo, htmlArr);

  if (this.getUseAutoAlign()) {
    if (typeof cellInfo.value == qx.constant.Type.NUMBER) {
      htmlArr.push(qx.ui.table.DefaultDataCellRenderer.STYLE_ALIGN_RIGHT);
    }
  }
}


qx.Proto._createContentHtml_array_join = function(cellInfo, htmlArr) {
  htmlArr.push(this._formatValue(cellInfo.value));
}


qx.Class._numberFormat = new qx.util.format.NumberFormat();
qx.Class._numberFormat.setMaximumFractionDigits(2);

qx.Class.STYLE_ALIGN_RIGHT = ';text-align:right';
