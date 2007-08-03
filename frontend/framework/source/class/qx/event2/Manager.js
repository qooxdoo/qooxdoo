/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#module(event2)

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
  extend : qx.core.Object,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * Creates a new instance of the event handler.
   *
   * @param win {Window} The DOM window this manager handles the events for
   */
  construct : function(win)
  {
    this.base(arguments);

    this.__window = win;
    this._documentElement = this.__window.document.documentElement;

    // registry for events
    // structure: elementId -> type
    this.__registry = {};

    // get event handler
    this.__eventHandlers = [];
    this.__knownHandler = {};
    this.__updateHandler();

    // get event dispatcher
    this.__dispatchHandlers = [];
    this.__knownDispatcher = {};
    this.__updateDispatcher();

    // add unload listener to prevent memory leaks
    this.addListener(win, "unload", this.__onunload, this);
  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    var winId = qx.core.Object.toHashCode(this.getWindow());
    delete(qx.event2.Manager.__managers[winId]);

    this._disposeObjects("__captureHandler");

    this._disposeFields(
      "__registry",
      "__window",
      "_documentElement",
      "__eventHandlers",
      "__dispatchHandlers",
      "__knownHandler",
      "__dispatchHandlers",
      "__knownDispatcher"
    );
  },



  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Static list of all instantiated event managers. The key is the qooxdoo
     * hash value of the corresponding window
     */
    __managers : {},


    /**
     * Get an instance of the event manager, which can handle events for the
     * given element.
     *
     * @param element {Element} DOM element
     * @return {qx.event2.Manager} The event manger for the element.
     */
    getManager : function(element)
    {
      // get the corresponding default view (window)
      if (qx.html2.node.Util.isWindow(element)) {
        var win = element;
      } else if (qx.html2.node.Util.isElementNode(element)) {
        var win = qx.html2.node.Util.getDefaultView(element);
      } else {
        var win = window;
      }
      var id = qx.core.Object.toHashCode(win);

      var manager = this.__managers[id];
      if (!manager)
      {
        manager = new qx.event2.Manager(win);
        this.__managers[id] = manager;
      }

      return manager;
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
     */
    addListener : function(element, type, listener, self, useCapture)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (typeof(listener) != "function") {
          throw new Error("The parameter listener bust be of type Function");
        }
      }

      this.getManager(element).addListener(element, type, listener, self, useCapture);
    },


    /**
     * Remove an event listener from a from DOM node.
     *
     * Note: All registered event listeners will automatically be removed from
     *   the DOM at page unload so it is not necessary to detach events in the
     *   destructor.
     *
     * @type static
     * @param element {Element} DOM Element
     * @param type {String} Name of the event
     * @param listener {Function} The pointer to the event listener
     * @param useCapture {Boolean ? false} Whether to remove the event listener of
     *       the bubbling or of the capturing phase.
     */
    removeListener : function(element, type, listener, useCapture)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (typeof(listener) != "function") {
          throw new Error("The parameter listener bust be of type Function");
        }
      }

      this.getManager(element).removeListener(element, type, listener, useCapture);
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
    addNativeListener : qx.core.Variant.select("qx.client",
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
    removeNativeListener : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(vElement, vType, vFunction) {
        vElement.detachEvent("on" + vType, vFunction);
      },

      "default" : function(vElement, vType, vFunction) {
        vElement.removeEventListener(vType, vFunction, false);
      }
    }),


    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER/DISPATCHER REGISTRATION
    ---------------------------------------------------------------------------
    */

    /**
     * Position at which the handler should be inserted into the handler list.
     */
    PRIORITY_FIRST : -32000,
    PRIORITY_NORMAL : 0,
    PRIORITY_LAST : 32000,


    /**
     * Sort the event handler/dispatcher list by priority.
     *
     * @param handlerList {qx.event.handler.AbstractEventHandler[]} handler list
     * @return {qx.event.handler.AbstractEventHandler[]} sorted handler list
     */
    __sortHandlerList : function(handlerList)
    {
      return handlerList.sort(function(a,b) {
        if (a.priority == b.priority) {
          return 0;
        }
        return a.priority < b.priority ? -1 : 1;
      });
    },

    __eventHandler : [],

    /**
     * Register an event handler.
     *
     * @param handler {qx.event.handler.AbstractEventHandler} Event handler to add
     * @param priority {Integer} One of {@link #PRIORITY_FIRST}, {@link PRIORITY_NORMAL}
     *     or {@link #PRIORITY_LAST}.
     */
    registerEventHandler : function(handler, priority)
    {
      this.__eventHandler.push({handler: handler, priority: priority});
      for (var winId in this.__managers) {
        this.__managers[winId].__updateHandler();
      }
    },


    /**
     * Get a sorted list of registered event handlers.
     *
     * @return {qx.event.handler.AbstractEventHandler[]} registered event handlers
     */
    getRegisteredEventHandler : function() {
      return this.__sortHandlerList(this.__eventHandler);
    },


    __eventDispatcher : [],

    /**
     * Register an event dispatcher.
     *
     * @param handler {qx.event.dispatch.IEventDispatch} Event dispatcher to add
     * @param priority {Integer} One of {@link #PRIORITY_FIRST}, {@link PRIORITY_NORMAL}
     *     or {@link #PRIORITY_LAST}.
     */
    registerEventDispatcher : function(handler, priority)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (!qx.Class.hasInterface(handler, qx.event2.dispatch.IEventDispatcher)) {
          throw new Error("The dispatch handler does not implement the interface qx.event2.dispatch.IEventDispatcher!");
        }
      }

      this.__eventDispatcher.push({handler: handler, priority: priority});
      for (var winId in this.__managers) {
        this.__managers[winId].__updateDispatcher();
      }
    },


    /**
     * Get a sorted list of registered event dispatcher.
     *
     * @return {qx.event.dispatch.IEventDispatch[]} all registered event dispatcher
     */
    getRegisteredEventDispatcher : function() {
      return this.__sortHandlerList(this.__eventDispatcher);
    }

  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

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
      var eventListeners = this.registryGetListeners(element, type, useCapture, true);

      // this is the first event handler for this type and element
      if (eventListeners.length == 0)
      {
        // inform the event handler about the new event
        // they perform the event registration at DOM level
        this.__registerEventAtHandler(element, type);
      }

      // store event listener
      eventListeners.push({
        handler: listener,
        context: self
      });
    },


    /**
     * This method is called each time an event listener for one of the
     * supported events is added using {qx.event2.Manager#addListener}.
     *
     * @param element {Element} DOM element to, which the event handler should
     *     be attached
     * @param type {String} event type
     */
    __registerEventAtHandler : function(element, type) {
      // iterate over all event handlers and check whether they are responsible
      // for this event type
      for (var i=0; i<this.__eventHandlers.length; i++)
      {
        if (this.__eventHandlers[i].canHandleEvent(element, type))
        {
          this.__eventHandlers[i].registerEvent(element, type);
          break;
        }
      }
    },


    /*
    ---------------------------------------------------------------------------
      REMOVE EVENT LISTENER
    ---------------------------------------------------------------------------
    */

    /**
     * Remove an event listener from a DOM node.
     *
     * @type member
     * @param element {Element} DOM Element
     * @param type {String} Name of the event
     * @param listener {Function} The pointer to the event listener
     * @param useCapture {Boolean ? false} Whether to remove the event listener of
     *       the bubbling or of the capturing phase.
     */
    removeListener : function(element, type, listener, useCapture)
    {
      // get event listeners
      var listeners = this.registryGetListeners(element, type, false, false);
      if (!listeners) {
        return;
      }

      // find listener
      var removeIndex = -1;
      for (var i=0; i<listeners.length; i++)
      {
        if (listeners[i].handler == listener)
        {
          removeIndex = i;
          break;
        }
      }

      // remove listener if found
      if (removeIndex != -1)
      {
        qx.lang.Array.removeAt(listeners, removeIndex);

        if (listeners.length == 0)
        {
          this.__unregisterEventAtHandler(element, type);
          this.__registryRemoveListeners(element, type);
        }
      }
    },


    /**
     * This method is called each time the an event listener for one of the
     * supported events is removed by using {qx.event2.Manager#removeListener}
     * and no other event listener is listening on this type.
     *
     * @param element {Element} DOM element from, which the event handler should
     *     be removed
     * @param type {String} event type
     */
    __unregisterEventAtHandler : function(element, type)
    {
      for (var i=0; i<this.__eventHandlers.length; i++)
      {
        if (this.__eventHandlers[i].canHandleEvent(element, type)) {
          this.__eventHandlers[i].unregisterEvent(element, type);
          break;
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
      for (var i=0,l=this.__dispatchHandlers.length; i<l; i++)
      {
        var dispatchHandler = this.__dispatchHandlers[i];
        if (dispatchHandler.canDispatchEvent(event)) {
          dispatchHandler.dispatchEvent(event);
          break;
        }
      }
    },


    /*
    ---------------------------------------------------------------------------
      MOUSE CAPTURE
    ---------------------------------------------------------------------------
    */

    /**
     * Get the capture handler for the element.
     *
     * @return {qx.event2.handler.MouseCaptureHandler} the mouse capture handler
     *     reponsible for the given element.
     */
    getCaptureHandler : function() {
      return this.__captureHandler;
    },


    /**
     * Get the window instance the event manager is reponsible for
     *
     * @return {Window} DOM window instance
     */
    getWindow : function() {
      return this.__window;
    },


    /**
     * Unload handler for each window with event listeners attached. Removes
     * all event listeners from the unloading window.
     *
     * @param domEvent {Event} DOM event object
     */
    __onunload : function(domEvent) {
      this.dispose();
    },


    /*
    ---------------------------------------------------------------------------
      REGISTRY HELPER
    ---------------------------------------------------------------------------
    */

    /**
     * Remove the registry entry for the given event type from the event data of
     * the given element.
     *
     * @param element {Element} DOM element
     * @param type {String} DOM event type
     */
    __registryRemoveListeners : function(element, type)
    {
      var elementId = qx.core.Object.toHashCode(element);
      var reg = this.__registry;

      if (!reg[elementId]) {
        return;
      }

      delete (reg[type]);
    },


    /**
     * Get all event listeners for the given element and event type. If no
     * registray data is available for this element and type and the
     * third parameter <code>buildRegistry</code> is true the registry is build
     * up and an empty array is returned.
     *
     * @param element {Element} DOM element.
     * @param type {String} DOM event type
     * @param useCapture {Boolean ? false} Whether to attach the event to the
     *       capturing phase of the bubbling phase of the event.
     * @param buildRegistry {Boolean?false} Whether to build up the registry if
     *     no entry is found
     * @return {Function[]|null} Array of registered event handlers for this event
     *     and type. Will return null if <code>buildRegistry</code> and no entry
     *     is found.
     */
    registryGetListeners : function(element, type, useCapture, buildRegistry)
    {
      var elementId = qx.core.Object.toHashCode(element);
      var listenerList = useCapture ? "captureListeners" : "bubbleListeners";
      var reg = this.__registry;

      if (!buildRegistry)
      try {
        return reg[elementId][type][listenerList]
      } catch (e) {
        return null;
      }

      if (!reg[elementId]) {
        reg[elementId] = {};
      }

      // create entry for the event type
      var elementEvents = reg[elementId];

      if (!elementEvents[type]) {
        elementEvents[type] = {};
      }

      var typeEvents = elementEvents[type];
      if (!typeEvents[listenerList]) {
        typeEvents[listenerList] = []
      }
      return typeEvents[listenerList];
    },


    /**
     * Synchronizes the internal event handler list with the event handlers
     * registered using {@link #registerEventHandler}.
     */
    __updateHandler : function()
    {
      // get event handler
      var oldHandlers = this.__eventHandlers;
      this.__eventHandlers = [];

      var registeredHandler = this.self(arguments).getRegisteredEventHandler();

      for (var i=0, l=registeredHandler.length; i<l; i++)
      {
        var handler = registeredHandler[i].handler;
        var handlerId = qx.core.Object.toHashCode(handler);

        if (this.__knownHandler[handlerId] !== undefined) {
          this.__eventHandlers[i] = oldHandlers[this.__knownHandler[handlerId]];
        } else {
          this.__eventHandlers[i] = new handler(this);
        }

        this.__knownHandler[handlerId] = i;
      }
    },


    /**
     * Synchronizes the internal event dispatcher list with the event dispatcher
     * registered using {@link #registerEventDispatcher}.
     */
    __updateDispatcher : function()
    {
      // get event handler
      var oldHandlers = this.__dispatchHandlers;
      this.__dispatchHandlers = [];

      var registeredHandler = this.self(arguments).getRegisteredEventDispatcher();

      for (var i=0, l=registeredHandler.length; i<l; i++)
      {
        var handler = registeredHandler[i].handler;
        var handlerId = qx.core.Object.toHashCode(handler);

        if (this.__knownDispatcher[handlerId] !== undefined) {
          this.__dispatchHandlers[i] = oldHandlers[this.__knownDispatcher[handlerId]];
        } else {
          this.__dispatchHandlers[i] = new handler(this);
        }

        this.__knownDispatcher[handlerId] = i;
      }
    }

  },



  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics)
  {
    statics.registerEventHandler(qx.event2.handler.InlineEventHandler, statics.PRIORITY_NORMAL);

    statics.registerEventDispatcher(qx.event2.dispatch.InlineDispatch, statics.PRIORITY_NORMAL);
    statics.registerEventDispatcher(qx.event2.dispatch.BubblingDispatch, statics.PRIORITY_NORMAL);
  }

});