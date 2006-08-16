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

#module(ui_core)

************************************************************************ */

qx.OO.defineClass("qx.component.init.InterfaceInitComponent", qx.component.init.BasicInitComponent,
function() {
  qx.component.init.BasicInitComponent.call(this);
});





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
    case qx.component.AbstractComponent.STATE_FINALIZE:
      this._printPreloadComplete();
      this._uiReady = true;
      qx.ui.core.Widget.flushGlobalQueues();
      break;
  }

  qx.component.init.BasicInitComponent.prototype._modifyState.call(this, propValue, propOldValue, propData);

  // Print runtime
  this.info(propValue + " runtime: " + ((new Date).valueOf() - start) + "ms");

  switch(propValue)
  {
    case qx.component.AbstractComponent.STATE_MAIN:
      this.debug("preloading visible images...");
      new qx.io.image.ImagePreloaderSystem(qx.manager.object.ImageManager.getInstance().getPreloadImageList(), this.finalize, this);
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
    new qx.io.image.ImagePreloaderSystem(qx.manager.object.ImageManager.getInstance().getPostPreloadImageList(), this._printPreloadComplete, this);
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

  return qx.component.init.BasicInitComponent.prototype.dispose.call(this);
}
