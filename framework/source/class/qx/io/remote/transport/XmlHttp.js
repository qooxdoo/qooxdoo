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
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this._req = qx.io.remote.transport.XmlHttp.createRequestObject();
    this._req.onreadystatechange = qx.lang.Function.bind(this._onreadystatechange, this);
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events : {
    /** Event when a request is created */
    "created" : "qx.event.type.Event",

    /** Event when a request is configured */
    "configured" : "qx.event.type.Event",

    /** Event when a request is sent */
    "sending" : "qx.event.type.Event",

    /** Event when a request is received */
    "receiving" : "qx.event.type.Event",

    /** Event when a request is completed */
    "completed" : "qx.event.type.Event",

    /** Event when a request is aborted */
    "aborted" : "qx.event.type.Event",

    /** Event when a request has failed */
    "failed" : "qx.event.type.Event",

    /** Event when a request has timed out */
    "timeout" : "qx.event.type.Event"
  },



  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    handles :
    {
      synchronous           : true,
      asynchronous          : true,
      crossDomain           : false,
      fileUpload            : false,
      programaticFormFields : false,
      responseTypes         : [ "text/plain", "text/javascript", "application/json", "application/xml", "text/html" ]
    },

    requestObjects : [],
    requestObjectCount : 0,


    /**
     * Return a new XMLHttpRequest object suitable for the client browser.
     *
     * @return {Object} native XMLHttpRequest object
     * @signature function()
     */
    createRequestObject : qx.core.Variant.select("qx.client",
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
    },


    /**
     * Dummy function to use for onreadystatechange after disposal
     */
    __dummy : function() {}
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

    _localRequest : false,
    _lastReadyState : 0,


    /**
     * Returns the native request object
     *
     * @return {Object} native XmlHTTPRequest object
     */
    getRequest : function() {
      return this._req;
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
      this._lastReadyState = 0;

      var vRequest = this.getRequest();
      var vMethod = this.getMethod();
      var vAsynchronous = this.getAsynchronous();
      var vUrl = this.getUrl();

      // --------------------------------------
      //   Local handling
      // --------------------------------------
      var vLocalRequest = (window.location.protocol === "file:" && !(/^http(s){0,1}\:/.test(vUrl)));
      this._localRequest = vLocalRequest;

      // --------------------------------------
      //   Adding parameters
      // --------------------------------------
      var vParameters = this.getParameters();
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

      vRequest.onreadystatechange = qx.lang.Function.bind(this._onreadystatechange, this);

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
      if (!qx.core.Variant.isSet("qx.client", "webkit"))
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
        if (qx.core.Variant.isSet("qx.debug", "on"))
        {
          if (qx.core.Setting.get("qx.ioRemoteDebugData"))
          {
            this.debug("Request: " + this.getData());
          }
        }

        vRequest.send(this.getData());
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
     * @param e {Event} native event
     * @return {void}
     */
    _onreadystatechange : function(e)
    {
      // Ignoring already stopped requests
      switch(this.getState())
      {
        case "completed":
        case "aborted":
        case "failed":
        case "timeout":
          if (qx.core.Variant.isSet("qx.debug", "on"))
          {
            if (qx.core.Setting.get("qx.ioRemoteDebug")) {
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
        if (!qx.io.remote.Exchange.wasSuccessful(this.getStatusCode(), vReadyState, this._localRequest)) {
          return this.failed();
        }
      }

      // Updating internal state
      while (this._lastReadyState < vReadyState) {
        this.setState(qx.io.remote.Exchange._nativeMap[++this._lastReadyState]);
      }
    },




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
        vReadyState = this._req.readyState;
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
      this._req.setRequestHeader(vLabel, vValue);
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
     * @param vLabel {String} Response header name
     * @return {var} Response header value
     */
    getResponseHeader : function(vLabel)
    {
      var vResponseHeader = null;

      try {
        this.getRequest().getResponseHeader(vLabel) || null;
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
        var vLoadHeader = this._req.getAllResponseHeaders();

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

      var vStatus = this.getStatusCode();
      var vReadyState = this.getReadyState();

      if (qx.io.remote.Exchange.wasSuccessful(vStatus, vReadyState, this._localRequest))
      {
        try {
          vResponseText = this.getRequest().responseText;
        } catch(ex) {}
      }

      return vResponseText;
    },


    /**
     * Provides the XML provided by the response if any and null otherwise.  By
     * passing true as the "partial" parameter of this method, incomplete data will
     * be made available to the caller.
     *
     * @return {String} Content of the response as XML
     * @throws TODOC
     */
    getResponseXml : function()
    {
      var vResponseXML = null;

      var vStatus = this.getStatusCode();
      var vReadyState = this.getReadyState();

      if (qx.io.remote.Exchange.wasSuccessful(vStatus, vReadyState, this._localRequest))
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
      if (this.getState() !== "completed")
      {
        if (qx.core.Variant.isSet("qx.debug", "on"))
        {
          if (qx.core.Setting.get("qx.ioRemoteDebug")) {
            this.warn("Transfer not complete, ignoring content!");
          }
        }

        return null;
      }

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.ioRemoteDebug")) {
          this.debug("Returning content for responseType: " + this.getResponseType());
        }
      }

      var vText = this.getResponseText();

      switch(this.getResponseType())
      {
        case "text/plain":
        case "text/html":
          if (qx.core.Variant.isSet("qx.debug", "on"))
          {
            if (qx.core.Setting.get("qx.ioRemoteDebugData"))
            {
              this.debug("Response: " + vText);
            }
          }

          return vText;

        case "application/json":
          if (qx.core.Variant.isSet("qx.debug", "on"))
          {
            if (qx.core.Setting.get("qx.ioRemoteDebugData"))
            {
              this.debug("Response: " + vText);
            }
          }

          try {
            if (vText && vText.length > 0) {
              return qx.util.Json.parseQx(vText) || null;
            } else {
              return null;
            }
          }
          catch(ex)
          {
            this.error("Could not execute json: [" + vText + "]", ex);
            return "<pre>Could not execute json: \n" + vText + "\n</pre>";
          }

        case "text/javascript":
          if (qx.core.Variant.isSet("qx.debug", "on"))
          {
            if (qx.core.Setting.get("qx.ioRemoteDebugData"))
            {
              this.debug("Response: " + vText);
            }
          }

          try {
            if(vText && vText.length > 0) {
              return window.eval(vText) || null;
            } else {
              return null;
            }
          } catch(ex) {
            this.error("Could not execute javascript: [" + vText + "]", ex);
            return null;
          }

        case "application/xml":
          vText = this.getResponseXml();

          if (qx.core.Variant.isSet("qx.debug", "on"))
          {
            if (qx.core.Setting.get("qx.ioRemoteDebugData"))
            {
              this.debug("Response: " + vText);
            }
          }

          return vText || null;

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
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.ioRemoteDebug")) {
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

  defer : function(statics, members)
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
      vRequest.onreadystatechange = qx.io.remote.transport.XmlHttp.__dummy;
      // Aborting
      switch(vRequest.readyState)
      {
        case 1:
        case 2:
        case 3:
          vRequest.abort();
      }
    }

    this._disposeFields("_req");
  }
});
