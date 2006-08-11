/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 by STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Til Schneider (til132)

************************************************************************ */

/* ************************************************************************

#module(table)

************************************************************************ */

/**
 * A data cell renderer for boolean values.
 */
qx.OO.defineClass("qx.ui.table.BooleanDataCellRenderer", qx.ui.table.AbstractDataCellRenderer,
function() {
  qx.ui.table.AbstractDataCellRenderer.call(this);
});


// overridden
qx.Proto._getCellStyle = function(cellInfo) {
  var style = qx.ui.table.AbstractDataCellRenderer.prototype._getCellStyle(cellInfo);

  style += qx.ui.table.BooleanDataCellRenderer.MAIN_DIV_STYLE;

  return style;
}


// overridden
qx.Proto._getContentHtml = function(cellInfo) {
  var BooleanDataCellRenderer = qx.ui.table.BooleanDataCellRenderer;
  return BooleanDataCellRenderer.IMG_START + this._getImgUrl(cellInfo) + BooleanDataCellRenderer.IMG_END;
}


// overridden
qx.Proto.updateDataCellElement = function(cellInfo, cellElement) {
  cellElement.firstChild.src = this._getImgUrl(cellInfo);
}


/**
 * Returns the URL of the image to show.
 *
 * @param cellInfo {Map} The information about the cell.
 *        See {@link #createDataCellHtml}.
 * @return {string} the URL of the image to show.
 */
qx.Proto._getImgUrl = function(cellInfo) {
  var BooleanDataCellRenderer = qx.ui.table.BooleanDataCellRenderer;
  switch (cellInfo.value) {
    case true:  return qx.manager.object.AliasManager.resolvePath("widget/table/boolean-true.png"); break;
    case false: return qx.manager.object.AliasManager.resolvePath("widget/table/boolean-false.png"); break;
    default:    return qx.manager.object.AliasManager.resolvePath("static/image/blank.gif"); break;
  }
}


qx.Proto._createCellStyle_array_join = function(cellInfo, htmlArr) {
  qx.ui.table.AbstractDataCellRenderer.prototype._createCellStyle_array_join(cellInfo, htmlArr);

  htmlArr.push(qx.ui.table.BooleanDataCellRenderer.MAIN_DIV_STYLE);
}


qx.Proto._createContentHtml_array_join = function(cellInfo, htmlArr) {
  var BooleanDataCellRenderer = qx.ui.table.BooleanDataCellRenderer;

  if (qx.ui.table.TablePane.USE_TABLE) {
    htmlArr.push(BooleanDataCellRenderer.TABLE_DIV);
    htmlArr.push(cellInfo.styleHeight - 2); // -1 for the border, -1 for the padding
    htmlArr.push(BooleanDataCellRenderer.TABLE_DIV_CLOSE);
  }

  htmlArr.push(BooleanDataCellRenderer.IMG_START);
  htmlArr.push(this._getImgUrl(cellInfo));
  htmlArr.push(BooleanDataCellRenderer.IMG_END);

  if (qx.ui.table.TablePane.USE_TABLE) {
    htmlArr.push(BooleanDataCellRenderer.TABLE_DIV_END);
  }
}

qx.Class.MAIN_DIV_STYLE = ';text-align:center;padding-top:1px';
qx.Class.IMG_START = '<img src="';
qx.Class.IMG_END = '"/>';

qx.Class.TABLE_DIV = '<div style="overflow:hidden;height:';
qx.Class.TABLE_DIV_CLOSE = 'px">';
qx.Class.TABLE_DIV_END = '</div>';
