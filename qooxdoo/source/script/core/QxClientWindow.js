/* ********************************************************************
   Class: QxClientWindow
******************************************************************** */

function QxClientWindow(windowElement)
{
  QxTarget.call(this);

  // Bind element nodes
  this._element = windowElement;
  this._element._QxClientWindow = this;
  
  // Add Unload Event
  this._addUnloadEvent(windowElement);

  // Document
  this._clientDocument = new QxClientDocument(this);

  // Create Core Managers
  this._eventManager = new QxEventManager(this);
  this._focusManager = new QxFocusManager(this);
};

QxClientWindow.extend(QxTarget, "QxClientWindow");



/*
------------------------------------------------------------------------------------
  GETTER
------------------------------------------------------------------------------------
*/

proto.getEventManager = function() { return this._eventManager; };
proto.getFocusManager = function() { return this._focusManager; };
proto.getClientDocument = function() { return this._clientDocument; };
proto.getDocument = function() { return this._clientDocument; };
proto.getElement = function() { return this._element; };




/*
------------------------------------------------------------------------------------
  UNLOAD SUPPORT
------------------------------------------------------------------------------------
*/

if ((new QxClient).isMshtml())
{
  proto._addUnloadEvent = function(el) 
  {
    if (el == window)
    {
      el.attachEvent("onunload", new Function("(new QxApplication).dispose();"));
    }
    else
    {
      el.attachEvent("onunload", function(e) {
        el._QxClientWindow.dispose();
      });
    };
  };  
}
else if ((new QxClient).isGecko())
{
  proto._addUnloadEvent = function(el) 
  {
    if (el == window)
    {
      el.addEventListener("unload", new Function("(new QxApplication).dispose();"), false);
    }
    else
    {
      el.addEventListener("unload", function(e) {
        el._QxClientWindow.dispose();
      }, false);  
    };
  };  
}
else
{
  proto._addUnloadEvent = function(el) 
  {
    // check for existing function (otherwise old operas <7.6 fails here)
    if (el.addEventListener) {
      el.addEventListener("unload", new Function("(new QxApplication).dispose();"), false);
    };
  };  
};







/*
------------------------------------------------------------------------------------
  DISPOSER
------------------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };

  if (this._element)
  {
    this._element._QxClientWindow = null;
    this._element = null;
  };

  if (this._eventManager) 
  {
    this._eventManager.dispose();
    this._eventManager = null;
  };
    
  if (this._focusManager) 
  {
    this._focusManager.dispose();
    this._focusManager = null;
  };
  
  if (this._clientDocument) 
  {
    this._clientDocument.dispose();
    this._clientDocument = null;
  };
  
  QxTarget.prototype.dispose.call(this);

  return true;
};
