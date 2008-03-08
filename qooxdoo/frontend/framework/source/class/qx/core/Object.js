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

    /** {Class} Pointer to the regular event registration class */
    __Registration : qx.event.Registration,


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
      if (!this.$$disposed) {
        this.__Registration.addListener(this, type, func, obj, !!capture);
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
        this.__Registration.removeListener(this, type, func, obj, false);
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
      return this.__Registration.hasListeners(this, type);
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
        this.__Registration.dispatchEvent(this, evt);
      }
    },


    /**
     * Creates and dispatches an event on this object.
     *
     * @type member
     * @param type {String} Event type to fire
     * @param clazz {Class?qx.event.type.Event} The event class
     * @param args {Array?null} Arguments, which will be passed to
     *       the event's init method.
     * @return {void}
     */
    fireEvent : function(type, clazz, args)
    {
      if (!this.$$disposed) {
        this.__Registration.fireEvent(this, type, clazz, args);
      }
    },


    /**
     * Creates and dispatches an data event on this object.
     *
     * @type member
     * @param type {String} Event type to fire
     * @param data {var} User defined data attached to the event object
     * @return {void}
     */
    fireDataEvent : function(type, data)
    {
      if (!this.$$disposed) {
        this.__Registration.fireEvent(this, type, qx.event.type.Data, [data]);
      }
    },




    /*
    ---------------------------------------------------------------------------
      DEBUG
    ---------------------------------------------------------------------------
    */

    /** {Class} Pointer to the regular logger class */
    __Logger : qx.log.Logger,


    /**
     * Logs a debug message.
     *
     * @type member
     * @param msg {var} the message to log. If this is not a string, the
     *          object dump will be logged.
     * @return {void}
     */
    debug : function(msg) {
      this.__Logger.debug(this, msg);
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
      this.__Logger.info(this, msg);
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
      this.__Logger.warn(this, msg);
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
      this.__Logger.error(this, msg);
    },


    /**
     * Prints the current stak trace
     *
     * @type member
     * @return {void}
     */
    trace : function() {
      this.__Logger.trace(this);
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

      // Debug output
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.disposerDebugLevel") > 1) {
          qx.log.Logger.debug(this, "Disposing " + this.classname + "[" + this.toHashCode() + "]");
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
          var key, value;
          for (key in this)
          {
            value = this[key];

            // Check for Objects but respect values attached to the prototype itself
            if (value !== null && typeof value === "object")
            {
              // Check prototype value
              // undefined is the best, but null may be used as a placeholder for
              // private variables (hint: checks in qx.Class.define). We accept both.
              if (this.constructor.prototype[key] != null) {
                continue;
              }

              qx.log.Logger.warn(this, "Missing destruct definition for '" + key + "' in " + this.classname + "[" + this.toHashCode() + "]: " + value);
              delete this[key];
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
      qx.util.DisposeUtil.disposeFields(this, arguments);
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
      qx.util.DisposeUtil.disposeObjects(this, arguments);
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
    // Cleanup event listeners
    qx.event.Registration.removeAllListeners(this);

    // Cleanup value managers
    qx.util.ValueManager.disconnect(this);

    // Cleanup object registry
    qx.core.ObjectRegistry.unregister(this);

    // Cleanup properties
    // TODO: Is this really needed for non DOM/JS links?
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
  }
});
