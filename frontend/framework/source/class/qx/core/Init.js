/* ************************************************************************

   qooxdoo - the new era of web development

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany
     http://www.1und1.de | http://www.1and1.com
     All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.org

   Authors:
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (ecker)
       <andreas dot ecker at 1und1 dot de>

************************************************************************ */

/* ************************************************************************

#module(init)
#require(qx.constant.Type)
#require(qx.core.Settings)
#require(qx.dom.DomEventRegistration)
#require(qx.manager.object.SingletonManager)

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

  // Attach Events
  qx.dom.DomEventRegistration.addEventListener(window, "load", this.__onload);
  qx.dom.DomEventRegistration.addEventListener(window, "beforeunload", this.__onbeforeunload);
  qx.dom.DomEventRegistration.addEventListener(window, "unload", this.__onunload);
});





/*
---------------------------------------------------------------------------
  COMPONENT MANAGMENT
---------------------------------------------------------------------------
*/

qx.OO.addProperty({ name : "componentClass", type : qx.constant.Type.FUNCTION });

qx.Proto._modifyComponentClass = function(propValue, propOldValue, propData)
{
  this._component = new propValue;
  return true;
}

/*!
  Get the assigned component.
*/
qx.Proto.getComponent = function()
{
  if (!this._component) {
    if (qx.core.Settings.enableUserInterface && (qx.component.InitUiComponent != null)) {
      this.setComponentClass(qx.component.InitUiComponent);
    } else {
      this.setComponentClass(qx.component.InitComponent);
    }
  }

  return this._component;
}







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

qx.Proto._onload = function(e) {
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

qx.core.Init = new qx.core.Init;
