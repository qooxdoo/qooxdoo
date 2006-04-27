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

#package(core)
#require(qx.sys.Client)
#require(qx.dom.DomEventRegistration)

************************************************************************ */

/*!
  This contains the main qooxdoo application.

  Each qooxdoo has only one instance of this class. The application
  instance is accessible through a reference named "application" in
  the window object of the main document.
*/

qx.OO.defineClass("qx.core.Init", qx.core.Target, 
function()
{
  qx.core.Target.call(this, false);

  if (qx.sys.Client.isGecko()) {
    qx.dom.DomEventRegistration.addEventListener(window, "DOMContentLoaded", qx.core.Init.onload);
  } else {
    qx.dom.DomEventRegistration.addEventListener(window, "load", qx.core.Init.onload);
  };
});


qx.core.Init.onload = function()
{
  if (window.application) {
    window.application.init();
  };
};




/*
---------------------------------------------------------------------------
  USER APPLICATION METHODS
---------------------------------------------------------------------------
*/

qx.Proto.pre = qx.util.Return.returnTrue;
qx.Proto.main = qx.util.Return.returnTrue;
qx.Proto.post = qx.util.Return.returnTrue;






/*
---------------------------------------------------------------------------
  MAIN INITIALISATION ROUTINE
---------------------------------------------------------------------------
*/

/*!
  Global application init routine
*/
qx.Proto.init = function()
{
  if (this._initDone) {
    return;
  };

  this._initDone = true;

  this._printVersion();
  this._printClassInfo();
  this._printPropertyInfo();
  this._printClientInfo();

  this._runPre();
  this._runMain();

  qx.core.Settings.enableUserInterface ? this._runPreload() : this._runPost();
};






/*
---------------------------------------------------------------------------
  SEPERATE INITIALISATION ROUTINES
---------------------------------------------------------------------------
*/

qx.Proto._runPre = function()
{
  var s = (new Date).valueOf();

  this.info("Pre phase");

  try
  {
    // Execute user define 'pre' method
    this.debug("Dispatching application pre event");
    this.createDispatchEvent(qx.Const.EVENT_TYPE_PRE);

    if (this.pre !== qx.util.Return.returnTrue)
    {
      this.warn("Using old style pre-application!");
      this.pre();
    };

    if (qx.core.Settings.enableUserInterface)
    {
      // Create client window instance (and client-document, event- and focus-manager, ...)
      if (typeof qx.client.ClientWindow === qx.Const.TYPEOF_FUNCTION) {
        this._clientWindow = new qx.client.ClientWindow();
      };

      // Build virtual methods for easy additions of childrens and so on
      if (typeof qx.ui.core.Parent === qx.Const.TYPEOF_FUNCTION)
      {
        this._remappingChildTable = qx.ui.core.Parent.prototype._remappingChildTable;
        qx.ui.core.Parent.prototype.remapChildrenHandlingTo.call(this, this._clientWindow.getClientDocument());
      };
    };

    // Output the number of currently instanciated objects
    this._printInstanceInfo();
  }
  catch(ex)
  {
    return this.error("...failed", ex);
  };

  this.debug("Done in: " + ((new Date).valueOf() - s) + qx.constant.Core.MILLISECONDS);
};

qx.Proto._runMain = function()
{
  var s = (new Date).valueOf();
  this.info("Main phase");

  try
  {
    // Execute user define 'main' method
    this.debug("Dispatching application main event");
    this.createDispatchEvent(qx.Const.EVENT_TYPE_MAIN);

    if (this.main !== qx.util.Return.returnTrue)
    {
      this.warn("Using old style main-application!");
      this.main();
    };

    // Output the number of currently instanciated objects
    this._printInstanceInfo();
  }
  catch(ex)
  {
    return this.error("...failed", ex);
  };

  this.debug("Done in: " + ((new Date).valueOf() - s) + qx.constant.Core.MILLISECONDS);
};

qx.Proto._runPreload = function()
{
  if (qx.core.Settings.enableUserInterface)
  {
    this._preloadStart = (new Date).valueOf();

    this.info("Preload phase");
    this.debug("Preloading images...");

    if (typeof qx.manager.object.ImageManager !== qx.Const.TYPEOF_UNDEFINED && typeof qx.io.image.ImagePreloaderSystem !== qx.Const.TYPEOF_UNDEFINED)
    {
      var vPreloaderSystem = new qx.io.image.ImagePreloaderSystem(qx.manager.object.ImageManager.getPreloadImageList());
      vPreloaderSystem.addEventListener(qx.Const.EVENT_TYPE_COMPLETED, this._runPreloadDone, this);
      vPreloaderSystem.start();
    };
  };
};

