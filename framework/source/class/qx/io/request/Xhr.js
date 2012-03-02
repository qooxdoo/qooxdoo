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
 * Send HTTP requests and handle responses using the HTTP client API.
 *
 * Configuration of the request is done with properties. Events are fired for
 * various states in the life cycle of a request, such as "success". Request
 * data is transparently processed.
 *
 * Here is how to request a JSON file and listen to the "success" event:
 *
 * <pre class="javascript">
 * var req = new qx.io.request.Xhr("/some/path/file.json");
 *
 * req.addListener("success", function(e) {
 *   var req = e.getTarget();
 *
 *   // Response parsed according to the server's
 *   // response content type, e.g. JSON
 *   req.getResponse();
 * }, this);
 *
 * // Send request
 * req.send();
 * </pre>
 *
 * Some noteable features:
 *
 * * Abstraction of low-level request
 * * Convenient setup using properties
 * * Fine-grained events
 * * Symbolic phases
 * * Transparent processing of request data
 * * Stream-lined authentication
 * * Automagic parsing of response based on content type
 *
 * Cross-origin requests are supported, but require browser support
 * (see <a href="http://caniuse.com/#search=CORS">caniuse.com</a>) and backend configuration
 * (see <a href="https://developer.mozilla.org/en/http_access_control">MDN</a>).
 * Note that IE's <code>XDomainRequest</code> is not currently supported.
 * For a cross-browser alternative, consider {@link qx.io.request.Jsonp}.
 *
 * In order to debug requests, set the environment flag
 * <code>qx.debug.io</code>.
 *
 * Internally uses {@link qx.bom.request.Xhr}.
 */
