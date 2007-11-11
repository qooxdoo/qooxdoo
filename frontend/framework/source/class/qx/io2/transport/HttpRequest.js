// Supported incoming mime types: XML, JSON, TEXT, HTML, ...
// Can load cross domain: NO
// Supported methods: GET, POST
// Can upload data (form fields): NO

qx.Bootstrap.define("qx.io2.transport.HttpRequest",
{
  statics :
  {
    _dataTypes :
    {
      script : true,
      json   : true,
      jsonp  : true,
      xml    : true,
      html   : true,
      text   : true
    },


    /**
     * TODOC
     *
     * @type static
     * @param options {var} TODOC
     * @return {var} TODOC
     */
    isSupported : function(options) {
      return !!(!options.crossDomain && !options.uploadData && this._dataTypes[options.dataType]);
    },


    /**
     * TODOC
     *
     * @type static
     * @return {var} TODOC
     */
    send : function()
    {
      var requestDone = false;

      // Create the request object; Microsoft failed to properly
      // implement the XMLHttpRequest in IE7, so we use the ActiveXObject when it is available
      var xml = window.ActiveXObject ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest();

      // Open the socket
      xml.open(options.type, options.url, options.async);

      // Set the correct header, if data is being sent
      if (options.data) {
        xml.setRequestHeader("Content-Type", options.outgoingType);
      }

      // Set the If-Modified-Since header, if ifModified mode.
      if (options.ifModified) {
        xml.setRequestHeader("If-Modified-Since", this.lastModified[options.url] || "Thu, 01 Jan 1970 00:00:00 GMT");
      }

      // Set header so the called script knows that it's an XMLHttpRequest
      xml.setRequestHeader("X-Requested-With", "XMLHttpRequest");

      // TODO: Support for adding custom headers
      var onreadystatechange = function(isTimeout)
      {
        // The transfer is complete and the data is available, or the request timed out
        if (!requestDone && xml && (xml.readyState == 4 || isTimeout == "timeout"))
        {
          requestDone = true;

          // clear poll interval
          if (ival)
          {
            clearInterval(ival);
            ival = null;
          }

          status = isTimeout == "timeout" && "timeout" || !jQuery.httpSuccess(xml) && "error" || s.ifModified && jQuery.httpNotModified(xml, s.url) && "notmodified" || "success";

          if (status == "success")
          {
            // Watch for, and catch, XML document parse errors
            try
            {
              // process the data (runs the xml through httpData regardless of callback)
              data = jQuery.httpData(xml, s.dataType);
            }
            catch(e)
            {
              status = "parsererror";
            }
          }

          // Make sure that the request was successful or notmodified
          if (status == "success")
          {
            // Cache Last-Modified header, if ifModified mode.
            if (options.ifModified)
            {
              var modRes;

              try {
                modRes = xml.getResponseHeader("Last-Modified");
              } catch(e) {}

              // swallow exception thrown by FF if header is not available
              if (modRes) {
                jQuery.lastModified[s.url] = modRes;
              }
            }

            // JSONP handles its own success callback
            if (!jsonp) {
              success();
            }
          }
          else
          {
            jQuery.handleError(s, xml, status);
          }

          // TODO: Fire "complete"
          // Stop memory leaks
          if (s.async) {
            xml = null;
          }
        }
      };

      if (s.async)
      {
        // don't attach the handler to the request, just poll it instead
        var ival = setInterval(onreadystatechange, 13);

        // Timeout checker
        if (options.timeout > 0)
        {
          setTimeout(function()
          {
            // Check to see if the request is still happening
            if (xml)
            {
              // Cancel the request
              xml.abort();

              if (!requestDone) {
                onreadystatechange("timeout");
              }
            }
          },
          options.timeout);
        }
      }

      // Send the data
      try {
        xml.send(options.data);
      } catch(e) {
        jQuery.handleError(options, xml, null, e);
      }

      // firefox 1.5 doesn't fire statechange for sync requests
      if (!options.async) {
        onreadystatechange();
      }

      // return XMLHttpRequest to allow aborting the request etc.
      return xml;
    },

    // Determines if an XMLHttpRequest was successful or not
    /**
     * TODOC
     *
     * @type static
     * @param r {var} TODOC
     * @return {var | boolean} TODOC
     */
    httpSuccess : function(r)
    {
      try {
        return !r.status && location.protocol == "file:" || (r.status >= 200 && r.status < 300) || r.status == 304 || jQuery.browser.safari && r.status == undefined;
      } catch(e) {}

      return false;
    },

    // Determines if an XMLHttpRequest returns NotModified
    /**
     * TODOC
     *
     * @type static
     * @param xml {var} TODOC
     * @param url {var} TODOC
     * @return {var | boolean} TODOC
     */
    httpNotModified : function(xml, url)
    {
      try
      {
        var xmlRes = xml.getResponseHeader("Last-Modified");

        // Firefox always returns 200. check Last-Modified date
        return xml.status == 304 || xmlRes == jQuery.lastModified[url] || jQuery.browser.safari && xml.status == undefined;
      }
      catch(e) {}

      return false;
    },


    /**
     * TODOC
     *
     * @type static
     * @param r {var} TODOC
     * @param type {var} TODOC
     * @return {var} TODOC
     * @throws TODOC
     */
    httpData : function(r, type)
    {
      var ct = r.getResponseHeader("content-type");
      var xml = type == "xml" || !type && ct && ct.indexOf("xml") >= 0;
      var data = xml ? r.responseXML : r.responseText;

      if (xml && data.documentElement.tagName == "parsererror") {
        throw "parsererror";
      }

      // If the type is "script", eval it in global context
      if (type == "script") {
        jQuery.globalEval(data);
      }

      // Get the JavaScript object, if JSON is used.
      if (type == "json") {
        data = eval("(" + data + ")");
      }

      return data;
    }
  }
});
