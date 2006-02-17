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

#package(viewcommon)

************************************************************************ */

function QxCommonViewButton(vText, vIcon, vIconWidth, vIconHeight, vFlash)
{
  QxAtom.call(this, vText, vIcon, vIconWidth, vIconHeight, vFlash);

  this.setTabIndex(1);

  // ************************************************************************
  //   MOUSE EVENTS
  // ************************************************************************
  this.addEventListener(QxConst.EVENT_TYPE_MOUSEOVER, this._onmouseover);
  this.addEventListener(QxConst.EVENT_TYPE_MOUSEOUT, this._onmouseout);
  this.addEventListener(QxConst.EVENT_TYPE_MOUSEDOWN, this._onmousedown);


  // ************************************************************************
  //   KEY EVENTS
  // ************************************************************************
  this.addEventListener(QxConst.EVENT_TYPE_KEYDOWN, this._onkeydown);
};

QxCommonViewButton.extend(QxAtom, "QxCommonViewButton");





/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

/*!
  If this tab is the currently selected/active one
*/
QxCommonViewButton.addProperty({ name : "checked", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false });

/*!
  The attached QxPage to this tab
*/
QxCommonViewButton.addProperty({ name : "page", type : QxConst.TYPEOF_OBJECT });

/*!
  The assigned QxRadioManager which handles the switching between registered buttons
*/
QxCommonViewButton.addProperty({ name : "manager", type : QxConst.TYPEOF_OBJECT, instance : "QxRadioManager", allowNull : true });

/*!
  The name of the radio group. All the radio elements in a group (registered by the same manager)
  have the same name (and could have a different value).
*/
QxCommonViewButton.addProperty({ name : "name", type : QxConst.TYPEOF_STRING });






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
  MODIFIER
---------------------------------------------------------------------------
*/

proto._modifyManager = function(propValue, propOldValue, propData)
{
  if (propOldValue) {
    propOldValue.remove(this);
  };

  if (propValue) {
    propValue.add(this);
  };

  return true;
};

proto._modifyParent = function(propValue, propOldValue, propData)
{
  if (propOldValue) {
    propOldValue.getManager().remove(this);
  };

  if (propValue) {
    propValue.getManager().add(this);
  };

  return QxAtom.prototype._modifyParent.call(this, propValue, propOldValue, propData);
};

proto._modifyPage = function(propValue, propOldValue, propData)
{
  if (propOldValue) {
    propOldValue.setButton(null);
  };

  if (propValue)
  {
    propValue.setButton(this);
    this.getChecked() ? propValue.show() : propValue.hide();
  };

  return true;
};

proto._modifyChecked = function(propValue, propOldValue, propData)
{
  if (this._hasParent)
  {
    var vManager = this.getManager();
    if (vManager) {
      vManager.handleItemChecked(this, propValue);
    };
  };

  propValue ? this.addState(QxConst.STATE_CHECKED) : this.removeState(QxConst.STATE_CHECKED);

  var vPage = this.getPage();
  if (vPage) {
    this.getChecked() ? vPage.show() : vPage.hide();
  };

  return true;
};

proto._modifyName = function(propValue, propOldValue, propData)
{
  if (this.getManager()) {
    this.getManager().setName(propValue);
  };

  return true;
};







/*
---------------------------------------------------------------------------
  EVENT HANDLER
---------------------------------------------------------------------------
*/

proto._onmousedown = function(e) {
  this.setChecked(true);
};

proto._onmouseover = function(e) {
  this.addState(QxConst.STATE_OVER);
};

proto._onmouseout = function(e) {
  this.removeState(QxConst.STATE_OVER);
};

proto._onkeydown = function(e) {};






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
  //   MOUSE EVENTS
  // ************************************************************************
  this.removeEventListener(QxConst.EVENT_TYPE_MOUSEOVER, this._onmouseover);
  this.removeEventListener(QxConst.EVENT_TYPE_MOUSEOUT, this._onmouseout);
  this.removeEventListener(QxConst.EVENT_TYPE_MOUSEDOWN, this._onmousedown);


  // ************************************************************************
  //   KEY EVENTS
  // ************************************************************************
  this.removeEventListener(QxConst.EVENT_TYPE_KEYDOWN, this._onkeydown);


  return QxAtom.prototype.dispose.call(this);
};
