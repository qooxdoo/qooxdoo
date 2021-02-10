/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */

/**
 * This module offers a cross browser storage implementation. The API is aligned
 * with the API of the HTML web storage (http://www.w3.org/TR/webstorage/) which is
 * also the preferred implementation used. As fallback for IE < 8, we use user data.
 * If both techniques are unsupported, we supply a in memory storage, which is
 * of course, not persistent.
 */
qx.Bootstrap.define("qx.module.Storage", {
  statics :
  {
    /**
     * Store an item in the storage.
     *
     * @attachStatic {qxWeb, localStorage.setItem}
     * @param key {String} The identifier key.
     * @param value {var} The data, which will be stored as JSON.
     */
    setLocalItem : function(key, value) {
      qx.bom.Storage.getLocal().setItem(key, value);
    },


    /**
     * Returns the stored item.
     *
     * @attachStatic {qxWeb, localStorage.getItem}
     * @param key {String} The identifier to get the data.
     * @return {var} The stored data.
     */
    getLocalItem : function(key) {
      return qx.bom.Storage.getLocal().getItem(key);
    },


    /**
     * Removes an item form the storage.
     * @attachStatic {qxWeb, localStorage.removeItem}
     * @param key {String} The identifier.
     */
    removeLocalItem : function(key) {
      qx.bom.Storage.getLocal().removeItem(key);
    },


    /**
     * Returns the amount of key-value pairs stored.
     * @attachStatic {qxWeb, localStorage.getLength}
     * @return {Number} The length of the storage.
     */
    getLocalLength : function() {
      return qx.bom.Storage.getLocal().getLength();
    },


    /**
     * Returns the named key at the given index.
     * @attachStatic {qxWeb, localStorage.getKey}
     * @param index {Number} The index in the storage.
     * @return {String} The key stored at the given index.
     */
    getLocalKey : function(index) {
      return qx.bom.Storage.getLocal().getKey(index);
    },


    /**
     * Deletes every stored item in the storage.
     * @attachStatic {qxWeb, localStorage.clear}
     */
    clearLocal : function() {
      qx.bom.Storage.getLocal().clear();
    },


    /**
     * Helper to access every stored item.
     *
     * @attachStatic {qxWeb, localStorage.forEach}
     * @param callback {Function} A function which will be called for every item.
     *   The function will have two arguments, first the key and second the value
     *    of the stored data.
     * @param scope {var} The scope of the function.
     */
    forEachLocal : function(callback, scope) {
      qx.bom.Storage.getLocal().forEach(callback, scope);
    },


    /**
     * Store an item in the storage.
     *
     * @attachStatic {qxWeb, sessionStorage.setItem}
     * @param key {String} The identifier key.
     * @param value {var} The data, which will be stored as JSON.
     */
    setSessionItem : function(key, value) {
      qx.bom.Storage.getSession().setItem(key, value);
    },


    /**
     * Returns the stored item.
     *
     * @attachStatic {qxWeb, sessionStorage.getItem}
     * @param key {String} The identifier to get the data.
     * @return {var} The stored data.
     */
    getSessionItem : function(key) {
      return qx.bom.Storage.getSession().getItem(key);
    },


    /**
     * Removes an item form the storage.
     * @attachStatic {qxWeb, sessionStorage.removeItem}
     * @param key {String} The identifier.
     */
    removeSessionItem : function(key) {
      qx.bom.Storage.getSession().removeItem(key);
    },


    /**
     * Returns the amount of key-value pairs stored.
     * @attachStatic {qxWeb, sessionStorage.getLength}
     * @return {Number} The length of the storage.
     */
    getSessionLength : function() {
      return qx.bom.Storage.getSession().getLength();
    },


    /**
     * Returns the named key at the given index.
     * @attachStatic {qxWeb, sessionStorage.getKey}
     * @param index {Number} The index in the storage.
     * @return {String} The key stored at the given index.
     */
    getSessionKey : function(index) {
      return qx.bom.Storage.getSession().getKey(index);
    },


    /**
     * Deletes every stored item in the storage.
     * @attachStatic {qxWeb, sessionStorage.clear}
     */
    clearSession : function() {
      qx.bom.Storage.getSession().clear();
    },


    /**
     * Helper to access every stored item.
     *
     * @attachStatic {qxWeb, sessionStorage.forEach}
     * @param callback {Function} A function which will be called for every item.
     *   The function will have two arguments, first the key and second the value
     *    of the stored data.
     * @param scope {var} The scope of the function.
     */
    forEachSession : function(callback, scope) {
      qx.bom.Storage.getSession().forEach(callback, scope);
    }
  },


  defer : function(statics) {
    qxWeb.$attachStatic({
      "localStorage" : {
        setItem : statics.setLocalItem,
        getItem : statics.getLocalItem,
        removeItem : statics.removeLocalItem,
        getLength : statics.getLocalLength,
        getKey : statics.getLocalKey,
        clear : statics.clearLocal,
        forEach : statics.forEachLocal
      },
      "sessionStorage" : {
        setItem : statics.setSessionItem,
        getItem : statics.getSessionItem,
        removeItem : statics.removeSessionItem,
        getLength : statics.getSessionLength,
        getKey : statics.getSessionKey,
        clear : statics.clearSession,
        forEach : statics.forEachSession
      }
    });
  }
});