qx.Proto._runPreloadDone = function()
{
  this.debug("Done in: " + ((new Date).valueOf() - this._preloadStart) + qx.constant.Core.MILLISECONDS);
  this._runWidgets();
};

qx.Proto._runWidgets = function()
{
  if (typeof qx.ui.core.Widget === qx.Const.TYPEOF_FUNCTION)
  {
    var s = (new Date).valueOf();

    this.info("Widget phase");
    this.debug("Rendering widgets");

    this._ready = true;
    qx.ui.core.Widget.flushGlobalQueues(true);

    this.debug("Done in: " + ((new Date).valueOf() - s) + qx.constant.Core.MILLISECONDS);
  };

  this._runPost();
};

qx.Proto._runPost = function()
{
  var s = (new Date).valueOf();
  this.info("Post phase");

  try
  {
    // Output the number of currently instanciated objects
    this._printInstanceInfo();

    // Execute "post" stuff
    this.debug("Dispatching application post event");
    this.createDispatchEvent(qx.Const.EVENT_TYPE_POST);

    if (this.post !== qx.util.Return.returnTrue)
    {
      this.warn("Using old style post-application!");
      this.post();
    };
  }
  catch(ex)
  {
    return this.error("...failed", ex);
  };

  this.debug("Done in: " + ((new Date).valueOf() - s) + qx.constant.Core.MILLISECONDS);
};

qx.Proto._runPostload = function()
{
  this._postloadStart = (new Date).valueOf();

  this.info("Postload phase");
  this.debug("Preloading images...");

  if (typeof qx.manager.object.ImageManager !== qx.Const.TYPEOF_UNDEFINED && typeof qx.io.image.ImagePreloaderSystem !== qx.Const.TYPEOF_UNDEFINED)
  {
    var vPreloaderSystem = new qx.io.image.ImagePreloaderSystem(qx.manager.object.ImageManager.getPostPreloadImageList());
    vPreloaderSystem.addEventListener(qx.Const.EVENT_TYPE_COMPLETED, this._runPostloadDone, this);
    vPreloaderSystem.start();
  };
};

qx.Proto._runPostloadDone = function()
{
  this.debug("Done in: " + ((new Date).valueOf() - this._postloadStart) + qx.constant.Core.MILLISECONDS);
};





/*
---------------------------------------------------------------------------
  ADDITIONAL INFORMATIONAL OUTPUT
---------------------------------------------------------------------------
*/

qx.Proto._printInstanceInfo = function() {
  this.debug("Number of instances: " + qx.core.ObjectDataBase.length);
};

qx.Proto._printClassInfo = function() {
  this.debug("Number of classes: " + qx.lang.Object.getLength(qx.OO.classes));
};

qx.Proto._printPropertyInfo = function() {
  this.debug("Number of properties: " + qx.OO.propertyNumber);
};

qx.Proto._printClientInfo = function()
{
  this.debug("Client: " + qx.sys.Client.getEngine() + qx.constant.Core.SPACE + qx.sys.Client.getVersion() + (qx.util.Validation.isValidString(qx.sys.Client.getEmulation()) ? qx.constant.Core.SPACE + qx.sys.Client.getEmulation() : qx.constant.Core.EMPTY));

  if (!qx.sys.Client.isInQuirksMode() && qx.sys.Client.isMshtml()) {
    this.warn("Document is not in Quirksmode! This is needed in Internet Explorer <= 6 to let qooxdoo render correctly.");
  };
};

qx.Proto._printVersion = function() {
  this.debug("Version: " + qx.core.DefaultSettings.version);
};









/*
---------------------------------------------------------------------------
  UTILITIES
---------------------------------------------------------------------------
*/

qx.Proto._ready = false;

qx.Proto.isReady = function() {
  return this._ready;
};

qx.Proto.getClientWindow = function() {
  return this._clientWindow;
};

qx.Proto.getEventManager = function() {
  return this.getClientWindow().getEventManager();
};

qx.Proto.getClientDocument = function() {
  return this.getClientWindow().getClientDocument();
};

qx.Proto.postLoad = function()
{
  if (this._postLoadDone) {
    return;
  };

  this._runPostload();
  this._postLoadDone = true;
};






/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

qx.Proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };

  if (qx.sys.Client.isGecko()) {
    qx.dom.DomEventRegistration.removeEventListener(window, "DOMContentLoaded", qx.core.Init.onload);
  } else {
    qx.dom.DomEventRegistration.removeEventListener(window, "load", qx.core.Init.onload);
  };

  delete this._clientWindow;
  delete this._remappingChildTable;
  delete this._remappingChildTarget;

  qx.core.Target.prototype.dispose.call(this);
};

window.application = new qx.core.Init;
