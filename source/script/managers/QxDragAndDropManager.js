function QxDragAndDropManager()
{
  if (QxDragAndDropManager._instance) {
    return QxDragAndDropManager._instance;
  };
  
  QxTarget.call(this);
  
  this._data = {};
  this._actions = {};
  this._cursors = {};

  var d = window.application.getClientWindow().getClientDocument();
  var a = [ "move", "copy", "alias", "nodrop" ];
  var c;
  
  for (var i=0; i<a.length; i++)
  {
    c = this._cursors[a[i]] = new QxImage("widgets/cursors/" + a[i] + ".gif");
    
    c.setTimerCreate(false);
    c.setStyleProperty("top", "-1000px");
    c.setZIndex(10000);
    c.setParent(d);    
  };

  QxDragAndDropManager._instance = this;
};

QxDragAndDropManager.extend(QxManager, "QxDragAndDropManager");

QxDragAndDropManager.addProperty({ name : "sourceWidget", type : Object });
QxDragAndDropManager.addProperty({ name : "destinationWidget", type : Object });
QxDragAndDropManager.addProperty({ name : "cursor", type : Object });
QxDragAndDropManager.addProperty({ name : "currentAction", type : String });

proto._lastDestinationEvent = null;






/*
  -------------------------------------------------------------------------------
    COMMON MODIFIER
  -------------------------------------------------------------------------------
*/

proto._modifyDestinationWidget = function(propValue, propOldValue, propName, uniqModIds)
{
  if (propValue) {
    propValue.dispatchEvent(new QxDragEvent("dragdrop", this._lastDestinationEvent));
    this._lastDestinationEvent = null;
  };

  return true;
};




/*
  -------------------------------------------------------------------------------
    DATA HANDLING
  -------------------------------------------------------------------------------
*/

/*!
Add data of mimetype.

#param vMimeType[String]: A valid mimetype
#param vData: Any value for the mimetype
*/
proto.addData = function(vMimeType, vData) {
  this._data[vMimeType] = vData;
};

proto.getData = function(vMimeType) {
  return this._data[vMimeType];
};

proto.clearData = function() {
  this._data = {};
};





/*
  -------------------------------------------------------------------------------
    MIME TYPE HANDLING
  -------------------------------------------------------------------------------
*/

proto.getDropDataTypes = function()
{
  var dw = this.getDestinationWidget();
  var st = [];

  // If there is not any destination, simple return
  if (!dw) {
    return st;
  };

  // Search for matching mimetypes
  var ddt = dw.getDropDataTypes();
  var ddtl = ddt.length;

  for (var i=0; i<ddtl; i++) {
    if (ddt[i] in this._data) {
      st.push(ddt[i]);
    };
  };

  return st;
};




/*
  -------------------------------------------------------------------------------
    START DRAG
  -------------------------------------------------------------------------------
*/

/*!
This needed be called from any "dragstart" event to really start drag session.
*/
proto.startDrag = function()
{
  if (!this._dragCache) {
    throw new Error("Invalid usage of startDrag. Missing dragInfo!");
  };

  // Update status flag
  this._dragCache.dragHandlerActive = true;

  // Internal storage of source widget
  this.setSourceWidget(this._dragCache.sourceWidget);
};



/*
  -------------------------------------------------------------------------------
    FIRE IMPLEMENTATION FOR USER EVENTS
  -------------------------------------------------------------------------------
*/

proto._fireUserEvents = function(fromWidget, toWidget, e)
{
  if (fromWidget && fromWidget != toWidget)
  {
    var outEvent = new QxDragEvent("dragout", e);

    outEvent._relatedTarget = toWidget;

    fromWidget.dispatchEvent(outEvent, true);
    outEvent = null;
  };

  if (toWidget)
  {
    if (fromWidget != toWidget)
    {
      var overEvent = new QxDragEvent("dragover", e);

      // set relatedTarget
      overEvent._relatedTarget = fromWidget;

      toWidget.dispatchEvent(overEvent, true);
      overEvent = null;
    };

    var moveEvent = new QxDragEvent("dragmove", e);
    toWidget.dispatchEvent(moveEvent, true);
    moveEvent = null;
  };
};




