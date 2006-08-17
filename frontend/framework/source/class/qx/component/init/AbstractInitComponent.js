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

#module(core)

************************************************************************ */

qx.OO.defineClass("qx.component.init.AbstractInitComponent", qx.component.AbstractComponent,
function()
{
  qx.component.AbstractComponent.call(this);

  this._methods = {};
});






/*!
  Run initialisation part of component creation.
*/
qx.Proto.initialize = function(e) {
  return this._methods.initialize && this._methods.initialize(e);
}

/*!
  Run main  part of component creation.
*/
qx.Proto.main = function(e) {
  return this._methods.main && this._methods.main(e);
}

/*!
  Run finalization part of component creation.
*/
qx.Proto.finalize = function(e) {
  return this._methods.finalize && this._methods.finalize(e);
}

/*!
  Terminate this component.
*/
qx.Proto.close = function(e) {
  return this._methods.close && this._methods.close(e);
}

/*!
  Terminate this component.
*/
qx.Proto.terminate = function(e) {
  return this._methods.terminate && this._methods.terminate(e);
}





/*!
  Defines the method which should be executed on initialization of this component.
*/
qx.Proto.defineInitialize = function(vFunc) {
  this._methods.initialize = vFunc;
}

/*!
  Defines the method which should be executed as main function of this component.
*/
qx.Proto.defineMain = function(vFunc) {
  this._methods.main = vFunc;
}

/*!
  Defines the method which should be executed on finalization of this component.
*/
qx.Proto.defineFinalize = function(vFunc) {
  this._methods.finalize = vFunc;
}

/*!
  Defines the method which should be executed on (before) close of this component.
*/
qx.Proto.defineClose = function(vFunc) {
  this._methods.close = vFunc;
}

/*!
  Defines the method which should be executed on termination of this component.
*/
qx.Proto.defineTerminate = function(vFunc) {
  this._methods.terminate = vFunc;
}







qx.Proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  }

  delete this._methods;

  return qx.component.AbstractComponent.prototype.dispose.call(this);
}
