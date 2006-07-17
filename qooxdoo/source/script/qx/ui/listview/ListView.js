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

************************************************************************ */

/* ************************************************************************

#module(listview)

************************************************************************ */

qx.OO.defineClass("qx.ui.listview.ListView", qx.ui.layout.VerticalBoxLayout,
function(vData, vColumns)
{
  // ************************************************************************
  //   REFERENCES
  // ************************************************************************

  this._data = vData;
  this._columns = vColumns;



  // ************************************************************************
  //   OBJECTS
  // ************************************************************************

  this._header = new qx.ui.listview.ListViewHeader(vColumns);
  this._frame = new qx.ui.layout.HorizontalBoxLayout;
  this._pane = new qx.ui.listview.ListViewPane(vData, vColumns);
  this._scroll = new qx.ui.layout.CanvasLayout;
  this._scrollContent = new qx.ui.basic.Terminator;
  this._resizeLine = new qx.ui.basic.Terminator;



  // ************************************************************************
  //   SUPERCLASS CONSTRUCTOR
  // ************************************************************************

  qx.ui.layout.VerticalBoxLayout.call(this);



  // ************************************************************************
  //   HEADER
  // ************************************************************************

  this._header.setParent(this);



  // ************************************************************************
  //   FRAME
  // ************************************************************************

  this._frame.setParent(this);
  this._frame.setHeight(qx.constant.Core.FLEX);
  this._frame.setWidth(null);



  // ************************************************************************
  //   PANE
  // ************************************************************************

  this._pane.setParent(this._frame);



  // ************************************************************************
  //   SCROLL AREA
  // ************************************************************************

  this._scroll.setWidth(qx.constant.Core.AUTO);
  this._scroll.setOverflow(qx.constant.Style.OVERFLOW_VERTICAL);
  this._scroll.setParent(this._frame);
  this._scroll.enableInlineEvent(qx.constant.Event.SCROLL);
  this._scroll.addEventListener(qx.constant.Event.SCROLL, this._onscroll, this);



  // ************************************************************************
  //   SCROLL CONTENT
  // ************************************************************************

  this._scrollContent.setWidth(1);
  this._scrollContent.setParent(this._scroll);




  // ************************************************************************
  //   RESIZE LINE
  // ************************************************************************

  this._resizeLine.setBackgroundColor("#D6D5D9");
  this._resizeLine.setWidth(1);
  this._resizeLine.setParent(this);



  // ************************************************************************
  //   EVENTS
  // ************************************************************************

  this.addEventListener(qx.constant.Event.MOUSEDOWN, this._onmousedown);
});




/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

qx.OO.changeProperty({ name : "appearance", type : qx.constant.Type.STRING, defaultValue : "list-view" });

qx.OO.addProperty({ name : "resizable", type : qx.constant.Type.BOOLEAN, defaultValue : true });
qx.OO.addProperty({ name : "liveResize", type : qx.constant.Type.BOOLEAN, defaultValue : false });
qx.OO.addProperty({ name : "sortBy", type : qx.constant.Type.STRING });




/*
---------------------------------------------------------------------------
  UTILITIES
---------------------------------------------------------------------------
*/

qx.Proto.getData = function() {
  return this._data;
}

qx.Proto.getColumns = function() {
  return this._columns;
}

qx.Proto.getHeader = function() {
  return this._header;
}

qx.Proto.getFrame = function() {
  return this._frame;
}

qx.Proto.getPane = function() {
  return this._pane;
}

qx.Proto.getScroll = function() {
  return this._scroll;
}

qx.Proto.getScrollContent = function() {
  return this._scrollContent;
}

qx.Proto.getResizeLine = function() {
  return this._resizeLine;
}

qx.Proto.update = function()
{
  this.updateScrollBar();
  this.updateContent();

  // ignore updateLayout here, as it is mostly initially used
}

qx.Proto.updateScrollBar = function() {
  this._scrollContent.setHeight((this._data.length * this._pane._rowHeight) + this._pane._rowHeight);
}

/*!
  Bugfix for gecko 1.8 (the one released with firefox 1.5)
  Overflow updates if content gets smaller are problematic
  https://bugzilla.mozilla.org/show_bug.cgi?id=320106
*/
if (qx.sys.Client.isGecko() && qx.sys.Client.getVersion() >= 1.8)
{
  qx.Proto._updateScrollBar = qx.Proto.updateScrollBar;

  qx.Proto.updateScrollBar = function()
  {
    this._updateScrollBar();

    this._scroll.setStyleProperty(qx.constant.Style.PROPERTY_HEIGHT, qx.constant.Core.ZEROPIXEL);
    this._scroll.forceHeight(0);
    this._scroll.setHeight(null);
  }
}

qx.Proto.updateContent = function() {
  this.getPane()._updateRendering(true);
}

qx.Proto.updateLayout = function() {
  this.getPane()._updateLayout();
}

qx.Proto.updateSort = function()
{
  var vSortBy = this.getSortBy();

  if (!vSortBy) {
    return;
  }

  var vCell = this._getHeaderCell(vSortBy);

  if (vCell) {
    vCell.updateSort();
  }
}

qx.Proto._getHeaderCell = function(vCellId)
{
  var vNewEntry = this._columns[vCellId];
  return vNewEntry ? vNewEntry.headerCell : null;
}






/*
---------------------------------------------------------------------------
  MODIFIERS
---------------------------------------------------------------------------
*/

qx.Proto._modifySortBy = function(propValue, propOldValue, propData)
{
  if (propOldValue)
  {
    var vOldCell = this._getHeaderCell(propOldValue);

    if (vOldCell) {
      vOldCell.setSortOrder(null);
    }
  }

  if (propValue)
  {
    var vNewCell = this._getHeaderCell(propValue);

    if (vNewCell && vNewCell.getSortOrder() == null) {
      vNewCell.setSortOrder(qx.ui.listview.ListViewHeaderCell.C_SORT_ASCENDING);
    }
  }

  return true;
}






/*
---------------------------------------------------------------------------
  EVENT HANDLER
---------------------------------------------------------------------------
*/

qx.Proto._onscroll = function(e) {
  this._pane._onscroll(e);
}

qx.Proto._onmousedown = function(e) {
  this.getFocusRoot().setActiveChild(this.getPane());
}






/*
---------------------------------------------------------------------------
  DISPLAYBLE HANDLING
---------------------------------------------------------------------------
*/

qx.Proto._handleDisplayableCustom = function(vDisplayable, vParent, vHint)
{
  qx.ui.layout.VerticalBoxLayout.prototype._handleDisplayableCustom.call(this, vDisplayable, vParent, vHint);

  if (vDisplayable)
  {
    this.updateLayout();
    this.updateScrollBar();
    this.updateContent();
  }
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

  if (this._header)
  {
    this._header.dispose();
    this._header = null;
  }

  if (this._frame)
  {
    this._frame.dispose();
    this._frame = null;
  }

  if (this._pane)
  {
    this._pane.dispose();
    this._pane = null;
  }

  if (this._scroll)
  {
    this._scroll.dispose();
    this._scroll = null;
  }

  if (this._scrollContent)
  {
    this._scrollContent.dispose();
    this._scrollContent = null;
  }

  if (this._resizeLine)
  {
    this._resizeLine.dispose();
    this._resizeLine = null;
  }

  delete this._columns;
  delete this._data;

  this.removeEventListener(qx.constant.Event.MOUSEDOWN, this._onmousedown);

  return qx.ui.layout.VerticalBoxLayout.prototype.dispose.call(this);
}
