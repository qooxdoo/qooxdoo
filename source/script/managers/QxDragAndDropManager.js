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

#package(dragndrop)
#require(QxImage)
#post(QxDragEvent)
#post(QxDomElementFromPoint)

************************************************************************ */

/*!
  This manager (singleton) manage all drag and drop handling of a QxApplication instance.
*/
function QxDragAndDropManager()
{
  QxTarget.call(this);

  this._data = {};
  this._actions = {};
  this._cursors = {};
};

QxDragAndDropManager.extend(QxManager, "QxDragAndDropManager");

QxDragAndDropManager.addProperty({ name : "sourceWidget", type : QxConst.TYPEOF_OBJECT });
QxDragAndDropManager.addProperty({ name : "destinationWidget", type : QxConst.TYPEOF_OBJECT });
QxDragAndDropManager.addProperty({ name : "cursor", type : QxConst.TYPEOF_OBJECT });
QxDragAndDropManager.addProperty({ name : "currentAction", type : QxConst.TYPEOF_STRING });

proto._actionNames =
{
  move : "move",
  copy : "copy",
  alias : "alias",
  nodrop : "nodrop"
};

proto._cursorPath = "widgets/cursors/";
proto._cursorFormat = "gif";
proto._lastDestinationEvent = null;






/*
---------------------------------------------------------------------------
  INIT CURSORS
---------------------------------------------------------------------------
*/

proto.initCursors = function()
{
  if (this._initCursorsDone) {
    return;
  };

  var vCursor;
  for (var vAction in this._actionNames)
  {
    vCursor = this._cursors[vAction] = new QxImage(this._cursorPath + vAction + QxConst.CORE_DOT + this._cursorFormat);
    vCursor.setZIndex(1e8);
  };

  this._initCursorsDone = true;
};






/*
---------------------------------------------------------------------------
  HELPER
---------------------------------------------------------------------------
*/

proto._getClientDocument = function() {
  return window.application.getClientWindow().getClientDocument();
};





/*
---------------------------------------------------------------------------
  COMMON MODIFIER
---------------------------------------------------------------------------
*/

proto._modifyDestinationWidget = function(propValue, propOldValue, propData)
{
  if (propValue)
  {
    propValue.dispatchEvent(new QxDragEvent(QxConst.EVENT_TYPE_DRAGDROP, this._lastDestinationEvent, propValue, this.getSourceWidget()));
    this._lastDestinationEvent = null;
  };

  return true;
};








/*
---------------------------------------------------------------------------
  DATA HANDLING
---------------------------------------------------------------------------
*/

/*!
Add data of mimetype.

#param vMimeType[String]: A valid mimetype
#param vData[Any]: Any value for the mimetype
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
---------------------------------------------------------------------------
  MIME TYPE HANDLING
---------------------------------------------------------------------------
*/

proto.getDropDataTypes = function()
{
  var vDestination = this.getDestinationWidget();
  var vDropTypes = [];

  // If there is not any destination, simple return
  if (!vDestination) {
    return vDropTypes;
  };

  // Search for matching mimetypes
  var vDropDataTypes = vDestination.getDropDataTypes();

  for (var i=0, l=vDropDataTypes.length; i<l; i++) {
    if (vDropDataTypes[i] in this._data) {
      vDropTypes.push(vDropDataTypes[i]);
    };
  };

  return vDropTypes;
};







/*
---------------------------------------------------------------------------
  START DRAG
---------------------------------------------------------------------------
*/

/*!
This needed be called from any QxConst.EVENT_TYPE_DRAGSTART event to really start drag session.
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
---------------------------------------------------------------------------
  FIRE IMPLEMENTATION FOR USER EVENTS
---------------------------------------------------------------------------
*/

proto._fireUserEvents = function(fromWidget, toWidget, e)
{
  if (fromWidget && fromWidget != toWidget && fromWidget.hasEventListeners(QxConst.EVENT_TYPE_DRAGOUT)) {
    fromWidget.dispatchEvent(new QxDragEvent(QxConst.EVENT_TYPE_DRAGOUT, e, fromWidget, toWidget), true);
  };

  if (toWidget)
  {
    if (fromWidget != toWidget && toWidget.hasEventListeners(QxConst.EVENT_TYPE_DRAGOVER)) {
      toWidget.dispatchEvent(new QxDragEvent(QxConst.EVENT_TYPE_DRAGOVER, e, toWidget, fromWidget), true);
    };

    if (toWidget.hasEventListeners(QxConst.EVENT_TYPE_DRAGMOVE)) {
      toWidget.dispatchEvent(new QxDragEvent(QxConst.EVENT_TYPE_DRAGMOVE, e, toWidget, null), true);
    };
  };
};








