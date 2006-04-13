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

#package(listview)
#post(QxDomDimension)
#post(QxDomLocation)

************************************************************************ */

qx.ui.listview.ListViewHeader = function(vColumns)
{
  qx.ui.layout.HorizontalBoxLayout.call(this);

  // This fixes the innerWidth calculation difference between the grid(pane) and the head.
  this.setPaddingRight(qx.ui.core.Widget.SCROLLBAR_SIZE);


  // ************************************************************************
  //   STORE REFERENCE TO CONFIG ENTRY
  // ************************************************************************
  this._columns = vColumns;


  // ************************************************************************
  //   CREATE HEADER CELLS
  // ************************************************************************
  var vHeadCell, vHeadSeparator;

  for (var vCol in vColumns)
  {
    vHeadCell = new qx.ui.listview.ListViewHeaderCell(vColumns[vCol], vCol);
    vHeadSeparator = new qx.ui.listview.ListViewHeaderSeparator;

    this.add(vHeadCell, vHeadSeparator);

    if (vColumns[vCol].align) {
      vHeadCell.setHorizontalChildrenAlign(vColumns[vCol].align);

      if (vColumns[vCol].align == QxConst.ALIGN_RIGHT) {
        vHeadCell.setReverseChildrenOrder(true);
      };
    };

    // store some additional data
    vColumns[vCol].contentClass = QxMain.classes["qx.ui.listview.ListViewContentCell" + (vColumns[vCol].type || "text").toFirstUp()];
    vColumns[vCol].headerCell = vHeadCell;
  };


  // ************************************************************************
  //   ADD EVENT LISTENERS
  // ************************************************************************
  this.addEventListener(QxConst.EVENT_TYPE_MOUSEMOVE, this._onmousemove);
  this.addEventListener(QxConst.EVENT_TYPE_MOUSEDOWN, this._onmousedown);
  this.addEventListener(QxConst.EVENT_TYPE_MOUSEUP, this._onmouseup);
  this.addEventListener(QxConst.EVENT_TYPE_MOUSEOUT, this._onmouseout);
};

qx.ui.listview.ListViewHeader.extend(qx.ui.layout.HorizontalBoxLayout, "qx.ui.listview.ListViewHeader");

qx.ui.listview.ListViewHeader.changeProperty({ name : "appearance", type : QxConst.TYPEOF_STRING, defaultValue : "list-view-header" });



/*
---------------------------------------------------------------------------
  RESIZE SYNC
---------------------------------------------------------------------------
*/

proto._syncColumnWidth = function(vWidth)
{
  var vChildren = this.getChildren();
  var vColumn = Math.ceil(vChildren.indexOf(this._resizeCell) / 2);

  this.getParent().getPane().setColumnWidth(vColumn, vWidth);
};

proto._syncResizeLine = function()
{
  qx.ui.core.Widget.flushGlobalQueues();

  var vParent = this.getParent();
  var vLine = vParent.getResizeLine();
  var vLeft = qx.dom.getComputedPageBoxLeft(this._resizeSeparator.getElement()) - qx.dom.getComputedPageInnerLeft(this.getElement());
  var vTop = qx.dom.getComputedBoxHeight(vParent.getHeader().getElement());
  var vHeight = qx.dom.getComputedBoxHeight(vParent.getElement()) - vTop;

  vLine._applyRuntimeTop(vTop);
  vLine._applyRuntimeHeight(vHeight);
  vLine._applyRuntimeLeft(vLeft);

  vLine.removeStyleProperty(QxConst.PROPERTY_VISIBILITY);
};




/*
---------------------------------------------------------------------------
  EVENT HANDLER
---------------------------------------------------------------------------
*/

proto._mshtml = qx.sys.Client.isMshtml();

