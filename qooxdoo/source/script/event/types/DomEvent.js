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

qx.OO.defineClass("qx.event.types.DomEvent", qx.event.types.Event, 
function(vType, vDomEvent, vDomTarget, vTarget, vOriginalTarget)
{
  qx.event.types.Event.call(this, vType);

  this.setDomEvent(vDomEvent);
  this.setDomTarget(vDomTarget);

  this.setTarget(vTarget);
  this.setOriginalTarget(vOriginalTarget);
});

qx.event.types.DomEvent.addFastProperty({ name : "bubbles", defaultValue : true, noCompute : true });
qx.event.types.DomEvent.addFastProperty({ name : "propagationStopped", defaultValue : false, noCompute : true });

qx.event.types.DomEvent.addFastProperty({ name : "domEvent", setOnlyOnce : true, noCompute : true });
qx.event.types.DomEvent.addFastProperty({ name : "domTarget", setOnlyOnce : true, noCompute : true });






/*
---------------------------------------------------------------------------
  SPECIAL KEY SUPPORT
---------------------------------------------------------------------------
*/

qx.Proto.getCtrlKey = function() {
  return this.getDomEvent().ctrlKey;
};

qx.Proto.getShiftKey = function() {
  return this.getDomEvent().shiftKey;
};

qx.Proto.getAltKey = function() {
  return this.getDomEvent().altKey;
};







/*
---------------------------------------------------------------------------
  PREVENT DEFAULT
---------------------------------------------------------------------------
*/

if(qx.sys.Client.isMshtml())
{
  qx.Proto.setDefaultPrevented = function(vValue)
  {
    if (!vValue) {
      return this.error("It is not possible to set preventDefault to false if it was true before!", "setDefaultPrevented");
    };

    this.getDomEvent().returnValue = false;

    qx.event.types.Event.prototype.setDefaultPrevented.call(this, vValue);
  };
}
else
{
  qx.Proto.setDefaultPrevented = function(vValue)
  {
    if (!vValue) {
      return this.error("It is not possible to set preventDefault to false if it was true before!", "setDefaultPrevented");
    };

    this.getDomEvent().preventDefault();
    this.getDomEvent().returnValue = false;

    qx.event.types.Event.prototype.setDefaultPrevented.call(this, vValue);
  };
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

  this._valueDomEvent = null;
  this._valueDomTarget = null;

  return qx.event.types.Event.prototype.dispose.call(this);
};
