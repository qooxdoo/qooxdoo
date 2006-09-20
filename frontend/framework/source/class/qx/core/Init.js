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
qx.OO.addProperty({ name : "application", type : qx.constant.Type.FUNCTION });







/*
---------------------------------------------------------------------------
  COMPONENT BINDING
---------------------------------------------------------------------------
*/

qx.Proto.defineInitialize = function(vFunc)
{
  if (!this.getApplication()) {
    this.setApplication(qx.component.DummyApplication);
  }

  this.getApplication().getInstance().initialize = vFunc;
}

qx.Proto.defineMain = function(vFunc)
{
  if (!this.getApplication()) {
    this.setApplication(qx.component.DummyApplication);
  }

  this.getApplication().getInstance().main = vFunc;
}

qx.Proto.defineFinalize = function(vFunc)
{
  if (!this.getApplication()) {
    this.setApplication(qx.component.DummyApplication);
  }

  this.getApplication().getInstance().finalize = vFunc;
}

qx.Proto.defineClose = function(vFunc)
{
  if (!this.getApplication()) {
    this.setApplication(qx.component.DummyApplication);
  }

  this.getApplication().getInstance().close = vFunc;
}

qx.Proto.defineTerminate = function(vFunc)
{
  if (!this.getApplication()) {
    this.setApplication(qx.component.DummyApplication);
  }

  this.getApplication().getInstance().terminate = vFunc;
}







/*
---------------------------------------------------------------------------
  EVENT HANDLER
---------------------------------------------------------------------------
*/

qx.Proto._onload = function(e)
{
  this.debug("qooxdoo " + qx.core.Version.toString());

  // Print out class information
  this.debug("loaded " + qx.lang.Object.getLength(qx.OO.classes) + " classes");

  // Print browser information
  var cl = qx.sys.Client.getInstance();
  this.debug("client: " + cl.getEngine() + "-" + cl.getMajor() + "."
    + cl.getMinor() + "/" + cl.getPlatform() + "/" + cl.getLocale());

  if (cl.isMshtml() && !cl.isInQuirksMode()) {
    this.warn("Wrong box sizing: Please modify the document's DOCTYPE!");
  }

  // Init component from settings
  this.setComponent(new qx.OO.classes[this.getSetting("component")](this));

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
qx.Class.getInstance = qx.util.Return.returnInstance;

// Force direct creation
qx.Class.getInstance();
