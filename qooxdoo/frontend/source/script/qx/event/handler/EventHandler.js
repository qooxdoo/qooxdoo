/* ************************************************************************

   qooxdoo - the new era of web development

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany
     http://www.1und1.de | http://www.1and1.com
     All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.org

   Authors:
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (ecker)
       <andreas dot ecker at 1und1 dot de>

************************************************************************ */

/* ************************************************************************

#module(eventcore)
#use(qx.dom.DomEventRegistration)
#use(qx.manager.object.PopupManager)
#use(qx.manager.object.ToolTipManager)
#use(qx.manager.object.MenuManager)
#use(qx.event.handler.DragAndDropHandler)
#use(qx.event.type.MouseEvent)
#use(qx.event.type.KeyEvent)

************************************************************************ */

/*!
  This manager registers and manage all incoming key and mouse events.
*/
qx.OO.defineClass("qx.event.handler.EventHandler", qx.core.Target,
function(vClientWindow)
{
  qx.core.Target.call(this);

  // Object Wrapper to Events (Needed for DOM-Events)
  var o = this;
  this.__onmouseevent = function(e) { return o._onmouseevent(e); }
  this.__onkeyevent = function(e) { return o._onkeyevent(e); }
  this.__ondragevent = function(e) { return o._ondragevent(e); }
  this.__onselectevent = function(e) { return o._onselectevent(e); }

  // Some Window Events
  this.__onwindowblur = function(e) { return o._onwindowblur(e); }
  this.__onwindowfocus = function(e) { return o._onwindowfocus(e); }
  this.__onwindowresize = function(e) { return o._onwindowresize(e); }

  // Attach Events
  this.attachEvents(vClientWindow);

  // Init Command Interface
  this._commands = {}
});

qx.OO.addProperty({ name : "allowClientContextMenu", type : qx.constant.Type.BOOLEAN, defaultValue : false });
qx.OO.addProperty({ name : "allowClientSelectAll", type : qx.constant.Type.BOOLEAN, defaultValue : false });

qx.OO.addProperty({ name : "captureWidget", type : qx.constant.Type.OBJECT, instance : "qx.ui.core.Widget", allowNull : true });
qx.OO.addProperty({ name : "focusRoot", type : qx.constant.Type.OBJECT, instance : "qx.ui.core.Parent", allowNull : true });

qx.Class.DOMMOUSESCROLL = "DOMMouseScroll";

qx.Class.mouseEventTypes = [ qx.constant.Event.MOUSEOVER, qx.constant.Event.MOUSEMOVE, qx.constant.Event.MOUSEOUT, qx.constant.Event.MOUSEDOWN, qx.constant.Event.MOUSEUP, qx.constant.Event.CLICK, qx.constant.Event.DBLCLICK, qx.constant.Event.CONTEXTMENU, qx.sys.Client.isMshtml() ? qx.constant.Event.MOUSEWHEEL : qx.Class.DOMMOUSESCROLL ];
qx.Class.keyEventTypes = [ qx.constant.Event.KEYDOWN, qx.constant.Event.KEYPRESS, qx.constant.Event.KEYUP ];

if (qx.sys.Client.isGecko())
{
  qx.Class.dragEventTypes = [ qx.constant.Event.DRAGDROP, qx.constant.Event.DRAGOVER, "dragenter", "dragexit", "draggesture" ];
}
else if (qx.sys.Client.isMshtml())
{
  qx.Class.dragEventTypes = [ qx.constant.Event.DRAGEND, qx.constant.Event.DRAGOVER, qx.constant.Event.DRAGSTART, "drag", "dragenter", "dragleave" ];
}
else
{
  qx.Class.dragEventTypes = [ qx.constant.Event.DRAGSTART, qx.constant.Event.DRAGDROP, qx.constant.Event.DRAGOVER, "drag", "dragleave", "dragenter", "dragexit", "draggesture" ];
}










/*
---------------------------------------------------------------------------
  STATE FLAGS
---------------------------------------------------------------------------
*/

qx.Proto._lastMouseEventType = null;
qx.Proto._lastMouseDown = false;
qx.Proto._lastMouseEventDate = 0;

qx.Proto._lastKeyEventType = null;





/*
---------------------------------------------------------------------------
  MODIFIERS
---------------------------------------------------------------------------
*/

