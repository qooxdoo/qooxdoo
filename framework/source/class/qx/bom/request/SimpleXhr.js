/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Richard Sternagel (rsternagel)

************************************************************************ */

/**
 * A wrapper of "qx.bom.request.Xhr" which offers:
 *  - set/get HTTP method, URL, request data and headers
 *  - retrieve the parsed response as object (content-type recognition)
 *  - more fine-grained events such as success, fail, ...
 *  - supports hash code for request identification
 *
 * It does *not* comply the interface defined by qx.bom.request.IRequest.
 *
 * <div class="desktop">
 * Example:
 *
 * <pre class="javascript">
 *  var req = new qx.bom.request.SimpleXhr("/some/path/file.json");
 *  req.setRequestData({"a":"b"});
 *  req.once("success", function successHandler() {
 *    var response = req.getResponse();
 *  }, this);
 *  req.once("fail", function successHandler() {
 *    var response = req.getResponse();
 *  }, this);
 *  req.send();
 * </pre>
 * </div>
 */
qx.Bootstrap.define("qx.bom.request.SimpleXhr",
{

  extend: Object,

  /**
   * @param url {String?} The URL of the resource to request.
   * @param method {String?"GET"} The HTTP method.
   */
  construct: function(url, method) {
    if (url !== undefined) {
      this.setUrl(url);
    }

    this.setMethod((method !== undefined) ? method : "GET");

    var transport = this._transport = this._createTransport();

    transport.onreadystatechange = qx.lang.Function.bind(this._onReadyStateChange, this);
    transport.onloadend = qx.lang.Function.bind(this._onLoadEnd, this);
    transport.ontimeout = qx.lang.Function.bind(this._onTimeout, this);
    transport.onerror = qx.lang.Function.bind(this._onError, this);
    transport.onabort = qx.lang.Function.bind(this._onAbort, this);

    qx.core.ObjectRegistry.register(this);

    this.__requestHeaders = [];
    this.__parser = this._createResponseParser();
  },

  members :
  {
    /*
    ---------------------------------------------------------------------------
      PUBLIC
    ---------------------------------------------------------------------------
    */

    /**
     * Sets a request header.
     *
     * @param key {String} Key of the header.
     * @param value {String} Value of the header.
     * @return {qx.bom.request.SimpleXhr} Self for chaining.
     */
    setRequestHeader: function(key, value) {
      this._transport.__checkDisposed();

      // Detect conditional requests
      if (key == "If-Match" || key == "If-Modified-Since" ||
        key == "If-None-Match" || key == "If-Range") {
        this._transport.__conditional = true;
      }

      this.__requestHeaders[key] = value;
      return this;
    },

    /**
     * Gets a request header.
     *
     * @param key {String} Key of the header.
     * @return {String} The value of the header.
     */
    getRequestHeader: function(key) {
      return this.__requestHeaders[key];
    },

    /**
     * Sets the URL.
     *
     * @param url {String} URL to be requested.
     * @return {qx.bom.request.SimpleXhr} Self for chaining.
     */
    setUrl: function(url) {
      if (qx.lang.Type.isString(url)) {
        this.__url = url;
      }
      return this;
    },

    /**
     * Gets the URL.
     *
     * @return {String} URL to be requested.
     */
    getUrl: function() {
      return this.__url;
    },

    /**
     * Sets the HTTP-Method.
     *
     * @param method {String} The method.
     * @return {qx.bom.request.SimpleXhr} Self for chaining.
     */
    setMethod: function(method) {
      var knownMethods = ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS", "TRACE", "CONNECT", "PATCH"];
      if (qx.lang.Type.isString(method) && knownMethods.indexOf(method) !== -1) {
        this.__method = method;
      }
      return this;
    },

    /**
     * Gets the HTTP-Method.
     *
     * @return {String} The method.
     */
    getMethod: function() {
      return this.__method;
    },

    /**
     * Sets the request data to be send as part of the request.
     *
     * The request data is transparently included as URL query parameters or embedded in the
     * request body as form data.
     *
     * If a string is given the user must make sure it is properly formatted and
     * escaped. See {@link qx.lang.Object#toUriParameter}.
     *
     * @param data {String|Object} The request data.
     * @return {qx.bom.request.SimpleXhr} Self for chaining.
     */
    setRequestData: function(data) {
      if (qx.lang.Type.isString(data) || qx.lang.Type.isObject(data)) {
        this.__requestData = data;
      }
      return this;
    },

    /**
     * Gets the request data (optionally serialized).
     *
     * @param asSerialized {Boolean} Whether the request data should be serialized.
     * @return {String} The serialized data.
     */
    getRequestData: function(asSerialized) {
      return (asSerialized) ? this._serializeData(this.__requestData) : this.__requestData;
    },

    /**
     * Gets parsed response.
     *
     * @return {String} The parsed response of the request.
     */
    getResponse: function() {
      if (this.__response !== null) {
        return this.__response;
      } else {
        return (this._transport.responseXML !== null) ? this._transport.responseXML : this._transport.responseText;
      }
    },

    /**
     * Gets low-level transport.
     *
     * Note: To be used with caution!
     *
     * This method can be used to query the transport directly,
     * but should be used with caution. Especially, it
     * is not advisable to call any destructive methods
     * such as <code>open</code> or <code>send</code>.
     *
     * @return {Object} An instance of a class found in
     *  <code>qx.bom.request.*</code>
     */
     // This method mainly exists so that some methods found in the
     // low-level transport can be deliberately omitted here,
     // but still be accessed should it be absolutely necessary.
     //
     // Valid use cases include to query the transport’s responseXML
     // property if performance is critical and any extra parsing
     // should be avoided at all costs.
     //
    getTransport: function() {
      return this._transport;
    },

    /**
     * Gets the response parser.
     *
     * @return {Object?qx.util.ResponseParser}
     */
    getParser: function() {
      return this.__parser;
    },

    /**
     * Sets (i.e. override) the parser for the response parsing.
     *
     * @return {qx.bom.request.SimpleXhr} Self for chaining.
     */
    setParser: function(parser) {
      this.__parser = parser;
      return this;
    },

    /**
     * Whether request completed (is done).

     * @return {Boolean} Whether request is completed.
     */
    isDone: function() {
      return this._transport.readyState === qx.bom.request.Xhr.DONE;
    },

    /**
     * Returns unique hash code of object.
     *
     * @return {Integer} unique hash code of the object
     */
    toHashCode : function() {
      return this.$$hash;
    },

    /**
     * Returns true if the object is disposed.
     *
     * @return {Boolean} Whether the object has been disposed
     */
    isDisposed: function() {
      return this._transport.__disposed;
    },

    /**
     * Sends request.
     *
     * Relies on set before:
     * * a HTTP method
     * * an URL
     * * optional request headers
     * * optional request data
     */
    send: function() {
      // add GET params if needed
      if (this.getMethod() === "GET" && this.getRequestData() !== null) {
        this.setUrl(qx.util.Uri.appendParamsToUrl(this.getUrl(), this.getRequestData(true)));
      }

      // initialize request
      this._transport.open(this.getMethod(), this.getUrl(), true);

      // set all previously stored headers on initialized request
      for (var key in this.__requestHeaders) {
        this._transport.__nativeXhr.setRequestHeader(key, this.__requestHeaders[key]);
      }

      // send
      if (this.getMethod() === "GET") {
        this._transport.send();
      } else {
        this._transport.send(this.getRequestData(true));
      }
    },

    /**
     * Aborts request.
     *
     * Cancels any network activity.
     * @return {qx.bom.request.SimpleXhr} Self for chaining.
     */
    abort: function() {
      this._transport.abort();
      return this;
    },

    /**
     * Disposes object and wrapped transport.
     * @return {Boolean} <code>true</code> if the object was successfully disposed
     */
    dispose: function() {
      this.__parser = null;
      return this._transport.dispose();
    },

    /*
    ---------------------------------------------------------------------------
      PROTECTED
    ---------------------------------------------------------------------------
    */

    /**
     * Holds transport.
     */
    _transport: null,

    /**
     * Creates XHR transport.
     *
     * @return {qx.bom.request.Xhr} Transport.
     */
    _createTransport: function() {
      return new qx.bom.request.Xhr();
    },

    /**
     * Creates response parser.
     *
     * @return {qx.util.ResponseParser} parser.
     */
    _createResponseParser: function() {
        return new qx.util.ResponseParser();
    },

    /**
     * Sets the response.
     *
     * @param response {String} The parsed response of the request.
     */
    _setResponse: function(response) {
      this.__response = response;
    },

    /**
     * Serializes data.
     *
     * @param data {String|Map} Data to serialize.
     * @return {String|undefined} Serialized data.
     */
    _serializeData: function(data) {
      var isPost = this.getMethod() === "POST";

      if (!data) {
        return;
      }

      if (qx.lang.Type.isString(data)) {
        return data;
      }

      if (qx.lang.Type.isObject(data)) {
        return qx.util.Uri.toParameter(data, isPost);
      }
    },


    /*
    ---------------------------------------------------------------------------
      PRIVATE
    ---------------------------------------------------------------------------
    */

    /**
     * {Array} Request headers.
     */
    __requestHeaders: null,
    /**
     * {Object} Request data (i.e. body).
     */
    __requestData: null,
    /**
     * {String} HTTP method to use for request.
     */
    __method: "",
    /**
     * {String} Requested URL.
     */
    __url: "",
    /**
     * {Object} Response data.
     */
    __response: null,
    /**
     * {Function} Parser.
     */
    __parser: null,

    /*
    ---------------------------------------------------------------------------
      EVENT HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * Adds an event listener for the given event name which is executed only once.
     *
     * @param name {String} The name of the event to listen to.
     * @param listener {Function} The function to execute when the event is fired
     * @param ctx {var?} The context of the listener.
     * @return {qx.bom.request.Xhr} Self for chaining.
     */
    once: function(name, listener, ctx) {
      this._transport._emitter.once(name, listener, ctx);
      return this;
    },

    /**
     * Handles "readyStateChange" event.
     */
    _onReadyStateChange: function() {
      if (qx.core.Environment.get("qx.debug.io")) {
        qx.Bootstrap.debug("Fire readyState: " + this._transport.readyState);
      }

      if (this.isDone()) {
        this.__onReadyStateDone();
      }
    },

    /**
     * Called internally when readyState is DONE.
     */
    __onReadyStateDone: function() {
      if (qx.core.Environment.get("qx.debug.io")) {
        qx.Bootstrap.debug("Request completed with HTTP status: " + this._transport.status);
      }

      var response = this._transport.responseText;
      var contentType = this._transport.getResponseHeader("Content-Type");

      // Successful HTTP status
      if (qx.util.Request.isSuccessful(this._transport.status)) {

        // Parse response
        if (qx.core.Environment.get("qx.debug.io")) {
          qx.Bootstrap.debug("Response is of type: '" + this.getResponseContentType() + "'");
        }

        this._setResponse(this.__parser.parse(response, contentType));

        this._transport._emit("success");

      // Erroneous HTTP status
      } else {

        try {
          this._setResponse(this.__parser.parse(response, contentType));
        } catch (e) {
          // ignore if it does not work
        }

        // A remote error failure
        if (this._transport.status !== 0) {
          this._transport._emit("fail");
        }
      }
    },

    /**
     * Handles "loadEnd" event.
     */
    _onLoadEnd: function() {
      this._transport._emit("loadEnd");
    },

    /**
     * Handles "abort" event.
     */
    _onAbort: function() {
      this._transport._emit("abort");
    },

    /**
     * Handles "timeout" event.
     */
    _onTimeout: function() {
      this._transport._emit("timeout");

      // A network error failure
      this._transport._emit("fail");
    },

    /**
     * Handles "error" event.
     */
    _onError: function() {
      this._transport._emit("error");

      // A network error failure
      this._transport._emit("fail");
    }

  }
});
