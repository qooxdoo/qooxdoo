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
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(core)

************************************************************************ */

/**
 * This is the main constructor for all objects that need to be connected to qx.event.type.Event objects.
 *
 * In objects created with this constructor, you find functions to addEventListener or
 * removeEventListener to or from the created object. Each event to connect to has a type in
 * form of an identification string. This type could be the name of a regular dom event like "click" or
 * something self-defined like "ready".
 */
qx.Class.define("qx.core.Target",
{
  extend : qx.core.Object,



  statics :
  {
    /** Function to call before an event is dispatched */
    __eventMonitorPre : null,

    /** Function to call after an event has been dispatched */
    __eventMonitorPost : null,

    /**
     * Event types which are excluded from pre-event monitoring.
     */
    __eventMonitorExcludePre : {},

    /**
     * Event types which are excluded from post-event monitoring.
     */
    __eventMonitorExcludePost : {},

    /**
     * Event types which are excluded from no-listener monitoring.  (TBD: We
     * probably want to exclude common events such as mouse movements by
     * default, to avoid flooding the monitor function.)
     */
    __eventMonitorExcludeNoListeners : {},

    /**
     * Add a function to be called before an event is dispatched.
     *
     * @param func {Function}
     *   The function to be called after an event has been dispatched.  The
     *   function will be called with three parameters: the object to which
     *   the event applies, the context object on which the event is being
     *   dispatched, and the event object.  The function should return a
     *   boolean which if true, indicates that the event should actually be
     *   dispatched.  To remove use of the event monitor, pass
     *   <code>null</code> for this parameter.
     */
    addEventMonitorPre : function(func)
    {
      qx.core.Target.__eventMonitorPre = func;
    },

    /**
     * Add a function to be called after an event is dispatched.
     *
     * @param func {Function}
     *   The function to be called after an event has been dispatched.  The
     *   function will be called with three parameters: the object to which
     *   the event applies, the context object on which the event is being
     *   dispatched, and the event object.  To remove use of the event
     *   monitor, pass <code>null</code> for this parameter.
     */
    addEventMonitorPost : function(func)
    {
      qx.core.Target.__eventMonitorPost = func;
    },

    /**
     * Add a function to be called to monitor events that have no listeners.
     * Monitoring of events that have no listeners is a variant that must be
     * explicitely enabled.  To use no-listener monitoring, set variant
     * qx.eventMonitorNoListeners to "on".
     *
     * @param func {Function}
     *   The function to be called on an event which has no listeners.  The
     *   function will be called with three parameters: the object to which
     *   the event applies, the context object on which the event is being
     *   dispatched (always <code>null</code> for events with no listeners),
     *   and the event object.  To remove use of the event monitor, pass
     *   <code>null</code> for this parameter.  Note that the signature of the
     *   function is the same as for the post-dispatch function, which allows
     *   the same function to be used for it and for events which have no
     *   listeners.
     */
    addEventMonitorNoListeners : function(func)
    {
      if (qx.core.Variant.isSet("qx.eventMonitorNoListeners", "off"))
      {
        throw new Error("No-listener event monitoring is not enabled.  " +
                        "Turn on variant qx.eventMonitorNoListeners " +
                        "to enable it.");
      }

      qx.core.Target.__eventMonitorPost = func;
    },

    /**
     * Add one or more event types to be excluded from pre-event monitoring.
     * Events of types provided here will not cause calls to the pre-event
     * monitor functions.
     *
     * @param eventTypes {String|Array}
     *   An event type (if a string) or an array of event type strings which
     *   are to be excluded from calls to the event monitor.
     */
    addEventMonitorExcludePre : function(eventTypes)
    {
      var _this = qx.core.Target;
      _this.__addEventMonitorExclude(_this.__eventMonitorExcludePre,
                                     eventTypes);
    },

    /**
     * Remove one or more event types from the list of types to be excluded
     * from pre-event monitoring.  Events of types provided here will again
     * cause calls to the pre-event monitor functions.
     *
     * @param eventTypes {String|Array}
     *   An event type (if a string) or an array of event type strings which
     *   are to be re-included in calls to the event monitor.
     */
    removeEventMonitorExcludePre : function(eventTypes)
    {
      var _this = qx.core.Target;
      _this.__removeEventMonitorExclude(_this.__eventMonitorExcludePre,
                                        eventTypes);
    },

    /**
     * Add one or more event types to be excluded from post-event monitoring.
     * Events of types provided here will not cause calls to the post-event
     * monitor functions.
     *
     * @param eventTypes {String|Array}
     *   An event type (if a string) or an array of event type strings which
     *   are to be excluded from calls to the event monitor.
     */
    addEventMonitorExcludePost : function(eventTypes)
    {
      var _this = qx.core.Target;
      _this.__addEventMonitorExclude(_this.__eventMonitorExcludePost,
                                     eventTypes);
    },

    /**
     * Remove one or more event types from the list of types to be excluded
     * from post-event monitoring.  Events of types provided here will again
     * cause calls to the post-event monitor functions.
     *
     * @param eventTypes {String|Array}
     *   An event type (if a string) or an array of event type strings which
     *   are to be re-included in calls to the event monitor.
     */
    removeEventMonitorExcludeNoPost : function(eventTypes)
    {
      var _this = qx.core.Target;
      _this.__removeEventMonitorExclude(_this.__eventMonitorExcludeNoPost,
                                        eventTypes);
    },

    /**
     * Add one or more event types to be excluded from monitoring when there
     * are no listeners for the event type.  Events of types provided here
     * will not cause calls to the no-listener event monitor functions.
     *
     * @param eventTypes {String|Array}
     *   An event type (if a string) or an array of event type strings which
     *   are to be excluded from calls to the event monitor.
     */
    addEventMonitorExcludeNoListeners : function(eventTypes)
    {
      var _this = qx.core.Target;
      _this.__addEventMonitorExclude(_this.__eventMonitorExcludeNoListseners,
                                     eventTypes);
    },

    /**
     * Remove one or more event types from the list of types to be excluded
     * from monitoring when there are no listeners for the event type.  Events
     * of types provided here will again cause calls to the no-listener event
     * monitor functions.
     *
     * @param eventTypes {String|Array}
     *   An event type (if a string) or an array of event type strings which
     *   are to be re-included in calls to the event monitor.
     */
    removeEventMonitorExcludeNoListeners : function(eventTypes)
    {
      var _this = qx.core.Target;
      _this.__removeEventMonitorExclude(_this.__eventMonitorExcludeNoListeners,
                                        eventTypes);
    },

    __addEventMonitorExclude : function(excludeList, eventTypes)
    {
      if (typeof(eventTypes) == "string")
      {
        eventTypes = [ eventTypes ];
      }

      for (var i = 0; i < eventTypes.length; i++)
      {
        qx.core.Target.__eventMonitorExclude[eventTypes[i]] = true;
      }
    },

    __removeEventMonitorExclude : function(excludeList, eventTypes)
    {
      if (typeof(eventTypes) == "string")
      {
        eventTypes = [ eventTypes ];
      }

      for (var i = 0; i < eventTypes.length; i++)
      {
        delete qx.core.Target.__eventMonitorExclude[eventTypes[i]];
      }
    }
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Add event listener to an object.
     *
     * @type member
     * @param type {String} name of the event type
     * @param func {Function} event callback function
     * @param obj {Object ? window} reference to the 'this' variable inside the callback
     * @return {void}
     * @throws TODOC
     */
    addEventListener : function(type, func, obj)
    {
      if (this.getDisposed()) {
        return;
      }

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (typeof type !== "string")
        {
          this.warn("addEventListener(" + type + "): '" + type + "' is not a string!");
          return;
        }

        if (typeof func !== "function")
        {
          this.warn("addEventListener(" + type + "): '" + func + "' is not a function!");
          return;
        }

        // Event validation is only available in modern classes
        if (this.constructor.base && !qx.Class.supportsEvent(this.constructor, type)) {
          this.warn("Objects of class‚ '" + this.constructor.classname + "' do not support the event '" + type + "'");
        }
      }

      // If this is the first event of given type, we need to create a subobject
      // that contains all the actions that will be assigned to this type
      if (this.__listeners === undefined) {
        this.__listeners = {};
      }

      if (this.__listeners[type] === undefined) {
        this.__listeners[type] = {};
      }

      // Create a special key string to allow identification of each bound action
      var key = "event" + qx.core.Object.toHashCode(func) + (obj ? "$" + qx.core.Object.toHashCode(obj) : "");

      // Finally set up the listeners object
      this.__listeners[type][key] =
      {
        handler : func,
        object  : obj
      };
    },


    /**
     * Remove event listener from object
     *
     * @type member
     * @param type {String} name of the event type
     * @param func {Function} event callback function
     * @param obj {Object ? window} reference to the 'this' variable inside the callback
     * @return {void}
     * @throws TODOC
     */
    removeEventListener : function(type, func, obj)
    {
      if (this.getDisposed()) {
        return;
      }

      var listeners = this.__listeners;

      if (!listeners || listeners[type] === undefined) {
        return;
      }

      if (typeof func !== "function") {
        throw new Error("qx.core.Target: removeEventListener(" + type + "): '" + func + "' is not a function!");
      }

      // Create a special key string to allow identification of each bound action
      var key = "event" + qx.core.Object.toHashCode(func) + (obj ? "$" + qx.core.Object.toHashCode(obj) : "");

      // Delete object entry for this action
      delete this.__listeners[type][key];
    },




    /*
    ---------------------------------------------------------------------------
      EVENT CONNECTION UTILITIES
    ---------------------------------------------------------------------------
    */

    /**
     * Check if there are one or more listeners for an event type.
     *
     * @type member
     * @param type {String} name of the event type
     * @return {var} TODOC
     */
    hasEventListeners : function(type) {
      return this.__listeners && this.__listeners[type] !== undefined && !qx.lang.Object.isEmpty(this.__listeners[type]);
    },


    /**
     * Checks if the event is registered. If so it creates an event object and dispatches it.
     *
     * @type member
     * @param type {String} name of the event type
     * @return {void}
     */
    createDispatchEvent : function(type)
    {
      if (this.hasEventListeners(type)) {
        this.dispatchEvent(new qx.event.type.Event(type), true);
      }
    },


    /**
     * Checks if the event is registered. If so it creates an event object and dispatches it.
     *
     * @type member
     * @param type {String} name of the event type
     * @param data {Object} user defined data attached to the event object
     * @return {void}
     */
    createDispatchDataEvent : function(type, data)
    {
      if (this.hasEventListeners(type)) {
        this.dispatchEvent(new qx.event.type.DataEvent(type, data), true);
      }
    },


    /**
     * Checks if the event is registered. If so it creates an event object and dispatches it.
     *
     * @type member
     * @param type {String} name of the event type
     * @param value {Object} property value attached to the event object
     * @param old {Object} old property value attached to the event object
     * @return {void}
     */
    createDispatchChangeEvent : function(type, value, old)
    {
      if (this.hasEventListeners(type)) {
        this.dispatchEvent(new qx.event.type.ChangeEvent(type, value, old), true);
      }
    },




    /*
    ---------------------------------------------------------------------------
      EVENT DISPATCH
    ---------------------------------------------------------------------------
    */

    /**
     * Dispatch an event
     *
     * @type member
     * @param evt {qx.event.type.Event} event to dispatch
     * @param dispose {Boolean} whether the event object should be disposed after all event handlers run.
     * @return {Boolean} whether the event default was prevented or not. Returns true, when the event was NOT prevented.
     */
    dispatchEvent : function(evt, dispose)
    {
      // Ignore event if eventTarget is disposed
      if (this.getDisposed()) {
        return;
      }

      if (evt.getTarget() == null) {
        evt.setTarget(this);
      }

      if (evt.getCurrentTarget() == null) {
        evt.setCurrentTarget(this);
      }

      // Dispatch Event
      this._dispatchEvent(evt, dispose);

      // Read default prevented
      var defaultPrevented = evt._defaultPrevented;

      // enable dispose for event?
      dispose && evt.dispose();

      return !defaultPrevented;
    },


    /**
     * Internal event dispatch method
     *
     * @type member
     * @param evt {qx.event.type.Event} event to dispatch
     * @return {void}
     */
    _dispatchEvent : function(evt)
    {
      var listeners = this.__listeners;

      if (listeners)
      {
        // Setup current target
        evt.setCurrentTarget(this);

        var eventType = evt.getType();

        // Shortcut for listener data
        var typeListeners = listeners[eventType];

        if (typeListeners)
        {
          var func, obj;

          // Handle all events for the specified type
          for (var vHashCode in typeListeners)
          {
            // Shortcuts for handler and object
            func = typeListeners[vHashCode].handler;
            obj = typeListeners[vHashCode].object || this;

            // Assme we'll be dispatching the event
            var dispatch = true;

            // If there is an event monitor (pre) function specified...
            if (qx.core.Target.__eventMonitorPre &&
                ! qx.core.Target.__eventMonitorExcludePre[eventType])
            {
              // ... then call it.  It may prevent dispatching the event.
              dispatch = qx.core.Target.__eventMonitorPre(this, obj, evt);
            }

            // Call object function, if not prevented.
            if (dispatch)
            {
              func.call(obj, evt);

              // If there is an event monitor (post) function specified...
              if (qx.core.Target.__eventMonitorPost &&
                  ! qx.core.Target.__eventMonitorExcludePost[eventType])
              {
                // ... then call it.
                qx.core.Target.__eventMonitorPost(this, obj, evt);
              }
            }
          }
        }
      }

      // Only support "no listeners" monitoring if specifically requested.
      // This has the potential to slow down, possibly noticibly, event
      // handling of events which occur frequently, e.g. mouse movements.
      // Requires experimentation.
      if (qx.core.Variant.isSet("qx.eventMonitorNoListeners", "on"))
      {
        // If there's an event monitor (no listeners) function specified...
        if ((! listeners || ! typeListeners) &&
            qx.core.Target.__eventMonitorNoListeners &&
            ! qx.core.Target.__eventMonitorExcludeNoListeners[eventType])
        {
          // ... then call it.
          qx.core.Target.__eventMonitorNoListeners(this, null, evt);
        }
      }

      // Bubble event to parents
      // TODO: Move this to Parent or Widget?
      if (evt.getBubbles() && !evt.getPropagationStopped() && typeof(this.getParent) == "function")
      {
        var parent = this.getParent();

        if (parent && !parent.getDisposed() && parent.getEnabled()) {
          parent._dispatchEvent(evt);
        }
      }
    }
  },



  /*
  *****************************************************************************
     DESTRUCT
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeObjectDeep("__listeners", 2);
  }
});