/*
  -------------------------------------------------------------------------------
    HANDLER FOR MOUSE EVENTS
  -------------------------------------------------------------------------------
*/

/*!
This wraps the mouse events to custom handlers.
*/
proto.handleMouseEvent = function(e)
{
  switch (e.getType())
  {
    case "mousedown":
      return this._handleMouseDown(e);

    case "mouseup":
      return this._handleMouseUp(e);

    case "mousemove":
      return this._handleMouseMove(e);
  };
};

/*!
This starts the core drag and drop session.

To really get drag and drop working you need to define
a function which you attach to "dragstart"-event, which
invokes at least this.startDrag()
*/
proto._handleMouseDown = function(e)
{
  if (e.getDefaultPrevented()) {
    return;
  };

  // Store initial dragCache
  this._dragCache = {
    startScreenX: e.getScreenX(),
    startScreenY: e.getScreenY(),

    pageX: e.getPageX(),
    pageY: e.getPageY(),

    sourceWidget: e.getTarget(),

    dragHandlerActive: false,
    hasFiredDragStart: false
  };
};


/*!
Handler for mouse move events
*/
proto._handleMouseMove = function(e)
{
  // Return if dragCache was not filled before
  if (!this._dragCache) {
    return;
  };
  
  

  /*
    Default handling if drag handler is activated
  */

  if (this._dragCache.dragHandlerActive)
  {
    // Update page coordinates
    this._dragCache.pageX = e.getPageX();
    this._dragCache.pageY = e.getPageY();

    // Get current target
    var currentDropTarget = this.getDropTarget(e);
    
    // window.status = "move: " + (new Date).valueOf() + " :: " + currentDropTarget
    
    // Update action
    this.setCurrentAction(currentDropTarget ? this._evalNewAction(e.getShiftKey(), e.getCtrlKey(), e.getAltKey()) : null);

    // Fire user events
    this._fireUserEvents(this._dragCache.currentDropWidget, currentDropTarget, e);

    // Store current widget
    this._dragCache.currentDropWidget = currentDropTarget;

    // Update cursor icon
    this._renderCursor();
  }

  /*
    Initial activation and fire of dragstart
  */
  else if (!this._dragCache.hasFiredDragStart)
  {
    if (Math.abs(e.getScreenX() - this._dragCache.startScreenX) > 5 || Math.abs(e.getScreenY() - this._dragCache.startScreenY) > 5)
    {
      // Fire dragstart event to finally allow the above if to handle next events
      this._dragCache.sourceWidget.dispatchEvent(new QxDragEvent("dragstart", e));

      // Update status flag
      this._dragCache.hasFiredDragStart = true;

      // Look if handler become active
      if (this._dragCache.dragHandlerActive)
      {
        // Fire first user events
        this._fireUserEvents(this._dragCache.currentDropWidget, this._dragCache.sourceWidget, e);

        // Update status flags
        this._dragCache.currentDropWidget = this._dragCache.sourceWidget;

        // Activate capture for clientDocument
        var clientDocument = window.application.getClientWindow().getClientDocument();

        clientDocument.setCapture(true);
        clientDocument.addEventListener("losecapture", this.cancelDrag, this);
      };
    };
  };
};

/*!
Handle mouse up event. Normally this finalize the drag and drop event.
*/
proto._handleMouseUp = function(e)
{
  // Return if dragCache was not filled before
  if (!this._dragCache) {
    return;
  };

  if (this._dragCache.dragHandlerActive)
  {
    this._endDrag(this.getDropTarget(e), e);
  }
  else
  {
    // Clear drag cache
    this._dragCache = null;
  };
};





/*
  -------------------------------------------------------------------------------
    HANDLER FOR KEY EVENTS
  -------------------------------------------------------------------------------
*/

