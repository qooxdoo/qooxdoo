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

/* ************************************************************************
#require(qx.bom.request.Script#open)
#require(qx.bom.request.Script#on)
#require(qx.bom.request.Script#onreadystatechange)
#require(qx.bom.request.Script#onload)
#require(qx.bom.request.Script#onloadend)
#require(qx.bom.request.Script#onerror)
#require(qx.bom.request.Script#onabort)
#require(qx.bom.request.Script#ontimeout)
#require(qx.bom.request.Script#send)
************************************************************************ */

/**
 * A special script loader handling JSONP responses. Automatically
 * provides callbacks and populates responseJson property.
 *
 * Example:
 *
 * <pre class="javascript">
 *  var req = new qx.bom.request.Jsonp();
 *
 *  // Some services have a fixed callback name
 *  // req.setCallbackName("callback");
 *
 *  req.onload = function() {
 *    // Handle data received
 *    req.responseJson;
 *  }
 *
 *  req.open("GET", url);
 *  req.send();
 * </pre>
 */
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
    /**
     * {Object} Parsed JSON response.
     */
    responseJson: null,

    /**
     * {Number} Identifier of this instance.
     */
    __id: null,

    /**
     * {String} Callback parameter.
     */
    __callbackParam: null,

    /**
     * {String} Callback name.
     */
    __callbackName: null,

    /**
     * {Boolean} Whether callback was called.
     */
    __callbackCalled: null,

    /**
     * {Boolean} Whether a custom callback was created automatically.
     */
    __customCallbackCreated: null,

    /**
     * {Boolean} Whether request was disposed.
     */
    __disposed: null,

    /** Prefix used for the internal callback name. */
    __prefix : "",

    /**
     * Initializes (prepares) request.
     *
     * @param method {String}
     *   The HTTP method to use.
     *   This parameter exists for compatibility reasons. The script transport
     *   does not support methods other than GET.
     * @param url {String}
     *   The URL to which to send the request.
     */
    open: function(method, url) {
      if (this.__disposed) {
        return;
      }

      var query = {},
          callbackParam,
          callbackName,
          that = this;

      // Reset properties that may have been set by previous request
      this.responseJson = null;
      this.__callbackCalled = false;

      callbackParam = this.__callbackParam || "callback";
      callbackName = this.__callbackName || this.__prefix +
        "qx.bom.request.Jsonp[" + this.__id + "].callback";

      // Default callback
      if (!this.__callbackName) {

        // Store globally available reference to this object
        this.constructor[this.__id] = this;

      // Custom callback
      } else {

        // Dynamically create globally available callback (if it does not
        // exist yet) with user defined name. Delegate to this object’s
        // callback method.
        if (!window[this.__callbackName]) {
          this.__customCallbackCreated = true;
          window[this.__callbackName] = function(data) {
            that.callback(data);
          };
        } else {
          if (qx.core.Environment.get("qx.debug.io")) {
            qx.Bootstrap.debug(qx.bom.request.Jsonp, "Callback " +
              this.__callbackName + " already exists");
          }
        }

      }

      if (qx.core.Environment.get("qx.debug.io")) {
        qx.Bootstrap.debug(qx.bom.request.Jsonp,
          "Expecting JavaScript response to call: " + callbackName);
      }

      query[callbackParam] = callbackName;
      url = qx.util.Uri.appendParamsToUrl(url, query);

      this.__callBase("open", [method, url]);
    },

    /**
     * Callback provided for JSONP response to pass data.
     *
     * Called internally to populate responseJson property
     * and indicate successful status.
     *
     * Note: If you write a custom callback you’ll need to call
     * this method in order to notify the request about the data
     * loaded. Writing a custom callback should not be necessary
     * in most cases.
     *
     * @param data {Object} JSON
     */
    callback: function(data) {
      if (this.__disposed) {
        return;
      }

      // Signal callback was called
      this.__callbackCalled = true;

      // Sanitize and parse
      if (qx.core.Environment.get("qx.debug")) {
        data = qx.lang.Json.stringify(data);
        data = qx.lang.Json.parse(data);
      }

      // Set response
      this.responseJson = data;

      // Delete global reference to this
      this.constructor[this.__id] = undefined;

      this.__deleteCustomCallback();
    },

    /**
     * Set callback parameter.
     *
     * Some JSONP services expect the callback name to be passed labeled with a
     * special URL parameter key, e.g. "jsonp" in "?jsonp=myCallback". The
     * default is "callback".
     *
     * @param param {String} Name of the callback parameter.
     * @return {qx.bom.request.Jsonp} Self reference for chaining.
     */
    setCallbackParam: function(param) {
      this.__callbackParam = param;
      return this;
    },


    /**
     * Set callback name.
     *
     * Must be set to the name of the callback function that is called by the
     * script returned from the JSONP service. By default, the callback name
     * references this instance’s {@link #callback} method, allowing to connect
     * multiple JSONP responses to different requests.
     *
     * If the JSONP service allows to set custom callback names, it should not
     * be necessary to change the default. However, some services use a fixed
     * callback name. This is when setting the callbackName is useful. A
     * function is created and made available globally under the given name.
     * The function receives the JSON data and dispatches it to this instance’s
     * {@link #callback} method. Please note that this function is only created
     * if it does not exist before.
     *
     * @param name {String} Name of the callback function.
     * @return {qx.bom.request.Jsonp} Self reference for chaining.
     */
    setCallbackName: function(name) {
      this.__callbackName = name;
      return this;
    },


    /**
     * Set the prefix used in front of 'qx.' in case 'qx' is not available
     * (for qx.Website e.g.)
     * @internal
     * @param prefix {String} The prefix to put in front of 'qx'
     */
    setPrefix : function(prefix) {
      this.__prefix = prefix;
    },


    dispose: function() {
      // In case callback was not called
      this.__deleteCustomCallback();

      this.__callBase("dispose");
    },

    /**
     * Handle native load.
     */
    _onNativeLoad: function() {

      // Indicate erroneous status (500) if callback was not called.
      //
      // Why 500? 5xx belongs to the range of server errors. If the callback was
      // not called, it is assumed the server failed to provide an appropriate
      // response. Since the exact reason of the error is unknown, the most
      // generic message ("500 Internal Server Error") is chosen.
      this.status = this.__callbackCalled ? 200 : 500;

      this.__callBase("_onNativeLoad");
    },

    /**
     *  Delete custom callback if dynamically created before.
     */
    __deleteCustomCallback: function() {
      if (this.__customCallbackCreated && window[this.__callbackName]) {
        window[this.__callbackName] = undefined;
        this.__customCallbackCreated = false;
      }
    },

    /**
     * Call overriden method.
     *
     * @param method {String} Name of the overriden method.
     * @param args {Array} Arguments.
     */
    __callBase: function(method, args) {
      qx.bom.request.Script.prototype[method].apply(this, args || []);
    },

    /**
     * Generate ID.
     */
    __generateId: function() {
      // Add random digits to date to allow immediately following requests
      // that may be send at the same time
      this.__id = (new Date().valueOf()) + ("" + Math.random()).substring(2,5);
    }
  }
});
