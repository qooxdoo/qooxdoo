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

#package(component)

************************************************************************ */

qx.OO.defineClass("qx.component.AbstractComponent", qx.core.Target,
function()
{
  qx.core.Target.call(this);

  this._methods = {};
});

qx.OO.addProperty({ name : "state", type : qx.constant.Type.STRING });

qx.Class.STATE_INITIALIZE = "initialize";
qx.Class.STATE_MAIN = "main";
qx.Class.STATE_FINALIZE = "finalize";
qx.Class.STATE_CLOSE = "close";
qx.Class.STATE_TERMINATE = "terminate";

qx.Proto._modifyState = function(propValue, propOldValue, propData)
{
  this.debug("State: " + propValue);

  if (this._methods[propValue]) {
    this._methods[propValue].call(this);
  }

  return true;
}






qx.Proto.initialize = function() {
  return this.setState(qx.component.AbstractComponent.STATE_INITIALIZE);
}

qx.Proto.main = function() {
  return this.setState(qx.component.AbstractComponent.STATE_MAIN);
}

qx.Proto.finalize = function() {
  return this.setState(qx.component.AbstractComponent.STATE_FINALIZE);
}

qx.Proto.close = function() {
  return this.setState(qx.component.AbstractComponent.STATE_CLOSE);
}

qx.Proto.terminate = function() {
  return this.setState(qx.component.AbstractComponent.STATE_TERMINATE);
}






qx.Proto.defineInitialize = function(vFunc) {
  this._methods[qx.component.AbstractComponent.STATE_INITIALIZE] = vFunc;
}

qx.Proto.defineMain = function(vFunc) {
  this._methods[qx.component.AbstractComponent.STATE_MAIN] = vFunc;
}

qx.Proto.defineFinalize = function(vFunc) {
  this._methods[qx.component.AbstractComponent.STATE_FINALIZE] = vFunc;
}

qx.Proto.defineClose = function(vFunc) {
  this._methods[qx.component.AbstractComponent.STATE_CLOSE] = vFunc;
}

qx.Proto.defineTerminate = function(vFunc) {
  this._methods[qx.component.AbstractComponent.STATE_TERMINATE] = vFunc;
}







qx.Proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  }

  delete this._methods;

  return qx.core.Target.prototype.dispose.call(this);
}
