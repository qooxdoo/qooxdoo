/* ********************************************************************
   Class: QxApplication
******************************************************************** */

function QxApplication()
{
  if (QxApplication._instance) {
    return QxApplication._instance;
  };

  QxTarget.call(this);

  window.onload = function() { window.application.init(); };
  
  QxApplication._instance = this;
};

QxApplication.extend(QxTarget, "QxApplication");

proto._clientWindow = null;
proto._activeWidget = null;

proto.init = function()
{
  // this.debug("State: " + typeof QxClientWindow + " :: " + typeof QxClientDocument + " :: " + typeof QxEventManager + " :: " + typeof QxFocusManager);
  
  window._appstart = (new Date).valueOf();

  var irun = (window._appstart - window._start);
  var iobj = QxObject._db.length;
  var iper = String(irun/iobj);
  iper = iper.substring(0, iper.indexOf(".")+4) + "ms";

  this.debug("Init Runtime: " + irun + "ms");
  this.debug("Init Object Count: " + iobj);
  this.debug("Init Object Perf: " + iper);

  this._clientWindow = new QxClientWindow(window);
  
  if (typeof window.application.main == "function") {
    window.application.main();
  };
    
  window._appstop = window._stop = (new Date).valueOf();
  
  var mrun = (window._appstop - window._appstart);
  var mobj = (QxObject._db.length - iobj);
  var mper = String(mrun/mobj);
  mper = mper.substring(0, mper.indexOf(".")+4) + "ms";

  this.debug("Main Runtime: " + mrun + "ms");
  this.debug("Main Object Count: " + mobj);
  this.debug("Main Object Perf: " + mper);
};

proto.setActiveWidget = function(v) {
  this._activeWidget = v;
};

proto.getActiveWidget = function() {
  return this._activeWidget;
};

proto.getClientWindow = function() {
  return this._clientWindow;
};

proto.getPath = function()
{
  var p = window.location.href;
  var v = p.substring(0, p.lastIndexOf("/"));
  
  return v;
};

proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };

  var dispose_start = (new Date).valueOf();
    
  if (this._clientWindow)
  {
    this._clientWindow.dispose();
    this._clientWindow = null;
  };

  this._activeWidget = null;

  QxTarget.prototype.dispose.call(this);

  QxObject.dispose();
  QxDebug("QxApplication", "Dispose total: " + ((new Date).valueOf() - dispose_start) + "ms");
};

window.application = new QxApplication;