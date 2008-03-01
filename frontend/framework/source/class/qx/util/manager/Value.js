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
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

qx.Class.define("qx.util.manager.Value",
{
  type : "abstract",
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);
    
    // Register value manager globally
    qx.util.manager.Value.register(this);

    // Stores the objects
    this._registry = {};

    // Create empty dynamic map
    this._dynamic = {};
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    __managers : {},
    
    disconnect : function(obj)
    {
      var all = this.__managers;
      for (var hc in all) {
        all[hc].disconnectObject(obj);
      }
    },
    
    register : function(mgr) {
      this.__managers[mgr.$$hash] = mgr;
    },
    
    unregister : function(mgr) {
      delete this.__managers[mgr.$$hash];
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
     * Processing a value and handle callback execution on updates.
     *
     * @type member
     * @param callback {Function} The callback function which handles the
     *   apply of the resulting dynamically resolved value.
     * @param obj {Object} The context, the callback will be caled with.
     * @param value {var} Any acceptable value, but no booleans and no undefined
     * @return {void}
     */
    connect : function(callback, obj, value)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (!callback) {
          throw new Error("Can not connect to invalid callback: " + callback);
        }

        if (!obj) {
          throw new Error("Can not connect to invalid object: " + obj);
        }

        if (value === undefined) {
          throw new Error("Undefined values are not allowed for connect: " + callback + "[" + obj + "]");
        }
      }

      // Preprocess value (if function is defined)
      // Currently used by alias manager for some crazy translation stuff
      // Need to keep an eye on this.
      if (value !== null && this._preprocess) {
        value = this._preprocess(value);
      }

      // Store references for dynamic values
      var objectKey = obj.toHashCode();
      var callbackKey = qx.core.ObjectRegistry.toHashCode(callback);
      var listenerKey = objectKey + "|" + callbackKey;
      var objectToValue = this._registry;

      // Callback handling
      if (this.isDynamic(value))
      {
        if (!objectToValue[objectKey]) {
          objectToValue[objectKey] = {};
        }

        // Store reference for themed values
        objectToValue[objectKey][callbackKey] =
        {
          callback : callback,
          object   : obj,
          value    : value
        };

        value = this.resolveDynamic(value);
      }
      else if (objectToValue[objectKey] && objectToValue[objectKey][callbackKey])
      {
        // In all other cases try to remove previously created references
        delete objectToValue[objectKey][callbackKey];
      }

      // Finally executing given callback
      callback.call(obj, value);
    },


    /**
     * Disconnect all connections to the given object.
     *
     * @type member
     * @param obj {qx.core.Object} The class, which should be disconnected.
     */
    disconnectObject : function(obj)
    {
      // Remove object entry from registry
      var reg = this._registry;
      if (reg && reg[obj.$$hash]) 
      {
        // this.debug("Disconnect: " + obj.toString());
        delete reg[obj.$$hash];
      }
    },
    
    
    /**
     * Returns the dynamically interpreted result for the incoming value
     *
     * @type member
     * @param value {String} dynamically interpreted idenfier
     * @return {var} return the (translated) result of the incoming value
     */
    resolveDynamic : function(value) {
      return this._dynamic[value];
    },


    /**
     * Whether a value is interpreted dynamically
     *
     * @type member
     * @param value {String} dynamically interpreted idenfier
     * @return {Boolean} returns true if the value is interpreted dynamically
     */
    isDynamic : function(value) {
      return !!this._dynamic[value];
    },


    /**
     * Calls the callbacks of all objects connected to this value.
     * All argumants passed to this function (including <code>value</code>) are
     * also the arguments of the callbacks.
     *
     * @param value {var} a dynamic value
     * @return {void}
     */
    updateUsersOf : function(value)
    {
      var reg = this._registry;
      var callbacks, entry;

      for (var objectKey in reg)
      {
        callbacks = reg[objectKey];
        for (var callbackKey in callbacks)
        {
          entry = callbacks[callbackKey];
          if (entry.value == value) {
            entry.callback.call(entry.object, this.resolveDynamic(entry.value));
          }
        }
      }      
    },


    /**
     * Update all registered objects regarding a global change in
     * interpretion of all values. This normally happens on whole
     * changes of a e.g. theme, locale, etc.
     *
     * @type member
     * @return {void}
     */
    updateAll : function()
    {
      var reg = this._registry;
      var callbacks, entry;

      for (var objectKey in reg)
      {
        callbacks = reg[objectKey];
        for (var callbackKey in callbacks)
        {
          entry = callbacks[callbackKey];
          entry.callback.call(entry.object, this.resolveDynamic(entry.value));
        }
      }
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() 
  {
    this._disposeFields("_registry", "_dynamic");
    
    // Unregister value manager globally
    qx.util.manager.Value.unregister(this);    
  }
});
