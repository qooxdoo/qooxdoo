/*!
  This manager registers and manage all incoming key and mouse events
*/
function QxEventManager(vClientWindow)
{
  QxObject.call(this);

  // Object Wrapper to Events (Needed for DOM-Events)
  var o = this;
  this.__onmouseevent = function(e) { return o._onmouseevent(e); };
  this.__onkeyevent = function(e) { return o._onkeyevent(e); };
  this.__ondragevent = function(e) { return o._ondragevent(e); };

  // Some Window Events
  this.__onwindowblur = function(e) { return o._onwindowblur(e); };
  this.__onwindowfocus = function(e) { return o._onwindowfocus(e); };
  this.__onwindowresize = function(e) { return o._onwindowresize(e); };

  // Attach Document
  if (isValid(vClientWindow)) {
    this.attachEvents(vClientWindow);
  };
  
  // Init Command Interface
  this._commands = {};  
};

QxEventManager.extend(QxManager, "QxEventManager");

QxEventManager.mouseEventTypes = [ "mouseover", "mousemove", "mouseout", "mousedown", "mouseup", "click", "dblclick", "contextmenu", (new QxClient).isMshtml() ? "mousewheel" : "DOMMouseScroll" ];
QxEventManager.keyEventTypes = [ "keydown", "keypress", "keyup" ];
QxEventManager.dragEventTypes = (new QxClient).isGecko() ? [ "dragdrop", "dragenter", "dragexit", "draggesture", "dragover" ] : [];

QxEventManager.addProperty({ name : "allowClientContextMenu", type : Boolean, defaultValue : false });
QxEventManager.addProperty({ name : "captureWidget" });


/*
  -------------------------------------------------------------------------------
    STATE FLAGS
  -------------------------------------------------------------------------------
*/

proto._attachedClientWindow = null;

proto._lastMouseEventType = null;
proto._lastMouseDown = false;
proto._lastMouseEventDate = 0;



/*
  -------------------------------------------------------------------------------
    MODIFIERS
  -------------------------------------------------------------------------------
*/

proto._modifyCaptureWidget = function(propValue, propOldValue, propName, uniqModIds)
{
  if (propOldValue) {
    propOldValue.setCapture(false, uniqModIds);
  };

  if (propValue) {
    propValue.setCapture(true, uniqModIds);
  };

  return true;
};




/*
  -------------------------------------------------------------------------------
    COMMAND INTERFACE
  -------------------------------------------------------------------------------
*/

proto.addCommand = function(vCommand) {
  this._commands[vCommand.toHash()] = vCommand;
};

proto.removeCommand = function(vCommand) {
  delete this._commands[vCommand.toHash()];
};

proto._checkKeyEventMatch = function(e)
{
  var vCommand;
  
  for (var vHash in this._commands)
  {
    vCommand = this._commands[vHash];

    if (vCommand.getEnabled() && vCommand._matchesKeyEvent(e))
    {
      // allow the user to stop the event 
      // through the execute event.
      if (!vCommand.execute()) {
        e.preventDefault();
      };
    };
  };
};




/*
  -------------------------------------------------------------------------------
    EVENT-MAPPING
  -------------------------------------------------------------------------------
*/

proto.attachEvents = function(clientWindow)
{
  if (this._attachedClientWindow) {
    return false;
  };

  //this.debug("Attach to clientWindow");

  this._attachedClientWindow = clientWindow;

  // Add dom events
  this.attachEventTypes(QxEventManager.mouseEventTypes, this.__onmouseevent);
  this.attachEventTypes(QxEventManager.keyEventTypes, this.__onkeyevent);
  this.attachEventTypes(QxEventManager.dragEventTypes, this.__ondragevent);

  // Add window events
  var winElem = clientWindow.getElement();

  winElem.onblur = this.__onwindowblur;
  winElem.onfocus = this.__onwindowfocus;
  winElem.onresize = this.__onwindowresize;
};

proto.detachEvents = function()
{
  if (!this._attachedClientWindow) {
    return false;
  };

  // Remove window events
  var winElem = this._attachedClientWindow.getElement();
  winElem.onblur = winElem.onfocus = winElem.onresize = null;

  // Remove dom events
  this.detachEventTypes(QxEventManager.mouseEventTypes, this.__onmouseevent);
  this.detachEventTypes(QxEventManager.keyEventTypes, this.__onkeyevent);
  this.detachEventTypes(QxEventManager.dragEventTypes, this.__ondragevent);

  this._attachedClientWindow = null;
};

