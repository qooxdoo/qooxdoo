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

************************************************************************ */

/* ************************************************************************

#package(layout)
#post(QxGridLayoutImpl)

************************************************************************ */

function QxGridLayout()
{
  QxParent.call(this);

  this._columnData = [];
  this._rowData = [];

  this._spans = [];
};

QxGridLayout.extend(QxParent, "QxGridLayout");




/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

/*!
  The spacing between childrens. Could be any positive integer value.
*/
QxGridLayout.addProperty({ name : "horizontalSpacing", type : QxConst.TYPEOF_NUMBER, defaultValue : 0, addToQueueRuntime : true, impl : "layout" });

/*!
  The spacing between childrens. Could be any positive integer value.
*/
QxGridLayout.addProperty({ name : "verticalSpacing", type : QxConst.TYPEOF_NUMBER, defaultValue : 0, addToQueueRuntime : true, impl : "layout" });

/*!
  The horizontal align of the children. Allowed values are: "left", "center" and "right"
*/
QxGridLayout.addProperty({ name : "horizontalChildrenAlign", type : QxConst.TYPEOF_STRING, defaultValue : "left", possibleValues : [ "left", "center", "right" ], addToQueueRuntime : true });

/*!
  The vertical align of the children. Allowed values are: "top", "middle" and "bottom"
*/
QxGridLayout.addProperty({ name : "verticalChildrenAlign", type : QxConst.TYPEOF_STRING, defaultValue : "top", possibleValues : [ "top", "middle", "bottom" ], addToQueueRuntime : true });

/*!
  Cell padding top of all cells, if not locally defined
*/
QxGridLayout.addProperty({ name : "cellPaddingTop", type : QxConst.TYPEOF_NUMBER });

/*!
  Cell padding right of all cells, if not locally defined
*/
QxGridLayout.addProperty({ name : "cellPaddingRight", type : QxConst.TYPEOF_NUMBER });

/*!
  Cell padding bottom of all cells, if not locally defined
*/
QxGridLayout.addProperty({ name : "cellPaddingBottom", type : QxConst.TYPEOF_NUMBER });

/*!
  Cell padding left of all cells, if not locally defined
*/
QxGridLayout.addProperty({ name : "cellPaddingLeft", type : QxConst.TYPEOF_NUMBER });






/*
---------------------------------------------------------------------------
  INIT LAYOUT IMPL
---------------------------------------------------------------------------
*/

/*!
  This creates an new instance of the layout impl this widget uses
*/
proto._createLayoutImpl = function() {
  return new QxGridLayoutImpl(this);
};







/*
---------------------------------------------------------------------------
  CORE FUNCTIONS
---------------------------------------------------------------------------
*/

proto.add = function(vChild, vCol, vRow)
{
  vChild._col = vCol;
  vChild._row = vRow;

  if (this.isFillCell(vCol, vRow)) {
    throw new Error("Could not insert child " + vChild + " into a fill cell: " + vCol + "x" + vRow);
  };

  QxParent.prototype.add.call(this, vChild);
};







/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

proto._modifyLayout = function(propValue, propOldValue, propData)
{
  // invalidate inner preferred dimensions
  this._invalidatePreferredInnerDimensions();

  return true;
};





/*
---------------------------------------------------------------------------
  GRID SETUP
---------------------------------------------------------------------------
*/

proto._syncDataFields = function(vData, vOldLength, vNewLength)
{
  if (vNewLength > vOldLength)
  {
    for (var i=vOldLength; i<vNewLength; i++) {
      vData[i] = {};
    };
  }
  else if (vOldLength > vNewLength)
  {
    vData.splice(vNewLength, vOldLength - vNewLength);
  };
};






/*
---------------------------------------------------------------------------
  GRID SETUP: COLUMNS
---------------------------------------------------------------------------
*/

proto._columnCount = 0;

proto.setColumnCount = function(vCount)
{
  this._columnCount = vCount;
  this._syncColumnDataFields();
};

proto.getColumnCount = function() {
  return this._columnCount;
};

proto.addColumn = function()
{
  this._columnCount++;
  this._syncColumnDataFields();
};

