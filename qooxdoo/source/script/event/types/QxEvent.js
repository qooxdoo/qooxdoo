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
  The qooxdoo core event object. Each event object for qx.core.Targets should extend this class.
*/
qx.event.types.Event = function(vType)
{
  qx.core.Object.call(this, false);

  this.setType(vType);
};

qx.event.types.Event.extend(qx.core.Object, "qx.event.types.Event");

qx.event.types.Event.addFastProperty({ name : "type", setOnlyOnce : true });

qx.event.types.Event.addFastProperty({ name : "originalTarget", setOnlyOnce : true });
qx.event.types.Event.addFastProperty({ name : "target", setOnlyOnce : true });
qx.event.types.Event.addFastProperty({ name : "relatedTarget", setOnlyOnce : true });
qx.event.types.Event.addFastProperty({ name : "currentTarget" });

qx.event.types.Event.addFastProperty({ name : "bubbles", defaultValue : false, noCompute : true });
qx.event.types.Event.addFastProperty({ name : "propagationStopped", defaultValue : true, noCompute : true });
qx.event.types.Event.addFastProperty({ name : "defaultPrevented", defaultValue : false, noCompute : true });




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

  return qx.core.Object.prototype.dispose.call(this);
};
