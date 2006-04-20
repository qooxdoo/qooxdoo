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
#post(qx.dom.DomEventRegistration)
#post(qx.manager.object.PopupManager)
#post(qx.manager.object.ToolTipManager)
#post(qx.manager.object.MenuManager)
#post(qx.event.handler.DragAndDropHandler)
#post(qx.event.types.MouseEvent)
#post(qx.event.types.KeyEvent)

************************************************************************ */

/*!
  This manager registers and manage all incoming key and mouse events.
*/
qx.event.handler.EventHandler = function(vClientWindow)
{
  // Don't use qx.manager.object.ObjectManager things, but include qx.core.Target functinality
  qx.core.Target.call(this);

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
  if (qx.util.Validation.isValid(vClientWindow)) {
    this.attachEvents(vClientWindow);
  };

  // Init Command Interface
  this._commands = {};
};

qx.event.handler.EventHandler.extend(qx.manager.object.ObjectManager, "qx.event.handler.EventHandler");

qx.event.handler.EventHandler.mouseEventTypes = [ QxConst.EVENT_TYPE_MOUSEOVER, QxConst.EVENT_TYPE_MOUSEMOVE, QxConst.EVENT_TYPE_MOUSEOUT, QxConst.EVENT_TYPE_MOUSEDOWN, QxConst.EVENT_TYPE_MOUSEUP, QxConst.EVENT_TYPE_CLICK, QxConst.EVENT_TYPE_DBLCLICK, QxConst.EVENT_TYPE_CONTEXTMENU, qx.sys.Client.isMshtml() ? QxConst.EVENT_TYPE_MOUSEWHEEL : "DOMMouseScroll" ];
qx.event.handler.EventHandler.keyEventTypes = [ QxConst.EVENT_TYPE_KEYDOWN, QxConst.EVENT_TYPE_KEYPRESS, QxConst.EVENT_TYPE_KEYUP ];

if (qx.sys.Client.isGecko())
{
  qx.event.handler.EventHandler.dragEventTypes = [ QxConst.EVENT_TYPE_DRAGDROP, QxConst.EVENT_TYPE_DRAGENTER, QxConst.EVENT_TYPE_DRAGEXIT, QxConst.EVENT_TYPE_DRAGGESTURE, QxConst.EVENT_TYPE_DRAGOVER ];
}
else if (qx.sys.Client.isMshtml())
{
  qx.event.handler.EventHandler.dragEventTypes = [ QxConst.EVENT_TYPE_DRAG, QxConst.EVENT_TYPE_DRAGEND, QxConst.EVENT_TYPE_DRAGENTER, QxConst.EVENT_TYPE_DRAGLEAVE, QxConst.EVENT_TYPE_DRAGOVER, QxConst.EVENT_TYPE_DRAGSTART ];
}
else
{
  qx.event.handler.EventHandler.dragEventTypes = [ QxConst.EVENT_TYPE_DRAG, QxConst.EVENT_TYPE_DRAGLEAVE, QxConst.EVENT_TYPE_DRAGSTART, QxConst.EVENT_TYPE_DRAGDROP, QxConst.EVENT_TYPE_DRAGENTER, QxConst.EVENT_TYPE_DRAGEXIT, QxConst.EVENT_TYPE_DRAGGESTURE, QxConst.EVENT_TYPE_DRAGOVER ];
};



qx.event.handler.EventHandler.addProperty({ name : "allowClientContextMenu", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false });
qx.event.handler.EventHandler.addProperty({ name : "allowClientSelectAll", type : QxConst.TYPEOF_BOOLEAN, defaultValue : false });

