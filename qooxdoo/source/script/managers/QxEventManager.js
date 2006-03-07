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

#package(eventcore)
#post(QxDomEventRegistration)
#post(QxPopupManager)
#post(QxToolTipManager)
#post(QxMenuManager)
#post(QxDragAndDropManager)
#post(QxMouseEvent)
#post(QxKeyEvent)

************************************************************************ */

/*!
  This manager registers and manage all incoming key and mouse events.
*/
function QxEventManager(vClientWindow)
{
  // Don't use QxManager things, but include QxTarget functinality
  QxTarget.call(this);

  // Object Wrapper to Events (Needed for DOM-Events)
  var o = this;
  this.__onmouseevent = function(e) { return o._onmouseevent(e); };
  this.__onkeyevent = function(e) { return o._onkeyevent(e); };
  this.__ondragevent = function(e) { return o._ondragevent(e); };
  this.__onselectevent = function(e) { return o._onselectevent(e); };

  // Some Window Events
  this.__onwindowblur = function(e) { return o._onwindowblur(e); };
  this.__onwindowfocus = function(e) { return o._onwindowfocus(e); };
  this.__onwindowresize = function(e) { return o._onwindowresize(e); };

  // Attach Document
  if (QxUtil.isValid(vClientWindow)) {
    this.attachEvents(vClientWindow);
  };

  // Init Command Interface
  this._commands = {};
};

QxEventManager.extend(QxManager, "QxEventManager");

QxEventManager.mouseEventTypes = [ QxConst.EVENT_TYPE_MOUSEOVER, QxConst.EVENT_TYPE_MOUSEMOVE, QxConst.EVENT_TYPE_MOUSEOUT, QxConst.EVENT_TYPE_MOUSEDOWN, QxConst.EVENT_TYPE_MOUSEUP, QxConst.EVENT_TYPE_CLICK, QxConst.EVENT_TYPE_DBLCLICK, QxConst.EVENT_TYPE_CONTEXTMENU, QxClient.isMshtml() ? QxConst.EVENT_TYPE_MOUSEWHEEL : "DOMMouseScroll" ];
QxEventManager.keyEventTypes = [ QxConst.EVENT_TYPE_KEYDOWN, QxConst.EVENT_TYPE_KEYPRESS, QxConst.EVENT_TYPE_KEYUP ];

if (QxClient.isGecko())
{
  QxEventManager.dragEventTypes = [ QxConst.EVENT_TYPE_DRAGDROP, QxConst.EVENT_TYPE_DRAGENTER, QxConst.EVENT_TYPE_DRAGEXIT, QxConst.EVENT_TYPE_DRAGGESTURE, QxConst.EVENT_TYPE_DRAGOVER ];
}
else if (QxClient.isMshtml())
{
  QxEventManager.dragEventTypes = [ QxConst.EVENT_TYPE_DRAG, QxConst.EVENT_TYPE_DRAGEND, QxConst.EVENT_TYPE_DRAGENTER, QxConst.EVENT_TYPE_DRAGLEAVE, QxConst.EVENT_TYPE_DRAGOVER, QxConst.EVENT_TYPE_DRAGSTART ];
}
else
{
  QxEventManager.dragEventTypes = [ QxConst.EVENT_TYPE_DRAG, QxConst.EVENT_TYPE_DRAGLEAVE, QxConst.EVENT_TYPE_DRAGSTART, QxConst.EVENT_TYPE_DRAGDROP, QxConst.EVENT_TYPE_DRAGENTER, QxConst.EVENT_TYPE_DRAGEXIT, QxConst.EVENT_TYPE_DRAGGESTURE, QxConst.EVENT_TYPE_DRAGOVER ];
};



QxEventManager.addProperty({ name : "allowClientContextMenu", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false });
QxEventManager.addProperty({ name : "allowClientSelectAll", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false });

QxEventManager.addProperty({ name : "captureWidget", type : QxConst.TYPEOF_OBJECT, instance : "QxWidget", allowNull : true });
QxEventManager.addProperty({ name : "focusRoot", type : QxConst.TYPEOF_OBJECT, instance : "QxParent", allowNull : true });





