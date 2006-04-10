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
#require(QxClient)
#require(QxDomEventRegistration)

************************************************************************ */

function QxApplicationInit()
{
  if (window.application) {
    window.application.init();
  };
};

/*!
  This contains the main qooxdoo application.

  Each qooxdoo has only one instance of this class. The application
  instance is accessible through a reference named "application" in
  the window object of the main document.
*/
function QxApplication()
{
  QxTarget.call(this, false);

  if (QxClient.isGecko()) {
    QxDom.addEventListener(window, "DOMContentLoaded", QxApplicationInit);
  } else {
    QxDom.addEventListener(window, "load", QxApplicationInit);
  };
};

QxApplication.extend(QxTarget, "QxApplication");





/*
---------------------------------------------------------------------------
  USER APPLICATION METHODS
---------------------------------------------------------------------------
*/

proto.pre = QxUtil.returnTrue;
proto.main = QxUtil.returnTrue;
proto.post = QxUtil.returnTrue;






/*
---------------------------------------------------------------------------
  MAIN INITIALISATION ROUTINE
---------------------------------------------------------------------------
*/

/*!
  Global application init routine
*/
proto.init = function()
{
  if (this._initDone) {
    return;
  };

  this._initDone = true;

  this._runInitialization();
  this._runApplication();
  this._runPreload();

  // initPostload will be executed from the first queue flush
};






/*
---------------------------------------------------------------------------
  SEPERATE INITIALISATION ROUTINES
---------------------------------------------------------------------------
*/

proto._runInitialization = function()
{
  var s = (new Date).valueOf();

  this.info("Initialization phase");

  this._printVersion();

  try
  {
    // Output the number of available classes
    this._printClassInfo();

    // Output the number existing properties
    this._printPropertyInfo();

    // Print short client detection info
    this._printClientInfo();

    // Execute user define 'pre' method
    this.debug("Executing application pre");
    this.pre();

    // Fire global 'pre' event
    this.createDispatchEvent(QxConst.EVENT_TYPE_PRE);

    // Create client window instance (and client-document, event- and focus-manager, ...)
    if (typeof QxClientWindow === QxConst.TYPEOF_FUNCTION) {
      this._clientWindow = new QxClientWindow();
    };

    // Build virtual methods for easy additions of childrens and so on
    if (typeof QxParent === QxConst.TYPEOF_FUNCTION)
    {
      this._remappingChildTable = QxParent.prototype._remappingChildTable;
      QxParent.prototype.remapChildrenHandlingTo.call(this, this._clientWindow.getClientDocument());
    };

    // Output the number of currently instanciated objects
    this._printInstanceInfo();
  }
  catch(ex)
  {
    return this.error("...failed: " + ex);
  };

  this.debug("Done in: " + ((new Date).valueOf() - s) + QxConst.CORE_MILLISECONDS);
};

proto._runApplication = function()
{
  var s = (new Date).valueOf();
  this.info("Main phase");

  try
  {
    // Execute user define 'main' method
    this.debug("Executing application main");
    this.main();

    // Fire global 'main' event
    this.createDispatchEvent(QxConst.EVENT_TYPE_MAIN);

    // Output the number of currently instanciated objects
    this._printInstanceInfo();
  }
  catch(ex)
  {
    return this.error("...failed: " + ex);
  };

  this.debug("Done in: " + ((new Date).valueOf() - s) + QxConst.CORE_MILLISECONDS);
};

proto._runPreload = function()
{
  this._preloadStart = (new Date).valueOf();

  this.info("Preload phase");
  this.debug("Preloading images...");

  if (typeof QxImageManager !== QxConst.TYPEOF_UNDEFINED && typeof QxImagePreloaderSystem !== QxConst.TYPEOF_UNDEFINED)
  {
    var vPreloaderSystem = new QxImagePreloaderSystem(QxImageManager.getPreloadImageList());
    vPreloaderSystem.addEventListener(QxConst.EVENT_TYPE_COMPLETED, this._runPreloadDone, this);
    vPreloaderSystem.start();
  };
};

