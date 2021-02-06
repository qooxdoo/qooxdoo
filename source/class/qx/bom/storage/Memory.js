/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */

/**
 * Fallback storage implementation which offers the same API as every other storage
 * but is not persistent. Basically, its just a storage API on a JavaScript map.
 *
 * @require(qx.bom.storage.Memory#getLength)
 * @require(qx.bom.storage.Memory#setItem)
 * @require(qx.bom.storage.Memory#getItem)
 * @require(qx.bom.storage.Memory#removeItem)
 * @require(qx.bom.storage.Memory#clear)
 * @require(qx.bom.storage.Memory#getKey)
 * @require(qx.bom.storage.Memory#forEach)
 */
qx.Bootstrap.define("qx.bom.storage.Memory", {
  statics : {
    __local : null,
    __session : null,

    /**
     * Returns an instance of {@link qx.bom.storage.Memory} which is of course
     * not persisted on reload.
     * @return {qx.bom.storage.Memory} A memory storage.
     */
    getLocal : function() {
      if (this.__local) {
        return this.__local;
      }
      return this.__local = new qx.bom.storage.Memory();
    },


    /**
     * Returns an instance of {@link qx.bom.storage.Memory} which is of course
     * not persisted on reload.
     * @return {qx.bom.storage.Memory} A memory storage.
     */
    getSession : function() {
      if (this.__session) {
        return this.__session;
      }
      return this.__session = new qx.bom.storage.Memory();
    }
  },


  construct : function() {
    this.__storage = {};
  },


  members : {
    __storage : null,


    /**
     * Returns the internal used map.
     * @return {Map} The storage.
     * @internal
     */
    getStorage : function() {
      return this.__storage;
    },


    /**
     * Returns the amount of key-value pairs stored.
     * @return {Integer} The length of the storage.
     */
    getLength : function() {
      return Object.keys(this.__storage).length;
    },


    /**
     * Store an item in the storage.
     *
     * @param key {String} The identifier key.
     * @param value {var} The data, which will be stored as JSON.
     */
    setItem : function(key, value) {
      value = qx.lang.Json.stringify(value);
      this.__storage[key] = value;
    },


    /**
     * Returns the stored item.
     *
     * @param key {String} The identifier to get the data.
     * @return {var} The stored data.
     */
    getItem : function(key) {
      var item = this.__storage[key];

      if (qx.lang.Type.isString(item)) {
        item = qx.lang.Json.parse(item);
      }
      return item;
    },


    /**
     * Removes an item form the storage.
     * @param key {String} The identifier.
     */
    removeItem : function(key) {
      delete this.__storage[key];
    },


    /**
     * Deletes every stored item in the storage.
     */
    clear : function() {
      this.__storage = {};
    },


    /**
     * Returns the named key at the given index.
     * @param index {Integer} The index in the storage.
     * @return {String} The key stored at the given index.
     */
    getKey : function(index) {
      var keys = Object.keys(this.__storage);
      return keys[index];
    },


    /**
     * Helper to access every stored item.
     *
     * @param callback {Function} A function which will be called for every item.
     *   The function will have two arguments, first the key and second the value
     *    of the stored data.
     * @param scope {var} The scope of the function.
     */
    forEach : function(callback, scope) {
      var length = this.getLength();
      for (var i = 0; i < length; i++) {
        var key = this.getKey(i);
        callback.call(scope, key, this.getItem(key));
      }
    }
  }
});