/*
---------------------------------------------------------------------------
  STATE FLAGS
---------------------------------------------------------------------------
*/

proto._lastMouseEventType = null;
proto._lastMouseDown = false;
proto._lastMouseEventDate = 0;





/*
---------------------------------------------------------------------------
  MODIFIERS
---------------------------------------------------------------------------
*/

proto._modifyCaptureWidget = function(propValue, propOldValue, propData)
{
  if (propOldValue) {
    propOldValue.setCapture(false);
  };

  if (propValue) {
    propValue.setCapture(true);
  };

  return true;
};

proto._modifyFocusRoot = function(propValue, propOldValue, propData)
{
  // this.debug("FocusRoot: " + propValue + "(from:" + propOldValue + ")");

  if (propOldValue) {
    propOldValue.setFocusedChild(null);
  };

  if (propValue)
  {
    if (propValue.getFocusedChild() == null) {
      propValue.setFocusedChild(propValue);
    };
  };

  return true;
};






/*
---------------------------------------------------------------------------
  COMMAND INTERFACE
---------------------------------------------------------------------------
*/

proto.addCommand = function(vCommand) {
  this._commands[vCommand.toHashCode()] = vCommand;
};

proto.removeCommand = function(vCommand) {
  delete this._commands[vCommand.toHashCode()];
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

      break;
    };
  };
};






/*
---------------------------------------------------------------------------
  EVENT-MAPPING
---------------------------------------------------------------------------
*/

proto.attachEvents = function(wobj)
{
  if (this._attachedClientWindow) {
    return false;
  };

  // Local
  var wel = wobj.getElement();
  var del = wel.document;
  var bel = del.body;

  // Attach client window
  this._attachedClientWindow = wobj;
  this._attachedClientWindowElement = wel;

  // Register dom events
  this.attachEventTypes(QxEventManager.mouseEventTypes, this.__onmouseevent);
  this.attachEventTypes(QxEventManager.keyEventTypes, this.__onkeyevent);
  this.attachEventTypes(QxEventManager.dragEventTypes, this.__ondragevent);

  // Register window events
  QxDom.addEventListener(wel, QxConst.EVENT_TYPE_BLUR, this.__onwindowblur);
  QxDom.addEventListener(wel, QxConst.EVENT_TYPE_FOCUS, this.__onwindowfocus);
  QxDom.addEventListener(wel, QxConst.EVENT_TYPE_RESIZE, this.__onwindowresize);

  // Register selection events
  bel.onselect = del.onselectstart = del.onselectionchange = this.__onselectevent;
};

proto.detachEvents = function()
{
  if (!this._attachedClientWindow) {
    return false;
  };

  // Local
  var wel = this._attachedClientWindowElement;
  var del = wel.document;
  var bel = del.body;

  // Unregister dom events
  this.detachEventTypes(QxEventManager.mouseEventTypes, this.__onmouseevent);
  this.detachEventTypes(QxEventManager.keyEventTypes, this.__onkeyevent);
  this.detachEventTypes(QxEventManager.dragEventTypes, this.__ondragevent);

  // Unregister window events
  QxDom.removeEventListener(wel, QxConst.EVENT_TYPE_BLUR, this.__onwindowblur);
  QxDom.removeEventListener(wel, QxConst.EVENT_TYPE_FOCUS, this.__onwindowfocus);
  QxDom.removeEventListener(wel, QxConst.EVENT_TYPE_RESIZE, this.__onwindowresize);

  // Unregister selection events
  bel.onselect = del.onselectstart = del.onselectionchange = null;

  // Detach client window
  this._attachedClientWindow = null;
  this._attachedClientWindowElement = null;
};







/*
---------------------------------------------------------------------------
  EVENT-MAPPING HELPER
---------------------------------------------------------------------------
*/

