/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)
     * Adrian Olaru (adrianolaru)

************************************************************************ */


/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 *
 */
qx.Class.define("qx.bom.storage.Abstract",
{
  extend: qx.core.Object,
  type: "abstract",

  /**
   * Create a new instance.
   *
   * @param type {String} type of storage
   */
  construct: function(type)
  {
    this.base(arguments);

    this._type = type;

    this._storage = window[this._type + "Storage"];
    this._handleStorageEventBound = qx.lang.Function.bind(this._handleStorageEvent, this);
    if (qx.core.Variant.isSet("qx.client", "mshtml")) {
      qx.bom.Event.addNativeListener(document, "storage", this._handleStorageEventBound);
    } else {
      qx.bom.Event.addNativeListener(window, "storage", this._handleStorageEventBound);
    }
  },

  events:
  {
    /** Fired when online status changed */
    "storage": "qx.event.type.Data"
  },


  members:
  {
    _handleStorageEventBound: null,
    _storage: null,
    _type: null,

    /**
     * The length of storage
     */
    getLength: function()
    {
      return this._storage.length;
    },


    /**
     * Set an item
     *
     * @param key {String} the key
     * @param value {String} the value
     */
    setItem: function(key, value)
    {
      this._storage.setItem(key, value);
    },


    /**
     * Get an item
     *
     * @param key {String} value of key
     * @return {Object}
     */
    getItem: function(key)
    {
      return this._storage.getItem(key);
    },


    /**
     * Remove an item
     *
     * @param key {String} value of key
     */
    removeItem: function(key)
    {
      this._storage.removeItem(key);
    },


    /**
     * Clear the storage
     */
    clear: function()
    {
      this._storage.clear();
    },


    /**
     * Get the key based on index
     *
     * @param index {Number} index value
     */
    getKey: function(index)
    {
      return this._storage.key(index);
    },


    /**
     * For each item execute the callback
     *
     * @param callback {Function} the callback to call
     * @param scope {Object} the scope of the callback
     */
    iterate: function(callback, scope)
    {
      var length = this.getLength();
      for (var i = 0; i < length; i++)
      {
        var key = this.getKey(i);
        callback.call(scope, key, this.getItem(key));
      }
    },


    /**
     * Storage event handler
     *
     * @param e {object} the storage event
     */
    _handleStorageEvent: function(e)
    {
      var data = {
        orig: e,
        key: e.key,
        newValue: e.newValue,
        oldValue: e.oldValue,
        url: e.url,
        storageArea: e.storageArea
      };

      this.fireDataEvent("storage",data);
    }
  },


  destruct: function()
  {
    this._storage = null;

    if (qx.core.Variant.isSet("qx.client", "mshtml")) {
      qx.bom.Event.removeNativeListener(document, "storage", this._handleStorageEventBound);
    } else {
      qx.bom.Event.removeNativeListener(window, "storage", this._handleStorageEventBound);
    }
  }
});
