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
qx.event.types.DragEvent = function(vType, vMouseEvent, vTarget, vRelatedTarget)
{
  this._mouseEvent = vMouseEvent;

  var vOriginalTarget = null;

  switch(vType)
  {
    case QxConst.EVENT_TYPE_DRAGSTART:
    case QxConst.EVENT_TYPE_DRAGOVER:
      vOriginalTarget = vMouseEvent.getOriginalTarget();
  };

  qx.event.types.MouseEvent.call(this, vType, vMouseEvent.getDomEvent(), vTarget.getElement(), vTarget, vOriginalTarget, vRelatedTarget);
};

qx.event.types.DragEvent.extend(qx.event.types.MouseEvent, "qx.event.types.DragEvent");





/*
---------------------------------------------------------------------------
  UTILITIY
---------------------------------------------------------------------------
*/

proto.getMouseEvent = function() {
  return this._mouseEvent;
};






/*
---------------------------------------------------------------------------
  APPLICATION CONNECTION
---------------------------------------------------------------------------
*/

proto.startDrag = function()
{
  if (this.getType() != QxConst.EVENT_TYPE_DRAGSTART) {
    throw new Error("qx.event.types.DragEvent startDrag can only be called during the dragstart event: " + this.getType());
  };

  this.stopPropagation();
  qx.event.handler.DragAndDropHandler.startDrag();
};






/*
---------------------------------------------------------------------------
  DATA SUPPORT
---------------------------------------------------------------------------
*/

proto.addData = function(sType, oData) {
  qx.event.handler.DragAndDropHandler.addData(sType, oData);
};

proto.getData = function(sType) {
  return qx.event.handler.DragAndDropHandler.getData(sType);
};

proto.clearData = function() {
  qx.event.handler.DragAndDropHandler.clearData();
};

proto.getDropDataTypes = function() {
  return qx.event.handler.DragAndDropHandler.getDropDataTypes();
};






/*
---------------------------------------------------------------------------
  ACTION SUPPORT
---------------------------------------------------------------------------
*/

proto.addAction = function(sAction) {
  qx.event.handler.DragAndDropHandler.addAction(sAction);
};

proto.removeAction = function(sAction) {
  qx.event.handler.DragAndDropHandler.removeAction(sAction);
};

proto.getAction = function() {
  return qx.event.handler.DragAndDropHandler.getCurrentAction();
};

proto.clearActions = function() {
  qx.event.handler.DragAndDropHandler.clearActions();
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

  this._mouseEvent = null;

  return qx.event.types.MouseEvent.prototype.dispose.call(this);
};