proto.removeColumn = function()
{
  if (this._columnCount > 0)
  {
    this._columnCount--;
    this._syncColumnDataFields();
  };
};

proto._syncColumnDataFields = function()
{
  var vData = this._columnData;
  var vOldLength = vData.length;
  var vNewLength = this._columnCount;

  this._syncDataFields(vData, vOldLength, vNewLength);
};





/*
---------------------------------------------------------------------------
  GRID SETUP: ROWS
---------------------------------------------------------------------------
*/

proto._rowCount = 0;

proto.setRowCount = function(vCount)
{
  this._rowCount = vCount;
  this._syncRowDataFields();
};

proto.getRowCount = function() {
  return this._rowCount;
};

proto.addRow = function()
{
  this._rowCount++;
  this._syncRowDataFields();
};

proto.removeRow = function()
{
  if (this._rowCount > 0)
  {
    this._rowCount--;
    this._syncRowDataFields();
  };
};

proto._syncRowDataFields = function()
{
  var vData = this._rowData;
  var vOldLength = vData.length;
  var vNewLength = this._rowCount;

  this._syncDataFields(vData, vOldLength, vNewLength);
};







/*
---------------------------------------------------------------------------
  DATA HANDLING: COLUMNS
---------------------------------------------------------------------------
*/

proto._getColumnProperty = function(vColumnIndex, vProperty)
{
  try
  {
    return this._columnData[vColumnIndex][vProperty] || null;
  }
  catch(ex)
  {
    this.error("Error while getting column property (" + vColumnIndex + "|" + vProperty + "): " + ex, "_getColumnProperty");
    return null;
  };
};

proto._setupColumnProperty = function(vColumnIndex, vProperty, vValue)
{
  this._columnData[vColumnIndex][vProperty] = vValue;
  this._invalidateColumnLayout();
};

proto._removeColumnProperty = function(vColumnIndex, vProperty, vValue)
{
  delete this._columnData[vColumnIndex][vProperty];
  this._invalidateColumnLayout();
};

proto._invalidateColumnLayout = function()
{
  if (!this._initialLayoutDone || !this._isDisplayable) {
    return;
  };

  this.forEachVisibleChild(function() {
    this.addToQueue(QxConst.PROPERTY_WIDTH);
  });
};






/*
---------------------------------------------------------------------------
  DATA HANDLING: ROWS
---------------------------------------------------------------------------
*/

proto._getRowProperty = function(vRowIndex, vProperty)
{
  try
  {
    return this._rowData[vRowIndex][vProperty] || null;
  }
  catch(ex)
  {
    this.error("Error while getting row property (" + vRowIndex + "|" + vProperty + "): " + ex, "_getRowProperty");
    return null;
  };
};

proto._setupRowProperty = function(vRowIndex, vProperty, vValue)
{
  this._rowData[vRowIndex][vProperty] = vValue;
  this._invalidateRowLayout();
};

proto._removeRowProperty = function(vRowIndex, vProperty, vValue)
{
  delete this._rowData[vRowIndex][vProperty];
  this._invalidateRowLayout();
};

proto._invalidateRowLayout = function()
{
  if (!this._initialLayoutDone || !this._isDisplayable) {
    return;
  };

  this.forEachVisibleChild(function() {
    this.addToQueue(QxConst.PROPERTY_HEIGHT);
  });
};






/*
---------------------------------------------------------------------------
  UTILITIES: CELL DIMENSIONS
---------------------------------------------------------------------------
*/

// SETTER

proto.setColumnWidth = function(vIndex, vValue)
{
  this._setupColumnProperty(vIndex, "widthValue", vValue);

  var vType = QxWidget.prototype._evalUnitsPixelPercentAutoFlex(vValue);

  this._setupColumnProperty(vIndex, "widthType", vType);

  var vParsed, vComputed;

  switch(vType)
  {
    case QxWidget.TYPE_PIXEL:
      vParsed = vComputed = Math.round(vValue);
      break;

    case QxWidget.TYPE_PERCENT:
    case QxWidget.TYPE_FLEX:
      vParsed = parseFloat(vValue);
      vComputed = null;
      break;

    case QxWidget.TYPE_AUTO:
      vParsed = vComputed = null;
      break;

    default:
      vParsed = vComputed = null;
  };

  this._setupColumnProperty(vIndex, "widthParsed", vParsed);
  this._setupColumnProperty(vIndex, "widthComputed", vComputed);
};

