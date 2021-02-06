/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

/**
 * Connects the widgets to the browser DOM events.
 *
 * @require(qx.event.handler.Touch)
 * @require(qx.event.handler.Pointer)
 * @require(qx.event.dispatch.DomBubbling)
 * @require(qx.ui.mobile.core.Widget)
 */
qx.Class.define("qx.ui.mobile.core.EventHandler",
{
  extend : qx.core.Object,
  implement : qx.event.IEventHandler,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this.__manager = qx.event.Registration.getManager(window);
  },



  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** @type {Integer} Priority of this handler */
    PRIORITY : qx.event.Registration.PRIORITY_FIRST,

    /** @type {Map} Supported event types. Identical to events map of qx.ui.core.Widget */
    SUPPORTED_TYPES :
    {
      // mouse events
      mousemove : 1,
      mouseover : 1,
      mouseout : 1,
      mousedown : 1,
      mouseup : 1,
      click : 1,
      dblclick : 1,
      contextmenu : 1,
      mousewheel : 1,

      // key events
      keyup : 1,
      keydown : 1,
      keypress : 1,
      keyinput : 1,

      // mouse capture
      capture : 1,
      losecapture : 1,

      // focus events
      focusin : 1,
      focusout : 1,
      focus : 1,
      blur : 1,
      activate : 1,
      deactivate : 1,

      // appear events
      appear : 1,
      disappear : 1,

      // resize event
      // resize : 1,

      // drag drop events
      dragstart : 1,
      dragend : 1,
      dragover : 1,
      dragleave : 1,
      drop : 1,
      drag : 1,
      dragchange : 1,
      droprequest : 1,

      // scroll events
      roll : 1,

      // touch events
      touchstart : 1,
      touchend : 1,
      touchmove : 1,
      touchcancel : 1,

      // gestures
      tap : 1,
      longtap : 1,
      swipe : 1,
      dbltap : 1,
      track : 1,
      trackend : 1,
      trackstart : 1,
      pinch : 1,
      rotate : 1,

      // pointer events
      pointermove : 1,
      pointerover : 1,
      pointerout : 1,
      pointerdown : 1,
      pointerup : 1,
      pointercancel : 1
    },

    /** @type {Integer} Whether the method "canHandleEvent" must be called */
    IGNORE_CAN_HANDLE : false,

    __activeTarget : null,
    __scrollLeft : null,
    __scrollTop : null,
    __startY : null,
    __timer : null,


    /**
     * Event handler. Called when the pointerdown event occurs.
     * Sets the <code>active</class> class to the event target after a certain
     * time.
     *
     * @param domEvent {qx.event.type.Pointer} The pointerdown event
     */
    __onPointerDown : function(domEvent)
    {
      if (!domEvent.isPrimary()) {
        return;
      }

      var EventHandler = qx.ui.mobile.core.EventHandler;

      EventHandler.__scrollLeft = qx.bom.Viewport.getScrollLeft();
      EventHandler.__scrollTop = qx.bom.Viewport.getScrollTop();

      EventHandler.__startY = domEvent.getScreenTop();

      EventHandler.__cancelActiveStateTimer();

      var target = domEvent.getTarget();
      while (target && target.parentNode && target.parentNode.nodeType == 1 && qx.bom.element.Attribute.get(target, "data-activatable") != "true") {
        target = target.parentNode;
      }

      EventHandler.__activeTarget = target;
      EventHandler.___timer = window.setTimeout(function()
      {
        EventHandler.___timer =  null;
        var target = EventHandler.__activeTarget;
        if (target && (qx.bom.element.Attribute.get(target, "data-selectable") != "false")) {
          qx.bom.element.Class.add(target, "active");
        }
      },100);
    },


    /**
     * Event handler. Called when the pointerup event occurs.
     * Removes the <code>active</class> class from the event target.
     *
     * @param domEvent {qx.event.type.Pointer} The pointerup event
     */
    __onPointerUp : function(domEvent)
    {
      qx.ui.mobile.core.EventHandler.__removeActiveState();
    },


    /**
     * Event handler. Called when the pointermove event occurs.
     * Removes the <code>active</class> class from the event target
     * when the viewport was scrolled.
     *
     * @param domEvent {qx.event.type.Pointer} The pointermove event
     */
    __onPointerMove : function(domEvent)
    {
      if (!domEvent.isPrimary()) {
        return;
      }

      var EventHandler = qx.ui.mobile.core.EventHandler;
      var deltaY = domEvent.getScreenTop() - EventHandler.__startY;
      if (EventHandler.__activeTarget && Math.abs(deltaY) >=
          qx.event.handler.GestureCore.TAP_MAX_DISTANCE[domEvent.getPointerType()])
      {
        EventHandler.__removeActiveState();
      }

      if (EventHandler.__activeTarget
          && (EventHandler.__scrollLeft != qx.bom.Viewport.getScrollLeft()
              || EventHandler.__scrollTop != qx.bom.Viewport.getScrollTop())) {
        EventHandler.__removeActiveState();
      }
    },


    /**
     * Cancels the active state timer.
     */
    __cancelActiveStateTimer : function()
    {
      var EventHandler = qx.ui.mobile.core.EventHandler;
      if (EventHandler.___timer) {
        window.clearTimeout(EventHandler.___timer);
        EventHandler.___timer = null;
      }
    },


    /**
     * Removes the <code>active</class> class from the active target.
     */
    __removeActiveState : function()
    {
      var EventHandler = qx.ui.mobile.core.EventHandler;
      EventHandler.__cancelActiveStateTimer();
      var activeTarget = EventHandler.__activeTarget;
      if (activeTarget) {
        qx.bom.element.Class.remove(activeTarget, "active");
      }
      EventHandler.__activeTarget = null;
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __manager : null,


    // interface implementation
    canHandleEvent : function(target, type) {
      return target instanceof qx.ui.mobile.core.Widget;
    },


    // interface implementation
    registerEvent : function(target, type, capture)
    {
      var element = target.getContainerElement();
      qx.event.Registration.addListener(element, type, this._dispatchEvent, this, capture);
    },


    // interface implementation
    unregisterEvent : function(target, type, capture)
    {
      var element = target.getContainerElement();
      qx.event.Registration.removeListener(element, type, this._dispatchEvent, this, capture);
    },


    /**
     * Dispatches a DOM event on a widget.
     *
     * @param domEvent {qx.event.type.Event} The event object to dispatch.
     */
    _dispatchEvent: function(domEvent){
      // EVENT TARGET
      var domTarget = domEvent.getTarget();
      if (!domTarget || domTarget.id == null) {
        return;
      }
      var widgetTarget = qx.ui.mobile.core.Widget.getWidgetById(domTarget.id);

      // EVENT RELATED TARGET
      if (domEvent.getRelatedTarget) {
        var domRelatedTarget = domEvent.getRelatedTarget();

        if (domRelatedTarget && domRelatedTarget.id) {
          var widgetRelatedTarget = qx.ui.mobile.core.Widget.getWidgetById(domRelatedTarget.id);
        }
      }

      // EVENT CURRENT TARGET
      var currentTarget = domEvent.getCurrentTarget();
      var currentWidget = qx.ui.mobile.core.Widget.getWidgetById(currentTarget.id);
      if (!currentWidget) {
        return;
      }

      // PROCESS LISTENERS

      // Load listeners
      var capture = domEvent.getEventPhase() == qx.event.type.Event.CAPTURING_PHASE;
      var type = domEvent.getType();
      var listeners = this.__manager.getListeners(currentWidget, type, capture);
      if (!listeners || listeners.length === 0) {
        return;
      }

      // Create cloned event with correct target
      var widgetEvent = qx.event.Pool.getInstance().getObject(domEvent.constructor);
      domEvent.clone(widgetEvent);

      widgetEvent.setTarget(widgetTarget);
      widgetEvent.setRelatedTarget(widgetRelatedTarget || null);
      widgetEvent.setCurrentTarget(currentWidget);

      // Keep original target of DOM event, otherwise map it to the original
      var orig = domEvent.getOriginalTarget();
      if (orig && orig.id) {
        var widgetOriginalTarget = qx.ui.mobile.core.Widget.getWidgetById(orig.id);
        widgetEvent.setOriginalTarget(widgetOriginalTarget);
      }
      else {
        widgetEvent.setOriginalTarget(domTarget);
      }

      // Dispatch it on all listeners
      for (var i = 0, l = listeners.length; i < l; i++) {
        var context = listeners[i].context || currentWidget;
        listeners[i].handler.call(context, widgetEvent);
      }

      // Synchronize propagation stopped/prevent default property
      if (widgetEvent.getPropagationStopped()) {
        domEvent.stopPropagation();
      }

      if (widgetEvent.getDefaultPrevented()) {
        domEvent.preventDefault();
      }

      // Release the event instance to the event pool
      qx.event.Pool.getInstance().poolObject(widgetEvent);
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this.__manager = null;
  },




  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics)
  {
    qx.event.Registration.addHandler(statics);
    qx.event.Registration.addListener(document, "pointerdown", statics.__onPointerDown);
    qx.event.Registration.addListener(document, "pointerup", statics.__onPointerUp);
    qx.event.Registration.addListener(document, "pointercancel", statics.__onPointerUp);
    qx.event.Registration.addListener(document, "pointermove", statics.__onPointerMove);
  }
});
