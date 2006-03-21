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
#post(QxVirtualSelectionManager)

************************************************************************ */

function QxListViewPane(vData, vColumns)
{
  QxGridLayout.call(this);

  // ************************************************************************
  //   DATA
  // ************************************************************************
  // Add aliases for data tables
  this._data = vData;
  this._columns = vColumns;


  // ************************************************************************
  //   INITILISIZE MANAGER
  // ************************************************************************
  this._manager = new QxVirtualSelectionManager(this);


  // ************************************************************************
  //   MOUSE EVENT LISTENER
  // ************************************************************************
  // Add handling for mouse wheel events
  // Needed because the virtual scroll area does not fire browser understandable
  // events above this pane.
  this.addEventListener(QxConst.EVENT_TYPE_MOUSEWHEEL, this._onmousewheel);

  this.addEventListener(QxConst.EVENT_TYPE_MOUSEOVER, this._onmouseover);
  this.addEventListener(QxConst.EVENT_TYPE_MOUSEDOWN, this._onmousedown);
  this.addEventListener(QxConst.EVENT_TYPE_MOUSEUP, this._onmouseup);
  this.addEventListener(QxConst.EVENT_TYPE_CLICK, this._onclick);
  this.addEventListener(QxConst.EVENT_TYPE_DBLCLICK, this._ondblclick);


  // ************************************************************************
  //   KEY EVENT LISTENER
  // ************************************************************************
  this.addEventListener(QxConst.EVENT_TYPE_KEYDOWN, this._onkeydown);
};

QxListViewPane.extend(QxGridLayout, "QxListViewPane");

QxListViewPane.changeProperty({ name : "appearance", type : QxConst.TYPEOF_STRING, defaultValue : "list-view-pane" });

proto._rowHeight = 16;






/*
---------------------------------------------------------------------------
  UTILITIES
---------------------------------------------------------------------------
*/

proto.getView = function() {
  return this.getParent().getParent();
};






/*
---------------------------------------------------------------------------
  UPDATER
---------------------------------------------------------------------------
*/

proto._lastRowCount = 0;

proto._updateLayout = function(vUpdate)
{
  // this.debug("InnerHeight: " + this._computeInnerHeight());
  // this.debug("BoxHeight: " + this._computeBoxHeight());
  // return

  var vColumns = this._columns;
  var vRowCount = Math.ceil(this.getInnerHeight() / this._rowHeight);
  var vData = this._data;
  var vCell;

  // this.debug("Row-Count: " + this._lastRowCount + " => " + vRowCount);

  // Sync cells: Add new ones and configure them
  if (vRowCount > this._lastRowCount)
  {
    for (var i=this._lastRowCount, j=0; i<vRowCount; i++, j=0)
    {
      for (var vCol in vColumns)
      {
        vCell = new vColumns[vCol].contentClass;

        this.add(vCell, j++, i);

        if (vColumns[vCol].align) {
          vCell.setStyleProperty(QxConst.PROPERTY_TEXTALIGN, vColumns[vCol].align);
        };
      };
    };
  }

  // Sync cells: Remove existing ones and dispose them
  else if (this._lastRowCount > vRowCount)
  {
    var vChildren = this.getChildren();
    var vChildrenLength = vChildren.length - 1;

    for (var i=this._lastRowCount; i>vRowCount; i--)
    {
      for (var vCol in vColumns)
      {
        vCell = vChildren[vChildrenLength--];
        this.remove(vCell);
        vCell.dispose();
      };
    };
  };

  // Update row and column count
  this.setRowCount(vRowCount);
  if (!vUpdate) {
    this.setColumnCount(QxUtil.getObjectLength(vColumns));
  };

  // Apply height to all rows
  for (var i=0; i<vRowCount; i++) {
    this.setRowHeight(i, this._rowHeight);
  };

  if (!vUpdate)
  {
    // Apply width and alignment to all columns
    var vCount = 0;
    for (var vCol in vColumns)
    {
      this.setColumnHorizontalAlignment(vCount, vColumns[vCol].align);
      this.setColumnWidth(vCount, vColumns[vCol].width);

      vCount++;
    };
  };

  // Store last row count
  this._lastRowCount = vRowCount;
};

proto._currentScrollTop = -1;

