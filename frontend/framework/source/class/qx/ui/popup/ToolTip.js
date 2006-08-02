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

#module(tooltip)

************************************************************************ */

qx.OO.defineClass("qx.ui.popup.ToolTip", qx.ui.popup.PopupAtom, 
function(vLabel, vIcon)
{
  // ************************************************************************
  //   INIT
  // ************************************************************************

  qx.ui.popup.PopupAtom.call(this, vLabel, vIcon);


  // ************************************************************************
  //   TIMER
  // ************************************************************************

  this._showTimer = new qx.client.Timer(this.getShowInterval());
  this._showTimer.addEventListener(qx.constant.Event.INTERVAL, this._onshowtimer, this);

  this._hideTimer = new qx.client.Timer(this.getHideInterval());
  this._hideTimer.addEventListener(qx.constant.Event.INTERVAL, this._onhidetimer, this);


  // ************************************************************************
  //   EVENTS
  // ************************************************************************
  this.addEventListener(qx.constant.Event.MOUSEOVER, this._onmouseover);
  this.addEventListener(qx.constant.Event.MOUSEOUT, this._onmouseover);
});

qx.Proto._minZIndex = 1e7;


/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

qx.OO.changeProperty({ name : "appearance", type : qx.constant.Type.STRING, defaultValue : "tool-tip" });

qx.OO.addProperty({ name : "hideOnHover", type : qx.constant.Type.BOOLEAN, defaultValue : true });

qx.OO.addProperty({ name : "mousePointerOffsetX", type : qx.constant.Type.NUMBER, defaultValue : 1 });
qx.OO.addProperty({ name : "mousePointerOffsetY", type : qx.constant.Type.NUMBER, defaultValue : 20 });

qx.OO.addProperty({ name : "showInterval", type : qx.constant.Type.NUMBER, defaultValue : 1000 });
qx.OO.addProperty({ name : "hideInterval", type : qx.constant.Type.NUMBER, defaultValue : 4000 });

qx.OO.addProperty({ name : "boundToWidget", type : qx.constant.Type.OBJECT, instance : "qx.ui.core.Widget" });








/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

qx.Proto._modifyHideInterval = function(propValue, propOldValue, propData)
{
  this._hideTimer.setInterval(propValue);
  return true;
}

qx.Proto._modifyShowInterval = function(propValue, propOldValue, propData)
{
  this._showTimer.setInterval(propValue);
  return true;
}

qx.Proto._modifyBoundToWidget = function(propValue, propOldValue, propData)
{
  if (propValue)
  {
    this.setParent(propValue.getTopLevelWidget());
  }
  else if (propOldValue)
  {
    this.setParent(null);
  }

  return true;
}






/*
---------------------------------------------------------------------------
  APPEAR/DISAPPEAR
---------------------------------------------------------------------------
*/

qx.Proto._beforeAppear = function()
{
  this._stopShowTimer();
  this._startHideTimer();
}

qx.Proto._beforeDisappear = function() {
  this._stopHideTimer();
}






/*
---------------------------------------------------------------------------
  TIMER
---------------------------------------------------------------------------
*/

qx.Proto._startShowTimer = function()
{
  if(!this._showTimer.getEnabled()) {
    this._showTimer.start();
  }
}

qx.Proto._startHideTimer = function()
{
  if(!this._hideTimer.getEnabled()) {
    this._hideTimer.start();
  }
}

qx.Proto._stopShowTimer = function()
{
  if(this._showTimer.getEnabled()) {
    this._showTimer.stop();
  }
}

qx.Proto._stopHideTimer = function()
{
  if(this._hideTimer.getEnabled()) {
    this._hideTimer.stop();
  }
}







/*
---------------------------------------------------------------------------
  EVENTS
---------------------------------------------------------------------------
*/

qx.Proto._onmouseover = function(e)
{
  if(this.getHideOnHover()) {
    this.hide();
  }
}

qx.Proto._onshowtimer = function(e)
{
  this.setLeft(qx.event.type.MouseEvent.getPageX() + this.getMousePointerOffsetX());
  this.setTop(qx.event.type.MouseEvent.getPageY() + this.getMousePointerOffsetY());

  this.show();

  // we need a manual flushing because it could be that
  // there is currently no event which do this for us
  // and so show the tooltip.
  qx.ui.core.Widget.flushGlobalQueues();

  return true;
}

qx.Proto._onhidetimer = function(e) {
  return this.hide();
}







/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

qx.Proto.dispose = function()
{
  if(this.getDisposed()) {
    return;
  }

  this.removeEventListener(qx.constant.Event.MOUSEOVER, this._onmouseover);
  this.removeEventListener(qx.constant.Event.MOUSEOUT, this._onmouseover);

  if (this._showTimer)
  {
    this._showTimer.removeEventListener(qx.constant.Event.INTERVAL, this._onshowtimer, this);
    this._showTimer.dispose();
    this._showTimer = null;
  }

  if (this._hideTimer)
  {
    this._hideTimer.removeEventListener(qx.constant.Event.INTERVAL, this._onhidetimer, this);
    this._hideTimer.dispose();
    this._hideTimer = null;
  }

  return qx.ui.popup.PopupAtom.prototype.dispose.call(this);
}
