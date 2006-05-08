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

#require(qx.ui.table.DataCellRenderer)

************************************************************************ */

/**
 * An abstract data cell renderer that does the basic coloring
 * (borders, selected look, ...).
 */
qx.OO.defineClass("qx.ui.table.AbstractDataCellRenderer", qx.ui.table.DataCellRenderer, 
function() {
  qx.ui.table.DataCellRenderer.call(this);
});


// overridden
qx.Proto.createDataCellHtml = function(cellInfo) {
  return '<div style="' + this._getCellStyle(cellInfo) + '">'
    + this._getContentHtml(cellInfo) + '</div>';
};


// overridden
qx.Proto.updateDataCellElement = function(cellInfo, cellElement) {
  cellElement.innerHTML = this._getContentHtml(cellInfo);
};


/**
 * Returns the CSS styles that should be applied to the main div of this cell.
 *
 * @param cellInfo {Map} The information about the cell.
 *        See {@link #createDataCellHtml}.
 * @return the CSS styles of the main div.
 */
qx.Proto._getCellStyle = function(cellInfo) {
  return cellInfo.style + '; overflow:hidden'
    + '; border-right:1px solid #eeeeee; border-bottom:1px solid #eeeeee'
    + '; padding-left:2px; padding-right:2px';
};


/**
 * Returns the HTML that should be used inside the main div of this cell.
 *
 * @param cellInfo {Map} The information about the cell.
 *        See {@link #createDataCellHtml}.
 * @return {string} the inner HTML of the main div.
 */
qx.Proto._getContentHtml = function(cellInfo) {
  return cellInfo.value;
};



qx.Proto.createDataCellHtml_array_join = function(cellInfo, htmlArr) {
  throw new Error("createDataCellHtml_array_join is abstract");
};



qx.Proto.createDataCellHtml_array_join = function(cellInfo, htmlArr) {
  htmlArr.push('<div style="position:absolute;left:');
  htmlArr.push(cellInfo.styleLeft);
  htmlArr.push('px;top:0px;width:');
  htmlArr.push(cellInfo.styleWidth);
  htmlArr.push('px;height:');
  htmlArr.push(cellInfo.styleHeight);
  htmlArr.push('px');

  this._createCellStyle_array_join(cellInfo, htmlArr);

  htmlArr.push('">');

  this._createContentHtml_array_join(cellInfo, htmlArr);

  htmlArr.push('</div>');
};


qx.Proto._createCellStyle_array_join = function(cellInfo, htmlArr) {
  htmlArr.push(';overflow:hidden;border-right:1px solid #eeeeee;border-bottom:1px solid #eeeeee;padding-left:2px;padding-right:2px');
};


qx.Proto._createContentHtml_array_join = function(cellInfo, htmlArr) {
  htmlArr.push(cellInfo.value);
};