qx.event.handler.EventHandler.addProperty({ name : "captureWidget", type : QxConst.TYPEOF_OBJECT, instance : "qx.ui.core.Widget", allowNull : true });
qx.event.handler.EventHandler.addProperty({ name : "focusRoot", type : QxConst.TYPEOF_OBJECT, instance : "qx.ui.core.Parent", allowNull : true });





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
  this.attachEventTypes(qx.event.handler.EventHandler.mouseEventTypes, this.__onmouseevent);
  this.attachEventTypes(qx.event.handler.EventHandler.keyEventTypes, this.__onkeyevent);
  this.attachEventTypes(qx.event.handler.EventHandler.dragEventTypes, this.__ondragevent);

  // Register window events
  qx.dom.addEventListener(wel, QxConst.EVENT_TYPE_BLUR, this.__onwindowblur);
  qx.dom.addEventListener(wel, QxConst.EVENT_TYPE_FOCUS, this.__onwindowfocus);
  qx.dom.addEventListener(wel, QxConst.EVENT_TYPE_RESIZE, this.__onwindowresize);

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
  this.detachEventTypes(qx.event.handler.EventHandler.mouseEventTypes, this.__onmouseevent);
  this.detachEventTypes(qx.event.handler.EventHandler.keyEventTypes, this.__onkeyevent);
  this.detachEventTypes(qx.event.handler.EventHandler.dragEventTypes, this.__ondragevent);

  // Unregister window events
  qx.dom.removeEventListener(wel, QxConst.EVENT_TYPE_BLUR, this.__onwindowblur);
  qx.dom.removeEventListener(wel, QxConst.EVENT_TYPE_FOCUS, this.__onwindowfocus);
  qx.dom.removeEventListener(wel, QxConst.EVENT_TYPE_RESIZE, this.__onwindowresize);

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
    if (qx.sys.Client.isGecko()) {
      var d = this._attachedClientWindow.getElement();
    } else {
      var d = this._attachedClientWindow.getClientDocument().getElement();
    };

    for (var i=0, l=vEventTypes.length; i<l; i++) {
      qx.dom.addEventListener(d, vEventTypes[i], vFunctionPointer);
    };
  }
  catch(ex)
  {
    throw new Error("qx.event.handler.EventHandler: Failed to attach window event types: " + vEventTypes + ": " + ex);
  };
};

