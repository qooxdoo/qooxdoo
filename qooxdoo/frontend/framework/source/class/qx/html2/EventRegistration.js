/**
 * Wrapper for browser DOM event handling.
 *
 * The following feature are supported in a browser independend way:
 * <ul>
 *   <li>cancelling of events <code>stopPropagation</code></li>
 *   <li>prevention of the browser's default behaviour <code>preventDefault</code>
 *   <li>unified event objects matching the DOM 2 event interface
 *       http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-interface
 *   </li>
 *   <li>Support for the event <i>bubbling</i> and <i>capturing</i> phase even
 *       in the Internet Explorer
 *   </li>
 * </ul>
 */
qx.Class.define("qx.html2.EventRegistration", {

  statics : {

    // Events, which don't bubble
    __inlineEvents :
    {
      abort: 1,
      afterprint: 1, // IE
      beforeprint: 1, // IE
      beforeunload: 1,
      blur: 1,
      change: 1,
      dragdrop: 1,
      DOMNodeInsertedIntoDocument: 1, // DOM2
      DOMNodeRemovedFromDocument: 1, // DOM2
      error: 1,
      focus: 1,
      formchange: 1, // Opera (Webforms 2)
      forminput: 1, // Opera (Webforms 2)
      load: 1,
      losecapture: 1, // IE
      mouseenter: 1, // IE
      mouseleave: 1, // IE
      mousewheel: 1, // IE
      move: 1, // Navigator 4 only
      propertychange: 1, // IE
      readystatechange: 1,
      reset: 1,
      scroll: 1,
      select: 1,
      selectionchange: 1, // IE
      selectstart: 1, // IE
      stop: 1, // IE
      submit: 1,
      unload: 1
    },


    // registry for 'normal' bubbling events
    __registry : {},

    // registry for inline events
    __inlineRegistry : {},


    /**
     * Use the low level browser functionality to attach event listeners
     * to DOM nodes. Uses <code>attachEvent</code> in IE and
     * <code>addEventListener</code> in all oother browsers.
     *
     * @type static
     * @param vElement {Element} DOM Element
     * @param vType {String} Name of the event
     * @param vFunction {Function} The pointer to the function to assign
     * @signature function(vElement, vType, vFunction)
     */
    _nativeAddEventListener : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(vElement, vType, vFunction) {
        vElement.attachEvent("on" + vType, vFunction);
      },

      "default" : function(vElement, vType, vFunction) {
        vElement.addEventListener(vType, vFunction, false);
      }
    }),


    /**
     * Use the low level browser functionality to remove event listeners
     * from DOM nodes. Uses <code>detachEvent</code> in IE and
     * <code>removeEventListener</code> in all oother browsers.
     *
     * @type static
     * @param vElement {Element} DOM Element
     * @param vType {String} Name of the event
     * @param vFunction {Function} The pointer to the function to assign
     * @signature function(vElement, vType, vFunction)
     */
    _nativeRemoveEventListener : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(vElement, vType, vFunction) {
        vElement.detachEvent("on" + vType, vFunction);
      },

      "default" :  function(vElement, vType, vFunction) {
        vElement.removeEventListener(vType, vFunction, false);
      }
    }),


    /**
     * Add an event listener to a DOM element. The event listener is passed an
     * instance of {@link Event} containing all relevant information
     * about the event as parameter.
     *
     * @param element {Element} DOM element to attach the event on.
     * @param type {String} Name of the event e.g. "click", "keydown", ...
     * @param listener {Function} Event listener function
     * @param self {Object ? window} Reference to the 'this' variable inside
     *     the event listener.
     * @param useCapture {Boolean?false} Whether to attach the event to the
     *     capturing phase of the bubbling phase of the event. The default is
     *     to attach the event handler to the bubbling phase.
     */
    addEventListener : function(element, type, listener, self, useCapture)
    {
      if (this.__inlineEvents[type]) {
        if (useCapture) {
          throw new Error("The event '" + type + "' does not bubble, so capturing is not supported!");
        }
        return this.__addEventListenerInline(element, type, listener, self);
      } else {
        return this.__addEventListenerDocument(element, type, listener, self, useCapture);
      }
    },


    /**
     * Handles adding of event listeners of bubbling events by attaching the
     * event handler to the <code>documentElement</code>.
     *
     * @param element {Element} DOM element to attach the event on.
     * @param type {String} Name of the event e.g. "click", "keydown", ...
     * @param listener {Function} Event listener function
     * @param self {Object ? window} Reference to the 'this' variable inside
     *     the event listener.
     * @param useCapture {Boolean?false} Whether to attach the event to the
     *     capturing phase of the bubbling phase of the event. The default is
     *     to attach the event handler to the bubbling phase.
     */
    __addEventListenerDocument : function(element, type, listener, self, useCapture)
    {
      var reg = this.__registry;
      if (!reg[type]) {
        reg[type] = {};
        this._nativeAddEventListener(
          window.document.documentElement,
          type,
          this.__documentEventHandler
        );
      }

      var elementId = qx.core.Object.toHashCode(element);
      var typeEvents = reg[type];
      if (!typeEvents[elementId])
      {
        typeEvents[elementId] =
        {
          bubbleListeners : [],
          captureListeners : []
        }
      }

      // bind the listener to the object
      if (self) {
        callback = qx.lang.Function.bind(listener, self);
      }
      callback.$$original = listener;

      // store event listener
      var eventData = typeEvents[elementId];
      var listenerList = useCapture ? "captureListeners" : "bubbleListeners";
      eventData[listenerList].push(callback);
    },


    /**
     * Central event handler for all bubbling events. This function dispatches
     * the event to the event handlers and emulates the capturing and
     * bubbling phase.
     *
     * @param domEvent {Event} DOM event passed by the browser.
     */
    __documentEventHandler : function(domEvent)
    {
      var event = qx.html2.Event.getInstance(-1, window.event || domEvent);
      var target = event.getTarget();
      var node = target;

      var reg = qx.html2.EventRegistration.__registry[event.getType()];

      var bubbleList = [];
      var bubbleTargets = [];

      var captureList = [];
      var captureTargets = [];

      // Walk up the tree and search for an qx.ui.core.Widget
      while (node != null)
      {
        var elementId = qx.core.Object.toHashCode(node);
        var eventData = reg[elementId];
        if (eventData !== undefined)
        {
          if (eventData.captureListeners && node !== target) {
            captureList.push(qx.lang.Array.copy(eventData.captureListeners));
            captureTargets.push(node);
          }
          if (eventData.bubbleListeners) {
            bubbleList.push(qx.lang.Array.copy(eventData.bubbleListeners));
            bubbleTargets.push(node);
          }
        }
        try {
          node = node.parentNode;
        } catch(vDomEvent) {
          node = null;
        }
      }

      // capturing phase
      qx.html2.EventRegistration.EVENT_PHASE = qx.html2.Event.CAPTURING_PHASE;
      for (var i=(captureList.length-1); i>=0; i--) {
        qx.html2.EventRegistration.CURRENT_TARGET = captureTargets[i];
        for (var j=0; j<captureList[i].length; j++) {
          captureList[i][j](event);
        }
        if (event.getStopPropagation()) {
          return;
        }
      }

      // bubbling phase
      for (var i=0; i<bubbleList.length; i++) {
        qx.html2.EventRegistration.CURRENT_TARGET = bubbleTargets[i];
        if (bubbleTargets[i] == target) {
          qx.html2.EventRegistration.EVENT_PHASE = qx.html2.Event.AT_TARGET;
        } else {
          qx.html2.EventRegistration.EVENT_PHASE = qx.html2.Event.BUBBLING_PHASE;
        }
        for (var j=0; j<bubbleList[i].length; j++) {
          bubbleList[i][j](event);
        }
        if (event.getStopPropagation()) {
          return;
        }
      }
    },


    /**
     * Handles adding of event listeners of non bubbling events by attaching the
     * event handler directly to the element.
     *
     * @param element {Element} DOM element to attach the event on.
     * @param type {String} Name of the event e.g. "click", "keydown", ...
     * @param listener {Function} Event listener function
     * @param self {Object ? window} Reference to the 'this' variable inside
     *     the event listener.
     */
    __addEventListenerInline : function(element, type, listener, self)
    {

      var elementId = qx.core.Object.toHashCode(element);

      // create event listener entry for the element if needed.
      var reg = this.__inlineRegistry;
      if (!reg[elementId]) {
        reg[elementId] = {};
      }

      // create entry for the event type and attach event handler if needed
      var elementEvents = reg[elementId];
      if (!elementEvents[type]) {
        elementEvents[type] = {
          listeners : [],
          handler : qx.lang.Function.bind(this.__inlineEventHandler, this, elementId)
        };
      }

      if (elementEvents[type].listeners.length == 0)
      {
        this._nativeAddEventListener(
          element,
          type,
          elementEvents[type].handler
        );
      }

      // bind the listener to the object
      if (self) {
        callback = qx.lang.Function.bind(listener, self);
      }
      callback.$$original = listener;

      // store event listener
      elementEvents[type].listeners.push(callback);
    },


    /**
     * Central event handler for all non bubbling events. This function dispatches
     * the event to the event handlers.
     *
     * @param elementId {Number} hash value of the current target DOM element
     * @param domEvent {Event} DOM event passed by the browser.
     */
    __inlineEventHandler : function(elementId, domEvent)
    {
      qx.html2.EventRegistration.EVENT_PHASE = qx.html2.Event.AT_TARGET;
      var event = qx.html2.Event.getInstance(elementId, window.event || domEvent);

      var listeners = qx.lang.Array.copy(this.__inlineRegistry[elementId][domEvent.type].listeners);
      for (var i=0; i<listeners.length; i++) {
        listeners[i](event);
      }
    },


    /**
     * Remove an event listener from a from DOM node.
     *
     * @type static
     * @param element {Element} DOM Element
     * @param type {String} Name of the event
     * @param listener {Function} The pointer to the event listener
     * @param useCapture {Boolean?false} Whether to remove the event listener of
     *     the bubbling or of the capturing phase.
     * @signature function(element, type, listener, useCapture)
     */
    removeEventListener : function(element, type, listener, useCapture)
    {
      if (this.__inlineEvents[type]) {
        return this.__removeEventListenerInline(element, type, listener);
      } else {
        return this.__removeEventListenerDocument(element, type, listener, useCapture);
      }
    },


    /**
     * Handles removal of bubbling events.
     *
     * @type static
     * @param element {Element} DOM Element
     * @param type {String} Name of the event
     * @param listener {Function} The pointer to the event listener
     * @param useCapture {Boolean?false} Whether to remove the event listener of
     *     the bubbling or of the capturing phase.
     * @signature function(element, type, listener, useCapture)
     */
    __removeEventListenerDocument : function(element, type, listener, useCapture)
    {
      var elementId = qx.core.Object.toHashCode(element);

      var elementData = this.__registry[type];
      if (!elementData || !elementData[elementId]) {
        return;
      }
      var eventData = elementData[elementId];

      var listenerList = useCapture ? "captureListeners" : "bubbleListeners";
      var listeners = eventData[listenerList];

      var removeIndex = -1;
      for (var i=0; i<listeners.length; i++)
      {
        if (listeners[i].$$original == listener)
        {
          removeIndex = i;
          break;
        }
      }

      if (removeIndex != -1) {
        qx.lang.Array.removeAt(listeners, removeIndex);
        if (
          eventData.captureListeners.length == 0 &&
          eventData.bubbleListeners.length == 0
        ) {
          delete(elementData[type]);
        }
      }
      if (qx.lang.Object.isEmpty(this.__registry[type])) {
        this._nativeRemoveEventListener(
          window.document.documentElement,
          type,
          this.__documentEventHandler
        );
      }

    },


    /**
     * Handles removal of non bubbling events.
     *
     * @type static
     * @param element {Element} DOM Element
     * @param type {String} Name of the event
     * @param listener {Function} The pointer to the event listener
     * @param useCapture {Boolean?false} Whether to remove the event listener of
     *     the bubbling or of the capturing phase.
     * @signature function(element, type, listener, useCapture)
     */
    __removeEventListenerInline : function(element, type, listener, useCapture)
    {
      var elementId = qx.core.Object.toHashCode(element);

      var elementData = this.__inlineRegistry[elementId];
      if (!elementData || !elementData[type]) {
        return;
      }
      var eventData = elementData[type];
      var listeners = eventData.listeners;

      var removeIndex = -1;
      for (var i=0; i<listeners.length; i++)
      {
        if (listeners[i].$$original == listener)
        {
          removeIndex = i;
          break;
        }
      }

      if (removeIndex != -1) {
        qx.lang.Array.removeAt(listeners, removeIndex);
        if (eventData.listeners.length == 0) {
          this._nativeRemoveEventListener(element, type, eventData.handler);
          delete(elementData[type]);
        }
      }

    }

  }

});
