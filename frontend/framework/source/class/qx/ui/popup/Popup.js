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

#module(ui_popup)
#optional(qx.manager.object.MenuManager)

************************************************************************ */

qx.OO.defineClass("qx.ui.popup.Popup", qx.ui.layout.CanvasLayout,
function()
{
  qx.ui.layout.CanvasLayout.call(this);

  this.setZIndex(this._minZIndex);
});

qx.OO.changeProperty({ name : "appearance", type : qx.constant.Type.STRING, defaultValue : "popup" });

/*!
  Whether to let the system decide when to hide the popup. Setting
  this to false gives you better control but it also requires you
  to handle the closing of the popup.
*/
qx.OO.addProperty({ name : "autoHide", type : qx.constant.Type.BOOLEAN, defaultValue : true });

/*!
  Make element displayed (if switched to true the widget will be created, if needed, too).
  Instead of qx.ui.core.Widget, the default is false here.
*/
qx.OO.changeProperty({ name : "display", type : qx.constant.Type.BOOLEAN, defaultValue : false });

/*!
  Center the popup on open
*/
qx.OO.addProperty({ name : "centered", type : qx.constant.Type.BOOLEAN, defaultValue : false });


qx.Proto._showTimeStamp = (new Date(0)).valueOf();
qx.Proto._hideTimeStamp = (new Date(0)).valueOf();





/*
---------------------------------------------------------------------------
  APPEAR/DISAPPEAR
---------------------------------------------------------------------------
*/

qx.Proto._beforeAppear = function()
{
  qx.ui.layout.CanvasLayout.prototype._beforeAppear.call(this);

  qx.manager.object.PopupManager.add(this);
  qx.manager.object.PopupManager.update(this);

  this._showTimeStamp = (new Date).valueOf();
  this.bringToFront();
}

qx.Proto._beforeDisappear = function()
{
  qx.ui.layout.CanvasLayout.prototype._beforeDisappear.call(this);

  qx.manager.object.PopupManager.remove(this);

  this._hideTimeStamp = (new Date).valueOf();
}





/*
---------------------------------------------------------------------------
  ACTIVE/INACTIVE
---------------------------------------------------------------------------
*/

qx.Proto._makeActive = function() {
  this.getFocusRoot().setActiveChild(this);
}

qx.Proto._makeInactive = function()
{
  var vRoot = this.getFocusRoot();
  var vCurrent = vRoot.getActiveChild();

  if (vCurrent == this) {
    vRoot.setActiveChild(vRoot);
  }
}





/*
---------------------------------------------------------------------------
  FOCUS
---------------------------------------------------------------------------
*/

qx.Proto.isFocusable = function() {
  return false;
}





/*
---------------------------------------------------------------------------
  ZIndex Positioning
---------------------------------------------------------------------------
*/

qx.Proto._minZIndex = 1e6;

qx.Proto.bringToFront = function()
{
  this.forceZIndex(Infinity);
  this._sendTo();
}

qx.Proto.sendToBack = function()
{
  this.forceZIndex(-Infinity);
  this._sendTo();
}

qx.Proto._sendTo = function()
{
  var vPopups = qx.lang.Object.getValues(qx.manager.object.PopupManager.getAll());
  var vMenus = qx.lang.Object.getValues(qx.manager.object.MenuManager.getAll());

  var vAll = vPopups.concat(vMenus).sort(qx.util.Compare.byZIndex);
  var vLength = vAll.length;
  var vIndex = this._minZIndex;

  for (var i=0; i<vLength; i++) {
    vAll[i].setZIndex(vIndex++);
  }
}






/*
---------------------------------------------------------------------------
  TIMESTAMP HANDLING
---------------------------------------------------------------------------
*/

qx.Proto.getShowTimeStamp = function() {
  return this._showTimeStamp;
}

qx.Proto.getHideTimeStamp = function() {
  return this._hideTimeStamp;
}

/*
---------------------------------------------------------------------------
  UTILITIES
---------------------------------------------------------------------------
*/

qx.Proto.centerToBrowser = function()
{
  var d = qx.core.Init.getComponent().getClientWindow().getClientDocument();

  var left = (d.getClientWidth() - this.getBoxWidth()) / 2;
  var top = (d.getClientHeight() - this.getBoxHeight()) / 2;

  this.setLeft(left < 0 ? 0 : left);
  this.setTop(top < 0 ? 0 : top);
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

  this._showTimeStamp = null;
  this._hideTimeStamp = null;

  return qx.ui.layout.CanvasLayout.prototype.dispose.call(this);
}