proto.attachEventTypes = function(eventTypes, functionPointer)
{
  var d = this._attachedClientWindow.getClientDocument().getElement();

  // MSHTML Method to add events
  if (d.attachEvent) {
    for (var i=0; i<eventTypes.length; i++) {
      d.attachEvent("on" + eventTypes[i], functionPointer);
    };
  }

  // Default W3C Method to add events
  else if (d.addEventListener) {
    for (var i=0; i<eventTypes.length; i++) {
      d.addEventListener(eventTypes[i], functionPointer, false);
    };
  };
};

proto.detachEventTypes = function(eventTypes, functionPointer)
{
  var d = this._attachedClientWindow.getClientDocument().getElement();

  // MSHTML Method to add events
  if (d.detachEvent) {
    for (var i=0; i<eventTypes.length; i++) {
      d.detachEvent("on" + eventTypes[i], functionPointer);
    };
  }

  // Default W3C Method to add events
  else if (d.removeEventListener) {
    for (var i=0; i<eventTypes.length; i++) {
      d.removeEventListener(eventTypes[i], functionPointer, false);
    };
  };
};





/*
  -------------------------------------------------------------------------------
    HELPER METHODS
  -------------------------------------------------------------------------------
*/

// BUG: http://xscroll.mozdev.org/
// If your Mozilla was built with an option `--enable-default-toolkit=gtk2',
// it can not return the correct event target for DOMMouseScroll.

QxEventManager.getTargetObject = function(n)
{
  // Walk up the tree and search for an QxWidget
  while(n != null && n._QxWidget == null)
  {
    try {
      n = n.parentNode;
    }
    catch(e)
    {
      n = null;
    };
  };

  return n ? n._QxWidget : null;
};

QxEventManager.getTargetObjectFromEvent = function(e) {
  return QxEventManager.getTargetObject(e.target || e.srcElement);
};

QxEventManager.getRelatedTargetObjectFromEvent = function(e) {
  return QxEventManager.getTargetObject(e.relatedTarget || (e.type == "mouseover" ? e.fromElement : e.toElement));
};

QxEventManager.getActiveTargetObject = function(n, o)
{
  if (!o) 
  {
    var o = QxEventManager.getTargetObject(n);

    if (!o) {
      return null;
    };
  };
  
  // Search parent tree
  while(o)
  {
    // Break if current object is disabled -
    // event should be ignored then.
    if (!o.getEnabled()) {
      return;
    };

    // If object is anonymous, search for
    // first parent which is not anonymous
    // and not disabled
    if (!o.getAnonymous()) {
      break;
    };

    o = o.getParent();
  };
  
  return o;
};

QxEventManager.getActiveTargetObjectFromEvent = function(e) {
  return QxEventManager.getActiveTargetObject(e.target || e.srcElement);
};

QxEventManager.getRelatedActiveTargetObjectFromEvent = function(e) {
  return QxEventManager.getActiveTargetObject(e.relatedTarget || (e.type == "mouseover" ? e.fromElement : e.toElement));
};






/*
  -------------------------------------------------------------------------------
    KEY EVENTS
  -------------------------------------------------------------------------------
*/

proto._onkeyevent = function(e)
{
  if (this.getDisposed() || typeof QxKeyEvent != "function") {
    return;
  };

  if(!e) {
    e = this._attachedClientWindow.getElement().event;
  };

  var k = e.keyCode || e.charCode;
  
  if (k == QxKeyEvent.keys.tab)
  {
    if ((new QxClient).isNotMshtml()) {
      e.preventDefault();
    };

    e.returnValue = false;

    // Hide Menus
    (new QxMenuManager).update();
    
    this._attachedClientWindow.getFocusManager()._ontabevent(e);
  }
  else
  {
    // Hide Menus
    if (k == QxKeyEvent.keys.esc) {
      (new QxMenuManager).update();
    };
    
    var o = this.getCaptureWidget() || (new QxApplication).getActiveWidget();
    if (o == null || !o.getEnabled()) {
      return;
    };

    // Create Event Object
    var s = new QxKeyEvent(e.type, e, false);
    
    // Check for commands
    if (e.type == "keypress") {
      this._checkKeyEventMatch(s);
    };

    // Starting Object Internal Event Dispatcher
    // This handles the real event action
    var r = o.dispatchEvent(s);

    if (typeof QxDragAndDropManager == "function") {
      (new QxDragAndDropManager).handleKeyEvent(s);
    };

    // Cleanup Event Object
    s.dispose();
    
    return r;
  };
};




