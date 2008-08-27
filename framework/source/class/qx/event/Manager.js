/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Sebastian Werner (wpbasti)

************************************************************************ */

/* ************************************************************************

#require(qx.bom.Event)

************************************************************************ */

/**
 * Wrapper for browser DOM event handling for each browser window/frame.
 */
qx.Bootstrap.define("qx.event.Manager",
{
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
    // Assign window object
    this.__window = win;

    // Register to the page unload event.
    // Only for iframes and other secondary documents.
    this.__disposeWrapper = qx.lang.Function.bind(this.dispose, this);
    qx.bom.Event.addNativeListener(win, "unload", this.__disposeWrapper);

    // Registry for event listeners
    this.__listeners = {};

    // The handler and dispatcher instances
    this.__handlers = {};
    this.__dispatchers = {};

    this.__handlerCache = {};
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
      HELPERS
    ---------------------------------------------------------------------------
    */

    /**
     * Local dispose method. Automatically executed when unloading of the
     * attached window occours.
     *
     * @return {void}
     */
    dispose : function()
    {
      // Remove own unload listener
      qx.bom.Event.removeNativeListener(this.__window, "unload", this.__disposeWrapper);

      // Remove from manager list
      qx.event.Registration.removeManager(this);

      // Dispose data fields
      this.__listeners = this.__window = this.__handlers =
      this.__dispatchers = this.__disposeWrapper = this.__handlerCache = null;
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
     * Returns an instance of the given handler class for this manager(window).
     *
     * @param clazz {Class} Any class which implements {@link qx.event.IEventHandler}
     * @return {Object} The instance used by this manager
     */
    getHandler : function(clazz)
    {
      var handler = this.__handlers[clazz.classname];

      if (handler) {
        return handler;
      }

      return this.__handlers[clazz.classname] = new clazz(this);
    },


    /**
     * Returns an instance of the given dispatcher class for this manager(window).
     *
     * @param clazz {Class} Any class which implements {@link qx.event.IEventHandler}
     * @return {Object} The instance used by this manager
     */
    getDispatcher : function(clazz)
    {
      var dispatcher = this.__dispatchers[clazz.classname];

      if (dispatcher) {
        return dispatcher;
      }

      return this.__dispatchers[clazz.classname] = new clazz(this);
    },



    /*
    ---------------------------------------------------------------------------
      EVENT LISTENER MANAGMENT
    ---------------------------------------------------------------------------
    */

    /**
     * Get a copy of all event listeners for the given combination
     * of target, event type and phase.
     *
     * This method is especially useful and thoughtfor event handlers to
     * to query the listeners registered in the manager.
     *
     * @param target {Object} Any valid event target
     * @param type {String} Event type
     * @param capture {Boolean ? false} Whether the listener is for the
     *       capturing phase of the bubbling phase.
     * @return {Array | null} Array of registered event handlers. May return
     *       null when no listener were found.
     */
    getListeners : function(target, type, capture)
    {
      var targetKey = qx.core.ObjectRegistry.toHashCode(target);
      var targetMap = this.__listeners[targetKey];

      if (!targetMap) {
        return null;
      }

      var entryKey = type + (capture ? "|capture" : "|bubble");
      var entryList = targetMap[entryKey];

      return entryList ? entryList.concat() : null;
    },


    /**
     * Check whether there are one or more listeners for an event type
     * registered at the target.
     *
     * @param target {Object} Any valid event target
     * @param type {String} The event type
     * @param capture {Boolean ? false} Whether to check for listeners of
     *         the bubbling or of the capturing phase.
     * @return {Boolean} Whether the target has event listeners of the given type.
     */
    hasListener : function(target, type, capture)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (target == null)
        {
          qx.log.Logger.trace(this);
          throw new Error("Invalid object: " + target);
        }
      }

      var targetKey = qx.core.ObjectRegistry.toHashCode(target);
      var targetMap = this.__listeners[targetKey];

      if (!targetMap) {
        return false;
      }

      var entryKey = type + (capture ? "|capture" : "|bubble");
      var entryList = targetMap[entryKey];

      if (!entryList) {
        return false;
      }

      return entryList.length > 0;
    },


    /**
     * Imports a list of event listeners at once. This only
     * works for newly created elements as it replaces
     * all existing data structures.
     *
     * Works with a map of data. Each entry in this map should be a
     * map again with the keys <code>type</code>, <code>capture</code>,
     * <code>listener</code> and <code>self</code>. The values are
     * identical to the parameters of {@link #addListener}. For details
     * please have a look there.
     *
     * @param target {Object} Any valid event target
     * @param list {Map} A map where every listener has a unique key.
     * @return {void}
     */
    importListeners : function(target, list)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (target == null)
        {
          qx.log.Logger.trace(this);
          throw new Error("Invalid object: " + target);
        }
      }

      var targetKey = qx.core.ObjectRegistry.toHashCode(target);
      var targetMap = this.__listeners[targetKey] = {};

      for (var listKey in list)
      {
        var item = list[listKey];

        var entryKey = item.type + (item.capture ? "|capture" : "|bubble");
        var entryList = targetMap[entryKey];

        if (!entryList)
        {
          entryList = targetMap[entryKey] = [];

          // This is the first event listener for this type and target
          // Inform the event handler about the new event
          // they perform the event registration at DOM level if needed
          this.__registerAtHandler(target, item.type, item.capture);
        }

        // Append listener to list
        entryList.push(
        {
          handler : item.listener,
          context : item.self
        });
      }
    },

    /**
     * Add an event listener to any valid target. The event listener is passed an
     * instance of {@link Event} containing all relevant information
     * about the event as parameter.
     *
     * @param target {Object} Any valid event target
     * @param type {String} Name of the event e.g. "click", "keydown", ...
     * @param listener {Function} Event listener function
     * @param self {Object ? window} Reference to the 'this' variable inside
     *         the event listener.
     * @param capture {Boolean ? false} Whether to attach the event to the
     *         capturing phase of the bubbling phase of the event. The default is
     *         to attach the event handler to the bubbling phase.
     * @return {void}
     * @throws an error if the parameters are wrong
     */
    addListener : function(target, type, listener, self, capture)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        var msg =
          "Failed to add event listener for type '"+ type +"'" +
          " to the target '" + target + "': ";

        qx.core.Assert.assertObject(target, msg + "Invalid Target.");
        qx.core.Assert.assertString(type, msg + "Invalid event type.");
        qx.core.Assert.assertFunction(listener, msg + "Invalid callback function");
        if (self !== undefined) {
          qx.core.Assert.assertObject(self, "Invalid context for callback.")
        }
        if (capture !== undefined) {
          qx.core.Assert.assertBoolean(capture, "Invalid capture falg.");
        }
      }

      var targetKey = qx.core.ObjectRegistry.toHashCode(target);
      var targetMap = this.__listeners[targetKey];

      if (!targetMap) {
        targetMap = this.__listeners[targetKey] = {};
      }

      var entryKey = type + (capture ? "|capture" : "|bubble");
      var entryList = targetMap[entryKey];

      if (!entryList) {
        entryList = targetMap[entryKey] = [];
      }

      // This is the first event listener for this type and target
      // Inform the event handler about the new event
      // they perform the event registration at DOM level if needed
      if (entryList.length === 0) {
        this.__registerAtHandler(target, type, capture);
      }

      // Append listener to list
      entryList.push(
      {
        handler : listener,
        context : self
      });
    },


    /**
     * Get the event handler class matching the given event target and type
     *
     * @param target {var} The event target
     * @param type {String} The event type
     * @return {qx.event.IEventHandler|null} The best matching event handler or
     *     <code>null</code>.
     */
    _findHandler : function(target, type)
    {
      var key;
      var isDomNode = false;
      var isWindow = false;
      var isObject = false;

      if (target.nodeType === 1)
      {
        isDomNode = true;
        key = "DOM_" + target.tagName.toLowerCase() + "_" + type;
      }

      // Please note:
      // Identical operator does not work in IE (as of version 7) because
      // document.parentWindow is not identical to window. Crazy stuff.
      else if (target == this.__window)
      {
        isWindow = true;
        key = "WIN_" + type;
      }
      else if (target.classname)
      {
        isObject = true;
        key = "QX_" + target.classname + "_" + type;
      }
      else
      {
        key = "UNKNOWN_" + target + "_" + type;
      }


      var cache = this.__handlerCache;
      if (cache[key]) {
        return cache[key];
      }


      var classes = qx.event.Registration.getHandlers();
      var instance;

      for (var i=0, l=classes.length; i<l; i++)
      {
        var clazz = classes[i];

        // shortcut type check
        var supportedTypes = clazz.SUPPORTED_TYPES;
        if (supportedTypes && !supportedTypes[type]) {
          continue;
        }

        // chortcut target check
        var IEventHandler = qx.event.IEventHandler;
        var targetCheck = clazz.TARGET_CHECK;
        if (targetCheck)
        {
          if (targetCheck === IEventHandler.TARGET_DOMNODE && !isDomNode) {
            continue;
          } else if (targetCheck === IEventHandler.TARGET_WINDOW && !isWindow) {
            continue;
          } else if (targetCheck === IEventHandler.TARGET_OBJECT && !isObject) {
            continue;
          }
        }

        instance = this.getHandler(classes[i]);
        if (clazz.IGNORE_CAN_HANDLE || instance.canHandleEvent(target, type))
        {
          cache[key] = instance;
          return instance;
        }
      }

      return null;
    },


    /**
     * This method is called each time an event listener for one of the
     * supported events is added using {qx.event.Manager#addListener}.
     *
     * @param target {Object} Any valid event target
     * @param type {String} event type
     * @param capture {Boolean} Whether to attach the event to the
     *         capturing phase of the bubbling phase of the event.
     * @throws an error if there is no handler for the event
     */
    __registerAtHandler : function(target, type, capture)
    {
      var handler = this._findHandler(target, type);

      if (handler)
      {
        handler.registerEvent(target, type, capture);
        return;
      }

      if (qx.core.Variant.isSet("qx.debug", "on")) {
        qx.log.Logger.warn(this, "There is no event handler for the event '" + type + "' on target '" + target + "'!");
      }
    },


    /**
     * Remove an event listener from a event target.
     *
     * @param target {Object} Any valid event target
     * @param type {String} Name of the event
     * @param listener {Function} The pointer to the event listener
     * @param self {Object ? window} Reference to the 'this' variable inside
     *         the event listener.
     * @param capture {Boolean ? false} Whether to remove the event listener of
     *         the bubbling or of the capturing phase.
     * @return {void}
     * @throws an error if the parameters are wrong
     */
    removeListener : function(target, type, listener, self, capture)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        var msg =
          "Failed to dd event listener for type '"+ type +"'" +
          " to the target '" + target + "': ";

        qx.core.Assert.assertObject(target, msg + "Invalid Target.");
        qx.core.Assert.assertString(type, msg + "Invalid event type.");
        qx.core.Assert.assertFunction(listener, msg + "Invalid callback function");
        if (self !== undefined) {
          qx.core.Assert.assertObject(self, "Invalid context for callback.")
        }
        if (capture !== undefined) {
          qx.core.Assert.assertBoolean(capture, "Invalid capture falg.");
        }
      }

      var targetKey = qx.core.ObjectRegistry.toHashCode(target);
      var targetMap = this.__listeners[targetKey];

      if (!targetMap) {
        return false;
      }

      var entryKey = type + (capture ? "|capture" : "|bubble");
      var entryList = targetMap[entryKey];

      if (!entryList) {
        return false;
      }

      for (var i=0, l=entryList.length; i<l; i++)
      {
        var entry = entryList[i];

        if (entry.handler === listener && entry.context === self)
        {
          qx.lang.Array.removeAt(entryList, i);

          if (entryList.length == 0) {
            this.__unregisterAtHandler(target, type, capture);
          }

          return true;
        }
      }

      return false;
    },


    /**
     * Remove all event listeners, which are attached to the given event target.
     *
     * @param target {Object} The event target to remove all event listeners from.
     */
    removeAllListeners : function(target)
    {
      var targetKey = qx.core.ObjectRegistry.toHashCode(target);
      var targetMap = this.__listeners[targetKey];
      if (!targetMap) {
        return false;
      }

      // Deregister from event handlers
      var split, type, capture;
      for (var entryKey in targetMap)
      {
        if (targetMap[entryKey].length > 0)
        {
          // This is quite expensive, see bug #1283
          split = entryKey.split('|');

          type = split[0];
          capture = split[1] === "capture";

          this.__unregisterAtHandler(target, type, capture);
        }
      }

      delete this.__listeners[targetKey];
      return true;
    },


    /**
     * This method is called each time the an event listener for one of the
     * supported events is removed by using {qx.event.Manager#removeListener}
     * and no other event listener is listening on this type.
     *
     * @param target {Object} Any valid event target
     * @param type {String} event type
     * @param capture {Boolean} Whether to attach the event to the
     *         capturing phase of the bubbling phase of the event.
     * @throws an error if there is no handler for the event
     */
    __unregisterAtHandler : function(target, type, capture)
    {
      var handler = this._findHandler(target, type);

      if (handler)
      {
        handler.unregisterEvent(target, type, capture);
        return;
      }

      if (qx.core.Variant.isSet("qx.debug", "on")) {
        qx.log.Logger.warn(this, "There is no event handler for the event '" + type + "' on target '" + target + "'!");
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
     * {@link #addListener}. After dispatching the event object will be pooled
     * for later reuse or disposed.
     *
     * @param target {Object} Any valid event target
     * @param event {qx.event.type.Event} The event object to dispatch. The event
     *     object must be obtained using {@link qx.event.Registration#createEvent}
     *     and initialized using {@link qx.event.type.Event#init}.
     * @return {Boolean} whether the event default was prevented or not.
     *     Returns true, when the event was NOT prevented.
     * @throws an error if there is no dispatcher for the event
     */
    dispatchEvent : function(target, event)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        var msg = "Could not dispatch event '" + event + "' on target '" + target +"': ";

        qx.core.Assert.assertNotUndefined(target, msg + "Invalid event target.")
        qx.core.Assert.assertNotNull(target, msg + "Invalid event target.")
        qx.core.Assert.assertInstance(event, qx.event.type.Event, msg + "Invalid event object.");
      }

      // Preparations
      var type = event.getType();

      if (!event.getBubbles() && !this.hasListener(target, type))
      {
        // qx.log.Logger.warn(this, "Useless dispatch found: " + type);
        qx.event.Pool.getInstance().poolObject(event);
        return true;
      }

      if (!event.getTarget()) {
        event.setTarget(target);
      }

      // Interation data
      var classes = qx.event.Registration.getDispatchers();
      var instance;

      // Loop through the dispatchers
      var dispatched = false;

      for (var i=0, l=classes.length; i<l; i++)
      {
        instance = this.getDispatcher(classes[i]);

        // Ask if the dispatcher can handle this event
        if (instance.canDispatchEvent(target, event, type))
        {
          instance.dispatchEvent(target, event, type);
          dispatched = true;
          break;
        }
      }

      if (!dispatched)
      {
        qx.log.Logger.error(this, "No dispatcher can handle event of type " + type + " on " + target);
        return true;
      }

      // check whether "preventDefault" has been called
      var preventDefault = event.getDefaultPrevented();

      // Release the event instance to the event pool
      qx.event.Pool.getInstance().poolObject(event);

      return !preventDefault;
    }
  }
});
