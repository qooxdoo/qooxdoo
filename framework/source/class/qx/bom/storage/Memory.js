/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Martin Wittemann (wittemann)

************************************************************************ */

qx.Bootstrap.define("qx.bom.storage.Memory", {
  statics : {
    __local : null,
    __session : null,

    getLocal : function() {
      if (this.__local) {
        return this.__local;
      }
      return this.__local = new qx.bom.storage.Memory();
    },


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
     * @internal
     */
    getStorage : function() {
      return this.__storage;
    },


    getLength : function() {
      return qx.Bootstrap.getKeys(this.__storage).length;
    },


    setItem : function(key, value) {
      value = qx.lang.Json.stringify(value);
      this.__storage[key] = value;
    },


    getItem : function(key) {
      var item = this.__storage[key];

      if (qx.lang.Type.isString(item)) {
        item = qx.lang.Json.parse(item);
      }
      return item;
    },


    removeItem : function(key) {
      delete this.__storage[key];
    },


    clear : function() {
      this.__storage = {};
    },


    getKey : function(index) {
      var keys = qx.Bootstrap.getKeys(this.__storage);
      return keys[index];
    },


    iterate : function(callback, scope) {
      var length = this.getLength();
      for (var i = 0; i < length; i++) {
        var key = this.getKey(i);
        callback.call(scope, key, this.getItem(key));
      }
    }
  }
});