qx.Proto._modifyCaptureWidget = function(propValue, propOldValue, propData)
{
  if (propOldValue) {
    propOldValue.setCapture(false);
  }

  if (propValue) {
    propValue.setCapture(true);
  }

  return true;
}

qx.Proto._modifyFocusRoot = function(propValue, propOldValue, propData)
{
  // this.debug("FocusRoot: " + propValue + "(from:" + propOldValue + ")");

  if (propOldValue) {
    propOldValue.setFocusedChild(null);
  }

  if (propValue)
  {
    if (propValue.getFocusedChild() == null) {
      propValue.setFocusedChild(propValue);
    }
  }

  return true;
}






/*
---------------------------------------------------------------------------
  COMMAND INTERFACE
---------------------------------------------------------------------------
*/

qx.Proto.addCommand = function(vCommand) {
  this._commands[vCommand.toHashCode()] = vCommand;
}

qx.Proto.removeCommand = function(vCommand) {
  delete this._commands[vCommand.toHashCode()];
}

qx.Proto._checkKeyEventMatch = function(e)
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
      }

      break;
    }
  }
}






/*
---------------------------------------------------------------------------
  EVENT-MAPPING
---------------------------------------------------------------------------
*/

qx.Proto.attachEvents = function(wobj)
{
  if (this._attachedClientWindow) {
    return false;
  }

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
  qx.dom.DomEventRegistration.addEventListener(wel, qx.constant.Event.BLUR, this.__onwindowblur);
  qx.dom.DomEventRegistration.addEventListener(wel, qx.constant.Event.FOCUS, this.__onwindowfocus);
  qx.dom.DomEventRegistration.addEventListener(wel, qx.constant.Event.RESIZE, this.__onwindowresize);

  // Register selection events
  bel.onselect = del.onselectstart = del.onselectionchange = this.__onselectevent;
}

qx.Proto.detachEvents = function()
{
  if (!this._attachedClientWindow) {
    return false;
  }

  // Local
  var wel = this._attachedClientWindowElement;
  var del = wel.document;
  var bel = del.body;

  // Unregister dom events
  this.detachEventTypes(qx.event.handler.EventHandler.mouseEventTypes, this.__onmouseevent);
  this.detachEventTypes(qx.event.handler.EventHandler.keyEventTypes, this.__onkeyevent);
  this.detachEventTypes(qx.event.handler.EventHandler.dragEventTypes, this.__ondragevent);

  // Unregister window events
  qx.dom.DomEventRegistration.removeEventListener(wel, qx.constant.Event.BLUR, this.__onwindowblur);
  qx.dom.DomEventRegistration.removeEventListener(wel, qx.constant.Event.FOCUS, this.__onwindowfocus);
  qx.dom.DomEventRegistration.removeEventListener(wel, qx.constant.Event.RESIZE, this.__onwindowresize);

  // Unregister selection events
  bel.onselect = del.onselectstart = del.onselectionchange = null;

  // Detach client window
  this._attachedClientWindow = null;
  this._attachedClientWindowElement = null;
}







/*
---------------------------------------------------------------------------
  EVENT-MAPPING HELPER
---------------------------------------------------------------------------
*/

qx.Proto.attachEventTypes = function(vEventTypes, vFunctionPointer)
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
    }

    for (var i=0, l=vEventTypes.length; i<l; i++) {
      qx.dom.DomEventRegistration.addEventListener(d, vEventTypes[i], vFunctionPointer);
    }
  }
  catch(ex)
  {
    throw new Error("qx.event.handler.EventHandler: Failed to attach window event types: " + vEventTypes + ": " + ex);
  }
}

qx.Proto.detachEventTypes = function(vEventTypes, vFunctionPointer)
{
  try
  {
    if (qx.sys.Client.isGecko()) {
      var d = this._attachedClientWindow.getElement();
    } else {
      var d = this._attachedClientWindow.getClientDocument().getElement();
    }

    for (var i=0, l=vEventTypes.length; i<l; i++) {
      qx.dom.DomEventRegistration.removeEventListener(d, vEventTypes[i], vFunctionPointer);
    }
  }
  catch(ex)
  {
    throw new Error("qx.event.handler.EventHandler: Failed to detach window event types: " + vEventTypes + ": " + ex);
  }
}






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
  }

  // Walk up the tree and search for an qx.ui.core.Widget
  while(vNode != null && vNode.qx_Widget == null)
  {
    try {
      vNode = vNode.parentNode;
    }
    catch(vDomEvent)
    {
      vNode = null;
    }
  }

  return vNode ? vNode.qx_Widget : null;
}

