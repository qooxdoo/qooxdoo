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
#require(qx.util.Validation)
#require(qx.util.Compare)
#use(qx.ui.basic.Image)
#use(qx.ui.basic.HorizontalSpacer)

************************************************************************ */

qx.OO.defineClass("qx.ui.listview.ListViewHeaderCell", qx.ui.basic.Atom,
function(vConfig, vId)
{
  qx.ui.basic.Atom.call(this, vConfig.label, vConfig.icon, vConfig.iconWidth, vConfig.iconHeight, vConfig.flash);


  // ************************************************************************
  //   STORE REFERENCE TO CONFIG ENTRY
  // ************************************************************************
  this._config = vConfig;
  this._id = vId;


  // ************************************************************************
  //   ARGUMENTS
  // ************************************************************************
  this.setWidth(typeof vConfig.width === qx.constant.Type.UNDEFINED ? qx.constant.Core.AUTO : vConfig.width);

  if (qx.util.Validation.isValid(vConfig.minWidth)) {
    this.setMinWidth(vConfig.minWidth);
  }

  if (qx.util.Validation.isValid(vConfig.maxWidth)) {
    this.setMaxWidth(vConfig.maxWidth);
  }


  // ************************************************************************
  //   ADDITIONAL CHILDREN
  // ************************************************************************

  // Re-Enable flex support
  this.getLayoutImpl().setEnableFlexSupport(true);

  this._spacer = new qx.ui.basic.HorizontalSpacer;

  this._arrowup = new qx.ui.basic.Image("widget/arrows/up.gif");
  this._arrowup.setVerticalAlign("middle");
  this._arrowup.setDisplay(false);

  this._arrowdown = new qx.ui.basic.Image("widget/arrows/down.gif");
  this._arrowdown.setVerticalAlign("middle");
  this._arrowdown.setDisplay(false);

  this.add(this._spacer, this._arrowup, this._arrowdown);


  // ************************************************************************
  //   EVENTS
  // ************************************************************************

  this.addEventListener(qx.constant.Event.MOUSEUP, this._onmouseup);
  this.addEventListener(qx.constant.Event.MOUSEOVER, this._onmouseover);
  this.addEventListener(qx.constant.Event.MOUSEOUT, this._onmouseout);
});

qx.OO.changeProperty({ name : "appearance", type : qx.constant.Type.STRING, defaultValue : "list-view-header-cell" });
qx.OO.addProperty({ name : "sortOrder", type : qx.constant.Type.STRING, allowNull : true, possibleValues : [ "ascending", "descending" ] });

qx.Class.C_SORT_ASCENDING = "ascending";
qx.Class.C_SORT_DESCENDING = "descending";



/*
---------------------------------------------------------------------------
  UTILITIES
---------------------------------------------------------------------------
*/

qx.Proto.getView = function() {
  return this.getParent().getParent();
}

qx.Proto.getNextSortOrder = function()
{
  var vCurrentSortOrder = this.getSortOrder();

  switch(vCurrentSortOrder)
  {
    case qx.ui.listview.ListViewHeaderCell.C_SORT_ASCENDING:
      return qx.ui.listview.ListViewHeaderCell.C_SORT_DESCENDING;

    default:
      return qx.ui.listview.ListViewHeaderCell.C_SORT_ASCENDING;
  }
}

qx.Proto.updateSort = function()
{

  var vListView = this.getView();
  var vData = vListView.getData();
  var vFieldId = this._id;
  var vSortProp = this._config.sortProp || "text";
  var vSortMethod = this._config.sortMethod || qx.util.Compare.byString;

  vData.sort(function(a, b) {
    return vSortMethod(a[vFieldId][vSortProp], b[vFieldId][vSortProp]);
  });

  if (this.getSortOrder() == qx.ui.listview.ListViewHeaderCell.C_SORT_DESCENDING) {
    vData.reverse();
  }
}





/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

qx.Proto._modifySortOrder = function(propValue, propOldValue, propData)
{
  var vListView = this.getView();

  switch(propValue)
  {
    case qx.ui.listview.ListViewHeaderCell.C_SORT_ASCENDING:
      this._arrowup.setDisplay(true);
      this._arrowdown.setDisplay(false);

      vListView.setSortBy(this._id);
      break;

    case qx.ui.listview.ListViewHeaderCell.C_SORT_DESCENDING:
      this._arrowup.setDisplay(false);
      this._arrowdown.setDisplay(true);

      vListView.setSortBy(this._id);
      break;

    default:
      this._arrowup.setDisplay(false);
      this._arrowdown.setDisplay(false);

      if (vListView.getSortBy() == this._id) {
        vListView.setSortBy(null);
      }
  }

  if (propValue)
  {
    this.updateSort();
    vListView.update();
  }

  return true;
}







/*
---------------------------------------------------------------------------
  EVENT HANDLER
---------------------------------------------------------------------------
*/

qx.Proto._onmouseover = function(e) {
  this.addState(qx.ui.core.Widget.STATE_OVER);
}

qx.Proto._onmouseout = function(e) {
  this.removeState(qx.ui.core.Widget.STATE_OVER);
}

qx.Proto._onmouseup = function(e)
{
  if (!this._config.sortable || this.getParent()._resizeSeparator) {
    return;
  }

  this.setSortOrder(this.getNextSortOrder());
  e.stopPropagation();
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

  delete this._config;

  if (this._spacer)
  {
    this._spacer.dispose();
    this._spacer = null;
  }

  if (this._arrowup)
  {
    this._arrowup.dispose();
    this._arrowup = null;
  }

  if (this._arrowdown)
  {
    this._arrowdown.dispose();
    this._arrowdown = null;
  }

  this.removeEventListener(qx.constant.Event.MOUSEUP, this._onmouseup);
  this.removeEventListener(qx.constant.Event.MOUSEOVER, this._onmouseover);
  this.removeEventListener(qx.constant.Event.MOUSEOUT, this._onmouseout);

  return qx.ui.basic.Atom.prototype.dispose.call(this);
}