proto.detachEventTypes = function(vEventTypes, vFunctionPointer)
{
  try
  {
    if (qx.sys.Client.isGecko()) {
      var d = this._attachedClientWindow.getElement();
    } else {
      var d = this._attachedClientWindow.getClientDocument().getElement();
    };

    for (var i=0, l=vEventTypes.length; i<l; i++) {
      qx.dom.removeEventListener(d, vEventTypes[i], vFunctionPointer);
    };
  }
  catch(ex)
  {
    throw new Error("qx.event.handler.EventHandler: Failed to detach window event types: " + vEventTypes + ": " + ex);
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

qx.event.handler.EventHandler.getOriginalTargetObject = function(vNode)
{
  // Events on the HTML element, when using absolute locations which
  // are outside the HTML element. Opera does not seem to fire events
  // on the HTML element.
  if (vNode == document.documentElement) {
    vNode = document.body;
  };

  // Walk up the tree and search for an qx.ui.core.Widget
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

qx.event.handler.EventHandler.getOriginalTargetObjectFromEvent = function(vDomEvent, vWindow)
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

  return qx.event.handler.EventHandler.getOriginalTargetObject(vNode);
};

qx.event.handler.EventHandler.getRelatedOriginalTargetObjectFromEvent = function(vDomEvent) {
  return qx.event.handler.EventHandler.getOriginalTargetObject(vDomEvent.relatedTarget || (vDomEvent.type == QxConst.EVENT_TYPE_MOUSEOVER ? vDomEvent.fromElement : vDomEvent.toElement));
};







qx.event.handler.EventHandler.getTargetObject = function(vNode, vObject)
{
  if (!vObject)
  {
    var vObject = qx.event.handler.EventHandler.getOriginalTargetObject(vNode);

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

qx.event.handler.EventHandler.getTargetObjectFromEvent = function(vDomEvent) {
  return qx.event.handler.EventHandler.getTargetObject(vDomEvent.target || vDomEvent.srcElement);
};

qx.event.handler.EventHandler.getRelatedTargetObjectFromEvent = function(vDomEvent) {
  return qx.event.handler.EventHandler.getTargetObject(vDomEvent.relatedTarget || (vDomEvent.type == QxConst.EVENT_TYPE_MOUSEOVER ? vDomEvent.fromElement : vDomEvent.toElement));
};

if (qx.sys.Client.isMshtml())
{
  qx.event.handler.EventHandler.stopDomEvent = function(vDomEvent) {
    vDomEvent.returnValue = false;
  };
}
else
{
  qx.event.handler.EventHandler.stopDomEvent = function(vDomEvent)
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
  if (this.getDisposed() || typeof qx.event.types.KeyEvent != QxConst.TYPEOF_FUNCTION || !window.application.isReady()) {
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
    case qx.event.types.KeyEvent.keys.esc:
    case qx.event.types.KeyEvent.keys.tab:
      if (typeof qx.manager.object.MenuManager !== QxConst.TYPEOF_UNDEFINED) {
        qx.manager.object.MenuManager.update();
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
          qx.event.handler.EventHandler.stopDomEvent(vDomEvent);
      };
    };
  };





  // Create Event Object
  var vKeyEventObject = new qx.event.types.KeyEvent(vType, vDomEvent, vDomTarget, vTarget, null, vKeyCode);

  // Check for commands
  if (vDomEvent.type == QxConst.EVENT_TYPE_KEYDOWN) {
    this._checkKeyEventMatch(vKeyEventObject);
  };

  // Starting Objects Internal Event Dispatcher
  // This handles the real event action
  vTarget.dispatchEvent(vKeyEventObject);

  // Send event to qx.event.handler.DragAndDropHandler
  if (typeof qx.event.handler.DragAndDropHandler !== QxConst.TYPEOF_UNDEFINED) {
    qx.event.handler.DragAndDropHandler.handleKeyEvent(vKeyEventObject);
  };

  // Cleanup Event Object
  vKeyEventObject.dispose();

  // Flush Queues
  qx.ui.core.Widget.flushGlobalQueues();
};






/*
---------------------------------------------------------------------------
  MOUSE EVENTS
---------------------------------------------------------------------------
*/

/*!
  This one handle all mouse events

  When a user double clicks on a qx.ui.core.Widget the
  order of the mouse events is the following:

  1. mousedown
  2. mouseup
  3. click
  4. mousedown
  5. mouseup
  6. click
  7. dblclick
*/

if(qx.sys.Client.isMshtml())
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
        if (vDomEvent.button != qx.event.types.MouseEvent.buttons.left) {
          return;
        };

      // Seems not to be needed anymore. Otherwise we should reinclude it.
      /*
      case QxConst.EVENT_TYPE_MOUSEDOWN:
        if(vDomTarget && vDomTarget.localName == "IMG" && vDomTarget._QxWidget) {
          qx.event.handler.EventHandler.stopDomEvent(vDomEvent);
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
    vOriginalTarget = qx.event.handler.EventHandler.getOriginalTargetObject(vDomTarget);

    // If no capturing is active search for a valid target object
    if (!qx.util.Validation.isValidObject(vDispatchTarget))
    {
      // Get Target Object
      vDispatchTarget = vTarget = qx.event.handler.EventHandler.getTargetObject(null, vOriginalTarget);
    }
    else
    {
      vTarget = qx.event.handler.EventHandler.getTargetObject(null, vOriginalTarget);
    };

    if (!vTarget) {
      return false;
    };





    switch(vType)
    {
      case QxConst.EVENT_TYPE_CONTEXTMENU:
        if (!this.getAllowClientContextMenu()) {
          qx.event.handler.EventHandler.stopDomEvent(vDomEvent);
        };

        break;

      case QxConst.EVENT_TYPE_MOUSEDOWN:
        qx.event.handler.FocusHandler.mouseFocus = true;

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
        vRelatedTarget = qx.event.handler.EventHandler.getRelatedTargetObjectFromEvent(vDomEvent);

        // Ignore events where the related target and
        // the real target are equal - from our sight
        if (vRelatedTarget == vTarget) {
          return;
        };
    };



    try
    {
      // Create Mouse Event Object
      vEventObject = new qx.event.types.MouseEvent(vType, vDomEvent, vDomTarget, vTarget, vOriginalTarget, vRelatedTarget);
    }
    catch(ex)
    {
      return this.error("Failed to create mouse event: " + ex);
    };


    // Store last Event in MouseEvent Constructor
    // Needed for Tooltips, ...
    qx.event.types.MouseEvent._storeEventState(vEventObject);



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
        if (typeof qx.manager.object.PopupManager !== QxConst.TYPEOF_UNDEFINED) {
          qx.manager.object.PopupManager.update(vTarget);
        };

        if (typeof qx.manager.object.MenuManager !== QxConst.TYPEOF_UNDEFINED) {
          qx.manager.object.MenuManager.update(vTarget);
        };

        break;

      case QxConst.EVENT_TYPE_MOUSEOVER:
        if (typeof qx.manager.object.ToolTipManager !== QxConst.TYPEOF_UNDEFINED) {
          qx.manager.object.ToolTipManager.handleMouseOver(vEventObject);
        };

        break;

      case QxConst.EVENT_TYPE_MOUSEOUT:
        if (typeof qx.manager.object.ToolTipManager !== QxConst.TYPEOF_UNDEFINED) {
          qx.manager.object.ToolTipManager.handleMouseOut(vEventObject);
        };

        break;

      case QxConst.EVENT_TYPE_MOUSEWHEEL:
        // priority for the real target not the (eventually captured) dispatch target
        vReturnValue ? this._onmousewheel(vOriginalTarget || vDispatchTarget, vEventObject) : qx.event.handler.EventHandler.stopDomEvent(vDomEvent);

        break;
    };




    // Send Event Object to Drag&Drop Manager
    if (typeof qx.event.handler.DragAndDropHandler  !== QxConst.TYPEOF_UNDEFINED && vTarget) {
      qx.event.handler.DragAndDropHandler.handleMouseEvent(vEventObject);
    };




    // Dispose Event Object
    vEventObject.dispose();
    vEventObject = null;




    // Flush Queues
    qx.ui.core.Widget.flushGlobalQueues();
  }
  catch(ex)
  {
    return this.error("Failed to handle mouse event: " + ex);
  };
};

if (qx.sys.Client.isGecko())
{
  proto._onmousewheel = function(vTarget, vEvent)
  {
    if(vTarget == null) {
      return;
    };

    // ingore if overflow is configured as hidden
    // in this case send the event to the parent instead
    if(vTarget.getOverflowY() == qx.ui.core.Widget.SCROLL_VALUE_HIDDEN) {
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
  proto._onmousewheel = qx.util.Return.returnTrue;
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

  qx.event.handler.EventHandler.stopDomEvent(vEvent);
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

  var vTarget = qx.event.handler.EventHandler.getOriginalTargetObjectFromEvent(e);

  if(vTarget && !vTarget.getSelectable()) {
    qx.event.handler.EventHandler.stopDomEvent(e);
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
  if (typeof qx.manager.object.PopupManager !== QxConst.TYPEOF_UNDEFINED) {
    qx.manager.object.PopupManager.update();
  };

  // Hide Menus
  if (typeof qx.manager.object.MenuManager !== QxConst.TYPEOF_UNDEFINED) {
    qx.manager.object.MenuManager.update();
  };

  // Cancel Drag Operations
  if (typeof qx.event.handler.DragAndDropHandler !== QxConst.TYPEOF_UNDEFINED) {
    qx.event.handler.DragAndDropHandler.globalCancelDrag();
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

  qx.core.Object.prototype.dispose.call(this);
};