qx.event.handler.EventHandler.getOriginalTargetObjectFromEvent = function(vDomEvent, vWindow)
{
  var vNode = vDomEvent.target || vDomEvent.srcElement;

  // Especially to fix key events.
  // 'vWindow' is the window reference then
  if (vWindow)
  {
    var vDocument = vWindow.document;

    if (vNode == vWindow || vNode == vDocument || vNode == vDocument.documentElement || vNode == vDocument.body) {
      return vDocument.body.qx_Widget;
    }
  }

  return qx.event.handler.EventHandler.getOriginalTargetObject(vNode);
}

qx.event.handler.EventHandler.getRelatedOriginalTargetObjectFromEvent = function(vDomEvent) {
  return qx.event.handler.EventHandler.getOriginalTargetObject(vDomEvent.relatedTarget || (vDomEvent.type == qx.constant.Event.MOUSEOVER ? vDomEvent.fromElement : vDomEvent.toElement));
}







qx.event.handler.EventHandler.getTargetObject = function(vNode, vObject)
{
  if (!vObject)
  {
    var vObject = qx.event.handler.EventHandler.getOriginalTargetObject(vNode);

    if (!vObject) {
      return null;
    }
  }

  // Search parent tree
  while(vObject)
  {
    // Break if current object is disabled -
    // event should be ignored then.
    if (!vObject.getEnabled()) {
      return null;
    }

    // If object is anonymous, search for
    // first parent which is not anonymous
    // and not disabled
    if (!vObject.getAnonymous()) {
      break;
    }

    vObject = vObject.getParent();
  }

  return vObject;
}

qx.event.handler.EventHandler.getTargetObjectFromEvent = function(vDomEvent) {
  return qx.event.handler.EventHandler.getTargetObject(vDomEvent.target || vDomEvent.srcElement);
}

qx.event.handler.EventHandler.getRelatedTargetObjectFromEvent = function(vDomEvent) {
  return qx.event.handler.EventHandler.getTargetObject(vDomEvent.relatedTarget || (vDomEvent.type == qx.constant.Event.MOUSEOVER ? vDomEvent.fromElement : vDomEvent.toElement));
}

if (qx.sys.Client.isMshtml())
{
  qx.event.handler.EventHandler.stopDomEvent = function(vDomEvent) {
    vDomEvent.returnValue = false;
  }
}
else
{
  qx.event.handler.EventHandler.stopDomEvent = function(vDomEvent)
  {
    vDomEvent.preventDefault();
    vDomEvent.returnValue = false;
  }
}







/*
---------------------------------------------------------------------------
  KEY EVENTS
---------------------------------------------------------------------------
*/

qx.Proto._onkeyevent = function(vDomEvent)
{
  if (this.getDisposed() || typeof qx.event.type.KeyEvent != qx.constant.Type.FUNCTION || !qx.core.Init.getComponent().isUiReady()) {
    return;
  }

  if(!vDomEvent) {
    vDomEvent = this._attachedClientWindow.getElement().event;
  }

  var vType = vDomEvent.type;

  // MSHTML sometimes does not include a keypress event type
  if (this._lastKeyEventType === qx.constant.Event.KEYDOWN && vType === qx.constant.Event.KEYUP) {
    this._onkeyevent_post(vDomEvent, qx.constant.Event.KEYPRESS);
  }

  this._lastKeyEventType = vType;

  this._onkeyevent_post(vDomEvent, vType);
}