proto._runPreloadDone = function()
{
  this.debug("Done in: " + ((new Date).valueOf() - this._preloadStart) + QxConst.CORE_MILLISECONDS);
  this._runWidgets();
};

proto._runWidgets = function()
{
  if (typeof QxWidget === QxConst.TYPEOF_FUNCTION)
  {
    var s = (new Date).valueOf();

    this.info("Widget phase");
    this.debug("Rendering widgets");

    this._ready = true;
    QxWidget.flushGlobalQueues(true);

    this.debug("Done in: " + ((new Date).valueOf() - s) + QxConst.CORE_MILLISECONDS);
  };

  this._runPost();
};

proto._runPost = function()
{
  var s = (new Date).valueOf();
  this.info("Post phase");

  try
  {
    // Output the number of currently instanciated objects
    this._printInstanceInfo();

    // Execute user define 'post' method
    this.debug("Executing application post");
    this.post();

    // Fire global 'post' event
    this.createDispatchEvent(QxConst.EVENT_TYPE_POST);
  }
  catch(ex)
  {
    return this.error("...failed: " + ex);
  };

  this.debug("Done in: " + ((new Date).valueOf() - s) + QxConst.CORE_MILLISECONDS);
};

proto._runPostload = function()
{
  this._postloadStart = (new Date).valueOf();

  this.info("Postload phase");
  this.debug("Preloading images...");

  if (typeof QxImageManager !== QxConst.TYPEOF_UNDEFINED && typeof QxImagePreloaderSystem !== QxConst.TYPEOF_UNDEFINED)
  {
    var vPreloaderSystem = new QxImagePreloaderSystem(QxImageManager.getPostPreloadImageList());
    vPreloaderSystem.addEventListener(QxConst.EVENT_TYPE_COMPLETED, this._runPostloadDone, this);
    vPreloaderSystem.start();
  };
};

proto._runPostloadDone = function()
{
  this.debug("Done in: " + ((new Date).valueOf() - this._postloadStart) + QxConst.CORE_MILLISECONDS);
};





/*
---------------------------------------------------------------------------
  ADDITIONAL INFORMATIONAL OUTPUT
---------------------------------------------------------------------------
*/

proto._printInstanceInfo = function() {
  this.debug("Number of instances: " + QxObjectDataBase.length);
};

proto._printClassInfo = function() {
  this.debug("Number of classes: " + QxUtil.getObjectLength(QxMain.classes));
};

proto._printPropertyInfo = function() {
  this.debug("Number of properties: " + QxMain.propertyNumber);
};

proto._printClientInfo = function()
{
  this.debug("Client: " + QxClient.getEngine() + QxConst.CORE_SPACE + QxClient.getVersion() + (QxUtil.isValidString(QxClient.getEmulation()) ? QxConst.CORE_SPACE + QxClient.getEmulation() : QxConst.CORE_EMPTY));

  if (!QxClient.isInQuirksMode() && QxClient.isMshtml()) {
    this.warn("Document is not in Quirksmode! This is needed in Internet Explorer <= 6 to let qooxdoo render correctly.");
  };
};

proto._printVersion = function() {
  this.debug("Version: " + QxMain.version);
};









/*
---------------------------------------------------------------------------
  UTILITIES
---------------------------------------------------------------------------
*/

proto._ready = false;

proto.isReady = function() {
  return this._ready;
};

proto.getClientWindow = function() {
  return this._clientWindow;
};

proto.getEventManager = function() {
  return this.getClientWindow().getEventManager();
};

proto.getClientDocument = function() {
  return this.getClientWindow().getClientDocument();
};

proto.postLoad = function()
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

proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };

  if (QxClient.isGecko()) {
    QxDom.removeEventListener(window, "DOMContentLoaded", QxApplicationInit);
  } else {
    QxDom.removeEventListener(window, "load", QxApplicationInit);
  };

  delete this._clientWindow;
  delete this._remappingChildTable;
  delete this._remappingChildTarget;

  QxTarget.prototype.dispose.call(this);
};

window.application = new QxApplication;
