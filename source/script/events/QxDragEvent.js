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
function QxDragEvent(vType, vMouseEvent, vTarget, vRelatedTarget)
{
  this._mouseEvent = vMouseEvent;
  
  var vOriginalTarget = null;
  
  switch(vType)
  {
    case QxConst.EVENT_TYPE_DRAGSTART:
    case QxConst.EVENT_TYPE_DRAGOVER:
      vOriginalTarget = vMouseEvent.getOriginalTarget();
  };

  QxMouseEvent.call(this, vType, vMouseEvent.getDomEvent(), vTarget.getElement(), vTarget, vOriginalTarget, vRelatedTarget);
};

QxDragEvent.extend(QxMouseEvent, "QxDragEvent");





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
    throw new Error("QxDragEvent startDrag can only be called during the dragstart event: " + this.getType());
  };

  this.stopPropagation();
  QxDragAndDropManager.startDrag();
};






/*
---------------------------------------------------------------------------
  DATA SUPPORT
---------------------------------------------------------------------------
*/

proto.addData = function(sType, oData) {
  QxDragAndDropManager.addData(sType, oData);
};

proto.getData = function(sType) {
  return QxDragAndDropManager.getData(sType);
};

proto.clearData = function() {
  QxDragAndDropManager.clearData();
};

proto.getDropDataTypes = function() {
  return QxDragAndDropManager.getDropDataTypes();
};






/*
---------------------------------------------------------------------------
  ACTION SUPPORT
---------------------------------------------------------------------------
*/

proto.addAction = function(sAction) {
  QxDragAndDropManager.addAction(sAction);
};

proto.removeAction = function(sAction) {
  QxDragAndDropManager.removeAction(sAction);
};

proto.getAction = function() {
  return QxDragAndDropManager.getCurrentAction();
};

proto.clearActions = function() {
  QxDragAndDropManager.clearActions();
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

  return QxMouseEvent.prototype.dispose.call(this);
};
