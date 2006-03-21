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

#package(popup)

************************************************************************ */

function QxPopup()
{
  QxCanvasLayout.call(this);

  this.setZIndex(this._minZIndex);
};

QxPopup.extend(QxCanvasLayout, "QxPopup");

QxPopup.changeProperty({ name : "appearance", type : QxConst.TYPEOF_STRING, defaultValue : "popup" });

/*!
  Whether to let the system decide when to hide the popup. Setting
  this to false gives you better control but it also requires you
  to handle the closing of the popup.
*/
QxPopup.addProperty({ name : "autoHide", type : QxConst.TYPEOF_BOOLEAN, defaultValue : true });

/*!
  Make element displayed (if switched to true the widget will be created, if needed, too).
  Instead of QxWidget, the default is false here.
*/
QxPopup.changeProperty({ name : "display", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false });

/*!
  Center the popup on open
*/
QxPopup.addProperty({ name : "centered", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false });


proto._showTimeStamp = (new Date(0)).valueOf();
proto._hideTimeStamp = (new Date(0)).valueOf();





/*
---------------------------------------------------------------------------
  APPEAR/DISAPPEAR
---------------------------------------------------------------------------
*/

proto._beforeAppear = function()
{
  QxCanvasLayout.prototype._beforeAppear.call(this);

  QxPopupManager.add(this);
  QxPopupManager.update(this);

  this._showTimeStamp = (new Date).valueOf();
  this.bringToFront();
};

proto._beforeDisappear = function()
{
  QxCanvasLayout.prototype._beforeDisappear.call(this);

  QxPopupManager.remove(this);

  this._hideTimeStamp = (new Date).valueOf();
};





/*
---------------------------------------------------------------------------
  ACTIVE/INACTIVE
---------------------------------------------------------------------------
*/

proto._makeActive = function() {
  this.getFocusRoot().setActiveChild(this);
};

proto._makeInactive = function()
{
  var vRoot = this.getFocusRoot();
  var vCurrent = vRoot.getActiveChild();

  if (vCurrent == this) {
    vRoot.setActiveChild(vRoot);
  };
};





/*
---------------------------------------------------------------------------
  FOCUS
---------------------------------------------------------------------------
*/

proto.isFocusable = function() {
  return false;
};





/*
---------------------------------------------------------------------------
  ZIndex Positioning
---------------------------------------------------------------------------
*/

proto._minZIndex = 1e6;

proto.bringToFront = function()
{
  this.forceZIndex(Infinity);
  this._sendTo();
};

proto.sendToBack = function()
{
  this.forceZIndex(-Infinity);
  this._sendTo();
};

proto._sendTo = function()
{
  var vPopups = QxUtil.convertObjectValuesToArray(QxPopupManager.getAll());
  var vMenus = QxUtil.convertObjectValuesToArray(QxMenuManager.getAll());

  var vAll = vPopups.concat(vMenus).sort(QxCompare.byZIndex);
  var vLength = vAll.length;
  var vIndex = this._minZIndex;

  for (var i=0; i<vLength; i++) {
    vAll[i].setZIndex(vIndex++);
  };
};






/*
---------------------------------------------------------------------------
  TIMESTAMP HANDLING
---------------------------------------------------------------------------
*/

proto.getShowTimeStamp = function() {
  return this._showTimeStamp;
};

proto.getHideTimeStamp = function() {
  return this._hideTimeStamp;
};

/*
---------------------------------------------------------------------------
  UTILITIES
---------------------------------------------------------------------------
*/

proto.centerToBrowser = function()
{
  var d = window.application.getClientWindow().getClientDocument();

  var left = (d.getClientWidth() - this.getBoxWidth()) / 2;
  var top = (d.getClientHeight() - this.getBoxHeight()) / 2;

  this.setLeft(left < 0 ? 0 : left);
  this.setTop(top < 0 ? 0 : top);
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

  this._showTimeStamp = null;
  this._hideTimeStamp = null;

  return QxCanvasLayout.prototype.dispose.call(this);
};
