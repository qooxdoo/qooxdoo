/* ********************************************************************
   Class: QxClientWindow
******************************************************************** */

function QxClientWindow(windowElement)
{
  QxTarget.call(this);

  // Bind element nodes
  this._element = windowElement;
  
  // Add Unload Event
  this._addUnloadEvent();
  
  // Document
  this._clientDocument = new QxClientDocument(this);

  // Create Core Managers
  this._eventManager = new QxEventManager(this);
  this._focusManager = new QxFocusManager(this);
};

QxClientWindow.extend(QxTarget, "QxClientWindow");

QxClientWindow.addProperty({ name : "currentContextMenu" });

proto.getEventManager = function() { return this._eventManager; };
proto.getFocusManager = function() { return this._focusManager; };
proto.getClientDocument = function() { return this._clientDocument; };
proto.getDocument = function() { return this._clientDocument; };

proto.isCreated = function() { return true; };
proto.getElement = function() { return this._element; };
proto.contains = function() { return false; };

if ((new QxClient).isMshtml())
{
  proto._addUnloadEvent = function() {
    this._element.attachEvent("onunload", new Function("(new QxApplication).dispose();"));
  };  
}
else if ((new QxClient).isGecko())
{
  proto._addUnloadEvent = function() {
    this._element.addEventListener("unload", new Function("(new QxApplication).dispose();"), false);
  };  
}
else
{
  proto._addUnloadEvent = function() 
  {
    var el = this._element;

    // check for existing function (otherwise old operas <7.6 fails here)
    if (el.addEventListener) {
      el.addEventListener("unload", new Function("(new QxApplication).dispose();"), false);
    };
  };  
};

proto._modifyCurrentContextMenu = function(propValue, propOldValue, propName, uniqModIds)
{
  if (propOldValue) {
    propOldValue.setVisible(false);
  };

  return true;
};

proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };

  if (this._eventManager) {
    this._eventManager.dispose();
  };
    
  if (this._focusManager) {
    this._focusManager.dispose();
  };
  
  QxTarget.prototype.dispose.call(this);

  return true;
};
