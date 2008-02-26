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

    // Stores the objects
    this._objectToValue = {};
    this._valueToObjects = {};

    // Create empty dynamic map
    this._dynamic = {};
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Disconnect all connections to the given object.
     *
     * @type member
     * @param obj {qx.core.Object} The class, which should be disconnected.
     */
    disconnect : function(obj)
    {
      // Error checking
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (!obj) {
          throw new Error("Can not disconnect from an empty object");
        }
      }

      // If value is disposed, it's already disconnected
      if (this.isDisposed()) {
        return;
      }

      // Otherwise disconnect from this value
      var objectKey = obj.toHashCode();
      var reg = this._objectToValue;

      delete reg[objectKey];
    },


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

        if (typeof obj.hasConnectionTo != "function") {
          throw new Error("The Connected object '" + obj + "' must include the mixin 'qx.util.manager.MConnectedObject'!");
        }

        if (value === undefined) {
          throw new Error("Undefined values are not allowed for connect: " + callback + "[" + obj + "]");
        }

        if (typeof value === "boolean") {
          throw new Error("Boolean values are not allowed for connect: " + callback + "[" + obj + "]");
        }
      }

      // Preprocess value (if function is defined)
      if (value !== null && this._preprocess) {
        value = this._preprocess(value);
      }

      // Store references for dynamic values
      var objectKey = obj.toHashCode();
      var callbackKey = qx.core.ObjectRegistry.toHashCode(callback);
      var listenerKey = objectKey + "|" + callbackKey;
      var objectToValue = this._objectToValue;
      var valueToObjects = this._valueToObjects;


      // remove old value from value2object map
      if (objectToValue[objectKey] && objectToValue[objectKey][callbackKey])
      {
        var oldValue = this.resolveDynamic(objectToValue[objectKey][callbackKey].value);
        if (oldValue instanceof qx.core.Object)
        {
          var connectedObjects = valueToObjects[oldValue.toHashCode()];
          if (connectedObjects) {
            delete connectedObjects[listenerKey];
          }
        }
      }


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

        var value = this.resolveDynamic(value);

        // store value in value2objects map
        if (value instanceof qx.core.Object)
        {
          var valueKey = value.toHashCode();
          if (!valueToObjects[valueKey]) {
            valueToObjects[valueKey] = {};
          }

          valueToObjects[valueKey][listenerKey] = {
            callbackKey: callbackKey,
            contextKey: objectKey
          };
        }

        obj.hasConnectionTo(this);
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
     * @param varargs {var} a variable number of argiments, which are passed to
     *     the callbacks
     */
    syncConnectedObjects : function(value, varargs)
    {
      var value = this.resolveDynamic(value) || value;
      if (! value instanceof qx.core.Object) {
        return;
      }

      var valueKey = value.toHashCode();
      var callbackInfo = this._valueToObjects[valueKey];
      if (!callbackInfo) {
        return;
      }

      for (var key in callbackInfo)
      {
        var contextKey = callbackInfo[key].contextKey;
        var callbackKey = callbackInfo[key].callbackKey;
        if (this._objectToValue[contextKey] && this._objectToValue[contextKey][callbackKey])
        {
          var entry = this._objectToValue[contextKey][callbackKey];
          entry.callback.apply(entry.object, arguments);
        } else {
          delete this._valueToObjects[valueKey]
        }
      }
    },


    /**
     * Update all registered objects regarding the value switch
     *
     * @type member
     */
    _updateObjects : function()
    {
      var reg = this._objectToValue;
      var entry;

      for (var objectKey in reg)
      {
        for (var callbackKey in reg[objectKey])
        {
          entry = reg[objectKey][callbackKey];
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

  destruct : function() {
    this._disposeFields("_objectToValue", "_dynamic");
  }
});
