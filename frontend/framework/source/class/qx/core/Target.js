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
qx.Clazz.define("qx.core.Target",
{
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param autoDispose {Boolean ? true} wether the object should be disposed automatically by qooxdoo
   */
  construct : function(autoDispose) {
    qx.core.Object.call(this, autoDispose);
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    EVENTPREFIX : "evt"
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
      EVENT CONNECTION
    ---------------------------------------------------------------------------
    */

    /**
     * Whether the objects supports the given event type
     *
     * @type member
     * @param eventName {String} name of the event to check for
     * @return {Boolean} whether the object support the given event.
     */
    supportsEvent : function(eventName)
    {
      // old style classes can't be checked
      if (!this.constructor.base) {
        return true;
      }

			if (eventName.indexOf("change") == 0) {
				var propName = qx.lang.String.toFirstLower(eventName.slice(6));
				if (this.$$properties[propName]) {
					return true;
				}
			}

      var clazz = this.constructor;

      while (clazz.superclass)
      {
        if (clazz.$$events && clazz.$$events[eventName]) {
          return true;
        }

        clazz = clazz.superclass;
      }

      return false;
    },


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
        if (!this.supportsEvent(type)) {
          throw new Error("Objects of class '" + this.constructor.classname + "' do not support the event '" + type + "'");
        }

        if (typeof func !== "function") {
          throw new Error("qx.core.Target: addEventListener(" + type + "): '" + func + "' is not a function!");
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
      var key = qx.core.Target.EVENTPREFIX + qx.core.Object.toHashCode(func) + (obj ? "_" + qx.core.Object.toHashCode(obj) : "");

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
      var key = qx.core.Target.EVENTPREFIX + qx.core.Object.toHashCode(func) + (obj ? "_" + qx.core.Object.toHashCode(obj) : "");

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
      return this.__listeners && typeof this.__listeners[type] !== "undefined" && !qx.lang.Object.isEmpty(this.__listeners[type]);
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
     * @param dispose {Boolean} wether the event object should be disposed after all event handlers run.
     * @return {Boolean} wether the event default was prevented or not. Returns true, when the event was NOT prevented.
     */
    dispatchEvent : function(evt, dispose)
    {
      // Ignore event if eventTarget is disposed
      if (this.getDisposed() && this.getEnabled()) {
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

        // Shortcut for listener data
        var typeListeners = listeners[evt.getType()];

        if (typeListeners)
        {
          var func, obj;

          // Handle all events for the specified type
          for (var vHashCode in typeListeners)
          {
            // Shortcuts for handler and object
            func = typeListeners[vHashCode].handler;
            obj = typeListeners[vHashCode].object || this;

            // Call object function
            try {
              func.call(obj, evt);
            } catch(ex) {
              this.error("Could not dispatch event of type \"" + evt.getType() + "\"", ex);
            }
          }
        }
      }

      // Bubble event to parents
      // TODO: Move this to Parent or Widget?
      if (evt.getBubbles() && !evt.getPropagationStopped() && this.getParent)
      {
        var parent = this.getParent();

        if (parent && !parent.getDisposed() && parent.getEnabled()) {
          parent._dispatchEvent(evt);
        }
      }
    },




    /*
    ---------------------------------------------------------------------------
      DISPOSER
    ---------------------------------------------------------------------------
    */

    /**
     * Destructor.
     *
     * @type member
     * @return {void | var} TODOC
     */
    dispose : function()
    {
      if (this.getDisposed()) {
        return;
      }

      if (typeof this.__listeners === "object")
      {
        for (var type in this.__listeners)
        {
          var listener = this.__listeners[type];

          for (var key in listener) {
            listener[key] = null;
          }

          this.__listeners[type] = null;
        }
      }

      this.__listeners = null;

      return qx.core.Object.prototype.dispose.call(this);
    }
  }
});
