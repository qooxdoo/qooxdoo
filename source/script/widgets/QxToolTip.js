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

#package(tooltip)

************************************************************************ */

function QxToolTip(vLabel, vIcon)
{
  // ************************************************************************
  //   INIT
  // ************************************************************************

  QxPopupAtom.call(this, vLabel, vIcon);
  

  // ************************************************************************
  //   TIMER
  // ************************************************************************

  this._showTimer = new QxTimer(this.getShowInterval());
  this._showTimer.addEventListener(QxConst.EVENT_TYPE_INTERVAL, this._onshowtimer, this);

  this._hideTimer = new QxTimer(this.getHideInterval());
  this._hideTimer.addEventListener(QxConst.EVENT_TYPE_INTERVAL, this._onhidetimer, this);


  // ************************************************************************
  //   EVENTS
  // ************************************************************************
  this.addEventListener(QxConst.EVENT_TYPE_MOUSEOVER, this._onmouseover);
  this.addEventListener(QxConst.EVENT_TYPE_MOUSEOUT, this._onmouseover);
};

QxToolTip.extend(QxPopupAtom, "QxToolTip");

proto._minZIndex = 1e7;


/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

QxToolTip.changeProperty({ name : "appearance", type : QxConst.TYPEOF_STRING, defaultValue : "tool-tip" });

QxToolTip.addProperty({ name : "hideOnHover", type : QxConst.TYPEOF_BOOLEAN, defaultValue : true });

QxToolTip.addProperty({ name : "mousePointerOffsetX", type : QxConst.TYPEOF_NUMBER, defaultValue : 1 });
QxToolTip.addProperty({ name : "mousePointerOffsetY", type : QxConst.TYPEOF_NUMBER, defaultValue : 20 });

QxToolTip.addProperty({ name : "showInterval", type : QxConst.TYPEOF_NUMBER, defaultValue : 1000 });
QxToolTip.addProperty({ name : "hideInterval", type : QxConst.TYPEOF_NUMBER, defaultValue : 4000 });

QxToolTip.addProperty({ name : "boundToWidget", type : QxConst.TYPEOF_OBJECT, instance : "QxWidget" });








/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

proto._modifyHideInterval = function(propValue, propOldValue, propData)
{
  this._hideTimer.setInterval(propValue);
  return true;
};

proto._modifyShowInterval = function(propValue, propOldValue, propData)
{
  this._showTimer.setInterval(propValue);
  return true;
};

proto._modifyBoundToWidget = function(propValue, propOldValue, propData)
{
  if (propValue)
  {
    this.setParent(propValue.getTopLevelWidget());
  }
  else if (propOldValue)
  {
    this.setParent(null);
  };

  return true;
};






/*
---------------------------------------------------------------------------
  APPEAR/DISAPPEAR
---------------------------------------------------------------------------
*/

proto._beforeAppear = function()
{
  this._stopShowTimer();
  this._startHideTimer();
};

proto._beforeDisappear = function() {
  this._stopHideTimer();
};






/*
---------------------------------------------------------------------------
  TIMER
---------------------------------------------------------------------------
*/

proto._startShowTimer = function()
{
  if(!this._showTimer.getEnabled()) {
    this._showTimer.start();
  };
};

proto._startHideTimer = function()
{
  if(!this._hideTimer.getEnabled()) {
    this._hideTimer.start();
  };
};

proto._stopShowTimer = function()
{
  if(this._showTimer.getEnabled()) {
    this._showTimer.stop();
  };
};

proto._stopHideTimer = function()
{
  if(this._hideTimer.getEnabled()) {
    this._hideTimer.stop();
  };
};







/*
---------------------------------------------------------------------------
  EVENTS
---------------------------------------------------------------------------
*/

proto._onmouseover = function(e)
{
  if(this.getHideOnHover()) {
    this.hide();
  };
};

proto._onshowtimer = function(e)
{
  this.setLeft(QxMouseEvent.getPageX() + this.getMousePointerOffsetX());
  this.setTop(QxMouseEvent.getPageY() + this.getMousePointerOffsetY());

  this.show();

  // we need a manual flushing because it could be that
  // there is currently no event which do this for us
  // and so show the tooltip.
  QxWidget.flushGlobalQueues();

  return true;
};

proto._onhidetimer = function(e) {
  return this.hide();
};







/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if(this.getDisposed()) {
    return;
  };

  this.removeEventListener(QxConst.EVENT_TYPE_MOUSEOVER, this._onmouseover);
  this.removeEventListener(QxConst.EVENT_TYPE_MOUSEOUT, this._onmouseover);

  if (this._showTimer)
  {
    this._showTimer.removeEventListener(QxConst.EVENT_TYPE_INTERVAL, this._onshowtimer, this);
    this._showTimer.dispose();
    this._showTimer = null;
  };

  if (this._hideTimer)
  {
    this._hideTimer.removeEventListener(QxConst.EVENT_TYPE_INTERVAL, this._onhidetimer, this);
    this._hideTimer.dispose();
    this._hideTimer = null;
  };

  return QxPopupAtom.prototype.dispose.call(this);
};
