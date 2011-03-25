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

/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 */
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

    requestHeaders: {
      check: "Map",
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

  statics:
  {
    appendDataToUrl: function(url, data) {
      return url += /\?/.test(url) ? "&" + data : "?" + data;
    }
  },

  members:
  {
    __transport: null,

    send: function() {
      var transport = this.__transport,
          method = this.getMethod(),
          url = this.getUrl(),
          async = this.getAsync(),
          username = this.getUsername(),
          password = this.getPassword(),
          data = this.getData();

      var serializedData = this.__serializeData(data);

      // Drop fragment (anchor) from URL as per
      // http://www.w3.org/TR/XMLHttpRequest/#the-open-method
      if (/\#/.test(url)) {
        url = url.replace(/\#.*/, "");
      }

      if (method === "GET") {
        if (serializedData) {
          url = qx.io.request.Xhr.appendDataToUrl(url, serializedData);
        }

        // Avoid duplication
        serializedData = null;
      }

      // Initialize request
      transport.open(method, url, async, username, password);

      // Set headers
      this.__setRequestHeaders();
      if (method === "POST") {
        transport.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      }

      // Send request
      transport.send(serializedData);
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
    },

    __setRequestHeaders: function() {
      var requestHeaders = this.getRequestHeaders();

      for (var key in requestHeaders) {
        if (requestHeaders.hasOwnProperty(key)) {
          this.__transport.setRequestHeader(key, requestHeaders[key]);
        }
      }
    }

  }
});