proto.setRowHeight = function(vIndex, vValue)
{
  this._setupRowProperty(vIndex, "heightValue", vValue);

  var vType = QxWidget.prototype._evalUnitsPixelPercentAutoFlex(vValue);
  this._setupRowProperty(vIndex, "heightType", vType);

  var vParsed, vComputed;

  switch(vType)
  {
    case QxWidget.TYPE_PIXEL:
      vParsed = vComputed = Math.round(vValue);
      break;

    case QxWidget.TYPE_PERCENT:
    case QxWidget.TYPE_FLEX:
      vParsed = parseFloat(vValue);
      vComputed = null;
      break;

    case QxWidget.TYPE_AUTO:
      vParsed = vComputed = null;
      break;

    default:
      vParsed = vComputed = null;
  };

  this._setupRowProperty(vIndex, "heightParsed", vParsed);
  this._setupRowProperty(vIndex, "heightComputed", vComputed);
};



// GETTER: BOX

proto.getColumnBoxWidth = function(vIndex)
{
  var vComputed = this._getColumnProperty(vIndex, "widthComputed");

  if (vComputed != null) {
    return vComputed;
  };

  var vType = this._getColumnProperty(vIndex, "widthType");
  var vParsed = this._getColumnProperty(vIndex, "widthParsed");
  var vComputed = null;

  switch(vType)
  {
    case QxWidget.TYPE_PIXEL:
      vComputed = Math.max(0, vParsed);
      break;

    case QxWidget.TYPE_PERCENT:
      vComputed = this.getInnerWidth() * Math.max(0, vParsed) * 0.01;
      break;

    case QxWidget.TYPE_AUTO:
      // TODO
      vComputed = null;
      break;

    case QxWidget.TYPE_FLEX:
      // TODO
      vComputed = null;
      break;
  };

  this._setupColumnProperty(vIndex, "widthComputed", vComputed);
  return vComputed;
};

proto.getRowBoxHeight = function(vIndex)
{
  var vComputed = this._getRowProperty(vIndex, "heightComputed");

  if (vComputed != null) {
    return vComputed;
  };

  var vType = this._getRowProperty(vIndex, "heightType");
  var vParsed = this._getRowProperty(vIndex, "heightParsed");
  var vComputed = null;

  switch(vType)
  {
    case QxWidget.TYPE_PIXEL:
      vComputed = Math.max(0, vParsed);
      break;

    case QxWidget.TYPE_PERCENT:
      vComputed = this.getInnerHeight() * Math.max(0, vParsed) * 0.01;
      break;

    case QxWidget.TYPE_AUTO:
      // TODO
      vComputed = null;
      break;

    case QxWidget.TYPE_FLEX:
      // TODO
      vComputed = null;
      break;
  };

  this._setupRowProperty(vIndex, "heightComputed", vComputed);
  return vComputed;
};


// GETTER: PADDING

proto.getComputedCellPaddingLeft = function(vCol, vRow) {
  return this.getColumnPaddingLeft(vCol) || this.getRowPaddingLeft(vRow) || this.getCellPaddingLeft() || 0;
};

proto.getComputedCellPaddingRight = function(vCol, vRow) {
  return this.getColumnPaddingRight(vCol) || this.getRowPaddingRight(vRow) || this.getCellPaddingRight() || 0;
};

proto.getComputedCellPaddingTop = function(vCol, vRow) {
  return this.getRowPaddingTop(vRow) || this.getColumnPaddingTop(vCol) || this.getCellPaddingTop() || 0;
};

proto.getComputedCellPaddingBottom = function(vCol, vRow) {
  return this.getRowPaddingBottom(vRow) || this.getColumnPaddingBottom(vCol) || this.getCellPaddingBottom() || 0;
};


// GETTER: INNER

