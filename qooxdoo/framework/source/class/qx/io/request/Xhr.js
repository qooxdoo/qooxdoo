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
  extend: qx.io.request.AbstractRequest,

  construct: function()
  {
    this.base(arguments);
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
      check: [ "HEAD", "OPTIONS", "GET", "POST", "PUT", "DELETE"],
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
    }
  },

  members:
  {

    /**
     * Parser.
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

    /**
     * Set additional headers required by XHR transport.
     */
    _setRequestHeaders: function() {
      var transport = this._transport;

      // Align headers to configuration of instance
      if (this.getCache() === "force-validate") {
        // Force validation. See http://www.mnot.net/cache_docs/#CACHE-CONTROL.
        transport.setRequestHeader("Cache-Control", "no-cache");
      }

      // POST with request data needs special content-type
      if (this.getMethod() === "POST") {
        transport.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      }

      // What representations to accept
      if (this.getAccept()) {
        if (qx.core.Environment.get("qx.debug.io")) {
          this.debug("Accepting: '" + this.getAccept() + "'");
        }
        transport.setRequestHeader("Accept", this.getAccept());
      }
    },

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
      this.base(arguments);
    },

    /*
    ---------------------------------------------------------------------------
      RESPONSE
    ---------------------------------------------------------------------------
    */

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
      var parser = this.__parser;

      // Use user-provided parser, if any
      if (parser) {
        return parser;
      }

      // Content type undetermined
      if (!this.isDone()) {
        return;
      }

      // Auto-detect parser based on content type
      switch (this.getResponseContentType()) {
        case "application/json":
          parser = qx.io.request.Xhr.PARSER["json"];
          break;

        case "application/xml":
          parser = qx.io.request.Xhr.PARSER["xml"];
          break;

        default:
          parser = null;
          break;

      }

      // Content type ending with +xml
      if ((/[^\/]+\/[^\+]+\+xml/).test(this.getResponseContentType())) {
        parser = qx.io.request.Xhr.PARSER["xml"];
      }

      return parser;
    },

    /**
     * Returns response parsed with parser determined by
     * {@link #_getParser}.
     */
    _getParsedResponse: function() {
      var response = this._transport.responseText,
          parser = this._getParser();

      if (typeof parser === "function") {
        return parser.call(this, response);
      }

      return response;
    }

  }
});
