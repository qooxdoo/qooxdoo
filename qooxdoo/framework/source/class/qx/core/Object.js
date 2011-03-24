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
  include : [qx.data.MBinding],



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * Create a new instance
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
     * @return {Integer} unique hash code of the object
     */
    toHashCode : function() {
      return this.$$hash;
    },


    /**
     * Returns a string representation of the qooxdoo object.
     *
     * @return {String} string representation of the object
     */
    toString : function() {
      return this.classname + "[" + this.$$hash + "]";
    },


    /**
     * Call the same method of the super class.
     *
     * @param args {arguments} the arguments variable of the calling method
     * @param varags {var} variable number of arguments passed to the overwritten function
     * @return {var} the return value of the method of the base class.
     */
    base : function(args, varags)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        if (!qx.Bootstrap.isFunction(args.callee.base)) {
          throw new Error(
            "Cannot call super class. Method is not derived: " +
            args.callee.displayName
          );
        }
      }

      if (arguments.length === 1) {
        return args.callee.base.call(this);
      } else {
        return args.callee.base.apply(this, Array.prototype.slice.call(arguments, 1));
      }
    },


    /**
     * Returns the static class (to access static members of this class)
     *
     * @param args {arguments} the arguments variable of the calling method
     * @return {var} the return value of the method of the base class.
     */
    self : function(args) {
      return args.callee.self;
    },





    /*
    ---------------------------------------------------------------------------
      CLONE SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * EXPERIMENTAL - NOT READY FOR PRODUCTION
     *
     * Returns a clone of this object. Copies over all user configured
     * property values. Do not configure a parent nor apply the appearance
     * styles directly.
     *
     * @return {qx.core.Object} The clone
     */
    clone : function()
    {
      var clazz = this.constructor;
      var clone = new clazz;
      var props = qx.Class.getProperties(clazz);
      var user = qx.core.Property.$$store.user;
      var setter = qx.core.Property.$$method.set;
      var name;

      // Iterate through properties
      for (var i=0, l=props.length; i<l; i++)
      {
        name = props[i];
        if (this.hasOwnProperty(user[name])) {
          clone[setter[name]](this[user[name]]);
        }
      }

      // Return clone
      return clone;
    },


    /*
    ---------------------------------------------------------------------------
      COMMON SETTER/GETTER/RESETTER SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Sets multiple properties at once by using a property list or
     * sets one property and its value by the first and second argument.
     * As a fallback, if no generated property setter could be found, a
     * handwritten setter will be searched and invoked if available.
     *
     * @param data {Map | String} a map of property values. The key is the name of the property.
     * @param value {var?} the value, only used when <code>data</code> is a string.
     * @return {Object} this instance.
     * @throws an Exception if a property defined does not exist
     */
    set : function(data, value)
    {
      var setter = qx.core.Property.$$method.set;

      if (qx.Bootstrap.isString(data))
      {
        if (!this[setter[data]])
        {
          if (this["set" + qx.Bootstrap.firstUp(data)] != undefined) {
            this["set" + qx.Bootstrap.firstUp(data)](value);
            return this;
          }

          if (qx.core.Environment.get("qx.debug"))
          {
            qx.Bootstrap.error(new Error("No such property: " + data));
            return this;
          }
        }


        return this[setter[data]](value);
      }
      else
      {
        for (var prop in data)
        {
          if (!this[setter[prop]])
          {
            if (this["set" + qx.Bootstrap.firstUp(prop)] != undefined) {
              this["set" + qx.Bootstrap.firstUp(prop)](data[prop]);
              continue;
            }

            if (qx.core.Environment.get("qx.debug"))
            {
              qx.Bootstrap.error(new Error("No such property: " + prop));
              return this;
            }
          }

          this[setter[prop]](data[prop]);
        }

        return this;
      }
    },


    /**
     * Returns the value of the given property. If no generated getter could be
     * found, a fallback tries to access a handwritten getter.
     *
     * @param prop {String} Name of the property.
     * @return {var} The value of the value
     * @throws an Exception if a property defined does not exist
     */
    get : function(prop)
    {
      var getter = qx.core.Property.$$method.get;

      if (!this[getter[prop]])
      {
        if (this["get" + qx.Bootstrap.firstUp(prop)] != undefined) {
          return this["get" + qx.Bootstrap.firstUp(prop)]();
        }

        if (qx.core.Environment.get("qx.debug"))
        {
          qx.Bootstrap.error(new Error("No such property: " + prop));
          return this;
        }
      }


      return this[getter[prop]]();
    },


    /**
     * Resets the value of the given property. If no generated resetter could be
     * found, a handwritten resetter will be invoked, if available.
     *
     * @param prop {String} Name of the property.
     * @throws an Exception if a property defined does not exist
     */
    reset : function(prop)
    {
      var resetter = qx.core.Property.$$method.reset;

      if (!this[resetter[prop]])
      {
        if (this["reset" + qx.Bootstrap.firstUp(prop)] != undefined) {
          this["reset" + qx.Bootstrap.firstUp(prop)]();
          return;
        }

        if (qx.core.Environment.get("qx.debug"))
        {
          qx.Bootstrap.error(new Error("No such property: " + prop));
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
     * @param type {String} name of the event type
     * @param listener {Function} event callback function
     * @param self {Object ? null} Reference to the 'this' variable inside
     *         the event listener. When not given, the corresponding dispatcher
     *         usually falls back to a default, which is the target
     *         by convention. Note this is not a strict requirement, i.e.
     *         custom dispatchers can follow a different strategy.
     * @param capture {Boolean ? false} Whether to attach the event to the
     *         capturing phase or the bubbling phase of the event. The default is
     *         to attach the event handler to the bubbling phase.
     * @return {String} An opaque id, which can be used to remove the event listener
     *         using the {@link #removeListenerById} method.
     */
    addListener : function(type, listener, self, capture)
    {
      if (!this.$$disposed) {
        return this.__Registration.addListener(this, type, listener, self, capture);
      }

      return null;
    },


    /**
     * Add event listener to this object, which is only called once. After the
     * listener is called the event listener gets removed.
     *
     * @param type {String} name of the event type
     * @param listener {Function} event callback function
     * @param self {Object ? window} reference to the 'this' variable inside the callback
     * @param capture {Boolean ? false} Whether to attach the event to the
     *         capturing phase or the bubbling phase of the event. The default is
     *         to attach the event handler to the bubbling phase.
     * @return {String} An opaque id, which can be used to remove the event listener
     *         using the {@link #removeListenerById} method.
     */
    addListenerOnce : function(type, listener, self, capture)
    {
      var callback = function(e)
      {
        this.removeListener(type, callback, this, capture);
        listener.call(self||this, e);
      };

      return this.addListener(type, callback, this, capture);
    },


    /**
     * Remove event listener from this object
     *
     * @param type {String} name of the event type
     * @param listener {Function} event callback function
     * @param self {Object ? null} reference to the 'this' variable inside the callback
     * @param capture {Boolean} Whether to remove the event listener of
     *   the bubbling or of the capturing phase.
     * @return {Boolean} Whether the event was removed successfully (has existed)
     */
    removeListener : function(type, listener, self, capture)
    {
      if (!this.$$disposed) {
        return this.__Registration.removeListener(this, type, listener, self, capture);
      }

      return false;
    },


    /**
     * Removes an event listener from an event target by an id returned by
     * {@link #addListener}
     *
     * @param id {String} The id returned by {@link #addListener}
     * @return {Boolean} Whether the event was removed successfully (has existed)
     */
    removeListenerById : function(id)
    {
      if (!this.$$disposed) {
        return this.__Registration.removeListenerById(this, id);
      }

      return false;
    },


    /**
     * Check if there are one or more listeners for an event type.
     *
     * @param type {String} name of the event type
     * @param capture {Boolean ? false} Whether to check for listeners of
     *         the bubbling or of the capturing phase.
     * @return {Boolean} Whether the object has a listener of the given type.
     */
    hasListener : function(type, capture) {
      return this.__Registration.hasListener(this, type, capture);
    },


    /**
     * Dispatch an event on this object
     *
     * @param evt {qx.event.type.Event} event to dispatch
     * @return {Boolean} Whether the event default was prevented or not.
     *     Returns true, when the event was NOT prevented.
     */
    dispatchEvent : function(evt)
    {
      if (!this.$$disposed) {
        return this.__Registration.dispatchEvent(this, evt);
      }

      return true;
    },


    /**
     * Creates and dispatches an event on this object.
     *
     * @param type {String} Event type to fire
     * @param clazz {Class?qx.event.type.Event} The event class
     * @param args {Array?null} Arguments, which will be passed to
     *       the event's init method.
     * @return {Boolean} Whether the event default was prevented or not.
     *     Returns true, when the event was NOT prevented.
     */
    fireEvent : function(type, clazz, args)
    {
      if (!this.$$disposed) {
        return this.__Registration.fireEvent(this, type, clazz, args);
      }

      return true;
    },


    /**
     * Create an event object and dispatch it on this object.
     * The event dispatched with this method does never bubble! Use only if you
     * are sure that bubbling is not required.
     *
     * @param type {String} Event type to fire
     * @param clazz {Class?qx.event.type.Event} The event class
     * @param args {Array?null} Arguments, which will be passed to
     *       the event's init method.
     * @return {Boolean} Whether the event default was prevented or not.
     *     Returns true, when the event was NOT prevented.
     */
    fireNonBubblingEvent : function(type, clazz, args)
    {
      if (!this.$$disposed) {
        return this.__Registration.fireNonBubblingEvent(this, type, clazz, args);
      }

      return true;
    },


    /**
     * Creates and dispatches an non-bubbling data event on this object.
     *
     * @param type {String} Event type to fire
     * @param data {var} User defined data attached to the event object
     * @param oldData {var?null} The event's old data (optional)
     * @param cancelable {Boolean?false} Whether or not an event can have its default
     *     action prevented. The default action can either be the browser's
     *     default action of a native event (e.g. open the context menu on a
     *     right click) or the default action of a qooxdoo class (e.g. close
     *     the window widget). The default action can be prevented by calling
     *     {@link qx.event.type.Event#preventDefault}
     * @return {Boolean} Whether the event default was prevented or not.
     *     Returns true, when the event was NOT prevented.
     */
    fireDataEvent : function(type, data, oldData, cancelable)
    {
      if (!this.$$disposed)
      {
        if (oldData === undefined) {
          oldData = null;
        }
        return this.__Registration.fireNonBubblingEvent(
          this, type, qx.event.type.Data, [data, oldData, !!cancelable]
        );
      }

      return true;
    },




    /*
    ---------------------------------------------------------------------------
      USER DATA
    ---------------------------------------------------------------------------
    */

    /** {Map} stored user data */
    __userData : null,


    /**
     * Store user defined data inside the object.
     *
     * @param key {String} the key
     * @param value {Object} the value of the user data
     * @return {void}
     */
    setUserData : function(key, value)
    {
      if (!this.__userData) {
        this.__userData = {};
      }

      this.__userData[key] = value;
    },


    /**
     * Load user defined data from the object
     *
     * @param key {String} the key
     * @return {Object} the user data
     */
    getUserData : function(key)
    {
      if (!this.__userData) {
        return null;
      }
      var data = this.__userData[key];
      return data === undefined ? null : data;
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
     * @param varargs {var} The item(s) to log. Any number of arguments is
     * supported. If an argument is not a string, the object dump will be
     * logged.
     */
    debug : function(varargs) {
      this.__logMessage("debug", arguments);
    },


    /**
     * Logs an info message.
     *
     * @param varargs {var} The item(s) to log. Any number of arguments is
     * supported. If an argument is not a string, the object dump will be
     * logged.
     */
    info : function(varargs) {
      this.__logMessage("info", arguments);
    },


    /**
     * Logs a warning message.
     *
     * @param varargs {var} The item(s) to log. Any number of arguments is
     * supported. If an argument is not a string, the object dump will be
     * logged.
     */
    warn : function(varargs) {
      this.__logMessage("warn", arguments);
    },


    /**
     * Logs an error message.
     *
     * @param varargs {var} The item(s) to log. Any number of arguments is
     * supported. If an argument is not a string, the object dump will be
     * logged.
     */
    error : function(varargs) {
      this.__logMessage("error", arguments);
    },


    /**
     * Prints the current stack trace
     *
     * @return {void}
     */
    trace : function() {
      this.__Logger.trace(this);
    },


    /**
     * Helper that calls the appropriate logger function with the current object
     * and any number of items.
     *
     * @param level {String} The log level of the message
     * @param varargs {arguments} Arguments list to be logged
     */
    __logMessage : function(level, varargs)
    {
      var argumentsArray = qx.lang.Array.fromArguments(varargs);
      argumentsArray.unshift(this);
      this.__Logger[level].apply(this.__Logger, argumentsArray);
    },






    /*
    ---------------------------------------------------------------------------
      DISPOSER
    ---------------------------------------------------------------------------
    */

    /**
     * Returns true if the object is disposed.
     *
     * @return {Boolean} Whether the object has been disposed
     */
    isDisposed : function() {
      return this.$$disposed || false;
    },


    /**
     * Dispose this object
     *
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
      this.$$instance = null;
      this.$$allowconstruct = null;

      // Debug output
      if (qx.core.Environment.get("qx.debug"))
      {
        if (qx.core.Environment.get("qx.disposerDebugLevel") > 2) {
          qx.Bootstrap.debug(this, "Disposing " + this.classname + "[" + this.toHashCode() + "]");
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

      // remove all property references for IE6 and FF2
      if (this.__removePropertyReferences) {
        this.__removePropertyReferences();
      }

      // Additional checks
      if (qx.core.Environment.get("qx.debug"))
      {
        if (qx.core.Environment.get("qx.disposerDebugLevel") > 0)
        {
          var key, value;
          for (key in this)
          {
            value = this[key];

            // Check for Objects but respect values attached to the prototype itself
            if (value !== null && typeof value === "object" && !(qx.Bootstrap.isString(value)))
            {
              // Check prototype value
              // undefined is the best, but null may be used as a placeholder for
              // private variables (hint: checks in qx.Class.define). We accept both.
              if (this.constructor.prototype[key] != null) {
                continue;
              }

              var ff2 = navigator.userAgent.indexOf("rv:1.8.1") != -1;
              var ie6 = navigator.userAgent.indexOf("MSIE 6.0") != -1;
              // keep the old behavior for IE6 and FF2
              if (ff2 || ie6) {
                if (value instanceof qx.core.Object || qx.core.Environment.get("qx.disposerDebugLevel") > 1) {
                  qx.Bootstrap.warn(this, "Missing destruct definition for '" + key + "' in " + this.classname + "[" + this.toHashCode() + "]: " + value);
                  delete this[key];
                }
              } else {
                if (qx.core.Environment.get("qx.disposerDebugLevel") > 1) {
                  qx.Bootstrap.warn(this, "Missing destruct definition for '" + key + "' in " + this.classname + "[" + this.toHashCode() + "]: " + value);
                  delete this[key];
                }
              }
            }
          }
        }
      }
    },


    /**
     * Possible reference to special method for IE6 and FF2
     * {@link #__removePropertyReferencesOld}
     *
     * @signature function()
     */
    __removePropertyReferences : null,


    /**
     * Special method for IE6 and FF2 which removes all $$user_ references
     * set up by the properties.
     * @signature function()
     */
    __removePropertyReferencesOld : function() {
      // remove all property references
      var properties = qx.Class.getProperties(this.constructor);
      for (var i = 0, l = properties.length; i < l; i++) {
        delete this["$$user_" + properties[i]];
      }
    },


    /*
    ---------------------------------------------------------------------------
      DISPOSER UTILITIES
    ---------------------------------------------------------------------------
    */


    /**
     * Disconnects and disposes given objects from instance.
     * Only works with qx.core.Object based objects e.g. Widgets.
     *
     * @param varargs {arguments} List of fields (which store objects) to dispose
     */
    _disposeObjects : function(varargs) {
      qx.util.DisposeUtil.disposeObjects(this, arguments);
    },


    /**
     * Disconnects and disposes given singleton objects from instance.
     * Only works with qx.core.Object based objects e.g. Widgets.
     *
     * @param varargs {arguments} List of fields (which store objects) to dispose
     */
    _disposeSingletonObjects : function(varargs) {
      qx.util.DisposeUtil.disposeObjects(this, arguments, true);
    },


    /**
     * Disposes all members of the given array and deletes
     * the field which refers to the array afterwards.
     *
     * @param field {String} Name of the field which refers to the array
     */
    _disposeArray : function(field) {
      qx.util.DisposeUtil.disposeArray(this, field);
    },


    /**
     * Disposes all members of the given map and deletes
     * the field which refers to the map afterwards.
     *
     * @param field {String} Name of the field which refers to the map
     */
    _disposeMap : function(field) {
      qx.util.DisposeUtil.disposeMap(this, field);
    }
  },




  /*
  *****************************************************************************
     ENVIRONMENT SETTINGS
  *****************************************************************************
  */

  environment : {
    "qx.disposerDebugLevel" : 0
  },




  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics, members)
  {
    // add asserts into each debug build
    if (qx.core.Environment.get("qx.debug")) {
      qx.Class.include(statics, qx.core.MAssert);
    }

    // special treatment for IE6 and FF2
    var ie6 = navigator.userAgent.indexOf("MSIE 6.0") != -1;
    var ff2 = navigator.userAgent.indexOf("rv:1.8.1") != -1;

    // patch the remove property method for IE6 and FF2
    if (ie6 || ff2) {
      members.__removePropertyReferences = members.__removePropertyReferencesOld;
      // debugger;
    }
  },





  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    if (!qx.core.ObjectRegistry.inShutDown) {
      // Cleanup event listeners
      qx.event.Registration.removeAllListeners(this);
    } else {
      // on shutdown, just clear the internal listener map
      qx.event.Registration.deleteAllListeners(this);
    }

    // Cleanup object registry
    qx.core.ObjectRegistry.unregister(this);

    // Cleanup user data
    this.__userData = null;

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
          if (properties[name].dereference) {
            this[storeUser[name]] = this[storeTheme[name]] = this[storeInherit[name]] = this[storeUseinit[name]] = this[storeInit[name]] = undefined;
          }
        }
      }

      clazz = clazz.superclass;
    }
  }
});