proto.getColumnInnerWidth = function(vCol, vRow) {
  return this.getColumnBoxWidth(vCol) - this.getComputedCellPaddingLeft(vCol, vRow) - this.getComputedCellPaddingRight(vCol, vRow);
};

proto.getRowInnerHeight = function(vCol, vRow) {
  return this.getRowBoxHeight(vRow) - this.getComputedCellPaddingTop(vCol, vRow) - this.getComputedCellPaddingBottom(vCol, vRow);
};








/*
---------------------------------------------------------------------------
  UTILITIES: CELL ALIGNMENT
---------------------------------------------------------------------------
*/

// SETTER

proto.setColumnHorizontalAlignment = function(vIndex, vValue) {
  this._setupColumnProperty(vIndex, "horizontalAlignment", vValue);
};

proto.setColumnVerticalAlignment = function(vIndex, vValue) {
  this._setupColumnProperty(vIndex, "verticalAlignment", vValue);
};

proto.setRowHorizontalAlignment = function(vIndex, vValue) {
  this._setupRowProperty(vIndex, "horizontalAlignment", vValue);
};

proto.setRowVerticalAlignment = function(vIndex, vValue) {
  this._setupRowProperty(vIndex, "verticalAlignment", vValue);
};



// GETTER

proto.getColumnHorizontalAlignment = function(vIndex) {
  return this._getColumnProperty(vIndex, "horizontalAlignment");
};

proto.getColumnVerticalAlignment = function(vIndex) {
  return this._getColumnProperty(vIndex, "verticalAlignment");
};

proto.getRowHorizontalAlignment = function(vIndex) {
  return this._getRowProperty(vIndex, "horizontalAlignment");
};

proto.getRowVerticalAlignment = function(vIndex) {
  return this._getRowProperty(vIndex, "verticalAlignment");
};






/*
---------------------------------------------------------------------------
  UTILITIES: CELL PADDING
---------------------------------------------------------------------------
*/

// SETTER

proto.setColumnPaddingTop = function(vIndex, vValue) {
  this._setupColumnProperty(vIndex, "paddingTop", vValue);
};

proto.setColumnPaddingRight = function(vIndex, vValue) {
  this._setupColumnProperty(vIndex, "paddingRight", vValue);
};

proto.setColumnPaddingBottom = function(vIndex, vValue) {
  this._setupColumnProperty(vIndex, "paddingBottom", vValue);
};

proto.setColumnPaddingLeft = function(vIndex, vValue) {
  this._setupColumnProperty(vIndex, "paddingLeft", vValue);
};

proto.setRowPaddingTop = function(vIndex, vValue) {
  this._setupRowProperty(vIndex, "paddingTop", vValue);
};

proto.setRowPaddingRight = function(vIndex, vValue) {
  this._setupRowProperty(vIndex, "paddingRight", vValue);
};

proto.setRowPaddingBottom = function(vIndex, vValue) {
  this._setupRowProperty(vIndex, "paddingBottom", vValue);
};

proto.setRowPaddingLeft = function(vIndex, vValue) {
  this._setupRowProperty(vIndex, "paddingLeft", vValue);
};



// GETTER

proto.getColumnPaddingTop = function(vIndex) {
  return this._getColumnProperty(vIndex, "paddingTop");
};

proto.getColumnPaddingRight = function(vIndex) {
  return this._getColumnProperty(vIndex, "paddingRight");
};

proto.getColumnPaddingBottom = function(vIndex) {
  return this._getColumnProperty(vIndex, "paddingBottom");
};

proto.getColumnPaddingLeft = function(vIndex) {
  return this._getColumnProperty(vIndex, "paddingLeft");
};

proto.getRowPaddingTop = function(vIndex) {
  return this._getRowProperty(vIndex, "paddingTop");
};

proto.getRowPaddingRight = function(vIndex) {
  return this._getRowProperty(vIndex, "paddingRight");
};

proto.getRowPaddingBottom = function(vIndex) {
  return this._getRowProperty(vIndex, "paddingBottom");
};

proto.getRowPaddingLeft = function(vIndex) {
  return this._getRowProperty(vIndex, "paddingLeft");
};