qx.Proto._onkeyevent_post = function(vDomEvent, vType)
{
  var vDomTarget = vDomEvent.target || vDomEvent.srcElement;
  var vKeyCode = vDomEvent.keyCode || vDomEvent.charCode;




  // Hide Menus
  switch(vKeyCode)
  {
    case qx.event.type.KeyEvent.keys.esc:
    case qx.event.type.KeyEvent.keys.tab:
      if (typeof qx.manager.object.MenuManager !== qx.constant.Type.UNDEFINED) {
        qx.manager.object.MenuManager.update();
      }

      break;
  }






  // Find current active qooxdoo object
  var vTarget = this.getCaptureWidget() || this.getFocusRoot().getActiveChild();

  if (vTarget == null || !vTarget.getEnabled()) {
    return false;
  }

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
      }
    }
  }




  // Create Event Object
  var vKeyEventObject = new qx.event.type.KeyEvent(vType, vDomEvent, vDomTarget, vTarget, null, vKeyCode);

  // Check for commands
  if (vDomEvent.type == qx.constant.Event.KEYDOWN) {
    this._checkKeyEventMatch(vKeyEventObject);
  }

  // Starting Objects Internal Event Dispatcher
  // This handles the real event action
  vTarget.dispatchEvent(vKeyEventObject);

  // Send event to qx.event.handler.DragAndDropHandler
  if (typeof qx.event.handler.DragAndDropHandler !== qx.constant.Type.UNDEFINED) {
    qx.event.handler.DragAndDropHandler.handleKeyEvent(vKeyEventObject);
  }

  // Cleanup Event Object
  vKeyEventObject.dispose();

  // Flush Queues
  qx.ui.core.Widget.flushGlobalQueues();
}






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
  qx.Proto._onmouseevent = function(vDomEvent)
  {
    if (!qx.core.Init.getComponent().isUiReady()) {
      return;
    }

    qx.core.Init.getComponent().preload();

    if(!vDomEvent) {
      vDomEvent = this._attachedClientWindow.getElement().event;
    }

    var vDomTarget = vDomEvent.target || vDomEvent.srcElement;
    var vType = vDomEvent.type;

    if(vType == qx.constant.Event.MOUSEMOVE)
    {
      if (this._mouseIsDown && vDomEvent.button == 0)
      {
        this._onmouseevent_post(vDomEvent, qx.constant.Event.MOUSEUP);
        this._mouseIsDown = false;
      }
    }
    else
    {
      if(vType == qx.constant.Event.MOUSEDOWN)
      {
        this._mouseIsDown = true;
      }
      else if(vType == qx.constant.Event.MOUSEUP)
      {
        this._mouseIsDown = false;
      }

      // Fix MSHTML Mouseup, should be after a normal click or contextmenu event, like Mozilla does this
      if(vType == qx.constant.Event.MOUSEUP && !this._lastMouseDown && ((new Date).valueOf() - this._lastMouseEventDate) < 250)
      {
        this._onmouseevent_post(vDomEvent, qx.constant.Event.MOUSEDOWN);
      }
      // Fix MSHTML Doubleclick, should be after a normal click event, like Mozilla does this
      else if(vType == qx.constant.Event.DBLCLICK && this._lastMouseEventType == qx.constant.Event.MOUSEUP && ((new Date).valueOf() - this._lastMouseEventDate) < 250)
      {
        this._onmouseevent_post(vDomEvent, qx.constant.Event.CLICK);
      }

      switch(vType)
      {
        case qx.constant.Event.MOUSEDOWN:
        case qx.constant.Event.MOUSEUP:
        case qx.constant.Event.CLICK:
        case qx.constant.Event.DBLCLICK:
        case qx.constant.Event.CONTEXTMENU:
          this._lastMouseEventType = vType;
          this._lastMouseEventDate = (new Date).valueOf();
          this._lastMouseDown = vType == qx.constant.Event.MOUSEDOWN;
      }
    }

    this._onmouseevent_post(vDomEvent, vType, vDomTarget);
  }
}
else
{
  qx.Proto._onmouseevent = function(vDomEvent)
  {
    if (!qx.core.Init.getComponent().isUiReady()) {
      return;
    }

    qx.core.Init.getComponent().preload();

    var vDomTarget = vDomEvent.target;
    var vType = vDomEvent.type;

    switch(vType)
    {
      case qx.event.handler.EventHandler.DOMMOUSESCROLL:
        // normalize mousewheel event
        vType = qx.constant.Event.MOUSEWHEEL;
        break;

      case qx.constant.Event.CLICK:
      case qx.constant.Event.DBLCLICK:
        // ignore click or dblclick events with other then the left mouse button
        if (vDomEvent.button !== qx.event.type.MouseEvent.buttons.left) {
          return;
        }
    }

    this._onmouseevent_post(vDomEvent, vType, vDomTarget);
  }
}




