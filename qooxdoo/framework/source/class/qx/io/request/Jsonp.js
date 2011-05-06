qx.Class.define("qx.io.request.Jsonp",
{
  extend: qx.io.request.AbstractRequest,

  construct: function()
  {
    this.base(arguments);
  },

  properties :
  {
    /**
     * Whether to allow request to be answered from cache.
     *
     * Allowed values:
     *
     * * <code>true</code>: Allow caching (Default)
     * * <code>false</code>: Prohibit caching. Appends nocache parameter to URL.
     */
    cache: {
      check: "Boolean",
      init: true
    }
  },

  members :
  {
    send: function() {
      var transport = this._transport,
          url = this.getUrl(),
          async = this.getAsync(),
          requestData = this.getRequestData(),
          auth = this.getAuthentication(),
          serializedData = this._serializeData(requestData);

      // Drop fragment (anchor) from URL as per
      // http://www.w3.org/TR/XMLHttpRequest/#the-open-method
      if (/\#/.test(url)) {
        url = url.replace(/\#.*/, "");
      }

      if (serializedData) {
        url = qx.util.Uri.appendParamsToUrl(url, serializedData);
      }

      if (!this.getCache()) {
        // Make sure URL cannot be served from cache and new request is made
        url = qx.util.Uri.appendParamsToUrl(url, {nocache: new Date().valueOf()});
      }

      // Initialize request
      if (qx.core.Environment.get("qx.debug.io")) {
        this.debug(
          "Initialize request with " +
          "url: '" + url +
          "', async: " + async);
      }
      transport.open("GET", url, async);

      // Authentication headers
      this._setAuthRequestHeaders();

      // User-provided headers
      this._setRequestHeaders();

      // Set timeout
      transport.timeout = this.getTimeout() * 1000;

      // Send request
      if (qx.core.Environment.get("qx.debug.io")) {
        this.debug("Send request");
      }
      transport.send(null);
    },

    abort: function() {
      if (qx.core.Environment.get("qx.debug.io")) {
        this.debug("Abort request");
      }
      this._transport.abort();
    },

    _createTransport: function() {
      return new qx.bom.request.Jsonp();
    },

    _getParsedResponse: function() {
      return this._transport.responseJson;
    }
  },

  environment:
  {
    "qx.debug.io": false
  }
});
