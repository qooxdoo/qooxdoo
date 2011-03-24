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
     * Tristan Koch (tristankoch)

************************************************************************ */

qx.Class.define("qx.io.request.Xhr",
{
  extend: qx.core.Object,

  construct: function()
  {
    this.base(arguments);

    this.__transport = this._createTransport();
  },

  properties:
  {
    method: {
      check: [ "GET", "POST"],
      init: "GET"
    },

    url: {
      check: "String"
    },

    async: {
      check: "Boolean",
      init: true
    },

    username: {
      check: "String",
      nullable: true
    },

    password: {
      check: "String",
      nullable: true
    },

    data: {
      check: function(value) {
        return qx.lang.Type.isString(value) || 
               qx.Class.isSubClassOf(value.constructor, qx.core.Object) ||
               qx.lang.Type.isObject(value)
      },
      nullable: true
    }
  },

  members:
  {
    __transport: null,

    send: function() {
      var method = this.getMethod(),
          url = this.getUrl(),
          async = this.getAsync(),
          username = this.getUsername(),
          password = this.getPassword(),
          data = this.getData();

      var serializedData = this.__serializeData(data);

      if (method == "GET") {
        // Add data to query string
        if (serializedData) {
          url = url + "?" + serializedData;
        }

        // Avoid duplication
        serializedData = null;
      }

      this.__transport.open(method, url, async, username, password);
      this.__transport.send(serializedData);
    },

    _createTransport: function() {
      return new qx.bom.request.Xhr();
    },

    __serializeData: function(data) {
      var isPost = this.getMethod() == "POST";
      
      if (!data) {
        return;
      }

      if (qx.lang.Type.isString(data)) {
        return data;
      }

      if (qx.Class.isSubClassOf(data.constructor, qx.core.Object)) {
        return qx.util.Serializer.toUriParameter(data);
      }

      if (qx.lang.Type.isObject(data)) {
        return qx.lang.Object.toUriParameter(data, isPost);
      }
    }

  }
});