/*!
  This is the crossbrowser post handler for all mouse events.
*/
qx.Proto._onmouseevent_post = function(vDomEvent, vType, vDomTarget)
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
    }

    if (!vTarget) {
      return false;
    }





    switch(vType)
    {
      case qx.constant.Event.CONTEXTMENU:
        if (!this.getAllowClientContextMenu()) {
          qx.event.handler.EventHandler.stopDomEvent(vDomEvent);
        }

        break;

      case qx.constant.Event.MOUSEDOWN:
        qx.event.handler.FocusHandler.mouseFocus = true;

        var vRoot = vTarget.getFocusRoot();

        if (vRoot)
        {
          this.setFocusRoot(vRoot);

          vRoot.setActiveChild(vTarget);
          vRoot.setFocusedChild(vTarget.isFocusable() ? vTarget : vRoot);
        }

        // the more intelli method, ignore blur after mousedown event
        this._ignoreBlur = true;

        break;
    }




    var vDomEventTarget = vTarget.getElement();




    // Find related target object
    switch(vType)
    {
      case qx.constant.Event.MOUSEOVER:
      case qx.constant.Event.MOUSEOUT:
        vRelatedTarget = qx.event.handler.EventHandler.getRelatedTargetObjectFromEvent(vDomEvent);

        // Ignore events where the related target and
        // the real target are equal - from our sight
        if (vRelatedTarget == vTarget) {
          return;
        }
    }



    try
    {
      // Create Mouse Event Object
      vEventObject = new qx.event.type.MouseEvent(vType, vDomEvent, vDomTarget, vTarget, vOriginalTarget, vRelatedTarget);
    }
    catch(ex)
    {
      return this.error("Failed to create mouse event", ex);
    }


    // Store last Event in MouseEvent Constructor
    // Needed for Tooltips, ...
    qx.event.type.MouseEvent._storeEventState(vEventObject);



    try
    {
      // Dispatch Event through target (eventtarget-)object
      var vReturnValue = vDispatchTarget ? vDispatchTarget.dispatchEvent(vEventObject) : true;
    }
    catch(ex)
    {
      return this.error("Failed to dispatch mouse event", ex);
    }





    // Handle Special Post Events
    switch(vType)
    {
      case qx.constant.Event.MOUSEDOWN:
        if (typeof qx.manager.object.PopupManager !== qx.constant.Type.UNDEFINED) {
          qx.manager.object.PopupManager.update(vTarget);
        }

        if (typeof qx.manager.object.MenuManager !== qx.constant.Type.UNDEFINED) {
          qx.manager.object.MenuManager.update(vTarget);
        }

        break;

      case qx.constant.Event.MOUSEOVER:
        if (typeof qx.manager.object.ToolTipManager !== qx.constant.Type.UNDEFINED) {
          qx.manager.object.ToolTipManager.handleMouseOver(vEventObject);
        }

        break;

      case qx.constant.Event.MOUSEOUT:
        if (typeof qx.manager.object.ToolTipManager !== qx.constant.Type.UNDEFINED) {
          qx.manager.object.ToolTipManager.handleMouseOut(vEventObject);
        }

        break;

      case qx.constant.Event.MOUSEWHEEL:
        // priority for the real target not the (eventually captured) dispatch target
        vReturnValue ? this._onmousewheel(vOriginalTarget || vDispatchTarget, vEventObject) : qx.event.handler.EventHandler.stopDomEvent(vDomEvent);

        break;
    }




    // Send Event Object to Drag&Drop Manager
    if (typeof qx.event.handler.DragAndDropHandler !== qx.constant.Type.UNDEFINED && vTarget) {
      qx.event.handler.DragAndDropHandler.handleMouseEvent(vEventObject);
    }




    // Dispose Event Object
    vEventObject.dispose();
    vEventObject = null;




    // Flush Queues
    qx.ui.core.Widget.flushGlobalQueues();
  }
  catch(ex)
  {
    return this.error("Failed to handle mouse event", ex);
  }
}

