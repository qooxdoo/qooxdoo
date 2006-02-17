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

function QxDomEvent(vType, vDomEvent, vDomTarget, vTarget, vOriginalTarget)
{
  QxEvent.call(this, vType);

  this.setDomEvent(vDomEvent);
  this.setDomTarget(vDomTarget);

  this.setTarget(vTarget);
  this.setOriginalTarget(vOriginalTarget);
};

QxDomEvent.extend(QxEvent, "QxDomEvent");

QxDomEvent.addFastProperty({ name : "bubbles", defaultValue : true, noCompute : true });
QxDomEvent.addFastProperty({ name : "propagationStopped", defaultValue : false, noCompute : true });

QxDomEvent.addFastProperty({ name : "domEvent", setOnlyOnce : true, noCompute : true });
QxDomEvent.addFastProperty({ name : "domTarget", setOnlyOnce : true, noCompute : true });






/*
---------------------------------------------------------------------------
  SPECIAL KEY SUPPORT
---------------------------------------------------------------------------
*/

proto.getCtrlKey = function() {
  return this.getDomEvent().ctrlKey;
};

proto.getShiftKey = function() {
  return this.getDomEvent().shiftKey;
};

proto.getAltKey = function() {
  return this.getDomEvent().altKey;
};







/*
---------------------------------------------------------------------------
  PREVENT DEFAULT
---------------------------------------------------------------------------
*/

if(QxClient.isMshtml())
{
  proto.setDefaultPrevented = function(vValue)
  {
    if (!vValue) {
      return this.error("It is not possible to set preventDefault to false if it was true before!", "setDefaultPrevented");
    };

    this.getDomEvent().returnValue = false;

    QxEvent.prototype.setDefaultPrevented.call(this, vValue);
  };
}
else
{
  proto.setDefaultPrevented = function(vValue)
  {
    if (!vValue) {
      return this.error("It is not possible to set preventDefault to false if it was true before!", "setDefaultPrevented");
    };

    this.getDomEvent().preventDefault();
    this.getDomEvent().returnValue = false;

    QxEvent.prototype.setDefaultPrevented.call(this, vValue);
  };
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

  this._valueDomEvent = null;
  this._valueDomTarget = null;

  return QxEvent.prototype.dispose.call(this);
};
