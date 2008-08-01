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

qx.Class.define("qx.legacy.util.ValueManager",
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
    qx.legacy.util.ValueManager.register(this);

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
    /** {Map} Map of all created value managers */
    __managers : {},


    /**
     * Disconnect the given object from all registered value managers
     *
     * @param obj {Object} any valid object
     * @return {void}
     */
    disconnect : function(obj)
    {
      var all = this.__managers;
      for (var hc in all) {
        all[hc].disconnectObject(obj);
      }
    },


    /**
     * Registers the given manager from the registry.
     *
     * @param mgr {qx.legacy.util.ValueManager} value manager to remove
     * @return {void}
     */
    register : function(mgr) {
      this.__managers[mgr.$$hash] = mgr;
    },


    /**
     * Unregisters the given manager from the registry.
     *
     * @param mgr {qx.legacy.util.ValueManager} value manager to remove
     * @return {void}
     */
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
     * @param callback {Function} The callback function which handles the
     *   apply of the resulting dynamically resolved value.
     * @param obj {Object} The context, the callback will be caled with.
     * @param value {var} Any acceptable value, but no booleans and no undefined
     * @return {void}
     */
    connect : function(callback, obj, value)
    {
      if (qx.core.Variant.isSet("qx.debug", "on")) {
        this.assertArgumentsCount(arguments, 3, 3);
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
     * @param value {String} dynamically interpreted idenfier
     * @return {var} return the (translated) result of the incoming value
     */
    resolveDynamic : function(value) {
      return this._dynamic[value];
    },


    /**
     * Whether a value is interpreted dynamically
     *
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
    qx.legacy.util.ValueManager.unregister(this);
  }
});