if (qx.sys.Client.isGecko())
{
  qx.Proto._onmousewheel = function(vTarget, vEvent)
  {
    if(vTarget == null) {
      return;
    }

    // ingore if overflow is configured as hidden
    // in this case send the event to the parent instead
    if(vTarget.getOverflowY() == qx.ui.core.Widget.SCROLL_VALUE_HIDDEN) {
      return this._onmousewheel(vTarget.getParent(), vEvent);
    }

    var vScrollTop = vTarget.getScrollTop();
    var vDelta = 20 * vEvent.getWheelDelta();

    // if already at the top edge and the user scrolls up
    // then send the event to the parent instead
    if(vScrollTop == 0 && vDelta > 0) {
      return this._onmousewheel(vTarget.getParent(), vEvent);
    }

    var vScrollHeight = vTarget.getScrollHeight();
    var vClientHeight = vTarget.getClientHeight();

    // if already at the bottom edge and the user scrolls down
    // then send the event to the parent instead
    if(vScrollTop + vClientHeight >= vScrollHeight && vDelta < 0) {
      return this._onmousewheel(vTarget.getParent(), vEvent);
    }

    // apply new scroll position
    vTarget.setScrollTop(vScrollTop - vDelta);

    // stop default handling, that works sometimes, too
    vEvent.preventDefault();
  }
}
else
{
  qx.Proto._onmousewheel = function() {};
}







/*
---------------------------------------------------------------------------
  DRAG EVENTS

    Currently only to stop non needed events
---------------------------------------------------------------------------
*/

qx.Proto._ondragevent = function(vEvent)
{
  if (!vEvent) {
    vEvent = window.event;
  }

  qx.event.handler.EventHandler.stopDomEvent(vEvent);
}







/*
---------------------------------------------------------------------------
  SELECT EVENTS
---------------------------------------------------------------------------
*/

qx.Proto._onselectevent = function(e)
{
  if(!e) {
    e = window.event;
  }

  var vTarget = qx.event.handler.EventHandler.getOriginalTargetObjectFromEvent(e);

  if(vTarget && !vTarget.getSelectable()) {
    qx.event.handler.EventHandler.stopDomEvent(e);
  }
}






/*
---------------------------------------------------------------------------
  WINDOW EVENTS
---------------------------------------------------------------------------
*/

qx.Proto._onwindowblur = function(e)
{
  if (!qx.core.Init.getComponent().isUiReady()) {
    return;
  }

  if (this._ignoreBlur)
  {
    delete this._ignoreBlur;
    return;
  }

  this._allowFocus = true;

  // Disable capturing
  this.setCaptureWidget(null);

  // Hide Popups, Tooltips, ...
  if (typeof qx.manager.object.PopupManager !== qx.constant.Type.UNDEFINED) {
    qx.manager.object.PopupManager.update();
  }

  // Hide Menus
  if (typeof qx.manager.object.MenuManager !== qx.constant.Type.UNDEFINED) {
    qx.manager.object.MenuManager.update();
  }

  // Cancel Drag Operations
  if (typeof qx.event.handler.DragAndDropHandler !== qx.constant.Type.UNDEFINED) {
    qx.event.handler.DragAndDropHandler.globalCancelDrag();
  }

  // Send blur event to client document
  if (this._attachedClientWindow) {
    this._attachedClientWindow.getClientDocument().createDispatchEvent(qx.constant.Event.BLUR);
  }
}

qx.Proto._onwindowfocus = function(e)
{
  if (!qx.core.Init.getComponent().isUiReady()) {
    return;
  }

  // Make focus more intelligent and only allow focus if
  // a previous blur occured
  if (!this._allowFocus) {
    return;
  }

  delete this._allowFocus;

  // Disable capturing
  this.setCaptureWidget(null);

  // Send focus event to client document
  if (this._attachedClientWindow) {
    this._attachedClientWindow.getClientDocument().createDispatchEvent(qx.constant.Event.FOCUS);
  }
}

qx.Proto._onwindowresize = function(e)
{
  // Send resize event to client document
  this._attachedClientWindow.getClientDocument().createDispatchEvent(qx.constant.Event.RESIZE);
}





/*
---------------------------------------------------------------------------
  DISPOSE
---------------------------------------------------------------------------
*/

qx.Proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  }

  // Detach mouse events
  this.detachEvents();

  // Reset functions
  this.__onmouseevent = this.__onkeyevent = this.__ondragevent = this.__onselectevent = null;
  this.__onwindowblur = this.__onwindowfocus = this.__onwindowresize = null;

  // Cleanup
  this._lastMouseEventType = null;
  this._lastMouseDown = null;
  this._lastMouseEventDate = null;
  this._lastKeyEventType = null;

  if (this._commands)
  {
    for (var vHash in this._commands)
    {
      this._commands[vHash].dispose();
      delete this._commands[vHash];
    }

    this._commands = null;
  }

  qx.core.Target.prototype.dispose.call(this);
}
