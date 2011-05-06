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
    _createTransport: function() {
      return new qx.bom.request.Jsonp();
    },

    _getConfiguredUrl: function() {
      var url = this.getUrl(),
          serializedData;

      if (this.getRequestData()) {
        serializedData = this._serializeData(this.getRequestData());
        url = qx.util.Uri.appendParamsToUrl(url, serializedData);
      }

      if (!this.getCache()) {
        // Make sure URL cannot be served from cache and new request is made
        url = qx.util.Uri.appendParamsToUrl(url, {nocache: new Date().valueOf()});
      }

      return url;
    },

    _getParsedResponse: function() {
      return this._transport.responseJson;
    }
  }
});
