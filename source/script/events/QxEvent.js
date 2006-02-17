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

#package(eventcore)

************************************************************************ */

/*!
  The qooxdoo core event object. Each event object for QxTargets should extend this class.
*/
function QxEvent(vType)
{
  QxObject.call(this, false);

  this.setType(vType);
};

QxEvent.extend(QxObject, "QxEvent");

QxEvent.addFastProperty({ name : "type", setOnlyOnce : true });

QxEvent.addFastProperty({ name : "originalTarget", setOnlyOnce : true });
QxEvent.addFastProperty({ name : "target", setOnlyOnce : true });
QxEvent.addFastProperty({ name : "relatedTarget", setOnlyOnce : true });
QxEvent.addFastProperty({ name : "currentTarget" });

QxEvent.addFastProperty({ name : "bubbles", defaultValue : false, noCompute : true });
QxEvent.addFastProperty({ name : "propagationStopped", defaultValue : true, noCompute : true });
QxEvent.addFastProperty({ name : "defaultPrevented", defaultValue : false, noCompute : true });




/*
---------------------------------------------------------------------------
  SHORTCUTS
---------------------------------------------------------------------------
*/

proto.preventDefault = function() {
  this.setDefaultPrevented(true);
};

proto.stopPropagation = function() {
  this.setPropagationStopped(true);
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

  this._valueOriginalTarget = null;
  this._valueTarget = null;
  this._valueRelatedTarget = null;
  this._valueCurrentTarget = null;

  return QxObject.prototype.dispose.call(this);
};
