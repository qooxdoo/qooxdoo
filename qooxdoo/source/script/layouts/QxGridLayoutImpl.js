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

************************************************************************ */

function QxGridLayoutImpl(vWidget) {
  QxLayoutImpl.call(this, vWidget);
};

QxGridLayoutImpl.extend(QxLayoutImpl, "QxGridLayoutImpl");




/*!
  Global Structure:

  [01] COMPUTE BOX DIMENSIONS FOR AN INDIVIDUAL CHILD
  [03] COMPUTE NEEDED DIMENSIONS FOR ALL CHILDREN
  [04] UPDATE LAYOUT WHEN A CHILD CHANGES ITS OUTER DIMENSIONS
  [05] UPDATE CHILD ON INNER DIMENSION CHANGES OF LAYOUT
  [06] UPDATE LAYOUT ON JOB QUEUE FLUSH
  [07] UPDATE CHILDREN ON JOB QUEUE FLUSH
  [08] CHILDREN ADD/REMOVE/MOVE HANDLING
  [09] FLUSH LAYOUT QUEUES OF CHILDREN
  [10] LAYOUT CHILD
  [11] DISPOSER

  Inherits from QxLayoutImpl:

  [04] UPDATE LAYOUT WHEN A CHILD CHANGES ITS OUTER DIMENSIONS
  [06] UPDATE LAYOUT ON JOB QUEUE FLUSH
  [07] UPDATE CHILDREN ON JOB QUEUE FLUSH
  [08] CHILDREN ADD/REMOVE/MOVE HANDLING
  [09] FLUSH LAYOUT QUEUES OF CHILDREN
  [11] DISPOSER
*/



/*
---------------------------------------------------------------------------
  [01] COMPUTE BOX DIMENSIONS FOR AN INDIVIDUAL CHILD
---------------------------------------------------------------------------
*/

/*!
  Compute and return the box width of the given child.
*/
proto.computeChildBoxWidth = function(vChild) 
{
  var vWidget = this.getWidget();
  var vColWidth = vWidget.getColumnInnerWidth(vChild._col, vChild._row);
  
  // extend colwidth to spanned area
  if (vWidget.isSpanStart(vChild._col, vChild._row))
  {
    var vEntry = vWidget.getSpanEntry(vChild._col, vChild._row);
    for (var i=1; i<vEntry.colLength; i++) 
    {
      // right padding from the previous cell
      vColWidth += vWidget.getComputedCellPaddingRight(vChild._col + i - 1, vChild._row);
      
      // left padding from the current cell
      vColWidth += vWidget.getComputedCellPaddingLeft(vChild._col + i, vChild._row);

      // spacing between previous and current cell
      vColWidth += vWidget.getHorizontalSpacing();
      
      // inner width of the current cell plus
      vColWidth += vWidget.getColumnInnerWidth(vChild._col + i, vChild._row);
    };
  };
  
  return vChild.getAllowStretchX() ? vColWidth : Math.min(vChild.getWidthValue(), vColWidth);
};

/*!
  Compute and return the box height of the given child.
*/
proto.computeChildBoxHeight = function(vChild) 
{
  var vWidget = this.getWidget();
  var vRowHeight = vWidget.getRowInnerHeight(vChild._col, vChild._row);
  
  // extend colwidth to spanned area
  if (vWidget.isSpanStart(vChild._col, vChild._row))
  {
    var vEntry = vWidget.getSpanEntry(vChild._col, vChild._row);
    for (var i=1; i<vEntry.rowLength; i++) 
    {
      // right padding from the previous cell
      vRowHeight += vWidget.getComputedCellPaddingBottom(vChild._col, vChild._row + i - 1);
      
      // left padding from the current cell
      vRowHeight += vWidget.getComputedCellPaddingTop(vChild._col, vChild._row + i);
            
      // spacing between previous and current cell
      vRowHeight += vWidget.getVerticalSpacing();
      
      // inner width of the current cell plus
      vRowHeight += vWidget.getRowInnerHeight(vChild._col, vChild._row + i);
    };
  };

  return vChild.getAllowStretchY() ? vRowHeight : Math.min(vChild.getHeightValue(), vRowHeight);
};







/*
---------------------------------------------------------------------------
  [03] COMPUTE NEEDED DIMENSIONS FOR ALL CHILDREN
---------------------------------------------------------------------------
*/

/*!
  Compute and return the width needed by all children of this widget
  which is in a grid layout the width used by all columns.
*/
proto.computeChildrenNeededWidth = function()
{
  var vWidget = this.getWidget();
  var vSpacingX = vWidget.getHorizontalSpacing();
  var vSum = -vSpacingX;
  
  for (var i=0, l=vWidget.getColumnCount(); i<l; i++) {
    vSum += vWidget.getColumnBoxWidth(i) + vSpacingX;
  };

  return vSum;
};