/*!
This wraps the key events to custom handlers.
*/
proto.handleKeyEvent = function(e)
{
  if (!this._dragCache) {
    return;
  };

  switch (e.getType())
  {
    case "keydown":
      this._handleKeyDown(e);
      return;

    case "keyup":
      this._handleKeyUp(e);
      return;
  };
};

proto._handleKeyDown = function(e)
{
  // Stop Drag on Escape
  if (e.getKeyCode() == QxKeyEvent.keys.esc)
  {
    this.cancelDrag();
  }

  // Update cursor and action on press of modifier keys
  else if (this.getCurrentAction() != null)
  {
    switch(e.getKeyCode())
    {
      case QxKeyEvent.keys.shift:
      case QxKeyEvent.keys.ctrl:
      case QxKeyEvent.keys.alt:
        this.setAction(this._evalNewAction(e.getShiftKey(), e.getCtrlKey(), e.getAltKey()));
        this._renderCursor();
    };
  };


};

proto._handleKeyUp = function(e)
{
  var bShiftPressed = e.getKeyCode() == QxKeyEvent.keys.shift;
  var bCtrlPressed = e.getKeyCode() == QxKeyEvent.keys.strl;
  var bAltPressed = e.getKeyCode() == QxKeyEvent.keys.alt;

  if (bShiftPressed || bCtrlPressed || bAltPressed)
  {
    if (this.getCurrentAction() != null)
    {
      this.setAction(this._evalNewAction(!bShiftPressed && e.getShiftKey(), ! bCtrlPressed && e.getCtrlKey(), !bAltPressed && e.getAltKey()));
      this._renderCursor();
    };
  };

  e.preventDefault();
};






/*
  -------------------------------------------------------------------------------
    IMPLEMENTATION OF DRAG&DROP SESSION FINALISATION
  -------------------------------------------------------------------------------
*/

/*!
  Cancel current drag and drop session
*/
proto.cancelDrag = function(e) {
  this._endDrag(null, e);
};

proto.globalCancelDrag = function() 
{
  if (this._dragCache && this._dragCache.dragHandlerActive) {
    this._endDragCore();
  };
};

/*!
  This will be called to the end of each drag and drop session
*/
proto._endDrag = function(currentDestinationWidget, e)
{
  // Use given destination widget
  if (currentDestinationWidget) {
    this._lastDestinationEvent = e;
    this.setDestinationWidget(currentDestinationWidget);
  };

  // Dispatch dragend event
  this.getSourceWidget().dispatchEvent(new QxDragEvent("dragend", e));

  // Fire dragout event
  this._fireUserEvents(this._dragCache && this._dragCache.currentDropWidget, null, e);

  // Call helper
  this._endDragCore();
};

proto._endDragCore = function()
{
  // Remove cursor
  this.setCursor(null);

  var d = window.application.getClientWindow().getClientDocument();
  d.removeEventListener("losecapture", this.cancelDrag, this);
  d.setCapture(false);

  // Reset drag cache for next drag and drop session
  if (this._dragCache) {
    this._dragCache.currentDropWidget = null;
    this._dragCache = null;
  };

  // Cleanup data and actions
  this.clearData();
  this.clearActions();

  // Cleanup widgets
  this.setSourceWidget(null);
  this.setDestinationWidget(null);  
};




/*
  -------------------------------------------------------------------------------
    IMPLEMENTATION OF CURSOR UPDATES
  -------------------------------------------------------------------------------
*/

/*!
  Select and setup the current used cursor
*/
proto._renderCursor = function()
{
  var newCursor;

  switch(this.getCurrentAction())
  {
    case "move":
      newCursor = this._cursors.move;
      break;

    case "copy":
      newCursor = this._cursors.copy;
      break;

    case "alias":
      newCursor = this._cursors.alias;
      break;

    default:
      newCursor = this._cursors.nodrop;
  };

  // Don't use properties: This is 100 times faster ;) 
  newCursor._applyPositionHorizontal(this._dragCache.pageX + 5);
  newCursor._applyPositionVertical(this._dragCache.pageY + 15);

  this.setCursor(newCursor);
};