/*
---------------------------------------------------------------------------
  HANDLER FOR MOUSE EVENTS
---------------------------------------------------------------------------
*/

/*!
This wraps the mouse events to custom handlers.
*/
proto.handleMouseEvent = function(e)
{
  switch (e.getType())
  {
    case QxConst.EVENT_TYPE_MOUSEDOWN:
      return this._handleMouseDown(e);

    case QxConst.EVENT_TYPE_MOUSEUP:
      return this._handleMouseUp(e);

    case QxConst.EVENT_TYPE_MOUSEMOVE:
      return this._handleMouseMove(e);
  };
};

/*!
This starts the core drag and drop session.

To really get drag and drop working you need to define
a function which you attach to QxConst.EVENT_TYPE_DRAGSTART-event, which
invokes at least this.startDrag()
*/
proto._handleMouseDown = function(e)
{
  if (e.getDefaultPrevented()) {
    return;
  };

  // Store initial dragCache
  this._dragCache =
  {
    startScreenX : e.getScreenX(),
    startScreenY : e.getScreenY(),

    pageX : e.getPageX(),
    pageY : e.getPageY(),

    sourceWidget : e.getTarget(),
    sourceTopLevel : e.getTarget().getTopLevelWidget(),

    dragHandlerActive : false,
    hasFiredDragStart : false
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
      this._dragCache.sourceWidget.dispatchEvent(new QxDragEvent(QxConst.EVENT_TYPE_DRAGSTART, e, this._dragCache.sourceWidget), true);

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
        this._getClientDocument().setCapture(true);
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
---------------------------------------------------------------------------
  HANDLER FOR KEY EVENTS
---------------------------------------------------------------------------
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
    case QxConst.EVENT_TYPE_KEYDOWN:
      this._handleKeyDown(e);
      return;

    case QxConst.EVENT_TYPE_KEYUP:
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

        e.preventDefault();
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

      e.preventDefault();
    };
  };
};









/*
---------------------------------------------------------------------------
  IMPLEMENTATION OF DRAG&DROP SESSION FINALISATION
---------------------------------------------------------------------------
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
  if (currentDestinationWidget)
  {
    this._lastDestinationEvent = e;
    this.setDestinationWidget(currentDestinationWidget);
  };

  // Dispatch dragend event
  this.getSourceWidget().dispatchEvent(new QxDragEvent(QxConst.EVENT_TYPE_DRAGEND, e, this.getSourceWidget(), currentDestinationWidget), true);

  // Fire dragout event
  this._fireUserEvents(this._dragCache && this._dragCache.currentDropWidget, null, e);

  // Call helper
  this._endDragCore();
};

proto._endDragCore = function()
{
  // Remove cursor
  var oldCursor = this.getCursor();
  if (oldCursor)
  {
    oldCursor._style.display = QxConst.DISPLAY_NONE;
    this.forceCursor(null);
  };

  // Reset drag cache for next drag and drop session
  if (this._dragCache)
  {
    this._dragCache.currentDropWidget = null;
    this._dragCache = null;
  };

  // Deactivate capture for clientDocument
  this._getClientDocument().setCapture(false);

  // Cleanup data and actions
  this.clearData();
  this.clearActions();

  // Cleanup widgets
  this.setSourceWidget(null);
  this.setDestinationWidget(null);
};









/*
---------------------------------------------------------------------------
  IMPLEMENTATION OF CURSOR UPDATES
---------------------------------------------------------------------------
*/

/*!
  Select and setup the current used cursor
*/
proto._renderCursor = function()
{
  this.initCursors();

  var vNewCursor;
  var vOldCursor = this.getCursor();

  switch(this.getCurrentAction())
  {
    case this._actionNames.move:
      vNewCursor = this._cursors.move;
      break;

    case this._actionNames.copy:
      vNewCursor = this._cursors.copy;
      break;

    case this._actionNames.alias:
      vNewCursor = this._cursors.alias;
      break;

    default:
      vNewCursor = this._cursors.nodrop;
  };

  // Hide old cursor
  if (vNewCursor != vOldCursor && vOldCursor != null) {
    vOldCursor._style.display = QxConst.DISPLAY_NONE;
  };

  // Ensure that the cursor is created
  if (!vNewCursor._initialLayoutDone)
  {
    this._getClientDocument().add(vNewCursor);
    QxWidget.flushGlobalQueues();
  };

  // Apply position with runtime style (fastest qooxdoo method)
  vNewCursor._applyRuntimeLeft(this._dragCache.pageX + 5);
  vNewCursor._applyRuntimeTop(this._dragCache.pageY + 15);

  // Finally show new cursor
  if (vNewCursor != vOldCursor) {
    vNewCursor._style.display = QxConst.CORE_EMPTY;
  };

  // Store new cursor
  this.forceCursor(vNewCursor);
};








