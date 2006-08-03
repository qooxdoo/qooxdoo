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

#module(init)

************************************************************************ */

qx.OO.defineClass("qx.component.InitUiComponent", qx.component.InitComponent,
function() {
  qx.component.InitComponent.call(this);
});







/*
---------------------------------------------------------------------------
  UI HELPER
---------------------------------------------------------------------------
*/

qx.Proto.getClientWindow = function() {
  return this._clientWindow;
}

qx.Proto.getEventManager = function() {
  return this.getClientWindow().getEventManager();
}

qx.Proto.getClientDocument = function() {
  return this.getClientWindow().getClientDocument();
}







/*
---------------------------------------------------------------------------
  READY STATE
---------------------------------------------------------------------------
*/

qx.Proto._uiReady = false;

qx.Proto.isUiReady = function() {
  return this._uiReady;
}






/*
---------------------------------------------------------------------------
  STATE MODIFIER
---------------------------------------------------------------------------
*/

qx.Proto._modifyState = function(propValue, propOldValue, propData)
{
  var start = (new Date).valueOf();

  switch(propValue)
  {
    case qx.component.AbstractComponent.STATE_INITIALIZE:
      // Create client window instance (and client-document, event- and focus-manager, ...)
      this._clientWindow = new qx.client.ClientWindow;

      // Build virtual methods for easy additions of childrens and so on
      // Intentionally call Parent functions even though it's not a superclass
      this._remappingChildTable = qx.ui.core.Parent.prototype._remappingChildTable;
      qx.ui.core.Parent.prototype.remapChildrenHandlingTo.call(this, this._clientWindow.getClientDocument());
      break;

    case qx.component.AbstractComponent.STATE_FINALIZE:
      this._printPreloadComplete();

      this._uiReady = true;
      qx.ui.core.Widget.flushGlobalQueues();
      break;
  }

  qx.component.InitComponent.prototype._modifyState.call(this, propValue, propOldValue, propData);

  // Print runtime
  this.info(propValue + " runtime: " + ((new Date).valueOf() - start) + "ms");

  switch(propValue)
  {
    case qx.component.AbstractComponent.STATE_MAIN:
      this.debug("preloading visible images...");
      new qx.io.image.ImagePreloaderSystem(qx.manager.object.ImageManager.getPreloadImageList(), this.finalize, this);
      break;
  }

  return true;
}






/*
---------------------------------------------------------------------------
  PRELOAD UTILITIES
---------------------------------------------------------------------------
*/

qx.Proto.preload = function()
{
  if (!this._preloadDone)
  {
    this.debug("preloading hidden images...");
    new qx.io.image.ImagePreloaderSystem(qx.manager.object.ImageManager.getPostPreloadImageList(), this._printPreloadComplete, this);
    this._preloadDone = true;
  }
}

qx.Proto._printPreloadComplete = function() {
  this.debug("preloading complete");
}






/*
---------------------------------------------------------------------------
  EVENT HANDLER
---------------------------------------------------------------------------
*/

qx.Proto._onload = function(e)
{
  this.initialize();
  this.main();

  // Note: finalize will be called through image preloader
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

  this._preloadDone = null;
  this._uiReady = null;

  return qx.component.InitComponent.prototype.dispose.call(this);
}