proto.attachEventTypes = function(vEventTypes, vFunctionPointer)
{
  try
  {
    // Gecko is a bit buggy to handle key events on document if not previously focused
    // I think they will fix this sometimes, and we should add a version check here.
    // Internet Explorer has problems to use 'window', so there we use the 'body' element
    // as previously.
    if (QxClient.isGecko()) {
      var d = this._attachedClientWindow.getElement();
    } else {
      var d = this._attachedClientWindow.getClientDocument().getElement();
    };

    for (var i=0, l=vEventTypes.length; i<l; i++) {
      QxDom.addEventListener(d, vEventTypes[i], vFunctionPointer);
    };
  }
  catch(ex)
  {
    throw new Error("QxEventManager: Failed to attach window event types: " + vEventTypes + ": " + ex);
  };
};

proto.detachEventTypes = function(vEventTypes, vFunctionPointer)
{
  try
  {
    if (QxClient.isGecko()) {
      var d = this._attachedClientWindow.getElement();
    } else {
      var d = this._attachedClientWindow.getClientDocument().getElement();
    };

    for (var i=0, l=vEventTypes.length; i<l; i++) {
      QxDom.removeEventListener(d, vEventTypes[i], vFunctionPointer);
    };
  }
  catch(ex)
  {
    throw new Error("QxEventManager: Failed to detach window event types: " + vEventTypes + ": " + ex);
  };
};






/*
---------------------------------------------------------------------------
  HELPER METHODS
---------------------------------------------------------------------------
*/

// BUG: http://xscroll.mozdev.org/
// If your Mozilla was built with an option `--enable-default-toolkit=gtk2',
// it can not return the correct event target for DOMMouseScroll.

QxEventManager.getOriginalTargetObject = function(vNode)
{
  // Events on the HTML element, when using absolute locations which
  // are outside the HTML element. Opera does not seem to fire events
  // on the HTML element.
  if (vNode == document.documentElement) {
    vNode = document.body;
  };

  // Walk up the tree and search for an QxWidget
  while(vNode != null && vNode._QxWidget == null)
  {
    try {
      vNode = vNode.parentNode;
    }
    catch(vDomEvent)
    {
      vNode = null;
    };
  };

  return vNode ? vNode._QxWidget : null;
};

QxEventManager.getOriginalTargetObjectFromEvent = function(vDomEvent, vWindow)
{
  var vNode = vDomEvent.target || vDomEvent.srcElement;

  // Especially to fix key events.
  // 'vWindow' is the window reference then
  if (vWindow)
  {
    var vDocument = vWindow.document;

    if (vNode == vWindow || vNode == vDocument || vNode == vDocument.documentElement || vNode == vDocument.body) {
      return vDocument.body._QxWidget;
    };
  };

  return QxEventManager.getOriginalTargetObject(vNode);
};

QxEventManager.getRelatedOriginalTargetObjectFromEvent = function(vDomEvent) {
  return QxEventManager.getOriginalTargetObject(vDomEvent.relatedTarget || (vDomEvent.type == QxConst.EVENT_TYPE_MOUSEOVER ? vDomEvent.fromElement : vDomEvent.toElement));
};







QxEventManager.getTargetObject = function(vNode, vObject)
{
  if (!vObject)
  {
    var vObject = QxEventManager.getOriginalTargetObject(vNode);

    if (!vObject) {
      return null;
    };
  };

  // Search parent tree
  while(vObject)
  {
    // Break if current object is disabled -
    // event should be ignored then.
    if (!vObject.getEnabled()) {
      return null;
    };

    // If object is anonymous, search for
    // first parent which is not anonymous
    // and not disabled
    if (!vObject.getAnonymous()) {
      break;
    };

    vObject = vObject.getParent();
  };

  return vObject;
};

QxEventManager.getTargetObjectFromEvent = function(vDomEvent) {
  return QxEventManager.getTargetObject(vDomEvent.target || vDomEvent.srcElement);
};

