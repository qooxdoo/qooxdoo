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
     * @type member
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
      this.__dispatchers = this.__disposeWrapper = null;
    },
    

    /**
     * Get the window instance the event manager is reponsible for
     *
     * @type member
     * @return {Window} DOM window instance
     */
    getWindow : function() {
      return this.__window;
    },


    /**
     * Returns an instance of the given handler class for this manager(window).
     *
     * @type member
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
     * @type member
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
     * Get all event listeners for the given target, event type and phase.
     *
     * @type member
     * @param target {Object} any valid event target
     * @param type {String} DOM event type
     * @param capture {Boolean ? false} Whether the listener is for the
     *       capturing phase of the bubbling phase.
     * @param copy {Boolean?true} Whether a copy of the listener list should be
     *       returned.
     * @param create {Boolean?false} Internal flag to indicate, whether a map entry
     *       for the target's listeners should be created if it does not yet exist.
     * @return {Function[] | null} Array of registered event handlers for this event
     *       and type. Will return null if <code>setup</code> and no entry
     *       is found.
     */
    getListeners : function(target, type, capture, copy, create)
    {
      var targetKey = qx.core.ObjectRegistry.toHashCode(target);

      // create map entry if needed
      if (!this.__listeners[targetKey])
      {
        if (create) {
          this.__listeners[targetKey] = {};
        } else {
          return null;
        }
      }
      
      var uniqueId = type + (capture ? "|capture" : "|bubble");
      var res = this.__listeners[targetKey][uniqueId];
      
      if (!res && create) {
        this.__listeners[targetKey][uniqueId] = res = [];
      }

      if (res)
      {
        if (copy === false) {
          return res;
        } else {
          return res.concat();
        }
      }

      return null;
    },


    /**
     * Check whether there are one or more listeners for an event type
     * registered at the target.
     *
     * @type member
     * @param target {Object} Any valid event target
     * @param type {String} The event type
     * @param capture {Boolean ? false} Whether to check for listeners of
     *         the bubbling or of the capturing phase.
     * @return {Boolean} Whether the target has event listeners of the given type.
     */
    hasListeners : function(target, type, capture)
    {
      var listeners = this.getListeners(target, type, capture, false, false);
      return listeners != null && listeners.length > 0;
    },


    /**
     * Add an event listener to any valid target. The event listener is passed an
     * instance of {@link Event} containing all relevant information
     * about the event as parameter.
     *
     * @type member
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
        if (typeof target !== "object") {
          throw new Error("Could not add listeners to non-objects!");
        }

        if (typeof type !== "string") {
          throw new Error("Invalid event type '" + type + "'");
        }

        if (typeof listener !== "function") {
          throw new Error("Invalid listener for event handling: " + listener);
        }

        if (capture !== undefined && typeof capture !== "boolean") {
          throw new Error("Capture flags needs to be boolean!");
        }
      }

      // Preparations
      var listeners = this.getListeners(target, type, capture, false, true);

      // This is the first event listener for this type and target
      // Inform the event handler about the new event
      // they perform the event registration at DOM level if needed
      if (listeners.length === 0) {
        this.__registerAtHandler(target, type, capture);
      }

      // Append listener to list
      listeners.push(
      {
        handler : listener,
        context : self
      });
    },


    /**
     * This method is called each time an event listener for one of the
     * supported events is added using {qx.event.Manager#addListener}.
     *
     * @type member
     * @param target {Object} Any valid event target
     * @param type {String} event type
     * @param capture {Boolean} Whether to attach the event to the
     *         capturing phase of the bubbling phase of the event.
     * @throws an error if there is no handler for the event
     */
    __registerAtHandler : function(target, type, capture)
    {
      var classes = qx.event.Registration.getHandlers();
      var instance;

      for (var i=0, l=classes.length; i<l; i++)
      {
        instance = this.getHandler(classes[i]);

        if (instance.canHandleEvent(target, type))
        {
          instance.registerEvent(target, type, capture);
          return;
        }
      }

      if (qx.core.Variant.isSet("qx.debug", "on")) {
        qx.log.Logger.warn("There is no event handler for the event '" + type + "' on target '" + target + "'!");
      }
    },


    /**
     * Remove an event listener from a event target.
     *
     * @type member
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
        if (typeof target !== "object") {
          throw new Error("Could not remove listeners from non-objects!");
        }

        if (typeof type !== "string") {
          throw new Error("Invalid event type '" + type + "'");
        }

        if (typeof listener !== "function") {
          throw new Error("Invalid listener for event handling: " + listener);
        }

        if (capture !== undefined && typeof capture !== "boolean") {
          throw new Error("Capture flags needs to be boolean!");
        }
      }

      // Preparations
      var listeners = this.getListeners(target, type, capture, false);

      // Directly return if there are no listeners
      if (!listeners || listeners.length === 0) {
        return;
      }

      // Remove listener from list
      var entry;
      var found = false;

      for (var i=0, l=listeners.length; i<l; i++)
      {
        entry = listeners[i];

        if (entry.handler === listener && entry.context === self)
        {
          qx.lang.Array.removeAt(listeners, i);
          found = true;
          break;
        }
      }

      if (!found)
      {
        // qx.log.Logger.warn("Cannot remove event listener: " + listener + " :: " + self);
        return;
      }

      // This was the last event listener for this type and target
      // Inform the event handler about the event removal so that
      // they perform the event deregistration at DOM level if needed
      if (listeners.length === 0) {
        this.__unregisterAtHandler(target, type, capture);
      }
    },


    /**
     * Remove all event listeners, which are attached to the given event target.
     *
     * @param target {Object} The event target to remove all event listeners from.
     */
    removeAllListeners : function(target)
    {
      var targetKey = qx.core.ObjectRegistry.toHashCode(target);
      var listeners = this.__listeners[targetKey];
      if (!listeners) {
        return;
      }

      for (var key in listeners)
      {
        var listener = key.split('|');
        var type = listener[0];
        var capture = (listener[1] == "capture");
        this.__unregisterAtHandler(target, type, capture);
      }
      
      delete this.__listeners[targetKey];
    },


    /**
     * This method is called each time the an event listener for one of the
     * supported events is removed by using {qx.event.Manager#removeListener}
     * and no other event listener is listening on this type.
     *
     * @type member
     * @param target {Object} Any valid event target
     * @param type {String} event type
     * @param capture {Boolean} Whether to attach the event to the
     *         capturing phase of the bubbling phase of the event.
     * @throws an error if there is no handler for the event
     */
    __unregisterAtHandler : function(target, type, capture)
    {
      var classes = qx.event.Registration.getHandlers();
      var instance;

      for (var i=0, l=classes.length; i<l; i++)
      {
        instance = this.getHandler(classes[i]);

        if (instance.canHandleEvent(target, type))
        {
          instance.unregisterEvent(target, type, capture);
          return;
        }
      }

      if (qx.core.Variant.isSet("qx.debug", "on")) {
        qx.log.Logger.warn("There is no event handler for the event '" + type + "' on target '" + target + "'!");
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
     * @type member
     * @param target {Object} Any valid event target
     * @param event {qx.event.type.Event} The event object to dispatch. The event
     *       object must be obtained using {@link qx.event.Registration#createEvent}
     *       and initialized using {@link qx.event.type.Event#init}.
     * @return {void}
     * @throws an error if there is no dispatcher for the event
     */
    dispatchEvent : function(target, event)
    {
      // Preparations
      var type = event.getType();
      
      if (!event.getBubbles() && !this.hasListeners(target, type)) 
      {
        // qx.log.Logger.warn("Useless dispatch found: " + type);
        return;
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
        qx.log.Logger.error("No dispatcher can handle event of type " + type + " on " + target);
        return;
      }

      // Release the event instance to the event pool
      qx.event.Pool.getInstance().poolEvent(event);
    }
  }
});