proto._onmousemove = function(e)
{
  if (!this.getParent().getResizable()) {
    return;
  };

  if (this._resizingActive)
  {
    // Slow down mshtml a bit
    if (this._mshtml)
    {
      if ((new Date).valueOf() - this._last < 50) {
        return;
      };

      this._last = (new Date).valueOf();
    };

    var vNewLeft = e.getPageX();
    var vSizeDiff = vNewLeft - this._resizeStart;
    var vCell = this._resizeCell;

    vCell.setWidth(Math.max(4, vCell.getWidth() + vSizeDiff));
    this._resizeStart = vNewLeft;

    if (this.getParent().getLiveResize())
    {
      this._syncColumnWidth(vCell._computeBoxWidth());
    }
    else
    {
      this._syncResizeLine();
    };
  }
  else
  {
    var vTarget = e.getTarget();
    var vEventPos = e.getPageX();
    var vTargetPosLeft = qx.dom.getComputedPageBoxLeft(vTarget.getElement());
    var vTargetPosRight = vTargetPosLeft + qx.dom.getComputedBoxWidth(vTarget.getElement());

    var vResizeCursor = false;
    var vResizeSeparator = null;

    if (vTarget instanceof qx.ui.listview.ListViewHeaderSeparator)
    {
      vResizeCursor = true;
      vResizeSeparator = vTarget;
    }
    else if ((vEventPos - vTargetPosLeft) <= 10)
    {
      // Ignore first column
      if (!vTarget.isFirstChild())
      {
        vResizeCursor = true;
        vResizeSeparator = vTarget.getPreviousSibling();
      };
    }
    else if ((vTargetPosRight - vEventPos) <= 10)
    {
      vResizeCursor = true;
      vResizeSeparator = vTarget.getNextSibling();
    };

    if (!(vResizeSeparator instanceof qx.ui.listview.ListViewHeaderSeparator))
    {
      vResizeSeparator = vTarget = vResizeCursor = null;
    }

    // Check if child is marked as resizable
    else if (vResizeSeparator)
    {
      var vResizeCell = vResizeSeparator.getPreviousSibling();

      if (vResizeCell && (vResizeCell._computedWidthTypePercent || vResizeCell._config.resizable == false)) {
        vResizeSeparator = vTarget = vResizeCursor = null;
      };
    };

    // Apply global cursor
    this.getTopLevelWidget().setGlobalCursor(vResizeCursor ? "e-resize" : null);

    // Store data for mousedown
    this._resizeSeparator = vResizeSeparator;
    this._resizeTarget = vTarget;
  };
};

proto._onmousedown = function(e)
{
  if (!this._resizeSeparator) {
    return;
  };

  this._resizingActive = true;
  this._resizeStart = e.getPageX();
  this._resizeCell = this._resizeSeparator.getPreviousSibling();

  if (!this.getParent().getLiveResize()) {
    this._syncResizeLine();
  };

  this.setCapture(true);
};

proto._onmouseup = function(e)
{
  if (!this._resizingActive) {
    return;
  };

  this._syncColumnWidth(this._resizeCell.getBoxWidth());

  this.setCapture(false);
  this.getTopLevelWidget().setGlobalCursor(null);

  // Remove hover effect
  this._resizeTarget.removeState(QxConst.STATE_OVER);

  // Hide resize line
  this.getParent().getResizeLine().setStyleProperty(QxConst.PROPERTY_VISIBILITY, QxConst.CORE_HIDDEN);

  this._cleanupResizing();
};

proto._onmouseout = function(e)
{
  if (!this.getCapture()) {
    this.getTopLevelWidget().setGlobalCursor(null);
  };
};

proto._cleanupResizing = function()
{
  delete this._resizingActive;

  delete this._resizeSeparator;
  delete this._resizeTarget;
  delete this._resizeStart;
  delete this._resizeCell;
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

  this._cleanupResizing();

  this.removeEventListener(QxConst.EVENT_TYPE_MOUSEMOVE, this._onmousemove);
  this.removeEventListener(QxConst.EVENT_TYPE_MOUSEDOWN, this._onmousedown);
  this.removeEventListener(QxConst.EVENT_TYPE_MOUSEUP, this._onmouseup);
  this.removeEventListener(QxConst.EVENT_TYPE_MOUSEOUT, this._onmouseout);

  this._columns = null;

  return qx.ui.layout.HorizontalBoxLayout.prototype.dispose.call(this);
};