proto._modifyCursor = function(propValue, propOldValue, propName, uniqModIds)
{
  if (propOldValue) {
    propOldValue.setStyleProperty("display", "none");
  };

  if (propValue) {
    propValue.removeStyleProperty("display");
  };

  return true;
};




/*
  -------------------------------------------------------------------------------
    IMPLEMENTATION OF DROP TARGET VALIDATION
  -------------------------------------------------------------------------------
*/

proto.supportsDrop = function(vWidget)
{
  var types = vWidget.getDropDataTypes();

  if (!types) {
    return false;
  };

  for (var i=0; i<types.length; i++)
  {
    if (types[i] in this._data) {
      return true;
    };
  };

  return false;
};

/*!

#param e[QxMouseEvent]: Current MouseEvent for dragdrop action
*/
proto.getDropTarget = function(e)
{
  // don't operate on anonymous widgets
  var currentWidget = e.getActiveTarget();
  
  while (currentWidget != null)
  {
    if (this.supportsDrop(currentWidget)) {
      return currentWidget;
    };

    currentWidget = currentWidget.getParent();
  };

  return null;
};




/*
  -------------------------------------------------------------------------------
    ACTION HANDLING
  -------------------------------------------------------------------------------
*/

proto.addAction = function(vAction, vForce)
{
  this._actions[vAction] = true;

  // Defaults to first added action
  if (vForce || this.getCurrentAction() == null) {
    this.setCurrentAction(vAction);
  };
};

proto.clearActions = function()
{
  this._actions = {};
  this.setCurrentAction(null);
};

proto.removeAction = function(sAction)
{
  delete this._actions[sAction];

  // Reset current action on remove
  if (this.getCurrentAction() == sAction) {
    this.setCurrentAction(null);
  };
};

proto.setAction = function(s)
{
  if (s != null && !(s in this._actions)) {
    this.addAction(s, true);
  }
  else
  {
    this.setCurrentAction(s);
  };
};

proto._evalNewAction = function(kShift, kCtrl, kAlt)
{
  if (kShift && kCtrl && this._supportAction("alias"))
  {
    return "alias";
  }
  else if (kShift && kAlt && this._supportAction("copy"))
  {
    return "copy";
  }
  else if (kShift && this._supportAction("move"))
  {
    return "move";
  }
  else if (kAlt && this._supportAction("alias"))
  {
    return "alias";
  }
  else if (kCtrl && this._supportAction("copy"))
  {
    return "copy";
  }
  else
  {
    // Return the first action found
    for (var action in this._actions) {
      return action;
    };
  };

  return null;
};

proto._supportAction = function(vAction) {
  return vAction in this._actions;
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

  // Clear data and actions
  this._data = null;
  this._actions = null;

  // Clear source and destination properties
  this.setSourceWidget(null);
  this.setDestinationWidget(null);

  this._lastdestinationWidgetEvent = null;

  // Clear drag cache
  this._dragCache = null;

  // Dispose and clean up cursors
  if (QxDragAndDropManager._cursors)
  {
    if (QxDragAndDropManager._cursors.move)
    {
      QxDragAndDropManager._cursors.move.dispose();
      QxDragAndDropManager._cursors.move = null;
    };

    if (QxDragAndDropManager._cursors.copy)
    {
      QxDragAndDropManager._cursors.copy.dispose();
      QxDragAndDropManager._cursors.copy = null;
    };

    if (QxDragAndDropManager._cursors.alias)
    {
      QxDragAndDropManager._cursors.alias.dispose();
      QxDragAndDropManager._cursors.alias = null;
    };

    if (QxDragAndDropManager._cursors.nodrop)
    {
      QxDragAndDropManager._cursors.nodrop.dispose();
      QxDragAndDropManager._cursors.nodrop = null;
    };

    QxDragAndDropManager._cursors = null;
  };
  
  QxManager.prototype.dispose.call(this);
};