qx.Class.define("qx.io.request.Xhr",
{
  extend: qx.io.request.AbstractRequest,

  /**
   * @param url {String?} The URL of the resource to request.
   * @param method {String?} The HTTP method.
   */
  construct: function(url, method) {
    if (method !== undefined) {
      this.setMethod(method);
    }

    this.base(arguments, url);
  },

  // Only document events with transport specific details.
  // For a complete list of events, refer to AbstractRequest.

  events:
  {
    /**
     * Fired on every change of the transport’s readyState.
     *
     * See {@link qx.bom.request.Xhr} for available readyStates.
     */
    "readyStateChange": "qx.event.type.Event",

    /**
    * Fired when request completes without eror and transport’s status
    * indicates success.
     *
     * Refer to {@link qx.util.Request#isSuccessful} for a list of HTTP
     * status considered successful.
     */
    "success": "qx.event.type.Event",

    /**
     * Fired when request completes without error.
     *
     * Every request not canceled or aborted completes. This means that
     * even requests receiving a response with erroneous HTTP status
     * fire a "load" event. If you are only interested in successful
     * responses, listen to the {@link #success} event instead.
     */
    "load": "qx.event.type.Event",

    /**
     * Fired when request completes without error but erroneous HTTP status.
     *
     * Refer to {@link qx.util.Request#isSuccessful} for a list of HTTP
     * status considered successful.
     */
    "statusError": "qx.event.type.Event"
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

  properties:
  {
    /**
     * The HTTP method.
     */
    method: {
      init: "GET"
    },

    /**
     * Whether the request should be executed asynchronously.
     */
    async: {
      check: "Boolean",
      init: true
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
     * Whether to allow request to be answered from cache.
     *
     * Allowed values:
     *
     * * <code>true</code>: Allow caching (Default)
     * * <code>false</code>: Prohibit caching. Appends nocache parameter to URL.
     * * <code>String</code>: Any Cache-Control request directive
     *
     * If a string is given, it is inserted in the request's Cache-Control
     * header. A request’s Cache-Control header may contain a number of directives
     * controlling the behavior of any caches in between client and origin
     * server.
     *
     * * <code>"no-cache"</code>: Force caches to submit request in order to
     *   validate the freshness of the representation. Note that the requested
     *   resource may still be served from cache if the representation is
     *   considered fresh. Use this directive to ensure freshness but save
     *   bandwidth when possible.
     * * <code>"no-store"</code>: Do not keep a copy of the representation under
     *   any conditions.
     *
     * See <a href="http://www.mnot.net/cache_docs/#CACHE-CONTROL">
     * Caching tutorial</a> for an excellent introduction to Caching in general.
     * Refer to the corresponding section in the
     * <a href="http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.9">
     * HTTP 1.1 specification</a> for more details and advanced directives.
     *
     * It is recommended to choose an appropriate Cache-Control directive rather
     * than prohibit caching using the nocache parameter.
     */
    cache: {
      check: function(value) {
        return qx.lang.Type.isBoolean(value) ||
          qx.lang.Type.isString(value);
      },
      init: true
    }
  },

  members:
  {

    /**
     * {Function} Parser.
     */
    __parser: null,

    /*
    ---------------------------------------------------------------------------
      CONFIGURE TRANSPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Create XHR transport.
     *
     * @return {qx.bom.request.Xhr} Transport.
     */
    _createTransport: function() {
      return new qx.bom.request.Xhr();
    },

    /**
     * Get configured URL.
     *
     * Append request data to URL if HTTP method is GET. Append random
     * string to URL if required by value of {@link #cache}.
     *
     * @return {String} The configured URL.
     */
    _getConfiguredUrl: function() {
      var url = this.getUrl(),
          serializedData;

      if (this.getMethod() === "GET" && this.getRequestData()) {
        serializedData = this._serializeData(this.getRequestData());
        url = qx.util.Uri.appendParamsToUrl(url, serializedData);
      }

      if (this.getCache() === false) {
        // Make sure URL cannot be served from cache and new request is made
        url = qx.util.Uri.appendParamsToUrl(url, {nocache: new Date().valueOf()});
      }

      return url;
    },

    // overridden
    _getConfiguredRequestHeaders: function() {
      var headers = {},
          isAllowsBody = qx.util.Request.methodAllowsRequestBody(this.getMethod());

      // Follow convention to include X-Requested-With header when same origin
      if (!qx.util.Request.isCrossDomain(this.getUrl())) {
        headers["X-Requested-With"] = "XMLHttpRequest";
      }

      // Include Cache-Control header if configured
      if (qx.lang.Type.isString(this.getCache())) {
        headers["Cache-Control"] = this.getCache();
      }

      // By default, set content-type urlencoded for requests with body
      if (this.getRequestData() !== "null" && isAllowsBody) {
        headers["Content-Type"] = "application/x-www-form-urlencoded";
      }

      // What representations to accept
      if (this.getAccept()) {
        if (qx.core.Environment.get("qx.debug.io")) {
          this.debug("Accepting: '" + this.getAccept() + "'");
        }
        headers["Accept"] = this.getAccept();
      }

      return headers;
    },

    // overridden
    _getMethod: function() {
      return this.getMethod();
    },

    // overridden
    _isAsync: function() {
      return this.isAsync();
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
     */
    setParser: function(parser) {
      var Xhr = qx.io.request.Xhr;

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
     * @return {Function} The parser function.
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
        return;
      }

      // See http://restpatterns.org/Glossary/MIME_Type

      contentType = this.getResponseContentType() || "";

      // Ignore parameters (e.g. the character set)
      contentType = contentType.replace(/;.*$/, "");

      if ((/^application\/(\w|\.)*\+?json$/).test(contentType)) {
        parser = qx.io.request.Xhr.PARSER["json"];
      }

      if ((/^application\/xml$/).test(contentType)) {
        parser = qx.io.request.Xhr.PARSER["xml"];
      }

      // Deprecated
      if ((/[^\/]+\/[^\+]+\+xml$/).test(this.getResponseContentType())) {
        parser = qx.io.request.Xhr.PARSER["xml"];
      }

      return parser;
    }
  }
});