/*
---------------------------------------------------------------------------
  DIMENSION CACHE
---------------------------------------------------------------------------
*/

proto._changeInnerWidth = function(vNew, vOld)
{
  for (var i=0, l=this.getColumnCount(); i<l; i++) {
    if (this._getColumnProperty(i, "widthType") == QxWidget.TYPE_PERCENT) {
      this._setupColumnProperty(i, "widthComputed", null);
    };
  };

  QxParent.prototype._changeInnerWidth.call(this, vNew, vOld);
};

proto._changeInnerHeight = function(vNew, vOld)
{
  for (var i=0, l=this.getRowCount(); i<l; i++) {
    if (this._getRowProperty(i, "heightType") == QxWidget.TYPE_PERCENT) {
      this._setupRowProperty(i, "heightComputed", null);
    };
  };

  QxParent.prototype._changeInnerHeight.call(this, vNew, vOld);
};






/*
---------------------------------------------------------------------------
  DIMENSION CACHE
---------------------------------------------------------------------------
*/

proto.getInnerWidthForChild = function(vChild) {
  return this._getColumnProperty(vChild._col, "widthComputed");
};

proto.getInnerHeightForChild = function(vChild) {
  return this._getRowProperty(vChild._row, "heightComputed");
};





/*
---------------------------------------------------------------------------
  SPAN CELLS
---------------------------------------------------------------------------
*/

proto.mergeCells = function(vStartCol, vStartRow, vColLength, vRowLength)
{
  var vSpans = this._spans;
  var vLength = vSpans.length;

  // Find end cols/rows
  var vEndCol = vStartCol + vColLength - 1;
  var vEndRow = vStartRow + vRowLength - 1;

  if (this._collidesWithSpans(vStartCol, vStartRow, vEndCol, vEndRow))
  {
    this.debug("Span collision detected!");

    // Send out warning
    return false;
  };

  // Finally store new span entry
  vSpans.push({ startCol : vStartCol, startRow : vStartRow, endCol : vEndCol, endRow : vEndRow, colLength : vColLength, rowLength : vRowLength });

  // Send out ok
  return true;
};

proto.hasSpans = function() {
  return this._spans.length > 0;
};

proto.getSpanEntry = function(vCol, vRow)
{
  for (var i=0, s=this._spans, l=s.length, c; i<l; i++)
  {
    c = s[i];

    if (vCol >= c.startCol && vCol <= c.endCol && vRow >= c.startRow && vRow <= c.endRow) {
      return c;
    };
  };

  return null;
};

proto.isSpanStart = function(vCol, vRow)
{
  for (var i=0, s=this._spans, l=s.length, c; i<l; i++)
  {
    c = s[i];

    if (c.startCol == vCol && c.startRow == vRow) {
      return true;
    };
  };

  return false;
};

proto.isSpanCell = function(vCol, vRow)
{
  for (var i=0, s=this._spans, l=s.length, c; i<l; i++)
  {
    c = s[i];

    if (vCol >= c.startCol && vCol <= c.endCol && vRow >= c.startRow && vRow <= c.endRow) {
      return true;
    };
  };

  return false;
};

proto.isFillCell = function(vCol, vRow)
{
  for (var i=0, s=this._spans, l=s.length, c; i<l; i++)
  {
    c = s[i];

    if (vCol >= c.startCol && vCol <= c.endCol && vRow >= c.startRow && vRow <= c.endRow && (vCol > c.startCol || vRow > c.startRow)) {
      return true;
    };
  };

  return false;
};

proto._collidesWithSpans = function(vStartCol, vStartRow, vEndCol, vEndRow)
{
  for (var i=0, s=this._spans, l=s.length, c; i<l; i++)
  {
    c = s[i];

    if (vEndCol >= c.startCol && vStartCol <= c.endCol && vEndRow >= c.startRow && vStartRow <= c.endRow ) {
      return true;
    };
  };

  return false;
};







/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };


  delete this._columnData;
  delete this._rowData;

  delete this._spans;

  return QxParent.prototype.dispose.call(this);
};
