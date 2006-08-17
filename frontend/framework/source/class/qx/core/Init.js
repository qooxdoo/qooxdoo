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
#optional(qx.component.init.InterfaceInitComponent)

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
});



/*
---------------------------------------------------------------------------
  DEFAULT SETTINGS
---------------------------------------------------------------------------
*/

qx.Settings.setDefault("component", "qx.component.init.InterfaceInitComponent");






/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

qx.OO.addProperty({ name : "component", type : qx.constant.Type.OBJECT, instance : "qx.component.init.BasicInitComponent" });
qx.OO.addProperty({ name : "application", type : qx.constant.Type.OBJECT, instance : "qx.component.AbstractApplication" });






/*
---------------------------------------------------------------------------
  COMPONENT MANAGMENT
---------------------------------------------------------------------------
*/

qx.Proto._createComponent = function()
{
  var vComponentName = this.getSetting("component");

  this.debug("Component: " + vComponentName.substring(vComponentName.lastIndexOf(qx.constant.Core.DOT)+1));
  this.setComponent(new qx.OO.classes[vComponentName](this));
}

/*
---------------------------------------------------------------------------
  APPLICATION MANAGMENT
---------------------------------------------------------------------------
*/

qx.Proto._modifyApplication = function(propValue, propOldValue, propData)
{
  if (propOldValue)
  {
    this.error("Could not modify application");
  }
  
  if (propValue)
  {

    // proposed new way (using custom application class)
    // define(Initialize|Main|Finalize|Close|Terminate) are deprecated
    /*
    this._initialize = propValue._initialize;
    this._main = propValue._main;
    this._finalize = propValue._finalize;
    this._close = propValue._close;
    this._terminate = propValue._terminate;
    */

    this.defineInitialize(propValue.initialize);
    this.defineMain(propValue.main);
    this.defineFinalize(propValue.finalize);
    this.defineClose(propValue.close);
    this.defineTerminate(propValue.terminate);
  }
  
  return true;
};





/*
---------------------------------------------------------------------------
  COMPONENT BINDING
---------------------------------------------------------------------------
*/

qx.Proto._initialize = null;
qx.Proto._main = null;
qx.Proto._finalize = null;
qx.Proto._close = null;
qx.Proto._terminate = null;

qx.Proto.defineInitialize = function(vFunc) {
  return this._initialize = vFunc || null;
}

qx.Proto.defineMain = function(vFunc) {
  return this._main = vFunc || null;
}

qx.Proto.defineFinalize = function(vFunc) {
  return this._finalize = vFunc || null;
}

qx.Proto.defineClose = function(vFunc) {
  return this._close = vFunc || null;
}

qx.Proto.defineTerminate = function(vFunc) {
  return this._terminate = vFunc || null;
}








/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

qx.Proto._modifyComponent = function(propValue, propOldValue, propData)
{
  if (propOldValue)
  {
    propOldValue.defineInitialize(null);
    propOldValue.defineMain(null);
    propOldValue.defineFinalize(null);
    propOldValue.defineClose(null);
    propOldValue.defineTerminate(null);
  }

  if (propValue)
  {
    propValue.defineInitialize(this._initialize);
    propValue.defineMain(this._main);
    propValue.defineFinalize(this._finalize);
    propValue.defineClose(this._close);
    propValue.defineTerminate(this._terminate);
  }

  return true;
}







/*
---------------------------------------------------------------------------
  EVENT HANDLER
---------------------------------------------------------------------------
*/

qx.Proto._onload = function(e)
{
  // Print out class informations
  this.debug("Loaded " + qx.lang.Object.getLength(qx.OO.classes) + " classes.");

  // Init component from settings
  this._createComponent();

  // Create singletons
  qx.manager.object.SingletonManager.getInstance().flush();

  // Send onload
  return this.getComponent()._onload(e);
}

qx.Proto._onbeforeunload = function(e)
{
  // Send onbeforeunload event (can be cancelled)
  return this.getComponent()._onbeforeunload(e);
}

qx.Proto._onunload = function(e)
{
  // Send onunload event (last event)
  this.getComponent()._onunload(e);

  // Dispose all qooxdoo objects
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

/**
 * Singleton Instance Getter
 */
qx.Class.getInstance = function() {
  return this._instance;
}

qx.core.Init._instance = new qx.core.Init;