/*
  -------------------------------------------------------------------------------
    MOUSE EVENTS
  -------------------------------------------------------------------------------
*/

/*!
  This one handle all mouse events

  When a user double clicks on a QxWidget the
  order of the mouse events is the following:

  1. mousedown
  2. mouseup
  3. click
  4. mousedown
  5. mouseup
  6. dblclick
*/

if((new QxClient).isMshtml())
{
  proto._onmouseevent = function(e)
  {
    if(!e) {
      e = this._attachedClientWindow.getElement().event;
    };

    var t = e.type;

    if(t == "mousemove")
    {
      if (this._mouseIsDown && e.button == 0)
      {
        this._onmouseevent_post(e, "mouseup");
        this._mouseIsDown = false;
      };
    }
    else
    {
      if(t == "mousedown")
      {
        this._mouseIsDown = true;
      }
      else if(t == "mouseup")
      {
        this._mouseIsDown = false;
      };

      // Fix MSHTML Mouseup, should be after a normal click or contextmenu event, like Mozilla do this
      if(t=="mouseup" && !this._lastMouseDown && ((new Date).valueOf() - this._lastMouseEventDate) < 250)
      {
        this._onmouseevent_post(e, "mousedown");
      }

      // Fix MSHTML Doubleclick, should be after a normal click event, like Mozilla do this
      else if(t=="dblclick" && this._lastMouseEventType=="mouseup" && ((new Date).valueOf() - this._lastMouseEventDate) < 250)
      {
        this._onmouseevent_post(e, "click");
      };

      if (t == "mousedown" || t == "mouseup" || t == "click" || t == "dblclick" || t == "contextmenu")
      {
        this._lastMouseEventType = t;
        this._lastMouseEventDate = (new Date).valueOf();
        this._lastMouseDown = t == "mousedown";
      };
    };

    this._onmouseevent_post(e, t);
  };
}
else
{
  proto._onmouseevent = function(e)
  {
    var t = e.type;
    
    switch(t)
    {
      case "DOMMouseScroll":
        // normalize mousewheel event
        t = "mousewheel";
        break;
        
      case "click":
      case "dblclick":
        // ignore click or dblclick events with other then the left mouse button
        if (e.button != QxMouseEvent.buttons.left) {
          return;
        };
    };

    this._onmouseevent_post(e, t);
  };
};


/*!
  This is the crossbrowser post handler for all mouse events.
*/
proto._onmouseevent_post = function(e, t)
{
  var vEventObject, vDispatchTarget, vTarget, vActiveTarget, vRelatedTarget;
  
  switch(t)
  {
    case "contextmenu":
      if (!this.getAllowClientContextMenu()) 
      {
        if(!(new QxClient).isMshtml()) {
          e.preventDefault();
        };

        e.returnValue = false;        
      };
      
      break;
      
    case "mousedown":
      this._onactivateevent(e);
      break;
  };
  
  
  
  
  
  // Check for capturing, if enabled the target is the captured widget.
  vDispatchTarget = this.getCaptureWidget();
  
  // Event Target Object
  vTarget = QxEventManager.getTargetObjectFromEvent(e);
  
  // If no capturing is active search for a valid target object
  if (!isValidObject(vDispatchTarget)) 
  {
    // Get Target Object
    vDispatchTarget = vActiveTarget = QxEventManager.getActiveTargetObject(null, vTarget);

    // Ignore events which have no target object
    if (!isValidObject(vDispatchTarget)) {
      return;
    };
  }
  else
  {
    vActiveTarget = QxEventManager.getActiveTargetObject(null, vTarget);
  };



  // Find related target object
  switch(t)
  {
    case "mouseover":
    case "mouseout":
      vRelatedTarget = QxEventManager.getRelatedActiveTargetObjectFromEvent(e);
      
      // Ignore events where the related target and
      // the real target are equal - from our sight
      if (vRelatedTarget == vActiveTarget) {
        return;
      };
  };  




  // Create Mouse Event Object
  vEventObject = new QxMouseEvent(t, e, false, vTarget, vActiveTarget, vRelatedTarget);
  
  // Store last Event in MouseEvent Constructor
  // Needed for Tooltips, ...
  QxMouseEvent._storeEventState(vEventObject);

  // Hide Popups
  if (t == "mousedown") {
    (new QxPopupManager).update(o);
  };

  // Dispatch Event through target (eventtarget-)object
  vDispatchTarget.dispatchEvent(vEventObject);
  
  

  
  
  // Handle Special Post Events
  switch(t)
  {
    case "mousedown":
      if (!vEventObject.getPropagationStopped()) {
        (new QxMenuManager).update();
      };
      break;
    
    case "mouseover":
      if (isValidFunction(QxToolTipManager)) {
        (new QxToolTipManager).handleMouseOver(vEventObject);
      };
      break;

    case "mouseout":
      if (isValidFunction(QxToolTipManager)) {
        (new QxToolTipManager).handleMouseOut(vEventObject);
      };
      break;
  };
  



  // Send Event Object to Drag&Drop Manager
  if (isValidFunction(QxDragAndDropManager)) {
    (new QxDragAndDropManager).handleMouseEvent(vEventObject);
  };




  // Dispose Event Object
  vEventObject.dispose();
  vEventObject = null;
};




