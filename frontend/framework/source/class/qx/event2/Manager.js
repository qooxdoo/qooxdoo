/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

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
 *   <li>Support for mouse event capturing
 *      http://msdn2.microsoft.com/en-us/library/ms537630.aspx
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
qx.Class.define("qx.event2.Manager",
{
  type : "singleton",

  extend : qx.core.Object,

  implement : qx.event2.handler.IEventHandler,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * Creates a new instance of the event handler.
   */
  construct : function()
  {
    this.__documentEventHandler = qx.lang.Function.bind(this.__handleEvent, this);

    this.__dispatchEventWrapper = qx.lang.Function.bind(
      this.__dispatchDocumentEvent, this
    );

    this.__eventHandlers = [
      new qx.event2.handler.KeyEventHandler(this.__dispatchEventWrapper),
      new qx.event2.handler.MouseEventHandler(this.__dispatchEventWrapper),
      this // must be the last because it can handle all events
    ],

    // registry for 'normal' bubbling events
    // structure: documentId -> eventType -> elementId
    this.__registry = {};

    // registry for inline events
    // structure: elementId -> documentId
    this.__inlineRegistry = {};

    // maps elementIDs to DOM elements
    this.__elementMap = {};

    // map of all known windows with event listeners
    this.__knownWindows = {};

    this.__mouseCapture = {};
  },



  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {

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
     */
    addListener : function(element, type, listener, self, useCapture) {
      this.getInstance().addListener(element, type, listener, self, useCapture);
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
     */
    removeListener : function(element, type, listener, useCapture) {
      this.getInstance().removeListener(element, type, listener, useCapture);
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



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

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
      unload                      : 1,
      losecapture                 : 1   // emulated
    },


    // Normalization of event names
    __eventNames :
    {
      "mousewheel": qx.core.Variant.isSet("qx.client", "mshtml") ? "mousewheel" : "DOMMouseScroll",
      "focusin": qx.core.Variant.isSet("qx.client", "mshtml") ? "focusin" : "DOMFocusIn",
      "focusout": qx.core.Variant.isSet("qx.client", "mshtml") ? "focusout" : "DOMFocusOut"
    },


    /*
    ---------------------------------------------------------------------------
      ADD EVENT LISTENER
    ---------------------------------------------------------------------------
    */

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
     */
    addListener : function(element, type, listener, self, useCapture)
    {
      // normalize event name
      var type = this.__eventNames[type] || type;

      if (this.__inlineEvents[type]) {
        if (useCapture) {
          throw new Error("The event '" + type + "' does not bubble, so capturing is also not supported!");
        }
        this.__addEventListenerInline(element, type, listener, self);
      } else {
        this.__addEventListenerDocument(element, type, listener, self, useCapture);
      }

      var win = qx.html2.element.Node.getDefaultView(element);
      var winId = this.__registerElement(win);

      // attach unload listener for automatic deregistration of event listeners
      if (!this.__knownWindows[winId])
      {
        this.__knownWindows[winId] = win;
        qx.event2.Manager.nativeAddEventListener(
          win,
          "unload",
          qx.lang.Function.bind(this.__onunload, this, winId)
        );
        var documentId = qx.core.Object.toHashCode(win.document.documentElement);
        this.__mouseCapture[documentId] = new qx.event2.handler.MouseCaptureHandler(win);
      }

    },


    /**
     * Unload handler for each window with event listeners attached. Removes
     * all event listeners from the unloading window.
     *
     * @param winId {var} hash code of the unloading window
     * @param e {Event} DOM event object
     */
    __onunload : function(winId, e)
    {
      var doc = this.__getElementByHash(winId).document;
      for (var i=0; i<this.__eventHandlers.length; i++) {
        this.__eventHandlers[i].removeAllListenersFromDocument(doc);
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
     */
    __addEventListenerDocument : function(element, type, listener, self, useCapture)
    {
      var reg = this.__registry;
      var documentElement = qx.html2.element.Node.getDocument(element).documentElement;
      var documentId = qx.core.Object.toHashCode(documentElement);

      // create registry for this document
      if (!reg[documentId]) {
        reg[documentId] = {};
        this.__registerElement(documentElement);
      }
      var docData = reg[documentId];

      // create registry for this event type
      if (!docData[type])
      {
        docData[type] = {};

        // iterate over all event handlers and check whether they are responsible
        // for this event type
        for (var i=0; i<this.__eventHandlers.length; i++) {
          if (this.__eventHandlers[i].canHandleEvent(type)) {
            this.__eventHandlers[i].registerEvent(documentElement, type);
            break;
          }
        }
      }

      var elementId = qx.core.Object.toHashCode(element);
      var typeEvents = docData[type];

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
        var callback = qx.lang.Function.bind(listener, self);
      } else {
        callback = listener;
      }

      callback.$$original = listener;

      // store event listener
      var eventData = typeEvents[elementId];
      var listenerList = useCapture ? "captureListeners" : "bubbleListeners";
      eventData[listenerList].push(callback);
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
      var elementId = this.__registerElement(element);

      // create event listener entry for the element if needed.
      var reg = this.__inlineRegistry;

      if (!reg[elementId]) {
        reg[elementId] = {};
      }

      // create entry for the event type
      var elementEvents = reg[elementId];

      if (!elementEvents[type])
      {
        elementEvents[type] =
        {
          listeners : [],
          handler   : qx.lang.Function.bind(this.__inlineEventHandler, this, elementId)
        };
      }

      // attach event handler if needed
      if (elementEvents[type].listeners.length == 0)
      {
        qx.event2.Manager.nativeAddEventListener(
          element,
          type,
          elementEvents[type].handler
        );
      }

      // bind the listener to the object
      if (self) {
        var callback = qx.lang.Function.bind(listener, self);
      } else {
        callback = listener;
      }

      callback.$$original = listener;

      // store event listener
      elementEvents[type].listeners.push(callback);
    },


    /**
     * Central event handler for all non bubbling events.
     *
     * @type member
     * @param elementId {Number} hash value of the current target DOM element
     * @param domEvent {Event} DOM event passed by the browser.
     */
    __inlineEventHandler : function(elementId, domEvent)
    {
      var event = qx.event2.type.Event.getInstance(window.event || domEvent);
      event.setTarget(this.__getElementByHash(elementId));
      this.__dispatchInlineEvent(event);
    },


    /*
    ---------------------------------------------------------------------------
      REMOVE EVENT LISTENER
    ---------------------------------------------------------------------------
    */

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
    removeListener : function(element, type, listener, useCapture)
    {
      var type = this.__eventNames[type] || type;
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
      var documentElement = qx.html2.element.Node.getDocument(element).documentElement;

      // get data for this event type
      var typeData = this.getDocumentTypeData(element, type);

      // get registry entry for this element
      var elementId = qx.core.Object.toHashCode(element);
      if (!typeData || !typeData[elementId]) {
        return;
      }
      var eventData = typeData[elementId];

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
          delete (typeData[type]);
          for (var i=0; i<this.__eventHandlers.length; i++) {
            this.__eventHandlers[i].unregisterEvent(documentElement, type);
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
          qx.event2.Manager.nativeRemoveEventListener(element, type, eventData.handler);
          delete (elementData[type]);
        }
      }
    },


    /*
    ---------------------------------------------------------------------------
      EVENT DISPATCH
    ---------------------------------------------------------------------------
    */

    /**
     * Dispatches an event object using the qooxdoo event handler system. The
     * event will only be visible in event listeners attached using
     * {@link #addListener}.
     *
     * @param event {qx.event2.type.Event} qooxdoo event object
     */
    dispatchEvent : function(event)
    {
      if (this.__inlineEvents[event.getType()]) {
        return this.__dispatchInlineEvent(event);
      } else {
        return this.__dispatchDocumentEvent(event);
      }
    },


    /**
     * This function dispatches the event to the event handlers and emulates
     * the capturing and bubbling phase.
     *
     * @type member
     * @param event {qx.event2.type.Event} event object to dispatch
     */
    __dispatchDocumentEvent : function(event)
    {

      var target = event.getTarget();
      var node = target;

      var mouseCapture = this.__getCaptureHandler(node);
      if (mouseCapture.shouldCaptureEvent(event)) {
        mouseCapture.doCaptureEvent(event);
        return;
      }

      var reg = this.getDocumentTypeData(node, event.getType());
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
      event.setEventPhase(qx.event2.type.Event.CAPTURING_PHASE);

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
          event.setEventPhase(qx.event2.type.Event.AT_TARGET);
        } else {
          event.setEventPhase(qx.event2.type.Event.BUBBLING_PHASE);
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
     * This function dispatches an  inline event to the event handlers.
     *
     * @type member
     * @param event {qx.event2.type.Event} event object to dispatch
     */
    __dispatchInlineEvent : function(event)
    {
      var elementId = qx.core.Object.toHashCode(event.getTarget());

      var elementData = this.__inlineRegistry[elementId];
      if (!elementData || !elementData[event.getType()]) {
        return;
      }

      event.setEventPhase(qx.event2.type.Event.AT_TARGET);
      event.setCurrentTarget(event.getTarget());

      var listeners = qx.lang.Array.copy(this.__inlineRegistry[elementId][event.getType()].listeners);

      for (var i=0; i<listeners.length; i++) {
        listeners[i](event);
      }
    },


    /*
    ---------------------------------------------------------------------------
      HELPER METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Check whether event listeners are registered at the document element
     * for the given type.
     *
     * @param type {String} The type to check
     * @return {Boolean} Whether event listeners are registered at the document
     *     element for the given type.
     */
    __getDocumentHasListeners : function(documentId, type) {
      return qx.lang.Object.isEmpty(this.__registry[documentId][type]);
    },


    /**
     * @Internal
     */
    getDocumentTypeData : function(element, type)
    {
      var documentElement = qx.html2.element.Node.getDocument(element).documentElement;
      var documentId = qx.core.Object.toHashCode(documentElement);

      var reg = this.__registry[documentId][type];

      if (reg == undefined) {
        return null;
      } else {
        return reg;
      }
    },


    /**
     * @internal
     */
    getDocumentElementData : function(element, type)
    {
      var typeData = this.getDocumentTypeData(element, type);
      if (typeData) {
        return typeData[qx.core.Object.toHashCode(element)]
      } else {
        return null;
      }
    },


    /**
     * Get an element by its qooxdoo hash value. The lement must be registered
     * before using {@link #__registerElement}.
     *
     * @param hash {Integer} qooxdoo hash value of the DOM element
     */
    __getElementByHash : function(hash) {
      return this.__elementMap[hash];
    },


    /**
     * Register a DOM node
     *
     * @param element {eelement} DOM element
     * @return {Integer} Hash code of the DOM element
     */
    __registerElement: function(element) {
      var hash = qx.core.Object.toHashCode(element);
      this.__elementMap[hash] = element;
      return hash;
    },


    /*
    ---------------------------------------------------------------------------
      MOUSE CAPTURE
    ---------------------------------------------------------------------------
    */


    /**
     * Get the capture handler for the element.
     *
     * @param element {Element} DOM element
     * @return {qx.event2.handler.MouseCaptureHandler} the mouse capture handler
     *     reponsible for the given element.
     */
    __getCaptureHandler : function(element)
    {
      var documentElement = qx.html2.element.Node.getDocument(element).documentElement;
      var documentId = qx.core.Object.toHashCode(documentElement);
      return this.__mouseCapture[documentId];
    },


    /**
     * Set the mouse capture to the given DOM element. While capturing is active
     * all mouse event will be dispatched on this element. This is e.g. useful for
     * drag and drop. Capturing will be stopped if one of the following actions
     * occur:
     *
     * <ul>
     *   <li>{@link #relaseCapture} is called</li>
     *   <li>the browser window looses focus</li>
     *   <li>any click event</li>
     * <ul>
     * When the element loses the capture the event <code>losecapture</code>
     * will be dispatched on the element.
     * @param element {Element} DOM element to set for capturing
     */
    setCapture : function(element) {
      this.__getCaptureHandler(element).setCapture(element);
    },


    /**
     * Stop event capturing on the given DOM document. By default the current
     * document is used.
     *
     * @param doc {Document?window.document} DOM document
     */
    releaseCapture : function(doc) {
      this.__getCaptureHandler((doc || document).documentElement).releaseCapture();
    },


    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER INTERFACE
    ---------------------------------------------------------------------------
    */

    /**
     * Whether the event handler can handle events of the given type.
     *
     * @param type {String} event type
     * @return {Boolean} Whether the event handler can handle events of the
     *     given type.
     *
     * @internal
     */
    canHandleEvent : function(type) {
      return true;
    },


    /**
     * Increase the event count for this event type.
     *
     * @param type {String} event type
     * @internal
     */
    registerEvent : function(element, type)
    {
      qx.event2.Manager.nativeAddEventListener(
        element,
        type,
        this.__documentEventHandler
      );
    },


    /**
     * Decrease the event count for this event type.
     *
     * @param type {String} event type
     * @internal
     */
    unregisterEvent : function(element, type)
    {
      var documentId = qx.core.Object.toHashCode(element);
      if (!this.__getDocumentHasListeners(documentId)) {
        qx.event2.Manager.nativeRemoveEventListener(
          element,
          type,
          this.__documentEventHandler
        );
      }
    },


    /**
     * Removes all event handlers handles by the class from the DOM of the given
     * DOM document. This function is called onunload of the the document.
     *
     * @param documentElement {Element} The DOM documentelement of the document
     *     to remove the listeners from.
     * @internal
     */
    removeAllListenersFromDocument : function(documentElement)
    {
      var documentId = qx.core.Object.toHashCode(documentElement);

      for (var type in this.__registry[documentId])
      {
        qx.event2.Manager.nativeRemoveEventListener(
          documentElement,
          type,
          this.__documentEventHandler
        );
      }
      delete(this.__registry[documentId]);
    },


    /**
     * Default event handler.
     *
     * @param domEvent {Event} DOM event
     */
    __handleEvent : function(domEvent) {
      var event = qx.event2.type.Event.getInstance(domEvent);
      this.__dispatchDocumentEvent(event);
    }

  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    for (var i=0; i<this.__eventHandlers.length-1; i++) {
      this.__eventHandlers[i].dispose();
    }

    // remove document event listeners
    for (var documentId in this.__registry)
    {
      var documentElement = this.__getElementByHash(documentId);
      this.remnoveAllListenersFromDocument(documentElement);
    }

    // remove inline event listeners
    for (var elementId in this.__inlineRegistry)
    {
      var element = this.getElementByHash(elementId);

      for (var type in this.__inlineRegistry[elementId])
      {
        var eventData = this.__inlineRegistry[elementId][type];
        qx.event2.Manager.nativeRemoveEventListener(
          element,
          type,
          eventData.handler
        );
      }
    }

    this.disposeFields(
      "__documentEventHandler",
      "__dispatchEventWrapper",
      "__elementMap",
      "__eventHandlers",
      "__registry",
      "__inlineRegistry",
      "__mouseCapture"
    );
  }
});