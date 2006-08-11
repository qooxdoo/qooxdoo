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
  if (this._methods[propValue]) {
    this._methods[propValue].call(this);
  }

  return true;
}






/*!
  Run initialisation part of component creation.
*/
qx.Proto.initialize = function() {
  return this.setState(qx.component.AbstractComponent.STATE_INITIALIZE);
}

/*!
  Run main  part of component creation.
*/
qx.Proto.main = function() {
  return this.setState(qx.component.AbstractComponent.STATE_MAIN);
}

/*!
  Run finalization part of component creation.
*/
qx.Proto.finalize = function() {
  return this.setState(qx.component.AbstractComponent.STATE_FINALIZE);
}

/*!
  Terminate this component.
*/
qx.Proto.close = function() {
  return this.setState(qx.component.AbstractComponent.STATE_CLOSE);
}

/*!
  Terminate this component.
*/
qx.Proto.terminate = function() {
  return this.setState(qx.component.AbstractComponent.STATE_TERMINATE);
}





/*!
  Defines the method which should be executed on initialization of this component.
*/
qx.Proto.defineInitialize = function(vFunc) {
  this._methods[qx.component.AbstractComponent.STATE_INITIALIZE] = vFunc;
}

/*!
  Defines the method which should be executed as main function of this component.
*/
qx.Proto.defineMain = function(vFunc) {
  this._methods[qx.component.AbstractComponent.STATE_MAIN] = vFunc;
}

/*!
  Defines the method which should be executed on finalization of this component.
*/
qx.Proto.defineFinalize = function(vFunc) {
  this._methods[qx.component.AbstractComponent.STATE_FINALIZE] = vFunc;
}

/*!
  Defines the method which should be executed on (before) close of this component.
*/
qx.Proto.defineClose = function(vFunc) {
  this._methods[qx.component.AbstractComponent.STATE_CLOSE] = vFunc;
}

/*!
  Defines the method which should be executed on termination of this component.
*/
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
