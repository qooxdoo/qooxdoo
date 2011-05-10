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

qx.Bootstrap.define("qx.bom.request.Jsonp",
{
  extend : qx.bom.request.Script,

  construct : function()
  {
    // Borrow super-class constructor
    qx.bom.request.Script.apply(this);

    this.__generateId();
  },

  members :
  {
    responseJson: null,

    __id: null,
    __callbackParam: null,
    __callbackName: null,
    __disposed: null,

    open: function(method, url) {
      if (this.__disposed) {
        return;
      }

      var query = {},
          callbackParam,
          callbackName;

      callbackParam = this.__callbackParam || "callback";
      callbackName = this.__callbackName ||
        "qx.bom.request.Jsonp[" + this.__id + "].callback";

      // Callback this object's callback method
      //
      // User-defined callbacks must be handled by the user
      if (!this.__callbackName) {
        this.constructor[this.__id] = this;
      }

      if (qx.core.Environment.get("qx.debug.io")) {
        qx.Bootstrap.debug(qx.bom.request.Jsonp,
          "Expecting JavaScript response to call: " + callbackName);
      }

      query[callbackParam] = callbackName;
      url = qx.util.Uri.appendParamsToUrl(url, query);

      this.__callBase("open", [method, url]);
    },

    callback: function(data) {
      if (this.__disposed) {
        return;
      }

      // Signal callback was called
      this.callback.called = true;

      // Sanitize and parse
      if (qx.core.Environment.get("qx.debug")) {
        data = qx.lang.Json.stringify(data);
        data = qx.lang.Json.parse(data);
      }

      // Set response
      this.responseJson = data;

      // Delete reference to this
      delete this.constructor[this.__id];
    },

    setCallbackParam: function(param) {
      this.__callbackParam = param;
    },

    setCallbackName: function(name) {
      this.__callbackName = name;
    },

    _onNativeLoad: function() {

      // Flag error if callback not called
      this._error = !this.callback.called;

      this.__callBase("_onNativeLoad");
    },

    __callBase: function(method, args) {
      qx.bom.request.Script.prototype[method].apply(this, args || []);
    },

    __generateId: function() {
      // Add random digits to date to allow immediately following requests
      // that may be send at the same time
      this.__id = (new Date().valueOf()) + ("" + Math.random()).substring(2,5);
    }
  }
});
