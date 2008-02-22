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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#require(qx.core.Property)
#require(qx.core.ObjectRegistry)
#use(qx.event.dispatch.Direct)
#use(qx.event.handler.Object)

************************************************************************ */

/**
 * The qooxdoo root class. All other classes are direct or indirect subclasses of this one.
 *
 * This class contains methods for:
 *
 * * object management (creation and destruction)
 * * interfaces for event system
 * * generic setter/getter support
 * * interfaces for logging console
 * * user friendly OO interfaces like {@link #self} or {@link #base}
 */
qx.Class.define("qx.core.Object",
{
  extend : Object,





  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * Create a new instance
   *
   * @type constructor
   */
  construct : function() {
    qx.core.ObjectRegistry.register(this);
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** Internal type */
    $$type : "Object"
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
      BASICS
    ---------------------------------------------------------------------------
    */

    /**
     * Return unique hash code of object
     *
     * @type member
     * @return {Integer} unique hash code of the object
     */
    toHashCode : function() {
      return this.$$hash;
    },


    /**
     * Returns a string represantation of the qooxdoo object.
     *
     * @type member
     * @return {String} string representation of the object
     */
    toString : function() {
      return this.classname + "[" + this.$$hash + "]";
    },


    /**
     * Call the same method of the super class.
     *
     * @type member
     * @param args {arguments} the arguments variable of the calling method
     * @param varags {var} variable number of arguments passed to the overwritten function
     * @return {var} the return value of the method of the base class.
     */
    base : function(args, varags)
    {
      if (arguments.length === 1) {
        return args.callee.base.call(this);
      } else {
        return args.callee.base.apply(this, Array.prototype.slice.call(arguments, 1));
      }
    },


    /**
     * Returns the static class (to access static members of this class)
     *
     * @type member
     * @param args {arguments} the arguments variable of the calling method
     * @return {var} the return value of the method of the base class.
     */
    self : function(args) {
      return args.callee.self;
    },




    /*
    ---------------------------------------------------------------------------
      COMMON SETTER/GETTER/RESETTER SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Sets multiple properties at once by using a property list or
     * sets one property and its value by the first and second argument.
     *
     * @type member
     * @param data {Map | String} a map of property values. The key is the name of the property.
     * @param value {var?} the value, only used when <code>data</code> is a string.
     * @return {Object} this instance.
     * @throws an Exception if a property defined does not exist
     */
    set : function(data, value)
    {
      var setter = qx.core.Property.$$method.set;

      if (typeof data === "string")
      {
        if (qx.core.Variant.isSet("qx.debug", "on"))
        {
          if (!this[setter[data]])
          {
            this.warn("No such property: " + data);
            return;
          }
        }

        return this[setter[data]](value);
      }
      else
      {
        for (var prop in data)
        {
          if (qx.core.Variant.isSet("qx.debug", "on"))
          {
            if (!this[setter[prop]])
            {
              this.warn("No such property: " + prop);
              continue;
            }
          }

          this[setter[prop]](data[prop]);
        }

        return this;
      }
    },


    /**
     * Returns the value of the given property.
     *
     * @type member
     * @param prop {String} Name of the property.
     * @return {var} The value of the value
     * @throws an Exception if a property defined does not exist
     */
    get : function(prop)
    {
      var getter = qx.core.Property.$$method.get;

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (!this[getter[prop]])
        {
          this.warn("No such property: " + prop);
          return;
        }
      }

      return this[getter[prop]]();
    },


    /**
     * Resets the value of the given property.
     *
     * @type member
     * @param prop {String} Name of the property.
     * @throws an Exception if a property defined does not exist
     */
    reset : function(prop)
    {
      var resetter = qx.core.Property.$$method.reset;

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (!this[resetter[prop]])
        {
          this.warn("No such property: " + prop);
          return;
        }
      }

      this[resetter[prop]]();
    },





    /*
    ---------------------------------------------------------------------------
      EVENT HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * Add event listener to this object.
     *
     * @type member
     * @param type {String} name of the event type
     * @param func {Function} event callback function
     * @param obj {Object ? window} reference to the 'this' variable inside the callback
     * @param capture {Boolean ? false} Whether to attach the event to the
     *         capturing phase of the bubbling phase of the event. The default is
     *         to attach the event handler to the bubbling phase.
     */
    addListener : function(type, func, obj, capture)
    {
      if (!this.$$disposed)
      {
        this.__hasEventListeners = true;
        qx.event.Registration.addListener(this, type, func, obj, !!capture);
      }
    },


    /**
     * Remove event listener from this object
     *
     * @type member
     * @param type {String} name of the event type
     * @param func {Function} event callback function
     * @param obj {Object ? window} reference to the 'this' variable inside the callback
     * @return {void}
     */
    removeListener : function(type, func, obj)
    {
      if (!this.$$disposed) {
        qx.event.Registration.removeListener(this, type, func, obj, false);
      }
    },


    /**
     * Check if there are one or more listeners for an event type.
     *
     * @type member
     * @param type {String} name of the event type
     * @return {var} TODOC
     */
    hasListeners : function(type) {
      return qx.event.Registration.hasListeners(this, type);
    },


    /**
     * Dispatch an event on this object
     *
     * @type member
     * @param evt {qx.event.type.Event} event to dispatch
     * @return {Boolean} whether the event default was prevented or not. Returns true, when the event was NOT prevented.
     */
    dispatchEvent : function(evt)
    {
      if (!this.$$disposed) {
        qx.event.Registration.dispatchEvent(this, evt);
      }
    },


    /**
     * Create an event object and dispatch it on this object.
     *
     * @type member
     * @param clazz {qx.event.type.Event} The even class
     * @param args {Array} Array or arguments, which will be passed to
     *       the event's init method.
     * @return {void}
     */
    fireCustomEvent : function(clazz, args)
    {
      if (!this.$$disposed) {
        qx.event.Registration.fireCustomEvent(this, clazz, args);
      }
    },


    /**
     * Creates and dispatches an event on this object.
     *
     * @type member
     * @param type {String} name of the event type
     */
    fireEvent : function(type)
    {
      if (!this.$$disposed) {
        qx.event.Registration.fireCustomEvent(this, qx.event.type.Event, [type, false]);
      }
    },


    /**
     * Creates and dispatches an data event on this object.
     *
     * @type member
     * @param type {String} name of the event type
     * @param data {var} user defined data attached to the event object
     */
    fireDataEvent : function(type, data)
    {
      if (!this.$$disposed) {
        qx.event.Registration.fireCustomEvent(this, qx.event.type.Data, [type, data]);
      }
    },




    /*
    ---------------------------------------------------------------------------
      DEBUG
    ---------------------------------------------------------------------------
    */

    /**
     * Logs a debug message.
     *
     * @type member
     * @param msg {var} the message to log. If this is not a string, the
     *          object dump will be logged.
     * @return {void}
     */
    debug : function(msg) {
      qx.log.Logger.debug(this, msg);
    },


    /**
     * Logs an info message.
     *
     * @type member
     * @param msg {var} the message to log. If this is not a string, the
     *      object dump will be logged.
     * @return {void}
     */
    info : function(msg) {
      qx.log.Logger.info(this, msg);
    },


    /**
     * Logs a warning message.
     *
     * @type member
     * @param msg {var} the message to log. If this is not a string, the
     *      object dump will be logged.
     * @return {void}
     */
    warn : function(msg) {
      qx.log.Logger.warn(this, msg);
    },


    /**
     * Logs an error message.
     *
     * @type member
     * @param msg {var} the message to log. If this is not a string, the
     *      object dump will be logged.
     * @return {void}
     */
    error : function(msg) {
      qx.log.Logger.error(this, msg);
    },


    /**
     * Logs the current stack trace as a debug message.
     *
     * @type member
     * @return {void}
     */
    trace : function() {
      qx.log.Logger.trace();
    },






    /*
    ---------------------------------------------------------------------------
      DISPOSER
    ---------------------------------------------------------------------------
    */

    /**
     * Returns true if the object is disposed.
     *
     * @type member
     * @return {Boolean} whether the object has been disposed
     */
    isDisposed : function() {
      return this.$$disposed || false;
    },


    /**
     * Dispose this object
     *
     * @type member
     * @return {void}
     */
    dispose : function()
    {
      // Check first
      if (this.$$disposed) {
        return;
      }

      // Mark as disposed (directly, not at end, to omit recursions)
      this.$$disposed = true;

      if (this.__hasEventListeners) {
        qx.event.Registration.getManager(this).removeAllListeners(this);
      }

      // Debug output
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.disposerDebugLevel") > 1) {
          qx.log.Logger.debug("Disposing " + this.classname + "[" + this.toHashCode() + "]");
        }
      }

      // Deconstructor support for classes
      var clazz = this.constructor;
      var mixins;

      while (clazz.superclass)
      {
        // Processing this class...
        if (clazz.$$destructor) {
          clazz.$$destructor.call(this);
        }

        // Destructor support for mixins
        if (clazz.$$includes)
        {
          mixins = clazz.$$flatIncludes;

          for (var i=0, l=mixins.length; i<l; i++)
          {
            if (mixins[i].$$destructor) {
              mixins[i].$$destructor.call(this);
            }
          }
        }

        // Jump up to next super class
        clazz = clazz.superclass;
      }

      // Additional checks
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.disposerDebugLevel") > 0)
        {
          var vValue;
          for (var vKey in this)
          {
            vValue = this[vKey];

            // Check for Objects but respect values attached to the prototype itself
            if (vValue !== null && typeof vValue === "object")
            {
              // Check prototype value
              // undefined is the best, but null may be used as a placeholder for
              // private variables (hint: checks in qx.Class.define). We accept both.
              if (this.constructor.prototype[vKey] != null) {
                continue;
              }

              qx.log.Logger.warn("Missing destruct definition for '" + vKey + "' in " + this.classname + "[" + this.toHashCode() + "]: " + vValue);
              delete this[vKey];
            }
          }
        }
      }
    },




    /*
    ---------------------------------------------------------------------------
      DISPOSER UTILITIES
    ---------------------------------------------------------------------------
    */

    /**
     * Disconnects given fields from instance.
     *
     * @type member
     * @param varargs {arguments} List of fields to dispose
     * @return {void}
     */
    _disposeFields : function(varargs) {
      qx.util.DisposeUtil.disposeFields(this, qx.lang.Array.fromArguments(arguments));
    },


    /**
     * Disconnects and disposes given objects from instance.
     * Only works with qx.core.Object based objects e.g. Widgets.
     *
     * @type member
     * @param varargs {arguments} List of fields (which store objects) to dispose
     * @return {void}
     */
    _disposeObjects : function(varargs) {
      qx.util.DisposeUtil.disposeObjects(this, qx.lang.Array.fromArguments(arguments));
    },


    /**
     * Disposes all members of the given array and deletes
     * the field which refers to the array afterwards.
     *
     * @type member
     * @param field {String} Name of the field which refers to the array
     * @return {void}
     */
    _disposeArray : function(field) {
      qx.util.DisposeUtil.disposeArray(this, field);
    },


    /**
     * Disposes all members of the given map and deletes
     * the field which refers to the map afterwards.
     *
     * @type member
     * @param field {String} Name of the field which refers to the array
     * @return {void}
     */
    _disposeMap : function(field) {
      qx.util.DisposeUtil.disposeMap(this, field);
    }
  },




  /*
  *****************************************************************************
     SETTINGS
  *****************************************************************************
  */

  settings : {
    "qx.disposerDebugLevel" : 0
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    // Cleanup properties
    var clazz = this.constructor;
    var properties;
    var store = qx.core.Property.$$store;
    var storeUser = store.user;
    var storeTheme = store.theme;
    var storeInherit = store.inherit;
    var storeUseinit = store.useinit;
    var storeInit = store.init;

    while(clazz)
    {
      properties = clazz.$$properties;
      if (properties)
      {
        for (var name in properties)
        {
          if (properties[name].dispose) {
            this[storeUser[name]] = this[storeTheme[name]] = this[storeInherit[name]] = this[storeUseinit[name]] = this[storeInit[name]] = undefined;
          }
        }
      }

      clazz = clazz.superclass;
    }

    qx.core.ObjectRegistry.unregister(this);
  }
});
