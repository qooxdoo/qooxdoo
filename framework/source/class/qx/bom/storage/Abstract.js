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
 *
 * Persistent key-value data storage
 *
 * For more information see:
 * http://www.w3.org/TR/webstorage/
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

    if ((qx.core.Environment.get("engine.name") == "mshtml") &&
        (parseInt(qx.core.Environment.get("browser.documentmode")) < 9)) {
      qx.bom.Event.addNativeListener(document, "storage", this._handleStorageEventBound);
    } else {
      qx.bom.Event.addNativeListener(window, "storage", this._handleStorageEventBound);
    }
  },

  events:
  {
    /** Fired when data storage is changed*/
    "storage": "qx.event.type.Data"
  },


  members:
  {
    _handleStorageEventBound: null,
    _storage: null,
    _type: null,

    /**
     * The length of storage
     *
     * @return {Number} the length
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
      this._storage.setItem(key, qx.lang.Json.stringify(value));
    },


    /**
     * Get an item
     *
     * @param key {String} value of key
     * @return {Object} the stored item
     */
    getItem: function(key)
    {
      var item = this._storage.getItem(key);

      if (qx.lang.Type.isString(item)) {
        item = qx.lang.Json.parse(item);
      // special case for FF3
      } else if (item && item.value && qx.lang.Type.isString(item.value)) {
        item = qx.lang.Json.parse(item.value);
      }

      return item;
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
      if (!this._storage.clear)
      {
        var storage = this._storage;
        for (var i = storage.length - 1; i >= 0; i--) {
          storage.removeItem(storage.key(i));
        }
      } else {
        this._storage.clear();
      }
    },


    /**
     * Get the key based on index
     *
     * @param index {Number} index value
     * @return {String} the key
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
      // force async events for all browsers (IE does that anyway)
      qx.event.Timer.once(function() {
        this.fireDataEvent("storage", data);
      }, this, 0);
    }
  },


  destruct: function()
  {
    this.clear();
    this._storage = null;

    if ((qx.core.Environment.get("engine.name") == "mshtml") &&
        (parseInt(qx.core.Environment.get("browser.documentmode")) < 9)) {
      qx.bom.Event.removeNativeListener(document, "storage", this._handleStorageEventBound);
    } else {
      qx.bom.Event.removeNativeListener(window, "storage", this._handleStorageEventBound);
    }
  }
});
