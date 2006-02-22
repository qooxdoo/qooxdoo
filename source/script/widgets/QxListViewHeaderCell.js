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
#require(QxCompare)
#require(QxUtil)
#post(QxHorizontalSpacer)
#post(QxImage)

************************************************************************ */

function QxListViewHeaderCell(vConfig, vId)
{
  QxAtom.call(this, vConfig.label, vConfig.icon, vConfig.iconWidth, vConfig.iconHeight, vConfig.flash);


  // ************************************************************************
  //   STORE REFERENCE TO CONFIG ENTRY
  // ************************************************************************
  this._config = vConfig;
  this._id = vId;


  // ************************************************************************
  //   ARGUMENTS
  // ************************************************************************
  this.setWidth(typeof vConfig.width === QxConst.TYPEOF_UNDEFINED ? QxConst.CORE_AUTO : vConfig.width);

  if (QxUtil.isValid(vConfig.minWidth)) {
    this.setMinWidth(vConfig.minWidth);
  };

  if (QxUtil.isValid(vConfig.maxWidth)) {
    this.setMaxWidth(vConfig.maxWidth);
  };


  // ************************************************************************
  //   ADDITIONAL CHILDREN
  // ************************************************************************

  // Re-Enable flex support
  this.getLayoutImpl().setEnableFlexSupport(true);

  this._spacer = new QxHorizontalSpacer;

  this._arrowup = new QxImage("widgets/arrows/up.gif");
  this._arrowup.setVerticalAlign("middle");
  this._arrowup.setDisplay(false);

  this._arrowdown = new QxImage("widgets/arrows/down.gif");
  this._arrowdown.setVerticalAlign("middle");
  this._arrowdown.setDisplay(false);

  this.add(this._spacer, this._arrowup, this._arrowdown);


  // ************************************************************************
  //   EVENTS
  // ************************************************************************

  this.addEventListener(QxConst.EVENT_TYPE_MOUSEUP, this._onmouseup);
  this.addEventListener(QxConst.EVENT_TYPE_MOUSEOVER, this._onmouseover);
  this.addEventListener(QxConst.EVENT_TYPE_MOUSEOUT, this._onmouseout);
};

QxListViewHeaderCell.extend(QxAtom, "QxListViewHeaderCell");

QxListViewHeaderCell.changeProperty({ name : "appearance", type : QxConst.TYPEOF_STRING, defaultValue : "list-view-header-cell" });
QxListViewHeaderCell.addProperty({ name : "sortOrder", type : QxConst.TYPEOF_STRING, allowNull : true, possibleValues : [ "ascending", "descending" ] });





/*
---------------------------------------------------------------------------
  UTILITIES
---------------------------------------------------------------------------
*/

proto.getView = function() {
  return this.getParent().getParent();
};

proto.getNextSortOrder = function()
{
  var vCurrentSortOrder = this.getSortOrder();

  switch(vCurrentSortOrder)
  {
    case QxConst.SORT_ASCENDING:
      return QxConst.SORT_DESCENDING;

    default:
      return QxConst.SORT_ASCENDING;
  };
};

proto.updateSort = function()
{

  var vListView = this.getView();
  var vData = vListView.getData();
  var vFieldId = this._id;
  var vSortProp = this._config.sortProp || "text";
  var vSortMethod = this._config.sortMethod || QxCompare.byString;

  vData.sort(function(a, b) {
    return vSortMethod(a[vFieldId][vSortProp], b[vFieldId][vSortProp]);
  });

  if (this.getSortOrder() == QxConst.SORT_DESCENDING) {
    vData.reverse();
  };
};





/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

proto._modifySortOrder = function(propValue, propOldValue, propData)
{
  var vListView = this.getView();

  switch(propValue)
  {
    case QxConst.SORT_ASCENDING:
      this._arrowup.setDisplay(true);
      this._arrowdown.setDisplay(false);

      vListView.setSortBy(this._id);
      break;

    case QxConst.SORT_DESCENDING:
      this._arrowup.setDisplay(false);
      this._arrowdown.setDisplay(true);

      vListView.setSortBy(this._id);
      break;

    default:
      this._arrowup.setDisplay(false);
      this._arrowdown.setDisplay(false);

      if (vListView.getSortBy() == this._id) {
        vListView.setSortBy(null);
      };
  };

  if (propValue)
  {
    this.updateSort();
    vListView.update();
  };

  return true;
};







/*
---------------------------------------------------------------------------
  EVENT HANDLER
---------------------------------------------------------------------------
*/

proto._onmouseover = function(e) {
  this.addState(QxConst.STATE_OVER);
};

proto._onmouseout = function(e) {
  this.removeState(QxConst.STATE_OVER);
};

proto._onmouseup = function(e)
{
  if (!this._config.sortable || this.getParent()._resizeSeparator) {
    return;
  };

  this.setSortOrder(this.getNextSortOrder());
  e.stopPropagation();
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

  delete this._config;

  if (this._spacer)
  {
    this._spacer.dispose();
    this._spacer = null;
  };

  if (this._arrowup)
  {
    this._arrowup.dispose();
    this._arrowup = null;
  };

  if (this._arrowdown)
  {
    this._arrowdown.dispose();
    this._arrowdown = null;
  };

  this.removeEventListener(QxConst.EVENT_TYPE_MOUSEUP, this._onmouseup);
  this.removeEventListener(QxConst.EVENT_TYPE_MOUSEOVER, this._onmouseover);
  this.removeEventListener(QxConst.EVENT_TYPE_MOUSEOUT, this._onmouseout);

  return QxAtom.prototype.dispose.call(this);
};
