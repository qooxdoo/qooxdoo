/* ********************************************************************
   Class: QxClientWindow
******************************************************************** */

function QxClientWindow(windowElement)
{
  QxTarget.call(this);

  // Bind element nodes
  this._element = windowElement;
  
  // Add Unload Event
  if ((new QxClient).isMshtml())
  {
    this._element.attachEvent("onunload", new Function("(new QxApplication).dispose()"));
  }
  else
  {
    this._element.addEventListener("unload", new Function("(new QxApplication).dispose()"), false);
  };

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

proto._modifyCurrentContextMenu = function(propValue, propOldValue, propName, uniqModIds)
{
  if (propOldValue) {
    propOldValue.setVisible(false);
  };

  return true;
};

proto.dispose = function()
{
  if (this._disposed) {
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
