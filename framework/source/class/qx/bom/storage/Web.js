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
     * Martin Wittemann (wittemann)

************************************************************************ */

qx.Bootstrap.define("qx.bom.storage.Web", {
  statics : {
    __local : null,
    __session : null,

    getLocal : function() {
      if (this.__local) {
        return this.__local;
      }
      return this.__local = new qx.bom.storage.Web("local");
    },


    getSession : function() {
      if (this.__session) {
        return this.__session;
      }
      return this.__session = new qx.bom.storage.Web("session");
    }
  },

  construct : function(type) {
    this.__type = type;
  },


  members : {
    __type : null,

    getStorage : function() {
      return window[this.__type + "Storage"];
    },

    getLength : function() {
      return this.getStorage(this.__type).length;
    },


    setItem : function(key, value) {
      value = qx.lang.Json.stringify(value);
      try {
        this.getStorage(this.__type).setItem(key, value);
      } catch (e) {
        throw new Error("Storage full.");
      }
    },


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


    removeItem : function(key) {
      this.getStorage(this.__type).removeItem(key);
    },


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


    getKey : function(index) {
      return this.getStorage(this.__type).key(index);
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