QxEventManager.getRelatedTargetObjectFromEvent = function(vDomEvent) {
  return QxEventManager.getTargetObject(vDomEvent.relatedTarget || (vDomEvent.type == QxConst.EVENT_TYPE_MOUSEOVER ? vDomEvent.fromElement : vDomEvent.toElement));
};

if (QxClient.isMshtml())
{
  QxEventManager.stopDomEvent = function(vDomEvent) {
    vDomEvent.returnValue = false;
  };
}
else
{
  QxEventManager.stopDomEvent = function(vDomEvent)
  {
    vDomEvent.preventDefault();
    vDomEvent.returnValue = false;
  };
};







/*
---------------------------------------------------------------------------
  KEY EVENTS
---------------------------------------------------------------------------
*/

proto._onkeyevent = function(vDomEvent)
{
  if (this.getDisposed() || typeof QxKeyEvent != QxConst.TYPEOF_FUNCTION || !window.application.isReady()) {
    return;
  };




  if(!vDomEvent) {
    vDomEvent = this._attachedClientWindow.getElement().event;
  };

  var vType = vDomEvent.type;
  var vDomTarget = vDomEvent.target || vDomEvent.srcElement;
  var vKeyCode = vDomEvent.keyCode || vDomEvent.charCode;




  // Hide Menus
  switch(vKeyCode)
  {
    case QxKeyEvent.keys.esc:
    case QxKeyEvent.keys.tab:
      if (typeof QxMenuManager !== QxConst.TYPEOF_UNDEFINED) {
        QxMenuManager.update();
      };

      break;
  };






  // Find current active qooxdoo object
  var vTarget = this.getCaptureWidget() || this.getFocusRoot().getActiveChild();

  if (vTarget == null || !vTarget.getEnabled()) {
    return false;
  };

  var vDomEventTarget = vTarget.getElement();





  // TODO: Move this to KeyEvent?

  // Prohibit CTRL+A
  if (!this.getAllowClientSelectAll())
  {
    if (vDomEvent.ctrlKey && (vKeyCode == 65 || vKeyCode == 97))
    {
      switch(vDomTarget.tagName)
      {
        case "INPUT":
        case "TEXTAREA":
        case "IFRAME":
          break;

        default:
          QxEventManager.stopDomEvent(vDomEvent);
      };
    };
  };





  // Create Event Object
  var vKeyEventObject = new QxKeyEvent(vType, vDomEvent, vDomTarget, vTarget, null, vKeyCode);

  // Check for commands
  if (vDomEvent.type == QxConst.EVENT_TYPE_KEYDOWN) {
    this._checkKeyEventMatch(vKeyEventObject);
  };

  // Starting Objects Internal Event Dispatcher
  // This handles the real event action
  vTarget.dispatchEvent(vKeyEventObject);

  // Send event to QxDragAndDropManager
  if (typeof QxDragAndDropManager !== QxConst.TYPEOF_UNDEFINED) {
    QxDragAndDropManager.handleKeyEvent(vKeyEventObject);
  };

  // Cleanup Event Object
  vKeyEventObject.dispose();

  // Flush Queues
  QxWidget.flushGlobalQueues();
};






/*
---------------------------------------------------------------------------
  MOUSE EVENTS
---------------------------------------------------------------------------
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
  6. click
  7. dblclick
*/

