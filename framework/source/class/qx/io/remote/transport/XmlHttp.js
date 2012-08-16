/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
     2006 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Derrell Lipman (derrell)

************************************************************************ */

/**
 * Transports requests to a server using the native XmlHttpRequest object.
 *
 * This class should not be used directly by client programmers.
 */
qx.Class.define("qx.io.remote.transport.XmlHttp",
{
  extend : qx.io.remote.transport.Abstract,


  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Capabilities of this transport type.
     *
     * @internal
     */
    handles :
    {
      synchronous           : true,
      asynchronous          : true,
      crossDomain           : false,
      fileUpload            : false,
      programaticFormFields : false,
      responseTypes         : [ "text/plain", "text/javascript", "application/json", "application/xml", "text/html" ]
    },


    /**
     * Return a new XMLHttpRequest object suitable for the client browser.
     *
     * @return {Object} native XMLHttpRequest object
     * @signature function()
     */
    createRequestObject : qx.core.Environment.select("engine.name",
    {
      "default" : function() {
        return new XMLHttpRequest;
      },

      // IE7's native XmlHttp does not care about trusted zones. To make this
      // work in the localhost scenario, you can use the following registry setting:
      //
      // [HKEY_CURRENT_USER\Software\Microsoft\Internet Explorer\Main\
      // FeatureControl\FEATURE_XMLHTTP_RESPECT_ZONEPOLICY]
      // "Iexplore.exe"=dword:00000001
      //
      // Generally it seems that the ActiveXObject is more stable. jQuery
      // seems to use it always. We prefer the ActiveXObject for the moment, but allow
      // fallback to XMLHTTP if ActiveX is disabled.
      "mshtml" : function()
      {
        if (window.ActiveXObject && qx.xml.Document.XMLHTTP) {
          return new ActiveXObject(qx.xml.Document.XMLHTTP);
        }

        if (window.XMLHttpRequest) {
          return new XMLHttpRequest;
        }
      }
    }),


    /**
     * Whether the transport type is supported by the client.
     *
     * @return {Boolean} supported or not
     */
    isSupported : function() {
      return !!this.createRequestObject();
    }
  },


  /*
   *****************************************************************************
      PROPERTIES
   *****************************************************************************
   */

   properties :
   {
    /**
     * If true and the responseType property is set to "application/json", getResponseContent() will
     * return a Javascript map containing the JSON contents, i. e. the result qx.lang.Json.parse().
     * If false, the raw string data will be returned and the parsing must be done manually.
     * This is usefull for special JSON dialects / extensions which are not supported by
     * qx.lang.Json.
     */
    parseJson :
    {
      check : "Boolean",
      init : true
    }
   },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      CORE METHODS
    ---------------------------------------------------------------------------
    */

    __localRequest : false,
    __lastReadyState : 0,
    __request : null,


    /**
     * Returns the native request object
     *
     * @return {Object} native XmlHTTPRequest object
     */
    getRequest : function()
    {
      if (this.__request === null)
      {
        this.__request = qx.io.remote.transport.XmlHttp.createRequestObject();
        this.__request.onreadystatechange = qx.lang.Function.bind(this._onreadystatechange, this);
      }

      return this.__request;
    },




    /*
    ---------------------------------------------------------------------------
      USER METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Implementation for sending the request
     *
     * @return {void}
     */
    send : function()
    {
      this.__lastReadyState = 0;

      var vRequest = this.getRequest();
      var vMethod = this.getMethod();
      var vAsynchronous = this.getAsynchronous();
      var vUrl = this.getUrl();

      // --------------------------------------
      //   Local handling
      // --------------------------------------
      var vLocalRequest = (window.location.protocol === "file:" && !(/^http(s){0,1}\:/.test(vUrl)));
      this.__localRequest = vLocalRequest;

      // --------------------------------------
      //   Adding URL parameters
      // --------------------------------------
      var vParameters = this.getParameters(false);
      var vParametersList = [];

      for (var vId in vParameters)
      {
        var value = vParameters[vId];

        if (value instanceof Array)
        {
          for (var i=0; i<value.length; i++) {
            vParametersList.push(encodeURIComponent(vId) + "=" + encodeURIComponent(value[i]));
          }
        }
        else
        {
          vParametersList.push(encodeURIComponent(vId) + "=" + encodeURIComponent(value));
        }
      }

      if (vParametersList.length > 0) {
        vUrl += (vUrl.indexOf("?") >= 0 ? "&" : "?") + vParametersList.join("&");
      }

      // --------------------------------------------------------
      //   Adding data parameters (if no data is already present)
      // --------------------------------------------------------
      if (this.getData() === null)
      {
        var vParameters = this.getParameters(true);
        var vParametersList = [];

        for (var vId in vParameters)
        {
          var value = vParameters[vId];

          if (value instanceof Array)
          {
            for (var i=0; i<value.length; i++)
            {
              vParametersList.push(encodeURIComponent(vId) +
                                   "=" +
                                   encodeURIComponent(value[i]));
            }
          }
          else
          {
            vParametersList.push(encodeURIComponent(vId) +
                                 "=" +
                                 encodeURIComponent(value));
          }
        }

        if (vParametersList.length > 0)
        {
          this.setData(vParametersList.join("&"));
        }
      }

      var encode64 = function(input)
      {
        var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        do
        {
          chr1 = input.charCodeAt(i++);
          chr2 = input.charCodeAt(i++);
          chr3 = input.charCodeAt(i++);

          enc1 = chr1 >> 2;
          enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
          enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
          enc4 = chr3 & 63;

          if (isNaN(chr2)) {
            enc3 = enc4 = 64;
          } else if (isNaN(chr3)) {
            enc4 = 64;
          }

          output += keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
        }
        while (i < input.length);

        return output;
      };

      // --------------------------------------
      //   Opening connection
      // --------------------------------------
      try
      {
        if (this.getUsername())
        {
          if (this.getUseBasicHttpAuth())
          {
            vRequest.open(vMethod, vUrl, vAsynchronous);
            vRequest.setRequestHeader('Authorization', 'Basic ' + encode64(this.getUsername() + ':' + this.getPassword()));
          }
          else
          {
            vRequest.open(vMethod, vUrl, vAsynchronous, this.getUsername(), this.getPassword());
          }
        }
        else
        {
          vRequest.open(vMethod, vUrl, vAsynchronous);
        }
      }
      catch(ex)
      {
        this.error("Failed with exception: " + ex);
        this.failed();
        return;
      }

      // --------------------------------------
      //   Applying request header
      // --------------------------------------
      // Add a Referer header

      // The Java backend uses the referer header, and Firefox doesn't send one by
      // default (see here:
      // http://www.mercurytide.co.uk/whitepapers/issues-working-with-ajax/ ). Even when
      // not using a backend that evaluates the referrer, it's still useful to have it
      // set correctly, e.g. when looking at server log files.
      if (!(qx.core.Environment.get("engine.name") == "webkit"))
      {
        // avoid "Refused to set unsafe header Referer" in Safari and other Webkit-based browsers
        vRequest.setRequestHeader('Referer', window.location.href);
      }

      var vRequestHeaders = this.getRequestHeaders();

      for (var vId in vRequestHeaders) {
        vRequest.setRequestHeader(vId, vRequestHeaders[vId]);
      }

      // --------------------------------------
      //   Sending data
      // --------------------------------------
      try {
        if (qx.core.Environment.get("qx.debug"))
        {
          if (qx.core.Environment.get("qx.debug.io.remote.data"))
          {
            this.debug("Request: " + this.getData());
          }
        }

        // IE9 executes the call synchronous when the call is to file protocol
        // See [BUG #4762] for details
        if (
          vLocalRequest && vAsynchronous &&
          qx.core.Environment.get("engine.name") == "mshtml" &&
          qx.core.Environment.get("engine.version") == 9
        ) {
          qx.event.Timer.once(function() {
            vRequest.send(this.getData());
          }, this, 0);
        } else {
          vRequest.send(this.getData());
        }
      }
      catch(ex)
      {
        if (vLocalRequest) {
          this.failedLocally();
        }
        else
        {
          this.error("Failed to send data: " + ex, "send");
          this.failed();
        }

        return;
      }

      // --------------------------------------
      //   Readystate for sync reqeusts
      // --------------------------------------
      if (!vAsynchronous) {
        this._onreadystatechange();
      }
    },


    /**
     * Force the transport into the failed state ("failed").
     *
     * This method should be used only if the requests URI was local
     * access. I.e. it started with "file://".
     *
     * @return {void}
     */
    failedLocally : function()
    {
      if (this.getState() === "failed") {
        return;
      }

      // should only occur on "file://" access
      this.warn("Could not load from file: " + this.getUrl());

      this.failed();
    },




    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * Listener method for change of the "readystate".
     * Sets the internal state and informs the transport layer.
     *
     * @signature function(e)
     * @param e {Event} native event
     */
    _onreadystatechange : qx.event.GlobalError.observeMethod(function(e)
    {
      // Ignoring already stopped requests
      switch(this.getState())
      {
        case "completed":
        case "aborted":
        case "failed":
        case "timeout":
          if (qx.core.Environment.get("qx.debug"))
          {
            if (qx.core.Environment.get("qx.debug.io.remote")) {
              this.warn("Ignore Ready State Change");
            }
          }

          return;
      }

      // Checking status code
      var vReadyState = this.getReadyState();

      if (vReadyState == 4)
      {
        // The status code is only meaningful when we reach ready state 4.
        // (Important for Opera since it goes through other states before
        // reaching 4, and the status code is not valid before 4 is reached.)
        if (!qx.io.remote.Exchange.wasSuccessful(this.getStatusCode(), vReadyState, this.__localRequest)) {
          // Fix for bug #2272
          // The IE doesn't set the state to 'sending' even though the send method
          // is called. This only occurs if the server (which is called) goes
          // down or a network failure occurs.
          if (this.getState() === "configured") {
            this.setState("sending");
          }

          this.failed();
          return;
        }
      }

      // Sometimes the xhr call skips the send state
      if (vReadyState == 3 && this.__lastReadyState == 1) {
        this.setState(qx.io.remote.Exchange._nativeMap[++this.__lastReadyState]);
      }

      // Updating internal state
      while (this.__lastReadyState < vReadyState) {
        this.setState(qx.io.remote.Exchange._nativeMap[++this.__lastReadyState]);
      }
    }),




    /*
    ---------------------------------------------------------------------------
      READY STATE
    ---------------------------------------------------------------------------
    */

    /**
     * Get the ready state of this transports request.
     *
     * For qx.io.remote.transport.XmlHttp, ready state is a number between 1 to 4.
     *
     * @return {Integer} ready state number
     */
    getReadyState : function()
    {
      var vReadyState = null;

      try {
        vReadyState = this.getRequest().readyState;
      } catch(ex) {}

      return vReadyState;
    },




    /*
    ---------------------------------------------------------------------------
      REQUEST HEADER SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Set a request header to this transports request.
     *
     * @param vLabel {String} Request header name
     * @param vValue {var} Request header value
     * @return {void}
     */
    setRequestHeader : function(vLabel, vValue) {
      this.getRequestHeaders()[vLabel] = vValue;
    },




    /*
    ---------------------------------------------------------------------------
      RESPONSE HEADER SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Returns a specific header provided by the server upon sending a request,
     * with header name determined by the argument headerName.
     *
     * Only available at readyState 3 and 4 universally and in readyState 2
     * in Gecko.
     *
     * Please note: Some servers/proxies (such as Selenium RC) will capitalize
     * response header names. This is in accordance with RFC 2616[1], which
     * states that HTTP 1.1 header names are case-insensitive, so your
     * application should be case-agnostic when dealing with response headers.
     *
     * [1]<a href="http://www.w3.org/Protocols/rfc2616/rfc2616-sec4.html#sec4.2">RFC 2616: HTTP Message Headers</a>
     *
     * @param vLabel {String} Response header name
     * @return {String|null} Response header value
     */
    getResponseHeader : function(vLabel)
    {
      var vResponseHeader = null;

      try {
        vResponseHeader = this.getRequest().getResponseHeader(vLabel) || null;
      } catch(ex) {}

      return vResponseHeader;
    },


    /**
     * Returns all response headers of the request.
     *
     * @return {var} response headers
     */
    getStringResponseHeaders : function()
    {
      var vSourceHeader = null;

      try
      {
        var vLoadHeader = this.getRequest().getAllResponseHeaders();

        if (vLoadHeader) {
          vSourceHeader = vLoadHeader;
        }
      }
      catch(ex) {}

      return vSourceHeader;
    },


    /**
     * Provides a hash of all response headers.
     *
     * @return {var} hash of all response headers
     */
    getResponseHeaders : function()
    {
      var vSourceHeader = this.getStringResponseHeaders();
      var vHeader = {};

      if (vSourceHeader)
      {
        var vValues = vSourceHeader.split(/[\r\n]+/g);

        for (var i=0, l=vValues.length; i<l; i++)
        {
          var vPair = vValues[i].match(/^([^:]+)\s*:\s*(.+)$/i);

          if (vPair) {
            vHeader[vPair[1]] = vPair[2];
          }
        }
      }

      return vHeader;
    },




    /*
    ---------------------------------------------------------------------------
      STATUS SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the current status code of the request if available or -1 if not.
     *
     * @return {Integer} current status code
     */
    getStatusCode : function()
    {
      var vStatusCode = -1;

      try {
        vStatusCode = this.getRequest().status;

        // [BUG #4476]
        // IE sometimes tells 1223 when it should be 204
        if (vStatusCode === 1223) {
          vStatusCode = 204;
        }

      } catch(ex) {}

      return vStatusCode;
    },


    /**
     * Provides the status text for the current request if available and null
     * otherwise.
     *
     * @return {String} current status code text
     */
    getStatusText : function()
    {
      var vStatusText = "";

      try {
        vStatusText = this.getRequest().statusText;
      } catch(ex) {}

      return vStatusText;
    },




    /*
    ---------------------------------------------------------------------------
      RESPONSE DATA SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Provides the response text from the request when available and null
     * otherwise.  By passing true as the "partial" parameter of this method,
     * incomplete data will be made available to the caller.
     *
     * @return {String} Content of the response as string
     */
    getResponseText : function()
    {
      var vResponseText = null;

      try
      {
        vResponseText = this.getRequest().responseText;
      }
      catch(ex)
      {
        vResponseText = null;
      }

      return vResponseText;
    },


    /**
     * Provides the XML provided by the response if any and null otherwise.  By
     * passing true as the "partial" parameter of this method, incomplete data will
     * be made available to the caller.
     *
     * @return {String} Content of the response as XML
     * @throws {Error} If an error within the response occurs.
     */
    getResponseXml : function()
    {
      var vResponseXML = null;

      var vStatus = this.getStatusCode();
      var vReadyState = this.getReadyState();

      if (qx.io.remote.Exchange.wasSuccessful(vStatus, vReadyState, this.__localRequest))
      {
        try {
          vResponseXML = this.getRequest().responseXML;
        } catch(ex) {}
      }

      // Typical behaviour on file:// on mshtml
      // Could we check this with something like: /^file\:/.test(path); ?
      // No browser check here, because it doesn't seem to break other browsers
      //    * test for this.req.responseXML's objecthood added by *
      //    * FRM, 20050816                                       *
      if (typeof vResponseXML == "object" && vResponseXML != null)
      {
        if (!vResponseXML.documentElement)
        {
          // Clear xml file declaration, this breaks non unicode files (like ones with Umlauts)
          var s = String(this.getRequest().responseText).replace(/<\?xml[^\?]*\?>/, "");
          vResponseXML.loadXML(s);
        }

        // Re-check if fixed...
        if (!vResponseXML.documentElement) {
          throw new Error("Missing Document Element!");
        }

        if (vResponseXML.documentElement.tagName == "parseerror") {
          throw new Error("XML-File is not well-formed!");
        }
      }
      else
      {
        throw new Error("Response was not a valid xml document [" + this.getRequest().responseText + "]");
      }

      return vResponseXML;
    },


    /**
     * Returns the length of the content as fetched thus far
     *
     * @return {Integer} Length of the response text.
     */
    getFetchedLength : function()
    {
      var vText = this.getResponseText();
      return typeof vText == "string" ? vText.length : 0;
    },


    /**
     * Returns the content of the response
     *
     * @return {null | String} Response content if available
     */
    getResponseContent : function()
    {
      var state = this.getState();
      if (state !== "completed" && state != "failed")
      {
        if (qx.core.Environment.get("qx.debug"))
        {
          if (qx.core.Environment.get("qx.debug.io.remote")) {
            this.warn("Transfer not complete or failed, ignoring content!");
          }
        }

        return null;
      }

      if (qx.core.Environment.get("qx.debug"))
      {
        if (qx.core.Environment.get("qx.debug.io.remote")) {
          this.debug("Returning content for responseType: " + this.getResponseType());
        }
      }

      var vText = this.getResponseText();

      if (state == "failed")
      {
          if (qx.core.Environment.get("qx.debug"))
          {
            if (qx.core.Environment.get("qx.debug.io.remote.data"))
            {
              this.debug("Failed: " + vText);
            }
          }

          return vText;
      }

      switch(this.getResponseType())
      {
        case "text/plain":
        case "text/html":
          if (qx.core.Environment.get("qx.debug"))
          {
            if (qx.core.Environment.get("qx.debug.io.remote.data"))
            {
              this.debug("Response: " + vText);
            }
          }

          return vText;

        case "application/json":
          if (qx.core.Environment.get("qx.debug"))
          {
            if (qx.core.Environment.get("qx.debug.io.remote.data"))
            {
              this.debug("Response: " + vText);
            }
          }

          try {
            if (vText && vText.length > 0)
            {
              var ret;
              if (this.getParseJson()){
                ret = qx.lang.Json.parse(vText);
                ret = (ret === 0 ? 0 : (ret || null));
              } else {
                ret = vText;
              }
              return ret;
            }
            else
            {
              return null;
            }
          }
          catch(ex)
          {
            this.error("Could not execute json: [" + vText + "]", ex);
            return "<pre>Could not execute json: \n" + vText + "\n</pre>";
          }

        case "text/javascript":
          if (qx.core.Environment.get("qx.debug"))
          {
            if (qx.core.Environment.get("qx.debug.io.remote.data"))
            {
              this.debug("Response: " + vText);
            }
          }

          try {
            if(vText && vText.length > 0)
            {
              var ret = window.eval(vText);
              return (ret === 0 ? 0 : (ret || null));
            }
            else
            {
              return null;
            }
          } catch(ex) {
            this.error("Could not execute javascript: [" + vText + "]", ex);
            return null;
          }

        case "application/xml":
          vText = this.getResponseXml();

          if (qx.core.Environment.get("qx.debug"))
          {
            if (qx.core.Environment.get("qx.debug.io.remote.data"))
            {
              this.debug("Response: " + vText);
            }
          }

          return (vText === 0 ? 0 : (vText || null));

        default:
          this.warn("No valid responseType specified (" + this.getResponseType() + ")!");
          return null;
      }
    },




    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    /**
     * Apply method for the "state" property.
     * Fires an event for each state value to inform the listeners.
     *
     * @param value {var} Current value
     * @param old {var} Previous value
     * @return {void}
     */
    _applyState : function(value, old)
    {
      if (qx.core.Environment.get("qx.debug"))
      {
        if (qx.core.Environment.get("qx.debug.io.remote")) {
          this.debug("State: " + value);
        }
      }

      switch(value)
      {
        case "created":
          this.fireEvent("created");
          break;

        case "configured":
          this.fireEvent("configured");
          break;

        case "sending":
          this.fireEvent("sending");
          break;

        case "receiving":
          this.fireEvent("receiving");
          break;

        case "completed":
          this.fireEvent("completed");
          break;

        case "failed":
          this.fireEvent("failed");
          break;

        case "aborted":
          this.getRequest().abort();
          this.fireEvent("aborted");
          break;

        case "timeout":
          this.getRequest().abort();
          this.fireEvent("timeout");
          break;
      }
    }
  },



  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function()
  {
    // basic registration to qx.io.remote.Exchange
    // the real availability check (activeX stuff and so on) follows at the first real request
    qx.io.remote.Exchange.registerType(qx.io.remote.transport.XmlHttp, "qx.io.remote.transport.XmlHttp");
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    var vRequest = this.getRequest();

    if (vRequest)
    {
      // Clean up state change handler
      // Note that for IE the proper way to do this is to set it to a
      // dummy function, not null (Google on "onreadystatechange dummy IE unhook")
      // http://groups.google.com/group/Google-Web-Toolkit-Contributors/browse_thread/thread/7e7ee67c191a6324
      vRequest.onreadystatechange = qx.lang.Function.empty;
      // Aborting
      switch(vRequest.readyState)
      {
        case 1:
        case 2:
        case 3:
          vRequest.abort();
      }
    }

    this.__request = null;
  }
});