/*
---------------------------------------------------------------------------
  IMPLEMENTATION OF DROP TARGET VALIDATION
---------------------------------------------------------------------------
*/

proto.supportsDrop = function(vWidget)
{
  var vTypes = vWidget.getDropDataTypes();

  if (!vTypes) {
    return false;
  };

  for (var i=0; i<vTypes.length; i++)
  {
    if (vTypes[i] in this._data) {
      return true;
    };
  };

  return false;
};

/*!
#param e[QxMouseEvent]: Current MouseEvent for dragdrop action
*/
if (QxClient.isGecko())
{
  proto.getDropTarget = function(e)
  {
    var vCurrent = e.getTarget();

    // work around gecko bug (all other browsers are correct)
    // clicking on a free space and drag prohibit the get of
    // a valid event target. The target is always the element
    // which was the one with the mousedown event before.
    if (vCurrent == this._dragCache.sourceWidget)
    {
      // vCurrent = QxEventManager.getTargetObject(QxDom.getElementFromPoint(e.getPageX(), e.getPageY()));

      // this is around 8-12 times faster as the above method
      vCurrent = this._dragCache.sourceTopLevel.getWidgetFromPoint(e.getPageX(), e.getPageY());
    }
    else
    {
      vCurrent = QxEventManager.getTargetObject(null, vCurrent);
    };

    while (vCurrent != null && vCurrent != this._dragCache.sourceWidget)
    {
      if (!vCurrent.supportsDrop(this._dragCache)) {
        return null;
      };

      if (this.supportsDrop(vCurrent)) {
        return vCurrent;
      };

      vCurrent = vCurrent.getParent();
    };

    return null;
  };
}
else
{
  proto.getDropTarget = function(e)
  {
    var vCurrent = e.getTarget();

    while (vCurrent != null)
    {
      if (!vCurrent.supportsDrop(this._dragCache)) {
        return null;
      };

      if (this.supportsDrop(vCurrent)) {
        return vCurrent;
      };

      vCurrent = vCurrent.getParent();
    };

    return null;
  };
};









/*
---------------------------------------------------------------------------
  ACTION HANDLING
---------------------------------------------------------------------------
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

proto.removeAction = function(vAction)
{
  delete this._actions[vAction];

  // Reset current action on remove
  if (this.getCurrentAction() == vAction) {
    this.setCurrentAction(null);
  };
};

proto.setAction = function(vAction)
{
  if (vAction != null && !(vAction in this._actions)) {
    this.addAction(vAction, true);
  }
  else
  {
    this.setCurrentAction(vAction);
  };
};

proto._evalNewAction = function(vKeyShift, vKeyCtrl, vKeyAlt)
{
  if (vKeyShift && vKeyCtrl && this._actionNames.alias in this._actions)
  {
    return this._actionNames.alias;
  }
  else if (vKeyShift && vKeyAlt && this._actionNames.copy in this._actions)
  {
    return this._actionNames.copy;
  }
  else if (vKeyShift && this._actionNames.move in this._actions)
  {
    return this._actionNames.move;
  }
  else if (vKeyAlt && this._actionNames.alias in this._actions)
  {
    return this._actionNames.alias;
  }
  else if (vKeyCtrl && this._actionNames.copy in this._actions)
  {
    return this._actionNames.copy;
  }
  else
  {
    // Return the first action found
    for (var vAction in this._actions) {
      return vAction;
    };
  };

  return null;
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

  // Reset drag cache for next drag and drop session
  if (this._dragCache)
  {
    this._dragCache.currentDropWidget = null;
    this._dragCache = null;
  };

  // Cleanup data and actions
  this._data = null;
  this._actions = null;
  this._actionNames = null;

  this._lastDestinationEvent = null;

  if (this._cursors)
  {
    if (this._cursors.move)
    {
      this._cursors.move.dispose();
      delete this._cursors.move;
    };

    if (this._cursors.copy)
    {
      this._cursors.copy.dispose();
      delete this._cursors.copy;
    };

    if (this._cursors.alias)
    {
      this._cursors.alias.dispose();
      delete this._cursors.alias;
    };

    if (this._cursors.nodrop)
    {
      this._cursors.nodrop.dispose();
      delete this._cursors.nodrop;
    };

    this._cursors = null;
  };

  return QxManager.prototype.dispose.call(this);
};








/*
---------------------------------------------------------------------------
  SINGLETON INSTANCE
---------------------------------------------------------------------------
*/

QxDragAndDropManager = new QxDragAndDropManager;
