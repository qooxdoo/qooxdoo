/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

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




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function() {
    this.base(arguments);
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
        if (this.constructor.classname && !qx.Class.supportsEvent(this.constructor, type)) {
          this.warn("Objects of class '" + this.constructor.classname + "' does not support the event '" + type + "'", new Error());
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
      var defaultPrevented = evt.getDefaultPrevented();

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
            func.call(obj, evt);
          }
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
