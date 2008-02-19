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

/*
#require(qx.event.Manager)
*/

/**
 * Wrapper for browser DOM event handling.
 *
 * The following feature are supported in a browser independend way:
 * <ul>
 *   <li>cancelling of events <code>stopPropagation</code></li>
 *   <li>prevention of the browser's default behaviour <code>preventDefault</code>
 *   <li>unified event objects matching the DOM 2 event interface (<a href="http://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-interface">Reference</a>)</li>
 *   <li>Support for the event <i>bubbling</i> and <i>capturing</i> phase</li>
 *   <li>Support for mouse event capturing (<a href="http://msdn2.microsoft.com/en-us/library/ms537630.aspx">Reference</a>)</li>
 *   <li>Support for normalized focus and activation handling</li>
 * </ul>
 *
 * Supported events differ from target to target. Generally the handlers
 * in {@link qx.event.handler} defines the available features.
 *
 */
qx.Bootstrap.define("qx.event.Registration",
{
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
     * given target.
     *
     * @type static
     * @internal
     * @param target {Object} Any valid event target
     * @return {qx.event.Manager} The event manger for the target.
     */
    getManager : function(target)
    {
      // get the corresponding default view (window)
      if (qx.dom.Node.isWindow(target)) {
        var win = target;
      } else if (qx.dom.Node.isElement(target)) {
        var win = qx.dom.Node.getWindow(target);
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
     * Removes a manager for a specific window from the list.
     * Normally only used when the manager gets disposed through
     * an unload event of the attached window.
     *
     * @internal
     * @type static
     * @param mgr {qx.event.Manager} The manager to remove
     * @return {void}
     */
    removeManager : function(mgr)
    {
      var id = qx.core.Object.toHashCode(mgr.getWindow());
      delete this.__managers[id];
    },


    /**
     * Add an event listener to a DOM target. The event listener is passed an
     * instance of {@link Event} containing all relevant information
     * about the event as parameter.
     *
     * @type static
     * @param target {Object} Any valid event target
     * @param type {String} Name of the event e.g. "click", "keydown", ...
     * @param listener {Function} Event listener function
     * @param self {Object} Reference to the 'this' variable inside
     *         the event listener.
     * @param capture {Boolean} Whether to attach the event to the
     *         capturing phase of the bubbling phase of the event. The default is
     *         to attach the event handler to the bubbling phase.
     */
    addListener : function(target, type, listener, self, capture)
    {
      var mgr = this.getManager(target);
      mgr.addListener(target, type, listener, self, capture);
    },


    /**
     * Remove an event listener from a from DOM node.
     *
     * Note: All registered event listeners will automatically be removed from
     *   the DOM at page unload so it is not necessary to detach events in the
     *   destructor.
     *
     * @type static
     * @param target {Object} Any valid event target
     * @param type {String} Name of the event
     * @param listener {Function} The pointer to the event listener
     * @param self {Object} Reference to the 'this' variable inside
     *         the event listener.
     * @param capture {Boolean} Whether to remove the event listener of
     *         the bubbling or of the capturing phase.
     */
    removeListener : function(target, type, listener, self, capture)
    {
      var mgr = this.getManager(target);
      mgr.removeListener(target, type, listener, self, capture);
    },


    /**
     * Check whether there are one or more listeners for an event type
     * registered at the target.
     *
     * @type static
     * @param target {Object} Any valid event target
     * @param type {String} The event type
     * @param capture {Boolean ? false} Whether to check for listeners of
     *         the bubbling or of the capturing phase.
     * @return {Boolean} Whether the target has event listeners of the given type.
     */
    hasListeners : function(target, type, capture) {
      return this.getManager(target).hasListeners(target, type, capture);
    },


    /**
     * Get an inevent instance of the given class, which can be dispatched using
     * an event manager. The created events must be initialized using
     * {@link qx.event.type.Event#init}.
     *
     * @type static
     * @param clazz {Object} The event class
     * @param args {Array} Array or arguments, which will be passed to
     *       the event's init method.
     * @return {qx.event.type.Event} An instance of the given class.
     */
    createEvent : function(clazz, args)
    {
      var obj = qx.event.Pool.getInstance().getEventInstance(clazz);

      if (args) {
        obj.init.apply(obj, args);
      }

      return obj;
    },


    /**
     * Dispatch an event object on the given target.
     *
     * @type static
     * @param target {Object} Any valid event target
     * @param event {qx.event.type.Event} The event object to dispatch. The event
     *       object must be obtained using {@link #createEvent} and initialized
     *       using {@link qx.event.type.Event#init}.
     * @return {void}
     */
    dispatchEvent : function(target, event) {
      this.getManager(target).dispatchEvent(target, event);
    },


    /**
     * Create an event object and dispatch it on the given target.
     *
     * @type static
     * @param target {Object} Any valid event target
     * @param clazz {Class} The event class
     * @param args {Array} Array or arguments, which will be passed to
     *       the event's init method.
     */
    fireCustomEvent : function(target, clazz, args) {
      this.getManager(target).fireCustomEvent(target, clazz, args);
    },


    /**
     * Use the low level browser functionality to attach event listeners
     * to DOM nodes. Uses <code>attachEvent</code> in IE and
     * <code>addListener</code> in all other browsers.
     *
     * Use this with caution. This is only thought for event handlers and
     * not for the user.
     *
     * @internal
     * @type static
     * @param target {Object} Any valid native event target
     * @param type {String} Name of the event
     * @param listener {Function} The pointer to the function to assign
     * @signature function(target, type, listener)
     */
    addNativeListener : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(target, type, listener) {
        target.attachEvent("on" + type, listener);
      },

      "default" : function(target, type, listener) {
        target.addEventListener(type, listener, false);
      }
    }),


    /**
     * Use the low level browser functionality to remove event listeners
     * from DOM nodes. Uses <code>detachEvent</code> in IE and
     * <code>removeListener</code> in all oother browsers.
     *
     * Use this with caution. This is only thought for event handlers and
     * not for the user.
     *
     * @internal
     * @type static
     * @param target {Object} Any valid native event target
     * @param type {String} Name of the event
     * @param listener {Function} The pointer to the function to assign
     * @signature function(target, type, listener)
     */
    removeNativeListener : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(target, type, listener) {
        target.detachEvent("on" + type, listener);
      },

      "default" : function(target, type, listener) {
        target.removeEventListener(type, listener, false);
      }
    }),




    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER/DISPATCHER PRIORITY
    ---------------------------------------------------------------------------
    */

    /** {Integer} Highest priority. Used by handlers and dispatchers. */
    PRIORITY_FIRST : -32000,

    /** {Integer} Default priority. Used by handlers and dispatchers. */
    PRIORITY_NORMAL : 0,

    /** {Integer} Lowest priority. Used by handlers and dispatchers. */
    PRIORITY_LAST : 32000,




    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER REGISTRATION
    ---------------------------------------------------------------------------
    */

    /** {Array} Contains all known event handlers */
    __handlers : [],


    /**
     * Register an event handler.
     *
     * @internal
     * @type static
     * @param handler {qx.event.handler.AbstractEventHandler} Event handler to add
     * @param priority {Integer} One of {@link #PRIORITY_FIRST}, {@link PRIORITY_NORMAL}
     *       or {@link #PRIORITY_LAST}.
     * @return {void}
     * @throws an error if the handler does not have the IEventHandler interface.
     */
    addHandler : function(handler, priority)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (!qx.Class.hasInterface(handler, qx.event.IEventHandler)) {
          throw new Error("The event handler does not implement the interface qx.event.IEventHandler!");
        }
      }

      // Append to list
      this.__handlers.push(handler);

      // Re-sort list
      this.__handlers.sort(function(a, b) {
        return a.PRIORITY - b.PRIORITY;
      });
    },


    /**
     * Get a list of registered event handlers.
     *
     * @internal
     * @type static
     * @return {qx.event.handler.AbstractEventHandler[]} registered event handlers
     */
    getHandlers : function() {
      return this.__handlers;
    },




    /*
    ---------------------------------------------------------------------------
      EVENT DISPATCHER REGISTRATION
    ---------------------------------------------------------------------------
    */

    /** {Array} Contains all known event dispatchers */
    __dispatchers : [],


    /**
     * Register an event dispatcher.
     *
     * @internal
     * @type static
     * @param dispatcher {qx.event.dispatch.IEventDispatch} Event dispatcher to add
     * @param priority {Integer} One of {@link #PRIORITY_FIRST}, {@link PRIORITY_NORMAL}
     *       or {@link #PRIORITY_LAST}.
     * @return {void}
     * @throws an error if the dispatcher does not have the IEventHandler interface.
     */
    addDispatcher : function(dispatcher, priority)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (!qx.Class.hasInterface(dispatcher, qx.event.IEventDispatcher)) {
          throw new Error("The dispatch dispatcher does not implement the interface qx.event.IEventDispatcher!");
        }
      }

      // Append to list
      this.__dispatchers.push(dispatcher);

      // Re-sort list
      this.__dispatchers.sort(function(a, b) {
        return a.PRIORITY - b.PRIORITY;
      });
    },


    /**
     * Get a list of registered event dispatchers.
     *
     * @internal
     * @type static
     * @return {qx.event.dispatch.IEventDispatch[]} all registered event dispatcher
     */
    getDispatchers : function() {
      return this.__dispatchers;
    }
  }
});
