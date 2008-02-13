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
    this._registry = {};

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
      var reg = this._registry;

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
      var callbackKey = qx.core.Object.toHashCode(callback);
      var reg = this._registry;

      // Callback handling
      if (this.isDynamic(value))
      {
        if (!reg[objectKey]) {
          reg[objectKey] = {};
        }

        // Store reference for themed values
        reg[objectKey][callbackKey] =
        {
          callback : callback,
          object   : obj,
          value    : value
        };

        obj.hasConnectionTo(this);
      }
      else if (reg[objectKey] && reg[objectKey][callbackKey])
      {
        // In all other cases try to remove previously created references
        delete reg[objectKey][callbackKey];
      }

      // Finally executing given callback
      callback.call(obj, this.resolveDynamic(value) || value);
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
      return this._dynamic[value] !== undefined;
    },


    /**
     * Update all registered objects regarding the value switch
     *
     * @type member
     */
    _updateObjects : function()
    {
      var reg = this._registry;
      var entry;

      for (var OobjectKey in reg)
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
    this._disposeFields("_registry", "_dynamic");
  }
});