/*
  -------------------------------------------------------------------------------
    DRAG EVENTS
    
    Currently only to stop non needed events
  -------------------------------------------------------------------------------
*/

proto._ondragevent = function(e) {
  e.preventDefault();
};




/*
  -------------------------------------------------------------------------------
    OTHER EVENTS
  -------------------------------------------------------------------------------
*/

proto._onwindowblur = function(e)
{
  if (this._ignoreBlur) {
    delete this._ignoreBlur;
    return;
  };
  
  this._allowFocus = true;
  
  // Hide Popups, Tooltips, ...
  if (isValidFunction(QxPopupManager)) {
    (new QxPopupManager).update();
  };
  
  // Hide Menus
  if (isValidFunction(QxMenuManager)) {
    (new QxMenuManager).update();
  };

  // Cancel Drag Operations
  if (isValidFunction(QxDragAndDropManager)) {
    (new QxDragAndDropManager).globalCancelDrag();
  };

  // Send blur event to client document
  var vDoc = this._attachedClientWindow.getDocument();
  if (vDoc.hasEventListeners("blur")) {
    vDoc.dispatchEvent(new QxEvent("blur"), true);
  };
};

proto._onwindowfocus = function(e)
{
  // Make focus more intelligent and only allow focus if 
  // a previous blur occured
  if (!this._allowFocus) {
    return;
  };
  
  delete this._allowFocus;
  
  // Send focus event to client document
  var vDoc = this._attachedClientWindow.getDocument();
  if (vDoc.hasEventListeners("focus")) {
    vDoc.dispatchEvent(new QxEvent("focus"), true);
  };
};

proto._onwindowresize = function(e)
{
  // Send resize event to client document
  this._attachedClientWindow.getDocument().dispatchEvent(new QxEvent("resize"), true);
};

proto._onactivateevent = function(e)
{
  var n = e.target || e.srcElement;

  while(n != null && n._QxWidget == null) {
    n = n.parentNode;
  };

  if(n == null) {
    return;
  };
  
  var o = n._QxWidget;
  var oactive = o;
  
  if (o) 
  {
    while(o != null && !o.canGetFocus()) {
      o = o.getParent();
    };
   
    if(o) {    
      o.setFocused(true);
    };
    
    if (oactive != o) {
      (new QxApplication).setActiveWidget(oactive);
    };
  };
  
  // this will also stops activating through browser
  // e.preventDefault();

  // the more intelli method, ignore blur after mousedown event
  this._ignoreBlur = true;
};


/*
  -------------------------------------------------------------------------------
    DISPOSE
  -------------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };

  this.detachEvents();

  this._attachedClientWindow = null;

  this._lastMouseEventType = null;
  this._lastMouseDown = null;
  this._lastMouseEventDate = null;
  
  if (this._commands)
  {
    for (var vHash in this._commands) 
    {
      this._commands[vHash].dispose();
      delete this._commands[vHash];  
    };
    
    this._commands = null;
  };  

  QxObject.prototype.dispose.call(this);
};