/*!
  Compute and return the height needed by all children of this widget
  which is in a grid layout the height used by all rows.
*/
proto.computeChildrenNeededHeight = function()
{
  var vWidget = this.getWidget();
  var vSpacingY = vWidget.getVerticalSpacing();
  var vSum = -vSpacingY;
  
  for (var i=0, l=vWidget.getRowCount(); i<l; i++) {
    vSum += vWidget.getRowBoxHeight(i) + vSpacingY;
  };

  return vSum;  
};







/*
---------------------------------------------------------------------------
  [05] UPDATE CHILD ON INNER DIMENSION CHANGES OF LAYOUT
---------------------------------------------------------------------------
*/

/*!
  Actions that should be done if the inner width of the widget was changed.
  Normally this includes update to percent values and ranges.
*/
proto.updateChildOnInnerWidthChange = function(vChild)
{
  vChild._recomputePercentX();
  vChild.addToLayoutChanges(QxConst.JOB_LOCATIONX);

  return true;
};

/*!
  Actions that should be done if the inner height of the widget was changed.
  Normally this includes update to percent values and ranges.
*/
proto.updateChildOnInnerHeightChange = function(vChild)
{
  vChild._recomputePercentY();
  vChild.addToLayoutChanges(QxConst.JOB_LOCATIONY);

  return true;
};








/*
---------------------------------------------------------------------------
  [10] LAYOUT CHILD
---------------------------------------------------------------------------
*/

/*!
  This is called from QxWidget and  it's task is to apply the layout
  (excluding border and padding) to the child.
*/

proto.layoutChild = function(vChild, vJobs)
{
  var vWidget = this.getWidget();
  
  this.layoutChild_sizeX(vChild, vJobs);
  this.layoutChild_sizeY(vChild, vJobs);

  this.layoutChild_sizeLimitX(vChild, vJobs);
  this.layoutChild_sizeLimitY(vChild, vJobs);  
  
  this.layoutChild_marginX(vChild, vJobs);
  this.layoutChild_marginY(vChild, vJobs);
  
  this.layoutChild_locationX(vChild, vJobs);
  this.layoutChild_locationY(vChild, vJobs);
};

proto.layoutChild_sizeX = function(vChild, vJobs)
{
  vChild._applyRuntimeWidth(vChild.getBoxWidth());
};

proto.layoutChild_sizeY = function(vChild, vJobs)
{
  vChild._applyRuntimeHeight(vChild.getBoxHeight());
};

proto.layoutChild_locationX = function(vChild, vJobs)
{
  var vWidget = this.getWidget();
  var vSpacingX = vWidget.getHorizontalSpacing();
  var vLocSumX = vWidget.getPaddingLeft() + vWidget.getComputedCellPaddingLeft(vChild._col, vChild._row);
  
  for (var i=0; i<vChild._col; i++) {
    vLocSumX += vWidget.getColumnBoxWidth(i) + vSpacingX;
  };
  
  switch(vChild.getHorizontalAlign() || vWidget.getColumnHorizontalAlignment(vChild._col) || vWidget.getRowHorizontalAlignment(vChild._row) || vWidget.getHorizontalChildrenAlign())
  {
    case QxConst.ALIGN_CENTER:
      vLocSumX += Math.round((vWidget.getColumnInnerWidth(vChild._col, vChild._row) - vChild.getBoxWidth()) / 2);
      break;
    
    case QxConst.ALIGN_RIGHT:
      vLocSumX += vWidget.getColumnInnerWidth(vChild._col, vChild._row) - vChild.getBoxWidth();
      break;
  };
  
  vChild._applyRuntimeLeft(vLocSumX);  
};
  
proto.layoutChild_locationY = function(vChild, vJobs)
{
  var vWidget = this.getWidget();
  var vSpacingY = vWidget.getVerticalSpacing();
  var vLocSumY = vWidget.getPaddingTop() + vWidget.getComputedCellPaddingTop(vChild._col, vChild._row);
  
  for (var i=0; i<vChild._row; i++) {
    vLocSumY += vWidget.getRowBoxHeight(i) + vSpacingY;
  };
  
  switch(vChild.getVerticalAlign() || vWidget.getRowVerticalAlignment(vChild._row) || vWidget.getColumnVerticalAlignment(vChild._col) || vWidget.getVerticalChildrenAlign())
  {
    case QxConst.ALIGN_MIDDLE:
      vLocSumY += Math.round((vWidget.getRowInnerHeight(vChild._col, vChild._row) - vChild.getBoxHeight()) / 2);
      break;
    
    case QxConst.ALIGN_BOTTOM:
      vLocSumY += vWidget.getRowInnerHeight(vChild._col, vChild._row) - vChild.getBoxHeight();
      break;
  };

  vChild._applyRuntimeTop(vLocSumY);
};