if(QxClient.isMshtml())
{
  proto._onmouseevent = function(vDomEvent)
  {
    if (!window.application.isReady()) {
      return;
    };

    window.application.postLoad();

    if(!vDomEvent) {
      vDomEvent = this._attachedClientWindow.getElement().event;
    };

    var vDomTarget = vDomEvent.target || vDomEvent.srcElement;
    var vType = vDomEvent.type;

    if(vType == QxConst.EVENT_TYPE_MOUSEMOVE)
    {
      if (this._mouseIsDown && vDomEvent.button == 0)
      {
        this._onmouseevent_post(vDomEvent, QxConst.EVENT_TYPE_MOUSEUP);
        this._mouseIsDown = false;
      };
    }
    else
    {
      if(vType == QxConst.EVENT_TYPE_MOUSEDOWN)
      {
        this._mouseIsDown = true;
      }
      else if(vType == QxConst.EVENT_TYPE_MOUSEUP)
      {
        this._mouseIsDown = false;
      };

      // Fix MSHTML Mouseup, should be after a normal click or contextmenu event, like Mozilla does this
      if(vType == QxConst.EVENT_TYPE_MOUSEUP && !this._lastMouseDown && ((new Date).valueOf() - this._lastMouseEventDate) < 250)
      {
        this._onmouseevent_post(vDomEvent, QxConst.EVENT_TYPE_MOUSEDOWN);
      }
      // Fix MSHTML Doubleclick, should be after a normal click event, like Mozilla does this
      else if(vType == QxConst.EVENT_TYPE_DBLCLICK && this._lastMouseEventType == QxConst.EVENT_TYPE_MOUSEUP && ((new Date).valueOf() - this._lastMouseEventDate) < 250)
      {
        this._onmouseevent_post(vDomEvent, QxConst.EVENT_TYPE_CLICK);
      };

      switch(vType)
      {
        case QxConst.EVENT_TYPE_MOUSEDOWN:
        case QxConst.EVENT_TYPE_MOUSEUP:
        case QxConst.EVENT_TYPE_CLICK:
        case QxConst.EVENT_TYPE_DBLCLICK:
        case QxConst.EVENT_TYPE_CONTEXTMENU:
          this._lastMouseEventType = vType;
          this._lastMouseEventDate = (new Date).valueOf();
          this._lastMouseDown = vType == QxConst.EVENT_TYPE_MOUSEDOWN;
      };
    };

    this._onmouseevent_post(vDomEvent, vType, vDomTarget);
  };
}
else
{
  proto._onmouseevent = function(vDomEvent)
  {
    if (!window.application.isReady()) {
      return;
    };

    window.application.postLoad();

    var vDomTarget = vDomEvent.target;
    var vType = vDomEvent.type;

    switch(vType)
    {
      case QxConst.EVENT_TYPE_DOMMOUSESCROLL:
        // normalize mousewheel event
        vType = QxConst.EVENT_TYPE_MOUSEWHEEL;
        break;

      case QxConst.EVENT_TYPE_CLICK:
      case QxConst.EVENT_TYPE_DBLCLICK:
        // ignore click or dblclick events with other then the left mouse button
        if (vDomEvent.button != QxMouseEvent.buttons.left) {
          return;
        };

      // Seems not to be needed anymore. Otherwise we should reinclude it.
      /*
      case QxConst.EVENT_TYPE_MOUSEDOWN:
        if(vDomTarget && vDomTarget.localName == "IMG" && vDomTarget._QxWidget) {
          QxEventManager.stopDomEvent(vDomEvent);
        };
      */
    };

    this._onmouseevent_post(vDomEvent, vType, vDomTarget);
  };
};




