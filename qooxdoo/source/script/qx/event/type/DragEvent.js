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

#package(dragndrop)

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
    case qx.Const.EVENT_TYPE_DRAGSTART:
    case qx.Const.EVENT_TYPE_DRAGOVER:
      vOriginalTarget = vMouseEvent.getOriginalTarget();
  };

  qx.event.type.MouseEvent.call(this, vType, vMouseEvent.getDomEvent(), vTarget.getElement(), vTarget, vOriginalTarget, vRelatedTarget);
});





/*
---------------------------------------------------------------------------
  UTILITIY
---------------------------------------------------------------------------
*/

qx.Proto.getMouseEvent = function() {
  return this._mouseEvent;
};






/*
---------------------------------------------------------------------------
  APPLICATION CONNECTION
---------------------------------------------------------------------------
*/

qx.Proto.startDrag = function()
{
  if (this.getType() != qx.Const.EVENT_TYPE_DRAGSTART) {
    throw new Error("qx.event.type.DragEvent startDrag can only be called during the dragstart event: " + this.getType());
  };

  this.stopPropagation();
  qx.event.handler.DragAndDropHandler.startDrag();
};






/*
---------------------------------------------------------------------------
  DATA SUPPORT
---------------------------------------------------------------------------
*/

qx.Proto.addData = function(sType, oData) {
  qx.event.handler.DragAndDropHandler.addData(sType, oData);
};

qx.Proto.getData = function(sType) {
  return qx.event.handler.DragAndDropHandler.getData(sType);
};

qx.Proto.clearData = function() {
  qx.event.handler.DragAndDropHandler.clearData();
};

qx.Proto.getDropDataTypes = function() {
  return qx.event.handler.DragAndDropHandler.getDropDataTypes();
};






/*
---------------------------------------------------------------------------
  ACTION SUPPORT
---------------------------------------------------------------------------
*/

qx.Proto.addAction = function(sAction) {
  qx.event.handler.DragAndDropHandler.addAction(sAction);
};

qx.Proto.removeAction = function(sAction) {
  qx.event.handler.DragAndDropHandler.removeAction(sAction);
};

qx.Proto.getAction = function() {
  return qx.event.handler.DragAndDropHandler.getCurrentAction();
};

qx.Proto.clearActions = function() {
  qx.event.handler.DragAndDropHandler.clearActions();
};







/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

qx.Proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };

  this._mouseEvent = null;

  return qx.event.type.MouseEvent.prototype.dispose.call(this);
};
