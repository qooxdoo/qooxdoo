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
 * A wrapper of "qx.bom.request.Xhr" which adds on top:
 *  - set/get method, url, request data and headers at any time
 *  - retrieve the parsed response (content-type recognition)
 *  - more fine-grained events such as success, fail, ...
 *
 * <div class="desktop">
 * Example:
 *
 * <pre class="javascript">
 *   ...
 * </pre>
 * </div>
 *
 * @ignore(XDomainRequest)
 */
qx.Bootstrap.define("qx.bom.request.SimpleXhr",
{

  extend: Object,

  construct: function() {
    var transport = this._transport = this._createTransport();

    transport.onreadystatechange = qx.lang.Function.bind(this._onReadyStateChange, this);
    transport.onloadend = qx.lang.Function.bind(this._onLoadEnd, this);
    transport.ontimeout = qx.lang.Function.bind(this._onTimeout, this);
    transport.onerror = qx.lang.Function.bind(this._onError, this);
    transport.onabort = qx.lang.Function.bind(this._onAbort, this);

    qx.core.ObjectRegistry.register(this);
  },

  statics:
  {
    /**
     * {Map} Map of parser functions. Parsers defined here can be
     * referenced symbolically, e.g. with {@link #setParser}.
     *
     * Known parsers are: <code>"json"</code> and <code>"xml"</code>.
     */
    PARSER: {
      json: qx.lang.Json.parse,
      xml: qx.xml.Document.fromString
    }
  },

  members :
  {
    /*
    ---------------------------------------------------------------------------
      PUBLIC
    ---------------------------------------------------------------------------
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
     * Get a request header.
     *
     * @param key {String} Key of the header.
     * @return {String} The value of the header.
     */
    getRequestHeader: function(key) {
      return this.__requestHeaders[key];
    },

    /**
     *
     */
    setUrl: function(url) {
      if (qx.lang.Type.isString(url)) {
        this.__url = url;
      }
      return this;
    },

    /**
     *
     */
    getUrl: function() {
      return this.__url;
    },

    /**
     *
     */
    setMethod: function(method) {
      var knownMethods = ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS", "TRACE", "CONNECT", "PATCH"];
      if (qx.lang.Type.isString(method) && knownMethods.indexOf(method) !== -1) {
        this.__method = method;
      }
      return this;
    },

    /**
     *
     */
    getMethod: function() {
      return this.__method;
    },

    /**
     *
     */
    setRequestData: function(data) {
      if (qx.lang.Type.isString(data) || qx.lang.Type.isObject(data)) {
        this.__requestData = data;
      }
      return this;
    },

    /**
     *
     */
    getRequestData: function(asSerialized) {
      return (asSerialized) ? this._serializeData(this.__requestData) : this.__requestData;
    },

    /**
     *
     */
    getResponse: function() {
      if (this.__response !== null) {
        return this.__response;
      } else {
        return (this._transport.responseXML !== null) ? this._transport.responseXML : this._transport.responseText;
      }
    },

    /**
     * Get low-level transport.
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
     * Whether request completed (is done).
     */
    isDone: function() {
      return this._transport.readyState === qx.bom.request.Xhr.DONE;
    },

    /**
     * Return unique hash code of object
     *
     * @return {Integer} unique hash code of the object
     */
    toHashCode : function() {
      return this.$$hash;
    },

    /**
     *
     */
    isDisposed: function() {
      return this._transport.__disposed;
    },

    /**
     * Sends request.
     *
     * @return {qx.bom.request.SimpleXhr} Self for chaining.
     */
    send: function() {
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
     * Abort request.
     *
     * Cancels any network activity.
     * @return {qx.bom.request.SimpleXhr} Self for chaining.
     */
    abort: function() {
      this._transport.abort();
      return this;
    },

    /**
     * Dispose object and wrapped transport.
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

    _transport: null,

    /**
     * Create XHR transport.
     *
     * @return {qx.bom.request.Xhr} Transport.
     */
    _createTransport: function() {
      return new qx.bom.request.Xhr();
    },

    /**
     *
     */
    _setResponse: function(response) {
      this.__response = response;
    },

    /**
     * Serialize data
     *
     * @param data {String|Map} Data to serialize.
     * @return {String} Serialized data.
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
     * Request headers.
     */
    __requestHeaders: [],
    /**
     * Request data (i.e. body).
     */
    __requestData: null,
    /**
     * HTTP method to use for request.
     */
    __method: "",
    /**
     * Response data.
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
     * Add an event listener for the given event name which is executed only once.
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
     * Handle "readyStateChange" event.
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

      // Successful HTTP status
      if (qx.util.Request.isSuccessful(this._transport.status)) {

        // Parse response
        if (qx.core.Environment.get("qx.debug.io")) {
          qx.Bootstrap.debug("Response is of type: '" + this.getResponseContentType() + "'");
        }

        this._setResponse(this._getParsedResponse());

        this._transport._emit("success");

      // Erroneous HTTP status
      } else {

        try {
          this._setResponse(this._getParsedResponse());
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
     * Handle "loadEnd" event.
     */
    _onLoadEnd: function() {
      this._transport._emit("loadEnd");
    },

    /**
     * Handle "abort" event.
     */
    _onAbort: function() {
      this._transport._emit("abort");
    },

    /**
     * Handle "timeout" event.
     */
    _onTimeout: function() {
      this._transport._emit("timeout");

      // A network error failure
      this._transport._emit("fail");
    },

    /**
     * Handle "error" event.
     */
    _onError: function() {
      this._transport._emit("error");

      // A network error failure
      this._transport._emit("fail");
    },

    /*
    ---------------------------------------------------------------------------
      PARSING
    ---------------------------------------------------------------------------
    */

    /**
     * Returns response parsed with parser determined by
     * {@link #_getParser}.
     *
     * @return {String|Object} The parsed response of the request.
     */
    _getParsedResponse: function() {
      var response = this._transport.responseText,
          parser = this._getParser();

      if (typeof parser === "function") {
        if (response !== "") {
          return parser.call(this, response);
        }
      }

      return response;
    },

    /**
     * Set parser used to parse response once request has
     * completed successfully.
     *
     * Usually, the parser is correctly inferred from the
     * content type of the response. This method allows to force the
     * parser being used, e.g. if the content type returned from
     * the backend is wrong or the response needs special parsing.
     *
     * Parsers most typically used can be referenced symbolically.
     * To cover edge cases, a function can be given. When parsing
     * the response, this function is called with the raw response as
     * first argument.
     *
     * @param parser {String|Function}
     *
     *        <br>Can be:
     *
     *         * A parser defined in {@link qx.io.request.Xhr#PARSER},
     *           referenced by string.
     *
     *         * The function to invoke.
     *           Receives the raw response as argument.
     *
     * @return {Function} The parser function
     */
    setParser: function(parser) {
      var Xhr = qx.bom.request.SimpleXhr;

      // Symbolically given known parser
      if (typeof Xhr.PARSER[parser] === "function") {
        return this.__parser = Xhr.PARSER[parser];
      }

      // If parser is not a symbol, it must be a function
      if (qx.core.Environment.get("qx.debug")) {
        qx.core.Assert.assertFunction(parser);
      }

      return this.__parser = parser;
    },


    /**
     * Get the parser.
     *
     * If not defined explicitly using {@link #setParser},
     * the parser is inferred from the content type.
     *
     * Override this method to extend the list of content types
     * being handled.
     *
     * @return {Function|null} The parser function or <code>null</code> if the
     * content type is undetermined.
     *
     */
    _getParser: function() {
      var parser = this.__parser,
          contentType;

      // Use user-provided parser, if any
      if (parser) {
        return parser;
      }

      // Content type undetermined
      if (!this.isDone()) {
        return null;
      }

      // See http://restpatterns.org/Glossary/MIME_Type

      contentTypeOrig = this._transport.getResponseHeader("Content-Type") || "";

      // Ignore parameters (e.g. the character set)
      contentType = contentTypeOrig.replace(/;.*$/, "");

      if ((/^application\/(\w|\.)*\+?json$/).test(contentType)) {
        parser = qx.bom.request.SimpleXhr.PARSER["json"];
      }

      if ((/^application\/xml$/).test(contentType)) {
        parser = qx.bom.request.SimpleXhr.PARSER["xml"];
      }

      // Deprecated
      if ((/[^\/]+\/[^\+]+\+xml$/).test(contentTypeOrig)) {
        parser = qx.bom.request.SimpleXhr.PARSER["xml"];
      }

      return parser;
    }
  }
});
