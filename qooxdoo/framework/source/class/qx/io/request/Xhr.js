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
 *
 * Note: This class is going to replace {@link qx.io.HttpRequest} in a
 * future release.
 *
 * Send HTTP requests and handle responses. Configuration of the request
 * is done with properties. Events are fired for various states in the life
 * cycle of a request, such as "success". Request data is transparently
 * processed.
 *
 * Internally uses {@link qx.bom.request.Xhr} to abstract browser
 * inconsistencies in their implementation of XMLHttpRequest (or equivalent).
 * This means the HTTP status and other XHR properties can be safely queried
 * and events are fired consistently on all platforms. Moreover, the same
 * instance of this class can be efficiently used to repeatedly send many
 * requests.
 *
 */
qx.Class.define("qx.io.request.Xhr",
{
  extend: qx.core.Object,

  construct: function()
  {
    this.base(arguments);

    var transport = this.__transport = this._createTransport();

    this.__onReadyStateChangeBound = qx.lang.Function.bind(this.__onReadyStateChange, this);
    this.__onLoadBound = qx.lang.Function.bind(this.__onLoad, this);
    this.__onLoadEndBound = qx.lang.Function.bind(this.__onLoadEnd, this);
    this.__onAbortBound = qx.lang.Function.bind(this.__onAbort, this);
    this.__onTimeoutBound = qx.lang.Function.bind(this.__onTimeout, this);
    this.__onErrorBound = qx.lang.Function.bind(this.__onError, this);

    transport.onreadystatechange = this.__onReadyStateChangeBound;
    transport.onload = this.__onLoadBound;
    transport.onloadend = this.__onLoadEndBound;
    transport.onabort = this.__onAbortBound;
    transport.ontimeout = this.__onTimeoutBound;
    transport.onerror = this.__onErrorBound;
  },

  events:
  {
    /**
     * Fires on every change of the readyState.
     */
    "readystatechange": "qx.event.type.Event",

    /**
     * Fires when request is complete and HTTP status
     * indicates success.
     */
    "success": "qx.event.type.Event",

    /**
     * Fires when request is complete. Must not necessarily
     * have an HTTP status that indicates success.
     */
    "load": "qx.event.type.Event",

    /**
     * Fires when processing of request completes.
     * Fired even when e.g. a network failure occured.
     */
    "loadend": "qx.event.type.Event",

    /**
     * Fires when request was aborted.
     */
    "abort": "qx.event.type.Event",

    /**
     * Fires when request reached timeout limit.
     */
    "timeout": "qx.event.type.Event",

    /**
     * Fires when request could not complete
     * due to a network error.
     */
    "error": "qx.event.type.Event",

    /**
    * Fires on change of the parsed response
    */
    "changeResponse": "qx.event.type.Data"
  },

  properties:
  {
    /**
     * The HTTP method.
     */
    method: {
      check: [ "GET", "POST"],
      init: "GET"
    },

    /**
     * The URL of the resource to request.
     */
    url: {
      check: "String"
    },

    /**
     * Whether the request should be executed asynchronously.
     */
    async: {
      check: "Boolean",
      init: true
    },

    /**
     * Authenticate with username.
     */
    username: {
      check: "String",
      nullable: true
    },

    /**
     * Authenticate with password.
     */
    password: {
      check: "String",
      nullable: true
    },

    /**
     * Map of headers to be send as part of the request. Both
     * key and value are serialized to string.
     *
     * Note: Depending on the HTTP method used (e.g. POST),
     * additional headers may be set automagically.
     *
     */
    requestHeaders: {
      check: "Map",
      nullable: true
    },

    /**
     * The content type to accept. By default, every content type
     * is accepted.
     *
     * Note: Some backends send distinct representations of the same
     * resource depending on the content type accepted. For instance,
     * a backend may respond with either a JSON (the accept header
     * indicates so) or a HTML representation (the default, no accept
     * header given).
     */
    accept: {
      check: "String",
      nullable: true
    },

    /**
     * Timeout limit in seconds. Default (0) means no limit.
     */
    timeout: {
      check: "Number",
      nullable: true,
      init: 0
    },

    /**
     * Whether to allow request to be answered from cache.
     *
     * Allowed values:
     *
     * * <code>true</code>: Allow caching (Default)
     * * <code>false</code>: Prohibit caching. Appends nocache parameter to URL.
     * * <code>"force-validate"</code>: Force browser to submit request in order to
     *   validate freshness of resource. Sets HTTP header Cache-Control to "no-cache".
     *   Note: Should the resource be considered fresh after validation, the requested
     *   resource is still served from cache.
     */
    cache: {
      check: function(value) {
        return qx.lang.Type.isBoolean(value) ||
               value === "force-validate";
      },
      init: true
    },

    /**
     * Data to be send as part of the request.
     *
     * Supported types:
     *
     * * String
     * * Map
     * * qooxdoo Object
     *
     * For every supported type except strings, a URL encoded string
     * with unsafe characters escaped is internally generated and sent
     * with the request. However, if a string is given the user must make
     * sure it is properly formatted and escaped. See
     * {@link qx.lang.Object#toUriParameter}
     *
     */
    data: {
      check: function(value) {
        return qx.lang.Type.isString(value) ||
               qx.Class.isSubClassOf(value.constructor, qx.core.Object) ||
               qx.lang.Type.isObject(value);
      },
      nullable: true
    }
  },

  statics:
  {
    /**
     * Append string to query part of the URL. Respects
     * existing query.
     *
     * @param url {String} URL to append string to.
     * @param params {String} Parameters to append to URL.
     * @return {String} URL with string appended in query part.
     */
    appendParamsToUrl: function(url, params) {
      if (qx.core.Environment.get("qx.debug")) {
        if (!(qx.lang.Type.isString(params) || qx.lang.Type.isObject(params))) {
          qx.log.Logger.debug("param attribute must be either string or object");
          return;
        }
      }

      if (qx.lang.Type.isObject(params)) {
        params = qx.lang.Object.toUriParameter(params);
      }

      return url += (/\?/).test(url) ? "&" + params : "?" + params;
    }

  },

  members:
  {

    /*
    ---------------------------------------------------------------------------
      PRIVATE FIELDS
    ---------------------------------------------------------------------------
    */

    /**
     * Holds transport. Is instance of qx.bom.request.Xhr.
     */
    __transport: null,

    /**
     * Parsed response.
     */
    __response: null,

    /**
     * Bound handlers.
     */
    __onReadyStateChangeBound: null,
    __onLoadBound: null,
    __onLoadEndBound: null,
    __onAbortBound: null,
    __onTimeoutBound: null,
    __onErrorBound: null,

    /*
    ---------------------------------------------------------------------------
      PUBLIC
    ---------------------------------------------------------------------------
    */

    //
    // INTERACT WITH TRANSPORT
    //

    /**
    * Send request.
    *
    * Configure HTTP method, URL, data etc. by setting the corresponding
    * properties.
    *
    * Note: No network activity happens before
    * running this method.
    *
    */
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
          url = qx.io.request.Xhr.appendParamsToUrl(url, serializedData);
        }

        // Avoid duplication
        serializedData = null;
      }

      if (this.getCache() === false) {
        // Make sure URL cannot be served from cache and new request is made
        url = qx.io.request.Xhr.appendParamsToUrl(url, {nocache: new Date().valueOf()});
      }

      // Initialize request
      transport.open(method, url, async, username, password);

      // Align headers to configuration of instance
      if (this.getCache() === "force-validate") {
        // Force validation. See http://www.mnot.net/cache_docs/#CACHE-CONTROL.
        transport.setRequestHeader("Cache-Control", "no-cache");
      }

      if (method === "POST") {
        transport.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      }

      if (this.getAccept()) {
        transport.setRequestHeader("Accept", this.getAccept());
      }

      // User-provided headers
      this.__setRequestHeaders();

      // Set timeout
      transport.timeout = this.getTimeout() * 1000;

      // Send request
      transport.send(serializedData);
    },

    /**
     * Aborts the request. Cancels any network activity.
     */
    abort: function() {
      this.__transport.abort();
    },

    //
    // QUERY TRANSPORT
    //

    /**
     * Get ready state.
     *
     * States can be:
     * UNSENT:           0,
     * OPENED:           1,
     * HEADERS_RECEIVED: 2,
     * LOADING:          3,
     * DONE:             4
     *
     * @return {Number} Ready state.
     */
    getReadyState: function() {
      return this.__transport.readyState;
    },

    /**
     * Get HTTP status code.
     *
     * @return {Number} The HTTP status code.
     */
    getStatus: function() {
      return this.__transport.status;
    },

    /**
     * Get HTTP status text.
     *
     * @return {String} The HTTP status text.
     */
    getStatusText: function() {
      return this.__transport.statusText;
    },

    /**
     * Get raw (unprocessed) response.
     *
     * @return {String} The raw response of the request.
     */
    getResponseText: function() {
      return this.__transport.responseText;
    },

    /**
     * Get response.
     *
     * @return {String} The parsed response of the request.
     */
    getResponse: function() {
      return this.__response;
    },

    /**
     * Set response.
     *
     * @param response {String} The parsed response of the request.
     */
    __setResponse: function(response) {
      var oldResponse = response;

      if (this.__response !== response) {
        this.__response = response;
        this.fireEvent("changeResponse", qx.event.type.Data, [this.__response, oldResponse]);
      }
    },

    /**
     * Get all response headers from response.
     *
     * @return {String} All response headers.
     */
    getAllResponseHeaders: function() {
      return this.__transport.getAllResponseHeaders();
    },

    /**
     * Get a single response header from response.
     *
     * @param  header {String}
     *         Key of the header to get the value from.
     * @return {String}
     *         Response header.
     */
    getResponseHeader: function(header) {
      return this.__transport.getResponseHeader(header);
    },

    /**
     * Whether request completed (is done).
     */
    isDone: function() {
      return this.getReadyState() === 4;
    },

    /**
     * Whether request was successful.
     *
     * Request is successful if it is done and comes with an
     * HTTP status indicating success.
     */
    isSuccessful: function() {
      if (!this.isDone()) {
        return false;
      }

      var status = this.getStatus();
      return (status >= 200 && status < 300 || status === 304);
    },

    /*
    ---------------------------------------------------------------------------
      EVENT HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * Handle abstracted "readystatechange" event.
     */
    __onReadyStateChange: function() {
      this.fireEvent("readystatechange");

      if (this.isDone() && this.isSuccessful()) {

        // TODO: Parse response according to response mime type
        this.__setResponse(this.__transport.responseText);

        this.fireEvent("success");
      }
    },

    /**
     * Handle abstracted "load" event.
     */
    __onLoad: function() {
      this.fireEvent("load");
    },

    /**
     * Handle abstracted "loadend" event.
     */
    __onLoadEnd: function() {
      this.fireEvent("loadend");
    },

    /**
     * Handle abstracted "abort" event.
     */
    __onAbort: function() {
      this.fireEvent("abort");
    },

    /**
     * Handle abstracted "timeout" event.
     */
    __onTimeout: function() {
      this.fireEvent("timeout");
    },

    /**
     * Handle abstracted "error" event.
     */
    __onError: function() {
      this.fireEvent("error");
    },

    /*
    ---------------------------------------------------------------------------
      INTERNAL / HELPERS
    ---------------------------------------------------------------------------
    */

    /**
     * Create and return transport.
     *
     * @return {qx.bom.request.Xhr} Transport.
     */
    _createTransport: function() {
      return new qx.bom.request.Xhr();
    },

    /**
     * Serialize data
     *
     * @param data {String|Map|qx.core.Object} Data to serialize.
     * @return {String} Serialized data.
     */
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

    /**
     * Set request headers.
     */
    __setRequestHeaders: function() {
      var requestHeaders = this.getRequestHeaders();

      for (var key in requestHeaders) {
        if (requestHeaders.hasOwnProperty(key)) {
          this.__transport.setRequestHeader(key, requestHeaders[key]);
        }
      }
    }

  },

  destruct: function()
  {
    var transport = this.__transport,
        noop = function() {};

    if (this.__transport) {
      transport.onreadystatechange = transport.onload = transport.onloadend =
      transport.onabort = transport.ontimeout = transport.onerror = noop;

      transport.dispose();
    }
  }
});