proto._updateRendering = function(vForce)
{
  if (this._updatingRendering) {
    return;
  };

  var vScrollTop = this._initialLayoutDone ? this.getView().getScroll().getScrollTop() : 0;

  this._updatingRendering = true;
  this._currentScrollTop = vScrollTop;

  for (var i=0; i<this._rowCount; i++) {
    this._updateRow(i);
  };

  delete this._updatingRendering;
};

proto._updateRow = function(vRelativeRow)
{
  var vData = this._data;
  var vRowOffset = Math.floor(this._currentScrollTop / this._rowHeight);

  var vColumnCount = this.getColumnCount();
  var vColumns = this._columns;

  var vChildren = this.getVisibleChildren();
  var vChild, vEntry, vCol;

  var j=0;

  for (vCol in vColumns)
  {
    vEntry = vData[vRowOffset+vRelativeRow];
    vChild = vChildren[vColumnCount*vRelativeRow+(j++)];

    if (vChild)
    {
      vEntry && vEntry._selected ? vChild.addState(QxConst.STATE_SELECTED) : vChild.removeState(QxConst.STATE_SELECTED);
      vChild.set(vEntry ? vEntry[vCol] : vColumns[vCol].empty || vColumns[vCol].contentClass.empty);
    };
  };
};

proto._onscroll = function(e) {
  this._updateRendering();
};





/*
---------------------------------------------------------------------------
  DIMENSION CACHE
---------------------------------------------------------------------------
*/

proto._changeInnerHeight = function(vNew, vOld)
{
  this._updateLayout(true);
  this._updateRendering(true);

  return QxGridLayout.prototype._changeInnerHeight.call(this, vNew, vOld);
};






/*
---------------------------------------------------------------------------
  MANAGER BINDING
---------------------------------------------------------------------------
*/

proto.getManager = function() {
  return this._manager;
};

proto.getListViewTarget = function(e)
{
  var vEventTop = e.getPageY();
  var vPaneTop = QxDom.getComputedPageInnerTop(this.getElement());
  var vItemNo = Math.floor(this._currentScrollTop / this._rowHeight) + 
                Math.floor((vEventTop - vPaneTop) / this._rowHeight);

  return this._data[vItemNo];
};

proto.getSelectedItem = function() {
  return this.getSelectedItems()[0];
};

proto.getSelectedItems = function() {
  return this._manager.getSelectedItems();
};

proto.getData = function() {
  return this._data;
};

// use static row height
proto.getItemHeight = function(vItem) {
  return this._rowHeight;
};

// use the full inner width of the pane
proto.getItemWidth = function(vItem) {
  return QxDom.getComputedInnerWidth(this.getElement());
};

proto.getItemLeft = function(vItem) {
  return 0;
};

proto.getItemTop = function(vItem) {
  return this._data.indexOf(vItem) * this._rowHeight;
};




/*
---------------------------------------------------------------------------
  MOUSE EVENT HANDLER
---------------------------------------------------------------------------
*/

proto._onmousewheel = function(e)
{
  var vScroll = this.getView().getScroll();
  vScroll.setScrollTop(vScroll.getScrollTop() - (e.getWheelDelta() * 20));
};

proto._onmouseover = function(e)
{
  var vTarget = this.getListViewTarget(e);
  if (vTarget) {
    this._manager.handleMouseOver(vTarget, e);
  };
};

proto._onmousedown = function(e)
{
  var vTarget = this.getListViewTarget(e);
  if (vTarget) {
    this._manager.handleMouseDown(vTarget, e);
  };
};

proto._onmouseup = function(e)
{
  var vTarget = this.getListViewTarget(e);
  if (vTarget) {
    this._manager.handleMouseUp(vTarget, e);
  };
};

proto._onclick = function(e)
{
  var vTarget = this.getListViewTarget(e);
  if (vTarget) {
    this._manager.handleClick(vTarget, e);
  };
};

proto._ondblclick = function(e)
{
  var vTarget = this.getListViewTarget(e);
  if (vTarget) {
    this._manager.handleDblClick(vTarget, e);
  };
};






/*
---------------------------------------------------------------------------
  KEY EVENT HANDLER
---------------------------------------------------------------------------
*/

proto._onkeydown = function(e)
{
  this._manager.handleKeyDown(e);
  e.preventDefault();
};






/*
---------------------------------------------------------------------------
  MANAGER SELECTION
---------------------------------------------------------------------------
*/

proto._updateSelectionState = function(vItem, vIsSelected)
{
  vItem._selected = vIsSelected;
  this._updateItem(vItem);
};

