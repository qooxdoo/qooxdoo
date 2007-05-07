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

#module(ui_core)

************************************************************************ */

qx.Class.define("qx.manager.object.ValueManager",
{
  type : "abstract",
  extend : qx.core.Target,




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

    // Static, non-changeable values, which should be registered, too
    this._static = {};
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
     * @param obj {Object} Any object
     * @param callback {String} Name of callback function which handles the
     *   apply of the resulting CSS valid value.
     * @param value {var} Any acceptable value
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
      }

      // Store references for dynamic values
      var key = "v" + obj.toHashCode() + "$" + qx.core.Object.toHashCode(callback);
      var reg = this._registry;

      // Detect and process static value
      value = this._processStatic(value);

      // Callback handling
      if (value && (this._dynamic[value] || this._static[value]))
      {
        // Store reference for themed values
        reg[key] = { callback : callback, object : obj, value : value };
      }
      else if (reg[key])
      {
        // In all other cases try to remove previously created references
        delete reg[key];
      }

      // Finally executing given callback
      callback.call(obj, value ? this._dynamic[value] || this._static[value] || value : null);
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
     * Returns the dynamically interpreted result for the incoming value
     *
     * @type member
     * @param value {String} dynamically interpreted idenfier
     * @return {var} return the (translated) result of the incoming value
     */
    resolveStatic : function(value) {
      return this._static[value];
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
     * Whether a value is interpreted dynamically
     *
     * @type member
     * @param value {String} dynamically interpreted idenfier
     * @return {Boolean} returns true if the value is interpreted dynamically
     */
    isStatic : function(value) {
      return this._static[value] !== undefined;
    },


    /**
     * Processes static values, placeholder for derived classes.
     * Can be used to also connect uninterpreted values/instances
     * to dependend objects.
     *
     * @type member
     * @param value {var} The incoming value
     * @return {var} The resulting value
     */
    _processStatic : function(value) {
      return value;
    },


    /**
     * Update all registered objects regarding the value switch
     *
     * @type member
     */
    _updateObjects : function()
    {
      var reg = this._registry;
      var dynamics = this._dynamic;
      var statics = this._static;
      var entry;

      for (var key in reg)
      {
        entry = reg[key];
        entry.callback.call(entry.object, dynamics[entry.value] || statics[entry.value]);
      }
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("_registry", "_dynamic", "_static");
  }
});