/*!
  This is the crossbrowser post handler for all mouse events.
*/
proto._onmouseevent_post = function(vDomEvent, vType, vDomTarget)
{
  try
  {
    var vEventObject, vDispatchTarget, vTarget, vOriginalTarget, vRelatedTarget;







    // Check for capturing, if enabled the target is the captured widget.
    vDispatchTarget = this.getCaptureWidget();

    // Event Target Object
    vOriginalTarget = QxEventManager.getOriginalTargetObject(vDomTarget);

    // If no capturing is active search for a valid target object
    if (!QxUtil.isValidObject(vDispatchTarget))
    {
      // Get Target Object
      vDispatchTarget = vTarget = QxEventManager.getTargetObject(null, vOriginalTarget);
    }
    else
    {
      vTarget = QxEventManager.getTargetObject(null, vOriginalTarget);
    };

    if (!vTarget) {
      return false;
    };





    switch(vType)
    {
      case QxConst.EVENT_TYPE_CONTEXTMENU:
        if (!this.getAllowClientContextMenu()) {
          QxEventManager.stopDomEvent(vDomEvent);
        };

        break;

      case QxConst.EVENT_TYPE_MOUSEDOWN:
        QxFocusManager.mouseFocus = true;

        var vRoot = vTarget.getFocusRoot();

        if (vRoot)
        {
          this.setFocusRoot(vRoot);

          vRoot.setActiveChild(vTarget);
          vRoot.setFocusedChild(vTarget.isFocusable() ? vTarget : vRoot);
        };

        // the more intelli method, ignore blur after mousedown event
        this._ignoreBlur = true;

        break;
    };





    // Check if is seeable (this is really needed for Opera as of 8.5)
    if ((vTarget && !vTarget.isSeeable()) || (vDispatchTarget && !vDispatchTarget.isSeeable())) {
      return false;
    };

    var vDomEventTarget = vTarget.getElement();




    // Find related target object
    switch(vType)
    {
      case QxConst.EVENT_TYPE_MOUSEOVER:
      case QxConst.EVENT_TYPE_MOUSEOUT:
        vRelatedTarget = QxEventManager.getRelatedTargetObjectFromEvent(vDomEvent);

        // Ignore events where the related target and
        // the real target are equal - from our sight
        if (vRelatedTarget == vTarget) {
          return;
        };
    };



    try
    {
      // Create Mouse Event Object
      vEventObject = new QxMouseEvent(vType, vDomEvent, vDomTarget, vTarget, vOriginalTarget, vRelatedTarget);
    }
    catch(ex)
    {
      return this.error("Failed to create mouse event: " + ex);
    };


    // Store last Event in MouseEvent Constructor
    // Needed for Tooltips, ...
    QxMouseEvent._storeEventState(vEventObject);



    try
    {
      // Dispatch Event through target (eventtarget-)object
      var vReturnValue = vDispatchTarget ? vDispatchTarget.dispatchEvent(vEventObject) : true;
    }
    catch(ex)
    {
      return this.error("Failed to dispatch mouse event: " + ex);
    };





    // Handle Special Post Events
    switch(vType)
    {
      case QxConst.EVENT_TYPE_MOUSEDOWN:
        if (typeof QxPopupManager !== QxConst.TYPEOF_UNDEFINED) {
          QxPopupManager.update(vTarget);
        };

        if (typeof QxMenuManager !== QxConst.TYPEOF_UNDEFINED) {
          QxMenuManager.update(vTarget);
        };

        break;

      case QxConst.EVENT_TYPE_MOUSEOVER:
        if (typeof QxToolTipManager !== QxConst.TYPEOF_UNDEFINED) {
          QxToolTipManager.handleMouseOver(vEventObject);
        };

        break;

      case QxConst.EVENT_TYPE_MOUSEOUT:
        if (typeof QxToolTipManager !== QxConst.TYPEOF_UNDEFINED) {
          QxToolTipManager.handleMouseOut(vEventObject);
        };

        break;

      case QxConst.EVENT_TYPE_MOUSEWHEEL:
        // priority for the real target not the (eventually captured) dispatch target
        vReturnValue ? this._onmousewheel(vOriginalTarget || vDispatchTarget, vEventObject) : QxEventManager.stopDomEvent(vDomEvent);

        break;
    };




    // Send Event Object to Drag&Drop Manager
    if (typeof QxDragAndDropManager  !== QxConst.TYPEOF_UNDEFINED && vTarget) {
      QxDragAndDropManager.handleMouseEvent(vEventObject);
    };




    // Dispose Event Object
    vEventObject.dispose();
    vEventObject = null;




    // Flush Queues
    QxWidget.flushGlobalQueues();
  }
  catch(ex)
  {
    return this.error("Failed to handle mouse event: " + ex);
  };
};