proto._updateAnchorState = function(vItem, vIsAnchor)
{
  vItem._anchor = vIsAnchor;
  this._updateItem(vItem);
};

proto._updateLeadState = function(vItem, vIsLead)
{
  vItem._lead = vIsLead;
  this._updateItem(vItem);
};

proto.scrollItemIntoView = function(vItem, vAlignLeftTop)
{
  this.scrollItemIntoViewX(vItem, vAlignLeftTop);
  this.scrollItemIntoViewY(vItem, vAlignLeftTop);
};

proto.scrollItemIntoViewX = function(vItem, vAlignLeft) {
  // this.error("Not implemented in QxListViewPane!", "scrollItemIntoViewX");
};

proto.scrollItemIntoViewY = function(vItem, vAlignTop)
{
  var vItems = this._data;
  var vOffset = vItems.indexOf(vItem) * this._rowHeight;
  var vHeight = this._rowHeight;

  // normalize client height (we want that the item is fully visible)
  var vParentHeight = Math.floor(this.getClientHeight() / this._rowHeight) * this._rowHeight;
  var vParentScrollTop = this._currentScrollTop;

  var vNewScrollTop = null;

  if (vAlignTop)
  {
    vNewScrollTop = vOffset;
  }
  else if (vAlignTop == false)
  {
    vNewScrollTop = vOffset + vHeight - vParentHeight;
  }
  else if (vHeight > vParentHeight || vOffset < vParentScrollTop)
  {
    vNewScrollTop = vOffset;
  }
  else if ((vOffset + vHeight) > (vParentScrollTop + vParentHeight))
  {
    vNewScrollTop = vOffset + vHeight - vParentHeight;
  };

  if (vNewScrollTop != null) {
    this.getView().getScroll().setScrollTop(vNewScrollTop);
  };
};

proto.setScrollTop = function(vScrollTop)
{
  this.getView().getScroll().setScrollTop(vScrollTop);
  this._updateRendering();
};

proto.getScrollTop = function() {
  return this._currentScrollTop;
};

proto.setScrollLeft = function() {
  this.error("Not implemented in QxListViewPane!", "setScrollLeft");
};

proto.getScrollLeft = function() {
  return 0;
};

proto.isItemVisible = function(vItem)
{
  var vIndex = this._data.indexOf(vItem);
  var vRowStart = Math.floor(this._currentScrollTop / this._rowHeight);
  var vRowLength = Math.ceil(this.getClientHeight() / this._rowHeight);

  return vIndex >= vRowStart && vIndex <= (vRowStart + vRowLength);
};

proto.getRelativeItemPosition = function(vItem)
{
  var vIndex = this._data.indexOf(vItem);
  var vRowStart = Math.floor(this._currentScrollTop / this._rowHeight);

  return vIndex - vRowStart;
};

proto._updateItem = function(vItem)
{
  var vIndex = this._data.indexOf(vItem);
  var vRowStart = Math.floor(this._currentScrollTop / this._rowHeight);
  var vRowLength = Math.ceil(this.getClientHeight() / this._rowHeight);

  if (vIndex < vRowStart || vIndex > (vRowStart + vRowLength)) {
    return;
  };

  this._updateRow(vIndex - vRowStart);
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


  // ************************************************************************
  //   MOUSE EVENT LISTENER
  // ************************************************************************
  this.removeEventListener(QxConst.EVENT_TYPE_MOUSEWHEEL, this._onmousewheel);
  this.removeEventListener(QxConst.EVENT_TYPE_MOUSEOVER, this._onmouseover);
  this.removeEventListener(QxConst.EVENT_TYPE_MOUSEDOWN, this._onmousedown);
  this.removeEventListener(QxConst.EVENT_TYPE_MOUSEUP, this._onmouseup);
  this.removeEventListener(QxConst.EVENT_TYPE_CLICK, this._onclick);
  this.removeEventListener(QxConst.EVENT_TYPE_DBLCLICK, this._ondblclick);


  // ************************************************************************
  //   KEY EVENT LISTENER
  // ************************************************************************
  this.removeEventListener(QxConst.EVENT_TYPE_KEYDOWN, this._onkeydown);


  // ************************************************************************
  //   DATA
  // ************************************************************************
  delete this._data;
  delete this._columns;


  // ************************************************************************
  //   MANAGER
  // ************************************************************************
  if (this._manager)
  {
    this._manager.dispose();
    this._manager = null;
  };

  return QxGridLayout.prototype.dispose.call(this);
};
