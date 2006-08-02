/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(listview)
#use(qx.manager.selection.VirtualSelectionManager)

************************************************************************ */

qx.OO.defineClass("qx.ui.listview.ListViewPane", qx.ui.layout.GridLayout, 
function(vData, vColumns)
{
  qx.ui.layout.GridLayout.call(this);

  // ************************************************************************
  //   DATA
  // ************************************************************************
  // Add aliases for data tables
  this._data = vData;
  this._columns = vColumns;


  // ************************************************************************
  //   INITIALIZE MANAGER
  // ************************************************************************
  this._manager = new qx.manager.selection.VirtualSelectionManager(this);


  // ************************************************************************
  //   MOUSE EVENT LISTENER
  // ************************************************************************
  // Add handling for mouse wheel events
  // Needed because the virtual scroll area does not fire browser
  // understandable events above this pane.
  this.addEventListener(qx.constant.Event.MOUSEWHEEL, this._onmousewheel);

  this.addEventListener(qx.constant.Event.MOUSEOVER, this._onmouseover);
  this.addEventListener(qx.constant.Event.MOUSEDOWN, this._onmousedown);
  this.addEventListener(qx.constant.Event.MOUSEUP, this._onmouseup);
  this.addEventListener(qx.constant.Event.CLICK, this._onclick);
  this.addEventListener(qx.constant.Event.DBLCLICK, this._ondblclick);


  // ************************************************************************
  //   KEY EVENT LISTENER
  // ************************************************************************
  this.addEventListener(qx.constant.Event.KEYDOWN, this._onkeydown);
});

qx.OO.changeProperty({ name : "appearance",
                       type : qx.constant.Type.STRING,
                       defaultValue : "list-view-pane"
                     });

qx.Proto._rowHeight = 16;






/*
---------------------------------------------------------------------------
  UTILITIES
---------------------------------------------------------------------------
*/

qx.Proto.getView = function() {
  return this.getParent().getParent();
}






/*
---------------------------------------------------------------------------
  UPDATER
---------------------------------------------------------------------------
*/

qx.Proto._lastRowCount = 0;

qx.Proto._updateLayout = function(vUpdate)
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
          vCell.setStyleProperty(qx.constant.Style.PROPERTY_TEXTALIGN,
                                 vColumns[vCol].align);
        }
      }
    }
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
      }
    }
  }

  // Update row and column count
  this.setRowCount(vRowCount);
  if (!vUpdate) {
    this.setColumnCount(qx.lang.Object.getLength(vColumns));
  }

  // Apply height to all rows
  for (var i=0; i<vRowCount; i++) {
    this.setRowHeight(i, this._rowHeight);
  }

  if (!vUpdate)
  {
    // Apply width and alignment to all columns
    var vCount = 0;
    for (var vCol in vColumns)
    {
      this.setColumnHorizontalAlignment(vCount, vColumns[vCol].align);
      this.setColumnWidth(vCount, vColumns[vCol].width);

      vCount++;
    }
  }

  // Store last row count
  this._lastRowCount = vRowCount;
}

qx.Proto._currentScrollTop = -1;

qx.Proto._updateRendering = function(vForce)
{
  if (this._updatingRendering) {
    return;
  }

  var vScrollTop = (this._initialLayoutDone
                    ? this.getView().getScroll().getScrollTop()
                    : 0);

  this._updatingRendering = true;
  this._currentScrollTop = vScrollTop;

  for (var i=0; i<this._rowCount; i++) {
    this._updateRow(i);
  }

  delete this._updatingRendering;
}

qx.Proto._updateRow = function(vRelativeRow)
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
      if (vEntry && vEntry._selected) {
        vChild.addState(qx.manager.selection.SelectionManager.STATE_SELECTED);
      } else {
        vChild.removeState(qx.manager.selection.SelectionManager.STATE_SELECTED);
      }
      vChild.set(vEntry
                 ? vEntry[vCol]
                 : vColumns[vCol].empty || vColumns[vCol].contentClass.empty);
    }
  }
}

qx.Proto._onscroll = function(e) {
  this._updateRendering();
}





/*
---------------------------------------------------------------------------
  DIMENSION CACHE
---------------------------------------------------------------------------
*/

qx.Proto._changeInnerHeight = function(vNew, vOld)
{
  this._updateLayout(true);
  this._updateRendering(true);

  return qx.ui.layout.GridLayout.prototype._changeInnerHeight.call(this,
                                                                   vNew,
                                                                   vOld);
}






/*
---------------------------------------------------------------------------
  MANAGER BINDING
---------------------------------------------------------------------------
*/

qx.Proto.getManager = function() {
  return this._manager;
}

qx.Proto.getListViewTarget = function(e)
{
  var vEventTop = e.getPageY();
  var vPaneTop = qx.dom.DomLocation.getPageInnerTop(this.getElement());
  var vItemNo = Math.floor(this._currentScrollTop / this._rowHeight) +
                Math.floor((vEventTop - vPaneTop) / this._rowHeight);

  return this._data[vItemNo];
}

qx.Proto.getSelectedItem = function() {
  return this.getSelectedItems()[0];
}

qx.Proto.getSelectedItems = function() {
  return this._manager.getSelectedItems();
}

qx.Proto.getData = function() {
  return this._data;
}

// use static row height
qx.Proto.getItemHeight = function(vItem) {
  return this._rowHeight;
}

// use the full inner width of the pane
qx.Proto.getItemWidth = function(vItem) {
  return qx.dom.DomDimension.getInnerWidth(this.getElement());
}

qx.Proto.getItemLeft = function(vItem) {
  return 0;
}

