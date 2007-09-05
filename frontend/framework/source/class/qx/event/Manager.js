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
qx.Class.define("qx.event.Manager",
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

    // registry for events
    // structure: elementId -> type
    this.__registry = {};

    this.__inEventDispatch = false;
    this.__jobQueue = [];
    this.__listenerCountOfType = {};

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
    var id = qx.core.Object.toHashCode(this.getWindow());
    delete qx.event.Manager.__managers[id];

    this._disposeObjects("__captureHandler");

    this._disposeFields(
      "__registry",
      "__jobQueue",
      "__listenerCountOfType",
      "__window",
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
     * @return {qx.event.Manager} The event manger for the element.
     */
    getManager : function(element)
    {
      // get the corresponding default view (window)
      if (qx.dom.Node.isWindow(element)) {
        var win = element;
      } else if (qx.dom.Node.isElement(element)) {
        var win = qx.dom.Node.getWindow(element);
      } else {
        var win = window;
      }

      var id = qx.core.Object.toHashCode(win);
      var manager = this.__managers[id];

      if (!manager)
      {
        manager = new qx.event.Manager(win);
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
     * @param self {Object} Reference to the 'this' variable inside
     *       the event listener.
     * @param capture {Boolean} Whether to attach the event to the
     *       capturing phase of the bubbling phase of the event. The default is
     *       to attach the event handler to the bubbling phase.
     */
    addListener : function(element, type, listener, self, capture) {
      return this.getManager(element).addListener(element, type, listener, self, capture);
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
     * @param self {Object} Reference to the 'this' variable inside
     *       the event listener.
     * @param capture {Boolean} Whether to remove the event listener of
     *       the bubbling or of the capturing phase.
     */
    removeListener : function(element, type, listener, self, capture) {
      return this.getManager(element).removeListener(element, type, listener, self, capture);
    },


    /**
     * Check whether there are one or more listeners for an event type
     * registered at the target.
     * @param target {Element|Object} The event target
     * @param type {String} The event type
     * @param capture {Boolean ? false} Whether to check for listeners of
     *       the bubbling or of the capturing phase.
     * @return {Boolean} Whether the target has event listeners of the given type.
     */
    hasListeners : function(target, type, capture) {
      return this.getManager(element).hasListeners(target, type, capture);
    },


    /**
     * Use the low level browser functionality to attach event listeners
     * to DOM nodes. Uses <code>attachEvent</code> in IE and
     * <code>addEventListener</code> in all oother browsers.
     *
     * @type static
     * @param element {Element} DOM Element
     * @param type {String} Name of the event
     * @param listener {Function} The pointer to the function to assign
     * @signature function(element, type, listener)
     */
    addNativeListener : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(element, type, listener) {
        element.attachEvent("on" + type, listener);
      },

      "default" : function(element, type, listener) {
        element.addEventListener(type, listener, false);
      }
    }),


    /**
     * Use the low level browser functionality to remove event listeners
     * from DOM nodes. Uses <code>detachEvent</code> in IE and
     * <code>removeEventListener</code> in all oother browsers.
     *
     * @type static
     * @param element {Element} DOM Element
     * @param type {String} Name of the event
     * @param listener {Function} The pointer to the function to assign
     * @signature function(element, type, listener)
     */
    removeNativeListener : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(element, type, listener) {
        element.detachEvent("on" + type, listener);
      },

      "default" : function(element, type, listener) {
        element.removeEventListener(type, listener, false);
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
     * @param handlerList {qx.legacy.event.handler.AbstractEventHandler[]} handler list
     * @return {qx.legacy.event.handler.AbstractEventHandler[]} sorted handler list
     */
    __sortByPriority : function(handlerList)
    {
      return handlerList.sort(function(a,b)
      {
        if (a.priority == b.priority) {
          return 0;
        }

        return a.priority < b.priority ? -1 : 1;
      });
    },




    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER REGISTRATION
    ---------------------------------------------------------------------------
    */

    __eventHandler : [],


    /**
     * Register an event handler.
     *
     * @param handler {qx.legacy.event.handler.AbstractEventHandler} Event handler to add
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
     * @return {qx.legacy.event.handler.AbstractEventHandler[]} registered event handlers
     */
    getRegisteredEventHandler : function() {
      return this.__sortByPriority(this.__eventHandler);
    },





    /*
    ---------------------------------------------------------------------------
      EVENT DISPATCHER REGISTRATION
    ---------------------------------------------------------------------------
    */

    __eventDispatcher : [],


    /**
     * Register an event dispatcher.
     *
     * @param handler {qx.legacy.event.dispatch.IEventDispatch} Event dispatcher to add
     * @param priority {Integer} One of {@link #PRIORITY_FIRST}, {@link PRIORITY_NORMAL}
     *     or {@link #PRIORITY_LAST}.
     */
    registerEventDispatcher : function(handler, priority)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (!qx.Class.hasInterface(handler, qx.event.dispatch.IEventDispatcher)) {
          throw new Error("The dispatch handler does not implement the interface qx.event.dispatch.IEventDispatcher!");
        }
      }

      this.__eventDispatcher.push({handler: handler, priority: priority});

      for (var winId in this.__managers) {
        this.__managers[winId].__updateDispatcher();
      }
    },


    /**
     * Get a sorted list of registered event dispatcher.
     * TODO: Is this function used often? Then is should be a good idea to cache this result
     * on each register instead of on every get.
     *
     * @return {qx.legacy.event.dispatch.IEventDispatch[]} all registered event dispatcher
     */
    getRegisteredEventDispatcher : function() {
      return this.__sortByPriority(this.__eventDispatcher);
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
      ADD/REMOVE EVENT LISTENER
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
     * @param capture {Boolean ? false} Whether to attach the event to the
     *       capturing phase of the bubbling phase of the event. The default is
     *       to attach the event handler to the bubbling phase.
     */
    addListener : function(element, type, listener, self, capture)
    {
      // if we are currently dispatching an event, defer this call after the
      // dispatcher has completed. It is critical to not modify the listener
      // registry while dispatching. This code is needed to support "addListener"
      // and "removeListener" calls inside of event handler code.
      if (this.__inEventDispatch)
      {
        this.__jobQueue.push({
          method : "addListener",
          arguments : arguments
        });

        return;
      }

      var eventListeners = this.registryGetListeners(element, type, capture, true);

      // This is the first event handler for this type and element
      if (eventListeners.length == 0)
      {
        // Inform the event handler about the new event
        // they perform the event registration at DOM level
        this.__registerEventAtHandler(element, type);
      }

      // Store event listener
      eventListeners.push({
        handler: listener,
        context: self
      });

      // Increase the event type count
      if (!this.__listenerCountOfType[type]) {
        this.__listenerCountOfType[type] = 0;
      }

      this.__listenerCountOfType[type] += 1;
    },


    /**
     * Remove an event listener from a DOM node.
     *
     * @type member
     * @param element {Element} DOM Element
     * @param type {String} Name of the event
     * @param listener {Function} The pointer to the event listener
     * @param capture {Boolean ? false} Whether to remove the event listener of
     *       the bubbling or of the capturing phase.
     */
    removeListener : function(element, type, listener, capture)
    {
      // if we are currently dispatching an event, defer this call after the
      // dispatcher. It is critical to not modify the listener registry while
      // dispatching.
      if (this.__inEventDispatch) {
        this.__jobQueue.push({
          method : "removeListener",
          arguments : arguments
        });
        return;
      }

      // get event listeners
      var listeners = this.registryGetListeners(element, type, false, false);
      if (!listeners) {
        return;
      }

      // find listener
      var removeIndex = -1;
      for (var i=0; i<listeners.length; i++)
      {
        // FIXME: This should be unique key based!!!
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

      // decrement listener count of type
      if (this.__listenerCountOfType[type] == undefined) {
        return;
      }

      this.__listenerCountOfType[type] -= 1;
      if (this.__listenerCountOfType[type] <= 0) {
        delete(this.__listenerCountOfType[type]);
      }
    },



    /**
     * Check whether there are one or more listeners for an event type
     * registered at the target.
     * @param target {Element|Object} The event target
     * @param type {String} The event type
     * @param capture {Boolean ? false} Whether to check for listeners of
     *       the bubbling or of the capturing phase.
     * @return {Boolean} Whether the target has event listeners of the given type.
     */
    hasListeners : function(target, type, capture)
    {
      var listeners = this.registryGetListeners(target, type, capture, false);
      if (!listeners || listeners.length <= 0) {
        return false;
      }
      return true;
    },



    /*
    ---------------------------------------------------------------------------
      HANDLER EVENT TYPE REGISTRATION
    ---------------------------------------------------------------------------
    */

    /**
     * This method is called each time an event listener for one of the
     * supported events is added using {qx.event.Manager#addListener}.
     *
     * @param target {Element|Object} The target to, which the event handler should
     *     be attached
     * @param type {String} event type
     */
    __registerEventAtHandler : function(target, type)
    {
      // TODO: What's about priority of these handlers here. Is this really
      // not important. What if two handler can handle the same event type?
      // At least the "break" would be problematic then...

      // iterate over all event handlers and check whether they are responsible
      // for this event type
      var handlers = this.__eventHandlers;
      var hasHandler = false;

      for (var i=0, l=handlers.length; i<l; i++)
      {
        if (handlers[i].canHandleEvent(target, type))
        {
          handlers[i].registerEvent(target, type);
          hasHandler = true;
          break;
        }
      }

      if (!hasHandler) {
        //console.log(target);
        //this.printStackTrace();
        throw new Error("There is no event handler for the event '"+type+"' on target '"+target+"'!");
      }
    },


    /**
     * This method is called each time the an event listener for one of the
     * supported events is removed by using {qx.event.Manager#removeListener}
     * and no other event listener is listening on this type.
     *
     * @param target {Element|Object} The target from, which the event handler should
     *     be removed
     * @param type {String} event type
     */
    __unregisterEventAtHandler : function(target, type)
    {
      // TODO: What's about priority of these handlers here. Is this really
      // not important. What if two handler can handle the same event type?
      // At least the "break" would be problematic then...
      var handlers = this.__eventHandlers;
      for (var i=0, l=handlers.length; i<l; i++)
      {
        if (handlers[i].canHandleEvent(target, type))
        {
          handlers[i].unregisterEvent(target, type);
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
     * @param event {qx.event.type.Event} qooxdoo event object
     */
    dispatchEvent : function(event)
    {
      // only dispatch if listeners are registered
      var type = event.getType();
      if (!this.__listenerCountOfType[type]) {
        return;
      }

      // dispatch event
      this.__inEventDispatch = true;
      for (var i=0,l=this.__dispatchHandlers.length; i<l; i++)
      {
        var dispatchHandler = this.__dispatchHandlers[i];

        if (dispatchHandler.canDispatchEvent(event, type))
        {
          //console.log("dispatchevent: ", type, dispatchHandler.classname);
          dispatchHandler.dispatchEvent(event, type);
          break;
        }
      }
      this.__inEventDispatch = false;

      // flush job queue
      if (this.__jobQueue && this.__jobQueue.length > 0)
      {
        for (var i=0, l=this.__jobQueue.length; i<l; i++)
        {
          var job = this.__jobQueue[i];
          this[job.method].apply(this, job.arguments);
        }

        this.__jobQueue = [];
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
     * @return {qx.event.handler.MouseCaptureHandler} the mouse capture handler
     *     reponsible for the given element.
     */
    getCaptureHandler : function() {
      return this.__captureHandler;
    },





    /*
    ---------------------------------------------------------------------------
      HELPER
    ---------------------------------------------------------------------------
    */

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

      delete reg[type];
    },


    /**
     * Get all event listeners for the given element and event type. If no
     * registry data is available for this element and type and the
     * third parameter <code>buildRegistry</code> is true the registry is build
     * up and an empty array is returned.
     *
     * @param element {Element} DOM element.
     * @param type {String} DOM event type
     * @param capture {Boolean ? false} Whether to attach the event to the
     *       capturing phase of the bubbling phase of the event.
     * @param buildRegistry {Boolean?false} Whether to build up the registry if
     *     no entry is found
     * @return {Function[]|null} Array of registered event handlers for this event
     *     and type. Will return null if <code>buildRegistry</code> and no entry
     *     is found.
     */
    registryGetListeners : function(element, type, capture, buildRegistry)
    {
      var elementId = qx.core.Object.toHashCode(element);
      var listenerList = capture ? "captureListeners" : "bubbleListeners";
      var reg = this.__registry;

      if (!buildRegistry)
      {
        if (!(reg[elementId] && reg[elementId][type] && reg[elementId][type][listenerList])) {
          return null;
        }
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
    statics.registerEventHandler(qx.event.handler.InlineEventHandler, statics.PRIORITY_NORMAL);

    statics.registerEventDispatcher(qx.event.dispatch.InlineDispatch, statics.PRIORITY_NORMAL);
    statics.registerEventDispatcher(qx.event.dispatch.BubblingDispatch, statics.PRIORITY_NORMAL);
  }
});