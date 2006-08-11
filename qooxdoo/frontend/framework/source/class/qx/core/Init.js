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
#require(qx.dom.DomEventRegistration)

************************************************************************ */

/*!
  This is the qooxdoo init process.
*/
qx.OO.defineClass("qx.core.Init", qx.core.Target,
function()
{
  qx.core.Target.call(this, false);

  // Object Wrapper to Events (Needed for DOM-Events)
  var o = this;
  this.__onload = function(e) { return o._onload(e); }
  this.__onbeforeunload = function(e) { return o._onbeforeunload(e); }
  this.__onunload = function(e) { return o._onunload(e); }

  // Attach events
  qx.dom.DomEventRegistration.addEventListener(window, "load", this.__onload);
  qx.dom.DomEventRegistration.addEventListener(window, "beforeunload", this.__onbeforeunload);
  qx.dom.DomEventRegistration.addEventListener(window, "unload", this.__onunload);

  // Init component from settings
  this.setComponent(qx.OO.classes[this.getSetting("component")]);
});



/*
---------------------------------------------------------------------------
  DEFAULT SETTINGS
---------------------------------------------------------------------------
*/

qx.Settings.setDefault("component", "qx.component.init.InterfaceInitComponent");






/*
---------------------------------------------------------------------------
  COMPONENT MANAGMENT
---------------------------------------------------------------------------
*/

qx.OO.addProperty({ name : "component", type : qx.constant.Type.OBJECT, instance : "qx.component.init.BasicInitComponent" });







/*
---------------------------------------------------------------------------
  COMPONENT BINDING
---------------------------------------------------------------------------
*/

qx.Proto.defineInitialize = function(vFunc) {
  return this.getComponent().defineInitialize(vFunc);
}

qx.Proto.defineMain = function(vFunc) {
  return this.getComponent().defineMain(vFunc);
}

qx.Proto.defineFinalize = function(vFunc) {
  return this.getComponent().defineFinalize(vFunc);
}

qx.Proto.defineClose = function(vFunc) {
  return this.getComponent().defineClose(vFunc);
}

qx.Proto.defineTerminate = function(vFunc) {
  return this.getComponent().defineTerminate(vFunc);
}







/*
---------------------------------------------------------------------------
  EVENT HANDLER
---------------------------------------------------------------------------
*/

qx.Proto._onload = function(e)
{
  this.info(qx.lang.Object.getLength(qx.OO.classes) + " available classes.");
  qx.manager.object.SingletonManager.flush();
  return this.getComponent()._onload(e);
}

qx.Proto._onbeforeunload = function(e) {
  return this.getComponent()._onbeforeunload(e);
}

qx.Proto._onunload = function(e)
{
  this.getComponent()._onunload(e);
  qx.core.Object.dispose();
}







/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

qx.Proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  }

  // Detach Events
  qx.dom.DomEventRegistration.removeEventListener(window, "load", this.__onload);
  qx.dom.DomEventRegistration.removeEventListener(window, "beforeunload", this.__onbeforeunload);
  qx.dom.DomEventRegistration.removeEventListener(window, "unload", this.__onunload);

  // Reset inline functions
  this.__onload = this.__onbeforeunload = this.__onunload = null;

  // Dispose Component
  if (this._component)
  {
    this._component.dispose();
    this._component = null;
  }

  qx.core.Target.prototype.dispose.call(this);
}




/*
---------------------------------------------------------------------------
  DIRECT SINGLETON INSTANCE
---------------------------------------------------------------------------
*/

qx.core.Init = new qx.core.Init;
