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


************************************************************************ */

/*!
  The event object for drag and drop sessions
*/
qx.OO.defineClass("qx.event.type.DragEvent", qx.event.type.MouseEvent, 
function(vType, vMouseEvent, vTarget, vRelatedTarget)
{
  this._mouseEvent = vMouseEvent;

  var vOriginalTarget = null;

  switch(vType)
  {
    case qx.constant.Event.DRAGSTART:
    case qx.constant.Event.DRAGOVER:
      vOriginalTarget = vMouseEvent.getOriginalTarget();
  }

  qx.event.type.MouseEvent.call(this, vType, vMouseEvent.getDomEvent(), vTarget.getElement(), vTarget, vOriginalTarget, vRelatedTarget);
});





/*
---------------------------------------------------------------------------
  UTILITIY
---------------------------------------------------------------------------
*/

qx.Proto.getMouseEvent = function() {
  return this._mouseEvent;
}






/*
---------------------------------------------------------------------------
  APPLICATION CONNECTION
---------------------------------------------------------------------------
*/

qx.Proto.startDrag = function()
{
  if (this.getType() != qx.constant.Event.DRAGSTART) {
    throw new Error("qx.event.type.DragEvent startDrag can only be called during the dragstart event: " + this.getType());
  }

  this.stopPropagation();
  qx.event.handler.DragAndDropHandler.startDrag();
}






/*
---------------------------------------------------------------------------
  DATA SUPPORT
---------------------------------------------------------------------------
*/

qx.Proto.addData = function(sType, oData) {
  qx.event.handler.DragAndDropHandler.addData(sType, oData);
}

qx.Proto.getData = function(sType) {
  return qx.event.handler.DragAndDropHandler.getData(sType);
}

qx.Proto.clearData = function() {
  qx.event.handler.DragAndDropHandler.clearData();
}

qx.Proto.getDropDataTypes = function() {
  return qx.event.handler.DragAndDropHandler.getDropDataTypes();
}






/*
---------------------------------------------------------------------------
  ACTION SUPPORT
---------------------------------------------------------------------------
*/

qx.Proto.addAction = function(sAction) {
  qx.event.handler.DragAndDropHandler.addAction(sAction);
}

qx.Proto.removeAction = function(sAction) {
  qx.event.handler.DragAndDropHandler.removeAction(sAction);
}

qx.Proto.getAction = function() {
  return qx.event.handler.DragAndDropHandler.getCurrentAction();
}

qx.Proto.clearActions = function() {
  qx.event.handler.DragAndDropHandler.clearActions();
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

  this._mouseEvent = null;

  return qx.event.type.MouseEvent.prototype.dispose.call(this);
}
