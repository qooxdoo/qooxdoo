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

************************************************************************ */

function QxListView(vData, vColumns)
{
  // ************************************************************************
  //   REFERENCES
  // ************************************************************************

  this._data = vData;
  this._columns = vColumns;



  // ************************************************************************
  //   OBJECTS
  // ************************************************************************

  this._header = new QxListViewHeader(vColumns);
  this._frame = new QxHorizontalBoxLayout;
  this._pane = new QxListViewPane(vData, vColumns);
  this._scroll = new QxCanvasLayout;
  this._scrollContent = new QxTerminator;
  this._resizeLine = new QxTerminator;



  // ************************************************************************
  //   SUPERCLASS CONSTRUCTOR
  // ************************************************************************

  QxVerticalBoxLayout.call(this);



  // ************************************************************************
  //   HEADER
  // ************************************************************************

  this._header.setParent(this);



  // ************************************************************************
  //   FRAME
  // ************************************************************************

  this._frame.setParent(this);
  this._frame.setHeight(QxConst.CORE_FLEX);
  this._frame.setWidth(null);



  // ************************************************************************
  //   PANE
  // ************************************************************************

  this._pane.setParent(this._frame);



  // ************************************************************************
  //   SCROLL AREA
  // ************************************************************************

  this._scroll.setWidth(QxConst.CORE_AUTO);
  this._scroll.setOverflow(QxConst.OVERFLOW_VALUE_VERTICAL);
  this._scroll.setParent(this._frame);
  this._scroll.enableInlineEvent(QxConst.EVENT_TYPE_SCROLL);
  this._scroll.addEventListener(QxConst.EVENT_TYPE_SCROLL, this._onscroll, this);



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

  this.addEventListener(QxConst.EVENT_TYPE_MOUSEDOWN, this._onmousedown);
};

QxListView.extend(QxVerticalBoxLayout, "QxListView");




/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

QxListView.changeProperty({ name : "appearance", type : QxConst.TYPEOF_STRING, defaultValue : "list-view" });

QxListView.addProperty({ name : "resizable", type : QxConst.TYPEOF_BOOLEAN, defaultValue : true });
QxListView.addProperty({ name : "liveResize", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false });
QxListView.addProperty({ name : "sortBy", type : QxConst.TYPEOF_STRING });




/*
---------------------------------------------------------------------------
  UTILITIES
---------------------------------------------------------------------------
*/

proto.getData = function() {
  return this._data;
};

proto.getColumns = function() {
  return this._columns;
};

proto.getHeader = function() {
  return this._header;
};

proto.getFrame = function() {
  return this._frame;
};

proto.getPane = function() {
  return this._pane;
};

proto.getScroll = function() {
  return this._scroll;
};

proto.getScrollContent = function() {
  return this._scrollContent;
};

proto.getResizeLine = function() {
  return this._resizeLine;
};

proto.update = function()
{
  this.updateScrollBar();
  this.updateContent();

  // ignore updateLayout here, as it is mostly initially used
};

proto.updateScrollBar = function() {
  this._scrollContent.setHeight((this._data.length * this._pane._rowHeight) + this._pane._rowHeight);
};

/*!
  Bugfix for gecko 1.8 (the one released with firefox 1.5)
  Overflow updates if content gets smaller are problematic
  https://bugzilla.mozilla.org/show_bug.cgi?id=320106
*/
if (QxClient.isGecko() && QxClient.getVersion() >= 1.8)
{
  proto._updateScrollBar = proto.updateScrollBar;

  proto.updateScrollBar = function()
  {
    this._updateScrollBar();

    this._scroll.setStyleProperty(QxConst.PROPERTY_HEIGHT, QxConst.CORE_0PIXEL);
    this._scroll.forceHeight(0);
    this._scroll.setHeight(null);
  };
};

proto.updateContent = function() {
  this.getPane()._updateRendering(true);
};

proto.updateLayout = function() {
  this.getPane()._updateLayout();
};

proto.updateSort = function()
{
  var vSortBy = this.getSortBy();
  
  if (!vSortBy) {
    return;
  };
  
  var vCell = this._getHeaderCell(vSortBy);
  
  if (vCell) {
    vCell.updateSort();
  };
};

proto._getHeaderCell = function(vCellId)
{
  var vNewEntry = this._columns[vCellId];
  return vNewEntry ? vNewEntry.headerCell : null;
};






/*
---------------------------------------------------------------------------
  MODIFIERS
---------------------------------------------------------------------------
*/

proto._modifySortBy = function(propValue, propOldValue, propData)
{
  if (propOldValue)
  {
    var vOldCell = this._getHeaderCell(propOldValue);

    if (vOldCell) {
      vOldCell.setSortOrder(null);
    };
  };

  if (propValue)
  {
    var vNewCell = this._getHeaderCell(propValue);
    
    if (vNewCell && vNewCell.getSortOrder() == null) {
      vNewCell.setSortOrder(QxConst.SORT_ASCENDING);
    };
  };

  return true;
};






/*
---------------------------------------------------------------------------
  EVENT HANDLER
---------------------------------------------------------------------------
*/

proto._onscroll = function(e) {
  this._pane._onscroll(e);
};

proto._onmousedown = function(e) {
  this.getFocusRoot().setActiveChild(this.getPane());
};






/*
---------------------------------------------------------------------------
  DISPLAYBLE HANDLING
---------------------------------------------------------------------------
*/

proto._handleDisplayableCustom = function(vDisplayable, vParent, vHint)
{
  QxVerticalBoxLayout.prototype._handleDisplayableCustom.call(this, vDisplayable, vParent, vHint);

  if (vDisplayable)
  {
    this.updateLayout();
    this.updateScrollBar();
    this.updateContent();
  };
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

  if (this._header)
  {
    this._header.dispose();
    this._header = null;
  };

  if (this._frame)
  {
    this._frame.dispose();
    this._frame = null;
  };

  if (this._pane)
  {
    this._pane.dispose();
    this._pane = null;
  };

  if (this._scroll)
  {
    this._scroll.dispose();
    this._scroll = null;
  };

  if (this._scrollContent)
  {
    this._scrollContent.dispose();
    this._scrollContent = null;
  };

  if (this._resizeLine)
  {
    this._resizeLine.dispose();
    this._resizeLine = null;
  };

  delete this._columns;
  delete this._data;

  this.removeEventListener(QxConst.EVENT_TYPE_MOUSEDOWN, this._onmousedown);

  return QxVerticalBoxLayout.prototype.dispose.call(this);
};