if (QxClient.isGecko())
{
  proto._onmousewheel = function(vTarget, vEvent)
  {
    if(vTarget == null) {
      return;
    };

    // ingore if overflow is configured as hidden
    // in this case send the event to the parent instead
    if(vTarget.getOverflowY() == QxWidget.SCROLL_VALUE_HIDDEN) {
      return this._onmousewheel(vTarget.getParent(), vEvent);
    };

    var vScrollTop = vTarget.getScrollTop();
    var vDelta = 20 * vEvent.getWheelDelta();

    // if already at the top edge and the user scrolls up
    // then send the event to the parent instead
    if(vScrollTop == 0 && vDelta > 0) {
      return this._onmousewheel(vTarget.getParent(), vEvent);
    };

    var vScrollHeight = vTarget.getScrollHeight();
    var vClientHeight = vTarget.getClientHeight();

    // if already at the bottom edge and the user scrolls down
    // then send the event to the parent instead
    if(vScrollTop + vClientHeight >= vScrollHeight && vDelta < 0) {
      return this._onmousewheel(vTarget.getParent(), vEvent);
    };

    // apply new scroll position
    vTarget.setScrollTop(vScrollTop - vDelta);

    // stop default handling, that works sometimes, too
    vEvent.preventDefault();
  };
}
else
{
  proto._onmousewheel = QxUtil.returnTrue;
};







/*
---------------------------------------------------------------------------
  DRAG EVENTS

    Currently only to stop non needed events
---------------------------------------------------------------------------
*/

proto._ondragevent = function(vEvent)
{
  if (!vEvent) {
    vEvent = window.event;
  };

  QxEventManager.stopDomEvent(vEvent);
};







/*
---------------------------------------------------------------------------
  SELECT EVENTS
---------------------------------------------------------------------------
*/

proto._onselectevent = function(e)
{
  if(!e) {
    e = window.event;
  };

  var vTarget = QxEventManager.getOriginalTargetObjectFromEvent(e);

  if(vTarget && !vTarget.getSelectable()) {
    QxEventManager.stopDomEvent(e);
  };
};






/*
---------------------------------------------------------------------------
  WINDOW EVENTS
---------------------------------------------------------------------------
*/

proto._onwindowblur = function(e)
{
  if (!window.application.isReady()) {
    return;
  };

  if (this._ignoreBlur)
  {
    delete this._ignoreBlur;
    return;
  };

  this._allowFocus = true;

  // Disable capturing
  this.setCaptureWidget(null);

  // Hide Popups, Tooltips, ...
  if (typeof QxPopupManager !== QxConst.TYPEOF_UNDEFINED) {
    QxPopupManager.update();
  };

  // Hide Menus
  if (typeof QxMenuManager !== QxConst.TYPEOF_UNDEFINED) {
    QxMenuManager.update();
  };

  // Cancel Drag Operations
  if (typeof QxDragAndDropManager !== QxConst.TYPEOF_UNDEFINED) {
    QxDragAndDropManager.globalCancelDrag();
  };

  // Send blur event to client document
  if (this._attachedClientWindow) {
    this._attachedClientWindow.getClientDocument().createDispatchEvent(QxConst.EVENT_TYPE_BLUR);
  };
};

proto._onwindowfocus = function(e)
{
  if (!window.application.isReady()) {
    return;
  };

  // Make focus more intelligent and only allow focus if
  // a previous blur occured
  if (!this._allowFocus) {
    return;
  };

  delete this._allowFocus;

  // Disable capturing
  this.setCaptureWidget(null);

  // Send focus event to client document
  if (this._attachedClientWindow) {
    this._attachedClientWindow.getClientDocument().createDispatchEvent(QxConst.EVENT_TYPE_FOCUS);
  };
};

proto._onwindowresize = function(e)
{
  // Send resize event to client document
  this._attachedClientWindow.getClientDocument().createDispatchEvent(QxConst.EVENT_TYPE_RESIZE);
};





/*
---------------------------------------------------------------------------
  DISPOSE
---------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  };

  this.detachEvents();

  delete this.__onmouseevent;
  delete this.__onkeyevent;
  delete this.__ondragevent;
  delete this.__onselectevent;
  delete this.__onwindowblur;
  delete this.__onwindowfocus;
  delete this.__onwindowresize;

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
