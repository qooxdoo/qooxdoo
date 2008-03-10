/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
     2006 Derrell Lipman
     2006 STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Derrell Lipman (derrell)
     * Andreas Junghans (lucidcake)

************************************************************************ */

/* ************************************************************************

#module(io_remote)
#use(qx.io.remote.XmlHttpTransport)
#use(qx.io.remote.IframeTransport)
#use(qx.io.remote.ScriptTransport)

************************************************************************ */


qx.Class.define("qx.io.remote.Exchange",
{
  extend : qx.core.Target,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vRequest)
  {
    this.base(arguments);

    this.setRequest(vRequest);
    vRequest.setTransport(this);
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events : {
    "sending" : "qx.event.type.Event",
    "receiving" : "qx.event.type.Event",
    "completed" : "qx.io.remote.Response",
    "aborted" : "qx.io.remote.Response",
    "failed" : "qx.io.remote.Response",
    "timeout" : "qx.io.remote.Response"
  },



  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /* ************************************************************************
       Class data, properties and methods
    ************************************************************************ */

    /*
    ---------------------------------------------------------------------------
      TRANSPORT TYPE HANDLING
    ---------------------------------------------------------------------------
    */

    typesOrder : [ "qx.io.remote.XmlHttpTransport", "qx.io.remote.IframeTransport", "qx.io.remote.ScriptTransport" ],

    typesReady : false,

    typesAvailable : {},
    typesSupported : {},


    /**
     * TODOC
     *
     * @type static
     * @param vClass {var} TODOC
     * @param vId {var} TODOC
     * @return {void}
     */
    registerType : function(vClass, vId) {
      qx.io.remote.Exchange.typesAvailable[vId] = vClass;
    },


    /**
     * TODOC
     *
     * @type static
     * @return {void}
     * @throws TODOC
     */
    initTypes : function()
    {
      if (qx.io.remote.Exchange.typesReady) {
        return;
      }

      for (var vId in qx.io.remote.Exchange.typesAvailable)
      {
        var vTransporterImpl = qx.io.remote.Exchange.typesAvailable[vId];

        if (vTransporterImpl.isSupported()) {
          qx.io.remote.Exchange.typesSupported[vId] = vTransporterImpl;
        }
      }

      qx.io.remote.Exchange.typesReady = true;

      if (qx.lang.Object.isEmpty(qx.io.remote.Exchange.typesSupported)) {
        throw new Error("No supported transport types were found!");
      }
    },


    /**
     * TODOC
     *
     * @type static
     * @param vImpl {var} TODOC
     * @param vNeeds {var} TODOC
     * @param vResponseType {var} TODOC
     */
    canHandle : function(vImpl, vNeeds, vResponseType)
    {
      if (!qx.lang.Array.contains(vImpl.handles.responseTypes, vResponseType)) {
        return false;
      }

      for (var vKey in vNeeds)
      {
        if (!vImpl.handles[vKey]) {
          return false;
        }
      }

      return true;
    },




    /*
    ---------------------------------------------------------------------------
      MAPPING
    ---------------------------------------------------------------------------
    */

    /*
    http://msdn.microsoft.com/library/default.asp?url=/library/en-us/xmlsdk/html/0e6a34e4-f90c-489d-acff-cb44242fafc6.asp

    0: UNINITIALIZED
    The object has been created, but not initialized (the open method has not been called).

    1: LOADING
    The object has been created, but the send method has not been called.

    2: LOADED
    The send method has been called, but the status and headers are not yet available.

    3: INTERACTIVE
    Some data has been received. Calling the responseBody and responseText properties at this state to obtain partial results will return an error, because status and response headers are not fully available.

    4: COMPLETED
    All the data has been received, and the complete data is available in the
    */

    _nativeMap :
    {
      0 : "created",
      1 : "configured",
      2 : "sending",
      3 : "receiving",
      4 : "completed"
    },




    /*
    ---------------------------------------------------------------------------
      UTILS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type static
     * @param vStatusCode {var} TODOC
     * @param vReadyState {var} TODOC
     * @param vIsLocal {var} TODOC
     * @return {boolean | var} TODOC
     * @throws TODOC
     */
    wasSuccessful : function(vStatusCode, vReadyState, vIsLocal)
    {
      if (vIsLocal)
      {
        switch(vStatusCode)
        {
          case null:
          case 0:
            return true;

          case -1:
            // Not Available (OK for readystates: MSXML<4=1-3, MSXML>3=1-2, Gecko=1)
            return vReadyState < 4;

          default:
            // at least older versions of Safari don't set the status code for local file access
            return typeof vStatusCode === "undefined";
        }
      }
      else
      {
        switch(vStatusCode)
        {
          case -1: // Not Available (OK for readystates: MSXML<4=1-3, MSXML>3=1-2, Gecko=1)
            if (qx.core.Variant.isSet("qx.debug", "on"))
            {
              if (qx.core.Setting.get("qx.ioRemoteDebug") && vReadyState > 3) {
                qx.log.Logger.getClassLogger(qx.io.remote.Exchange).debug("Failed with statuscode: -1 at readyState " + vReadyState);
              }
            }

            return vReadyState < 4;

          case 200: // OK
          case 304: // Not Modified
            return true;

          case 201: // Created
          case 202: // Accepted
          case 203: // Non-Authoritative Information
          case 204: // No Content
          case 205: // Reset Content
            return true;

          case 206: // Partial Content
            if (qx.core.Variant.isSet("qx.debug", "on"))
            {
              if (qx.core.Setting.get("qx.ioRemoteDebug") && vReadyState === 4) {
                qx.log.Logger.getClassLogger(qx.io.remote.Exchange).debug("Failed with statuscode: 206 (Partial content while being complete!)");
              }
            }

            return vReadyState !== 4;

          case 300: // Multiple Choices
          case 301: // Moved Permanently
          case 302: // Moved Temporarily
          case 303: // See Other
          case 305: // Use Proxy
          case 400: // Bad Request
          case 401: // Unauthorized
          case 402: // Payment Required
          case 403: // Forbidden
          case 404: // Not Found
          case 405: // Method Not Allowed
          case 406: // Not Acceptable
          case 407: // Proxy Authentication Required
          case 408: // Request Time-Out
          case 409: // Conflict
          case 410: // Gone
          case 411: // Length Required
          case 412: // Precondition Failed
          case 413: // Request Entity Too Large
          case 414: // Request-URL Too Large
          case 415: // Unsupported Media Type
          case 500: // Server Error
          case 501: // Not Implemented
          case 502: // Bad Gateway
          case 503: // Out of Resources
          case 504: // Gateway Time-Out
          case 505: // HTTP Version not supported
            if (qx.core.Variant.isSet("qx.debug", "on"))
            {
              if (qx.core.Setting.get("qx.ioRemoteDebug")) {
                qx.log.Logger.getClassLogger(qx.io.remote.Exchange).debug("Failed with typical HTTP statuscode: " + vStatusCode);
              }
            }

            return false;


            // The following case labels are wininet.dll error codes that may
            // be encountered.

            // Server timeout
          case 12002:
            // Internet Name Not Resolved
          case 12007:
            // 12029 to 12031 correspond to dropped connections.
          case 12029:
          case 12030:
          case 12031:
            // Connection closed by server.
          case 12152:
            // See above comments for variable status.
          case 13030:
            if (qx.core.Variant.isSet("qx.debug", "on"))
            {
              if (qx.core.Setting.get("qx.ioRemoteDebug")) {
                qx.log.Logger.getClassLogger(qx.io.remote.Exchange).debug("Failed with MSHTML specific HTTP statuscode: " + vStatusCode);
              }
            }

            return false;

          default:
            // Handle all 20x status codes as OK as defined in the corresponding RFC
            // http://www.w3.org/Protocols/rfc2616/rfc2616.html
            if (vStatusCode > 206 && vStatusCode < 300) {
              return true;
            }

            qx.log.Logger.getClassLogger(qx.io.remote.Exchange).debug("Unknown status code: " + vStatusCode + " (" + vReadyState + ")");
            return false;
        }
      }
    },


    /**
     * TODOC
     *
     * @type static
     * @param vStatusCode {var} TODOC
     * @return {string} TODOC
     */
    statusCodeToString : function(vStatusCode)
    {
      switch(vStatusCode)
      {
        case -1:
          return "Not available";

        case 200:
          return "Ok";

        case 304:
          return "Not modified";

        case 206:
          return "Partial content";

        case 204:
          return "No content";

        case 300:
          return "Multiple choices";

        case 301:
          return "Moved permanently";

        case 302:
          return "Moved temporarily";

        case 303:
          return "See other";

        case 305:
          return "Use proxy";

        case 400:
          return "Bad request";

        case 401:
          return "Unauthorized";

        case 402:
          return "Payment required";

        case 403:
          return "Forbidden";

        case 404:
          return "Not found";

        case 405:
          return "Method not allowed";

        case 406:
          return "Not acceptable";

        case 407:
          return "Proxy authentication required";

        case 408:
          return "Request time-out";

        case 409:
          return "Conflict";

        case 410:
          return "Gone";

        case 411:
          return "Length required";

        case 412:
          return "Precondition failed";

        case 413:
          return "Request entity too large";

        case 414:
          return "Request-URL too large";

        case 415:
          return "Unsupported media type";

        case 500:
          return "Server error";

        case 501:
          return "Not implemented";

        case 502:
          return "Bad gateway";

        case 503:
          return "Out of resources";

        case 504:
          return "Gateway time-out";

        case 505:
          return "HTTP version not supported";

        case 12002:
          return "Server timeout";

        case 12007:
          return "Internet name not resolved";

        case 12029:
          return "Connection dropped";

        case 12030:
          return "Connection dropped";

        case 12031:
          return "Connection dropped";

        case 12152:
          return "Connection closed by server";

        case 13030:
          return "MSHTML-specific HTTP status code";

        default:
          return "Unknown status code";
      }
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** Set the request to send with this transport. */
    request :
    {
      check : "qx.io.remote.Request",
      nullable : true
    },


    /**
     * Set the implementation to use to send the request with.
     *
     *  The implementation should be a subclass of qx.io.remote.AbstractRemoteTransport and
     *  must implement all methods in the transport API.
     */
    implementation :
    {
      check : "qx.io.remote.AbstractRemoteTransport",
      nullable : true,
      apply : "_applyImplementation"
    },

    state :
    {
      check : [ "configured", "sending", "receiving", "completed", "aborted", "timeout", "failed" ],
      init : "configured",
      event : "changeState",
      apply : "_applyState"
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

    /**
     * TODOC
     *
     * @type member
     * @return {var | Boolean} TODOC
     */
    send : function()
    {
      var vRequest = this.getRequest();

      if (!vRequest) {
        return this.error("Please attach a request object first");
      }

      qx.io.remote.Exchange.initTypes();

      var vUsage = qx.io.remote.Exchange.typesOrder;
      var vSupported = qx.io.remote.Exchange.typesSupported;

      // Mapping settings to contenttype and needs to check later
      // if the selected transport implementation can handle
      // fulfill these requirements.
      var vResponseType = vRequest.getResponseType();
      var vNeeds = {};

      if (vRequest.getAsynchronous()) {
        vNeeds.asynchronous = true;
      } else {
        vNeeds.synchronous = true;
      }

      if (vRequest.getCrossDomain()) {
        vNeeds.crossDomain = true;
      }

      if (vRequest.getFileUpload()) {
        vNeeds.fileUpload = true;
      }

      // See if there are any programtic form fields requested
      for (var field in vRequest.getFormFields())
      {
        // There are.
        vNeeds.programaticFormFields = true;

        // No need to search further
        break;
      }

      var vTransportImpl, vTransport;

      for (var i=0, l=vUsage.length; i<l; i++)
      {
        vTransportImpl = vSupported[vUsage[i]];

        if (vTransportImpl)
        {
          if (!qx.io.remote.Exchange.canHandle(vTransportImpl, vNeeds, vResponseType)) {
            continue;
          }

          try
          {
            if (qx.core.Variant.isSet("qx.debug", "on"))
            {
              if (qx.core.Setting.get("qx.ioRemoteDebug")) {
                this.debug("Using implementation: " + vTransportImpl.classname);
              }
            }

            vTransport = new vTransportImpl;
            this.setImplementation(vTransport);

            vTransport.setUseBasicHttpAuth(vRequest.getUseBasicHttpAuth());

            vTransport.send();
            return true;
          }
          catch(ex)
          {
            this.error("Request handler throws error", ex);
            return ex;
          }
        }
      }

      this.error("There is no transport implementation available to handle this request: " + vRequest);
    },


    /**
     * Force the transport into the aborted ("aborted")
     *  state.
     *
     * @type member
     * @return {void}
     */
    abort : function()
    {
      var vImplementation = this.getImplementation();

      if (vImplementation)
      {
        if (qx.core.Variant.isSet("qx.debug", "on"))
        {
          if (qx.core.Setting.get("qx.ioRemoteDebug")) {
            this.debug("Abort: implementation " + vImplementation.toHashCode());
          }
        }

        vImplementation.abort();
      }
      else
      {
        if (qx.core.Variant.isSet("qx.debug", "on"))
        {
          if (qx.core.Setting.get("qx.ioRemoteDebug")) {
            this.debug("Abort: forcing state to be aborted");
          }
        }

        this.setState("aborted");
      }
    },


    /**
     * Force the transport into the timeout state.
     *
     * @type member
     * @return {void}
     */
    timeout : function()
    {
      var vImplementation = this.getImplementation();

      if (vImplementation)
      {
        this.warn("Timeout: implementation " + vImplementation.toHashCode());
        vImplementation.timeout();
      }
      else
      {
        this.warn("Timeout: forcing state to timeout");
        this.setState("timeout");
      }

      // Disable future timeouts in case user handler blocks
      if (this.getRequest()) {
        this.getRequest().setTimeout(0);
      }
    },




    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onsending : function(e) {
      this.setState("sending");
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onreceiving : function(e) {
      this.setState("receiving");
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _oncompleted : function(e) {
      this.setState("completed");
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onabort : function(e) {
      this.setState("aborted");
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onfailed : function(e) {
      this.setState("failed");
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _ontimeout : function(e) {
      this.setState("timeout");
    },




    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyImplementation : function(value, old)
    {
      if (old)
      {
        old.removeEventListener("sending", this._onsending, this);
        old.removeEventListener("receiving", this._onreceiving, this);
        old.removeEventListener("completed", this._oncompleted, this);
        old.removeEventListener("aborted", this._onabort, this);
        old.removeEventListener("timeout", this._ontimeout, this);
        old.removeEventListener("failed", this._onfailed, this);
      }

      if (value)
      {
        var vRequest = this.getRequest();

        value.setUrl(vRequest.getUrl());
        value.setMethod(vRequest.getMethod());
        value.setAsynchronous(vRequest.getAsynchronous());

        value.setUsername(vRequest.getUsername());
        value.setPassword(vRequest.getPassword());

        value.setParameters(vRequest.getParameters());
        value.setFormFields(vRequest.getFormFields());
        value.setRequestHeaders(vRequest.getRequestHeaders());
        value.setData(vRequest.getData());

        value.setResponseType(vRequest.getResponseType());

        value.addEventListener("sending", this._onsending, this);
        value.addEventListener("receiving", this._onreceiving, this);
        value.addEventListener("completed", this._oncompleted, this);
        value.addEventListener("aborted", this._onabort, this);
        value.addEventListener("timeout", this._ontimeout, this);
        value.addEventListener("failed", this._onfailed, this);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyState : function(value, old)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.ioRemoteDebug")) {
          this.debug("State: " + old + " => " + value);
        }
      }

      switch(value)
      {
        case "sending":
        case "receiving":
          this.createDispatchEvent(value);
          break;

        case "completed":
        case "aborted":
        case "timeout":
        case "failed":
          var vImpl = this.getImplementation();

          if (!vImpl)
          {
            // implementation has already been disposed
            break;
          }

          if (this.hasEventListeners(value))
          {
            var vResponse = new qx.io.remote.Response(value);

            if (value == "completed")
            {
              var vContent = vImpl.getResponseContent();
              vResponse.setContent(vContent);

              /*
               * Was there acceptable content?  This might occur, for example, if
               * the web server was shut down unexpectedly and thus the connection
               * closed with no data having been sent.
               */

              if (vContent === null)
              {
                // Nope.  Change COMPLETED to FAILED.
                if (qx.core.Variant.isSet("qx.debug", "on"))
                {
                  if (qx.core.Setting.get("qx.ioRemoteDebug")) {
                    this.debug("Altered State: " + value + " => failed");
                  }
                }

                value = "failed";
              }
            }

            vResponse.setStatusCode(vImpl.getStatusCode());
            vResponse.setResponseHeaders(vImpl.getResponseHeaders());

            this.dispatchEvent(vResponse);
          }

          // Disconnect and dispose implementation
          this.setImplementation(null);
          vImpl.dispose();

          break;
      }
    }
  },




  /*
  *****************************************************************************
     SETTINGS
  *****************************************************************************
  */

  settings : {
    "qx.ioRemoteDebug"       : false,
    "qx.ioRemoteDebugData"   : false
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    var vImpl = this.getImplementation();

    if (vImpl)
    {
      this.setImplementation(null);
      vImpl.dispose();
    }

    this.setRequest(null);
  }
});
