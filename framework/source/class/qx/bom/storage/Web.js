/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */

/**
 * Storage implementation using HTML web storage:
 * http://www.w3.org/TR/webstorage/
 *
 * @require(qx.bom.storage.Web#getLength)
 * @require(qx.bom.storage.Web#setItem)
 * @require(qx.bom.storage.Web#getItem)
 * @require(qx.bom.storage.Web#removeItem)
 * @require(qx.bom.storage.Web#clear)
 * @require(qx.bom.storage.Web#getKey)
 * @require(qx.bom.storage.Web#forEach)
 */
qx.Bootstrap.define("qx.bom.storage.Web", {
  statics : {
    __local : null,
    __session : null,

    /**
     * Static accessor for the local storage.
     * @return {qx.bom.storage.Web} An instance of a local storage.
     */
    getLocal : function() {
      if (this.__local) {
        return this.__local;
      }
      return this.__local = new qx.bom.storage.Web("local");
    },


    /**
     * Static accessor for the session storage.
     * @return {qx.bom.storage.Web} An instance of a session storage.
     */
    getSession : function() {
      if (this.__session) {
        return this.__session;
      }
      return this.__session = new qx.bom.storage.Web("session");
    }
  },


  /**
   * Create a new instance. Usually, you should take the static
   * accessors to get your instance.
   *
   * @param type {String} type of storage, either
   *   <code>local</code> or <code>session</code>.
   */
  construct : function(type) {
    this.__type = type;
  },


  members : {
    __type : null,


    /**
     * Returns the internal used storage (the native object).
     *
     * @internal
     * @return {Storage} The native storage implementation.
     */
    getStorage : function() {
      return window[this.__type + "Storage"];
    },


    /**
     * Returns the amount of key-value pairs stored.
     * @return {Integer} The length of the storage.
     */
    getLength : function() {
      return this.getStorage(this.__type).length;
    },


    /**
     * Store an item in the storage.
     *
     * @param key {String} The identifier key.
     * @param value {var} The data, which will be stored as JSON.
     */
    setItem : function(key, value) {
      value = qx.lang.Json.stringify(value);
      try {
        this.getStorage(this.__type).setItem(key, value);
      } catch (e) {
        throw new Error("Storage full.");
      }
    },


    /**
     * Returns the stored item.
     *
     * @param key {String} The identifier to get the data.
     * @return {var} The stored data.
     */
    getItem : function(key) {
      var item = this.getStorage(this.__type).getItem(key);

      if (qx.lang.Type.isString(item)) {
        item = qx.lang.Json.parse(item);
      // special case for FF3
      } else if (item && item.value && qx.lang.Type.isString(item.value)) {
        item = qx.lang.Json.parse(item.value);
      }

      return item;
    },


    /**
     * Removes an item form the storage.
     * @param key {String} The identifier.
     */
    removeItem : function(key) {
      this.getStorage(this.__type).removeItem(key);
    },


    /**
     * Deletes every stored item in the storage.
     */
    clear : function() {
      var storage = this.getStorage(this.__type);
      if (!storage.clear) {
        for (var i = storage.length - 1; i >= 0; i--) {
          storage.removeItem(storage.key(i));
        }
      } else {
        storage.clear();
      }
    },


    /**
     * Returns the named key at the given index.
     * @param index {Integer} The index in the storage.
     * @return {String} The key stored at the given index.
     */
    getKey : function(index) {
      return this.getStorage(this.__type).key(index);
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
