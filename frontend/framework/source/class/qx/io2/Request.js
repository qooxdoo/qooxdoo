qx.Bootstrap.define("qx.io2.Request",
{
  statics :
  {
    defaults :
    {
      type         : "GET",
      timeout      : 0,
      outgoingType : "application/x-www-form-urlencoded",
      async        : true
    },


    /**
     * TODOC
     *
     * @type static
     * @param url {var} TODOC
     * @param data {var} TODOC
     * @param callback {var} TODOC
     * @param incomingType {var} TODOC
     * @return {var} TODOC
     */
    get : function(url, data, callback, incomingType)
    {
      return this.ajax(
      {
        type         : "GET",
        url          : url,
        data         : data,
        callback     : callback,
        incomingType : incomingType
      });
    },


    /**
     * TODOC
     *
     * @type static
     * @param url {var} TODOC
     * @param callback {var} TODOC
     * @return {var} TODOC
     */
    getScript : function(url, callback) {
      return this.get(url, null, callback, "script");
    },


    /**
     * TODOC
     *
     * @type static
     * @param url {var} TODOC
     * @param data {var} TODOC
     * @param callback {var} TODOC
     * @return {var} TODOC
     */
    getJson : function(url, data, callback) {
      return this.get(url, null, callback, "json");
    },


    /**
     * TODOC
     *
     * @type static
     * @param url {var} TODOC
     * @param data {var} TODOC
     * @param callback {var} TODOC
     * @param incomingType {var} TODOC
     * @return {var} TODOC
     */
    postData : function(url, data, callback, incomingType)
    {
      return this.ajax(
      {
        type         : "GET",
        url          : url,
        data         : data,
        callback     : callback,
        incomingType : incomingType
      });
    },


    /* {Map} Last-Modified header cache for next request */
    lastModified : {},


    /* {Integer} Unique key counter */
    jsc : (new Date).getTime(),


    /**
     * TODOC
     *
     * @type static
     * @param options {var} TODOC
     * @return {void | var} TODOC
     */
    _preprocess : function(options)
    {
      // Matches the placeholder for the callback
      var jsre = /=(\?|%3F)/g;

      // Fill options with defaults
      var defaults = this.settings;
      for (var key in defaults)
      {
        if (options[key] === undefined) {
          options[key] = defaults[key];
        }
      }

      // Handle JSONP Parameter Callbacks
      if (options.dataType == "jsonp")
      {
        // Add the callback method placeholder to the url (if not already done)
        if (options.type === "GET")
        {
          if (!options.url.match(jsre)) {
            options.url += (options.url.match(/\?/) ? "&" : "?") + (options.jsonp || "callback") + "=?";
          }
        }

        // Add the callback method placeholder to the data (if not already done)
        else if (options.type === "POST")
        {
          var callbackName = options.jsonp || "callback";

          // Add callback placeholder (if missing)
          if (!options.data) {
            options.data = callbackName + "=?";
          } else if (!options.data.match(jsre)) {
            options.data += "&" + callbackName + "=?";
          }
        }
      }

      // Build temporary JSONP function
      // First block: Looking for matching dataType
      // Second block: Looking if a callback method placeholder is defined
      if ((options.dataType == "json" || options.dataType == "jsonp") && (options.data && jsre.test(options.data) || options.url.match(jsre)))
      {
        var jsonp = "jsonp" + this.jsc++;

        // Replace the =? sequence both in the query string and the data
        if (options.data) {
          options.data = options.data.replace(jsre, "=" + jsonp);
        }

        options.url = options.url.replace(jsre, "=" + jsonp);

        // Handle JSONP-style loading
        window[jsonp] = function(jsonData)
        {
          options.callback(jsonData);

          // Garbage collect
          window[jsonp] = undefined;

          try {
            delete window[jsonp];
          } catch(e) {}
        };
      }

      // Add random parameter to the URL to omit caching
      if (options.cache === false && options.type === "GET") {
        options.url += (options.url.match(/\?/) ? "&" : "?") + "_=" + (new Date()).getTime();
      }

      // If data is available, append data to url for get requests
      if (options.data && options.type == "GET")
      {
        options.url += (options.url.match(/\?/) ? "&" : "?") + s.data;

        // IE likes to send both get and post data, prevent this
        options.data = null;
      }
    },

    // Define classes in strings to omit auto dependency tracking.
    // Maybe variants are a good alternative for this.
    // Also possible: Special classes for script loading etc.
    // which creates dependencies to these transport layers.
    _transports :
    [
      "qx.io2.transport.HttpRequest",
      "qx.io2.transport.Script",
      "qx.io2.transport.Iframe",
      "qx.io2.transport.JsonRequest"
    ],

    /**
     * TODOC
     *
     * @type static
     * @param options {var} TODOC
     * @return {void | var} TODOC
     * @throws TODOC
     */
    ajax : function(options)
    {
      // Normalize options
      this._preprocess(options);

      // Check transport implementations by their priority
      var all = this._transports;
      for (var i=0, l=all.length; i<l; i++)
      {
        var impl = qx.Bootstrap.getByName(all[i]);

        if (impl && impl.isSupported(options)) {
          return impl.send(options);
        }
      }

      // Ooops
      throw new Error("Missing transport implementation to handle request");
    }
  }
});