qx.Proto.getItemTop = function(vItem) {
  return this._data.indexOf(vItem) * this._rowHeight;
}




/*
---------------------------------------------------------------------------
  MOUSE EVENT HANDLER
---------------------------------------------------------------------------
*/

qx.Proto._onmousewheel = function(e)
{
  var vScroll = this.getView().getScroll();
  vScroll.setScrollTop(vScroll.getScrollTop() - (e.getWheelDelta() * 20));
}

qx.Proto._onmouseover = function(e)
{
  var vTarget = this.getListViewTarget(e);
  if (vTarget) {
    this._manager.handleMouseOver(vTarget, e);
  }
}

qx.Proto._onmousedown = function(e)
{
  var vTarget = this.getListViewTarget(e);
  if (vTarget) {
    this._manager.handleMouseDown(vTarget, e);
  }
}

qx.Proto._onmouseup = function(e)
{
  var vTarget = this.getListViewTarget(e);
  if (vTarget) {
    this._manager.handleMouseUp(vTarget, e);
  }
}

qx.Proto._onclick = function(e)
{
  var vTarget = this.getListViewTarget(e);
  if (vTarget) {
    this._manager.handleClick(vTarget, e);
  }
}

qx.Proto._ondblclick = function(e)
{
  var vTarget = this.getListViewTarget(e);
  if (vTarget) {
    this._manager.handleDblClick(vTarget, e);
  }
}






/*
---------------------------------------------------------------------------
  KEY EVENT HANDLER
---------------------------------------------------------------------------
*/

qx.Proto._onkeydown = function(e)
{
  this._manager.handleKeyDown(e);
  e.preventDefault();
}






/*
---------------------------------------------------------------------------
  MANAGER SELECTION
---------------------------------------------------------------------------
*/

qx.Proto._updateSelectionState = function(vItem, vIsSelected)
{
  vItem._selected = vIsSelected;
  this._updateItem(vItem);
}

qx.Proto._updateAnchorState = function(vItem, vIsAnchor)
{
  vItem._anchor = vIsAnchor;
  this._updateItem(vItem);
}

qx.Proto._updateLeadState = function(vItem, vIsLead)
{
  vItem._lead = vIsLead;
  this._updateItem(vItem);
}

qx.Proto.scrollItemIntoView = function(vItem, vAlignLeftTop)
{
  this.scrollItemIntoViewX(vItem, vAlignLeftTop);
  this.scrollItemIntoViewY(vItem, vAlignLeftTop);
}

qx.Proto.scrollItemIntoViewX = function(vItem, vAlignLeft) {
  // this.error("Not implemented in qx.ui.listview.ListViewPane!");
}

qx.Proto.scrollItemIntoViewY = function(vItem, vAlignTop)
{
  var vItems = this._data;
  var vOffset = vItems.indexOf(vItem) * this._rowHeight;
  var vHeight = this._rowHeight;

  // normalize client height (we want that the item is fully visible)
  var vParentHeight = (Math.floor(this.getClientHeight() / this._rowHeight) *
                       this._rowHeight);
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
  }

  if (vNewScrollTop != null) {
    this.getView().getScroll().setScrollTop(vNewScrollTop);
  }
}

qx.Proto.setScrollTop = function(vScrollTop)
{
  this.getView().getScroll().setScrollTop(vScrollTop);
  this._updateRendering();
}

qx.Proto.getScrollTop = function() {
  return this._currentScrollTop;
}

qx.Proto.setScrollLeft = function() {
  this.error("Not implemented in qx.ui.listview.ListViewPane!");
}

qx.Proto.getScrollLeft = function() {
  return 0;
}

qx.Proto.isItemVisible = function(vItem)
{
  var vIndex = this._data.indexOf(vItem);
  var vRowStart = Math.floor(this._currentScrollTop / this._rowHeight);
  var vRowLength = Math.ceil(this.getClientHeight() / this._rowHeight);

  return vIndex >= vRowStart && vIndex <= (vRowStart + vRowLength);
}

qx.Proto.getRelativeItemPosition = function(vItem)
{
  var vIndex = this._data.indexOf(vItem);
  var vRowStart = Math.floor(this._currentScrollTop / this._rowHeight);

  return vIndex - vRowStart;
}

qx.Proto._updateItem = function(vItem)
{
  var vIndex = this._data.indexOf(vItem);
  var vRowStart = Math.floor(this._currentScrollTop / this._rowHeight);
  var vRowLength = Math.ceil(this.getClientHeight() / this._rowHeight);

  if (vIndex < vRowStart || vIndex > (vRowStart + vRowLength)) {
    return;
  }

  this._updateRow(vIndex - vRowStart);
}






/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

qx.Proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  }


  // ************************************************************************
  //   MOUSE EVENT LISTENER
  // ************************************************************************
  this.removeEventListener(qx.constant.Event.MOUSEWHEEL, this._onmousewheel);
  this.removeEventListener(qx.constant.Event.MOUSEOVER, this._onmouseover);
  this.removeEventListener(qx.constant.Event.MOUSEDOWN, this._onmousedown);
  this.removeEventListener(qx.constant.Event.MOUSEUP, this._onmouseup);
  this.removeEventListener(qx.constant.Event.CLICK, this._onclick);
  this.removeEventListener(qx.constant.Event.DBLCLICK, this._ondblclick);


  // ************************************************************************
  //   KEY EVENT LISTENER
  // ************************************************************************
  this.removeEventListener(qx.constant.Event.KEYDOWN, this._onkeydown);


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
  }

  return qx.ui.layout.GridLayout.prototype.dispose.call(this);
}
