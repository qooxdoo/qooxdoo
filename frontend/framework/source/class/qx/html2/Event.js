/* ************************************************************************

#require(qx.html2.event.KeyEventHandler)
#require(qx.html2.event.MouseEventHandler)

************************************************************************ */

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
 *
 * Available Events
 * <ul>
 *   <li>Internet Explorer events:
 *       http://msdn2.microsoft.com/en-us/library/ms533051.aspx</li>
 *   <li>Mozilla element events:
 *       http://developer.mozilla.org/en/docs/DOM:element#Event_Handlers
 *   </li>
 * </ul>
 */
qx.Class.define("qx.html2.Event",
{

  extend : qx.core.Object,

  implement : qx.html2.event.IEventHandler,

  construct : function(domDocument)
  {
    this._documentElement = domDocument ?
      domDocument.documentElement :
      window.document.documentElement;

    this.__dispatchEventWrapper = qx.lang.Function.bind(
      this.__dispatchDocumentEvent, this
    )

    this.__eventHandlers = [
      new qx.html2.event.KeyEventHandler(this.__dispatchEventWrapper),
      new qx.html2.event.MouseEventHandler(this.__dispatchEventWrapper),
      this // must be last
    ],

    // registry for 'normal' bubbling events
    this.__registry = {};

    // registry for inline events
    this.__inlineRegistry = {};

  },


  statics :
  {

    getInstance : function() {
      if (this.__instance == undefined) {
        this.__instance = new this();
      }
      return this.__instance;
    },


    /**
     * Add an event listener to a DOM element. The event listener is passed an
     * instance of {@link Event} containing all relevant information
     * about the event as parameter.
     *
     * @type static
     * @param element {Element} DOM element to attach the event on.
     * @param type {String} Name of the event e.g. "click", "keydown", ...
     * @param listener {Function} Event listener function
     * @param self {Object ? window} Reference to the 'this' variable inside
     *       the event listener.
     * @param useCapture {Boolean ? false} Whether to attach the event to the
     *       capturing phase of the bubbling phase of the event. The default is
     *       to attach the event handler to the bubbling phase.
     * @return {var} TODOC
     * @throws TODOC
     */
    addEventListener : function(element, type, listener, self, useCapture) {
      return this.getInstance().addEventListener(element, type, listener, self, useCapture);
    },


    /**
     * Remove an event listener from a from DOM node.
     *
     * @type static
     * @param element {Element} DOM Element
     * @param type {String} Name of the event
     * @param listener {Function} The pointer to the event listener
     * @param useCapture {Boolean ? false} Whether to remove the event listener of
     *       the bubbling or of the capturing phase.
     * @return {var} TODOC
     */
    removeEventListener : function(element, type, listener, useCapture) {
      return this.getInstance().removeEventListener(element, type, listener, useCapture);
    },


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
    nativeAddEventListener : qx.core.Variant.select("qx.client",
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
    nativeRemoveEventListener : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(vElement, vType, vFunction) {
        vElement.detachEvent("on" + vType, vFunction);
      },

      "default" : function(vElement, vType, vFunction) {
        vElement.removeEventListener(vType, vFunction, false);
      }
    })

  },

  members :
  {

    // Events, which don't bubble
    __inlineEvents :
    {
      abort                       : 1,
      afterprint                  : 1,  // IE
      beforeprint                 : 1,  // IE
      beforeunload                : 1,
      blur                        : 1,
      change                      : 1,
      dragdrop                    : 1,
      DOMNodeInsertedIntoDocument : 1,  // DOM2
      DOMNodeRemovedFromDocument  : 1,  // DOM2
      error                       : 1,
      focus                       : 1,
      formchange                  : 1,  // Opera (Webforms 2)
      forminput                   : 1,  // Opera (Webforms 2)
      load                        : 1,
      losecapture                 : 1,  // IE
      mouseenter                  : 1,  // IE
      mouseleave                  : 1,  // IE
      mousewheel                  : 1,  // IE
      propertychange              : 1,  // IE
      readystatechange            : 1,
      reset                       : 1,
      scroll                      : 1,
      select                      : 1,
      selectionchange             : 1,  // IE
      selectstart                 : 1,  // IE
      stop                        : 1,  // IE
      submit                      : 1,
      unload                      : 1
    },


    /**
     * Add an event listener to a DOM element. The event listener is passed an
     * instance of {@link Event} containing all relevant information
     * about the event as parameter.
     *
     * @type member
     * @param element {Element} DOM element to attach the event on.
     * @param type {String} Name of the event e.g. "click", "keydown", ...
     * @param listener {Function} Event listener function
     * @param self {Object ? window} Reference to the 'this' variable inside
     *       the event listener.
     * @param useCapture {Boolean ? false} Whether to attach the event to the
     *       capturing phase of the bubbling phase of the event. The default is
     *       to attach the event handler to the bubbling phase.
     * @return {var} TODOC
     * @throws TODOC
     */
    addEventListener : function(element, type, listener, self, useCapture)
    {
      if (this.__inlineEvents[type])
      {
        if (useCapture) {
          throw new Error("The event '" + type + "' does not bubble, so capturing is also not supported!");
        }

        return this.__addEventListenerInline(element, type, listener, self);
      }
      else
      {
        return this.__addEventListenerDocument(element, type, listener, self, useCapture);
      }
    },


    /**
     * Handles adding of event listeners of bubbling events by attaching the
     * event handler to the <code>documentElement</code>.
     *
     * @type member
     * @param element {Element} DOM element to attach the event on.
     * @param type {String} Name of the event e.g. "click", "keydown", ...
     * @param listener {Function} Event listener function
     * @param self {Object ? window} Reference to the 'this' variable inside
     *       the event listener.
     * @param useCapture {Boolean ? false} Whether to attach the event to the
     *       capturing phase of the bubbling phase of the event. The default is
     *       to attach the event handler to the bubbling phase.
     * @return {void}
     */
    __addEventListenerDocument : function(element, type, listener, self, useCapture)
    {
      var reg = this.__registry;

      if (!reg[type])
      {
        reg[type] = {};

        // iterate over all event handlers and check whether they are responsible
        // for this event type
        for (var i=0; i<this.__eventHandlers.length; i++) {
          if (this.__eventHandlers[i].canHandleEvent(type)) {
            this.__eventHandlers[i].registerEvent(type);
            break;
          }
        }
      }

      var elementId = qx.core.Object.toHashCode(element);
      var typeEvents = reg[type];

      if (!typeEvents[elementId])
      {
        typeEvents[elementId] =
        {
          bubbleListeners  : [],
          captureListeners : []
        };
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
     * This function dispatches the event to the event handlers and emulates
     * the capturing and bubbling phase.
     *
     * @type member
     * @param event {qx.html2.event.Event} event object to dispatch
     * @return {void}
     */
    __dispatchDocumentEvent : function(event)
    {
      var target = event.getTarget();
      var node = target;

      var reg = this.__registry[event.getType()];

      if (reg == undefined) {
        return;
      }

      var bubbleList = [];
      var bubbleTargets = [];

      var captureList = [];
      var captureTargets = [];

      // Walk up the tree and look for event listeners
      while (node != null)
      {
        var elementId = qx.core.Object.toHashCode(node);
        var eventData = reg[elementId];

        if (eventData !== undefined)
        {
          if (eventData.captureListeners && node !== target)
          {
            captureList.push(qx.lang.Array.copy(eventData.captureListeners));
            captureTargets.push(node);
          }

          if (eventData.bubbleListeners)
          {
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
      event.setEventPhase(qx.html2.event.Event.CAPTURING_PHASE);

      for (var i=(captureList.length-1); i>=0; i--)
      {
        event.setCurrentTarget(captureTargets[i]);

        for (var j=0; j<captureList[i].length; j++) {
          captureList[i][j](event);
        }

        if (event.getStopPropagation()) {
          return;
        }
      }

      // bubbling phase
      for (var i=0; i<bubbleList.length; i++)
      {
        event.setCurrentTarget(bubbleTargets[i]);

        if (bubbleTargets[i] == target) {
          event.setEventPhase(qx.html2.event.Event.AT_TARGET);
        } else {
          event.setEventPhase(qx.html2.event.Event.BUBBLING_PHASE);
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
     * @type member
     * @param element {Element} DOM element to attach the event on.
     * @param type {String} Name of the event e.g. "click", "keydown", ...
     * @param listener {Function} Event listener function
     * @param self {Object ? window} Reference to the 'this' variable inside
     *       the event listener.
     * @return {void}
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

      if (!elementEvents[type])
      {
        elementEvents[type] =
        {
          listeners : [],
          handler   : qx.lang.Function.bind(this.__inlineEventHandler, this, elementId)
        };
      }

      if (elementEvents[type].listeners.length == 0)
      {
        qx.html2.Event.nativeAddEventListener(
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
     * @type member
     * @param elementId {Number} hash value of the current target DOM element
     * @param domEvent {Event} DOM event passed by the browser.
     * @return {void}
     */
    __inlineEventHandler : function(elementId, domEvent)
    {
      var event = qx.html2.event.Event.getInstance(window.event || domEvent);
      event.setEventPhase(qx.html2.event.Event.AT_TARGET);
      event.setCurrentTarget(event.getTarget());

      var listeners = qx.lang.Array.copy(this.__inlineRegistry[elementId][domEvent.type].listeners);

      for (var i=0; i<listeners.length; i++) {
        listeners[i](event);
      }
    },


    /**
     * Remove an event listener from a from DOM node.
     *
     * @type member
     * @param element {Element} DOM Element
     * @param type {String} Name of the event
     * @param listener {Function} The pointer to the event listener
     * @param useCapture {Boolean ? false} Whether to remove the event listener of
     *       the bubbling or of the capturing phase.
     * @return {var} TODOC
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
     * @type member
     * @param element {Element} DOM Element
     * @param type {String} Name of the event
     * @param listener {Function} The pointer to the event listener
     * @param useCapture {Boolean ? false} Whether to remove the event listener of
     *       the bubbling or of the capturing phase.
     * @return {void}
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

      if (removeIndex != -1)
      {
        qx.lang.Array.removeAt(listeners, removeIndex);

        if (eventData.captureListeners.length == 0 && eventData.bubbleListeners.length == 0) {
          delete (elementData[type]);
          for (var i=0; i<this.__eventHandlers.length; i++) {
            this.__eventHandlers[i].unregisterEvent(type);
          }
        }
      }
    },


    /**
     * Handles removal of non bubbling events.
     *
     * @type member
     * @param element {Element} DOM Element
     * @param type {String} Name of the event
     * @param listener {Function} The pointer to the event listener
     * @param useCapture {Boolean ? false} Whether to remove the event listener of
     *       the bubbling or of the capturing phase.
     * @return {void}
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

      if (removeIndex != -1)
      {
        qx.lang.Array.removeAt(listeners, removeIndex);

        if (eventData.listeners.length == 0)
        {
          qx.html2.Event.nativeRemoveEventListener(element, type, eventData.handler);
          delete (elementData[type]);
        }
      }
    },


    /*
    ---------------------------------------------------------------------------
      HELPER METHODS
    ---------------------------------------------------------------------------
    */

    __getDocumentListenerCount: function(type) {
      return qx.lang.Object.isEmpty(this.__registry[type]);
    },


    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER INTERFACE
    ---------------------------------------------------------------------------
    */

    canHandleEvent : function(type) {
      return true;
    },

    registerEvent : function(type)
    {
      qx.html2.Event.nativeAddEventListener(
        this._documentElement,
        type,
        this.__handleEvent
      );
      return;
    },


    unregisterEvent : function(type)
    {
      if (this.__getDocumentListenerCount() == 0) {
        qx.html2.Event.nativeRemoveEventListener(
          this._documentElement,
          type,
          this.__documentEventHandler
        );
      }
    },


    __handleEvent : function(domEvent) {
      var event = qx.html2.event.Event.getInstance(domEvent);
      this.__dispatchEventWrapper(event);
    }

  },

  destruct : function() {

  }
});
