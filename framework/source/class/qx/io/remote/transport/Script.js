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

/**
 * Transports requests to a server using dynamic script tags.
 *
 * This class should not be used directly by client programmers.
 */
qx.Class.define("qx.io.remote.transport.Script",
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

    var vUniqueId = ++qx.io.remote.transport.Script._uniqueId;

    if (vUniqueId >= 2000000000) {
      qx.io.remote.transport.Script._uniqueId = vUniqueId = 1;
    }

    this._element = null;
    this._uniqueId = vUniqueId;
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    _uniqueId : 0,
    _instanceRegistry : {},

    ScriptTransport_PREFIX : "_ScriptTransport_",
    ScriptTransport_ID_PARAM : "_ScriptTransport_id",
    ScriptTransport_DATA_PARAM : "_ScriptTransport_data",

    handles :
    {
      synchronous           : false,
      asynchronous          : true,
      crossDomain           : true,
      fileUpload            : false,
      programaticFormFields : false,
      responseTypes         : [ "text/plain", "text/javascript", "application/json" ]
    },


    /**
     * Returns always true, because script transport is supported by all browsers.
     *
     */
    isSupported : function() {
      return true;
    },




    /*
    ---------------------------------------------------------------------------
      EVENT LISTENER
    ---------------------------------------------------------------------------
    */

    // For reference:
    // http://msdn.microsoft.com/workshop/author/dhtml/reference/properties/readyState_1.asp
    _numericMap :
    {
      "uninitialized" : 1,
      "loading"       : 2,
      "loaded"        : 2,
      "interactive"   : 3,
      "complete"      : 4
    },


    /**
     * This method can be called by the script loaded by the ScriptTransport
     * class.
     *
     * @param id {String} Id of the corresponding transport object,
     *     which is passesd as an URL parameter to the server an
     * @param content {String} This string is passed to the content property
     *     of the {@link #Response} object.
     */
    _requestFinished : function(id, content)
    {
      var vInstance = qx.io.remote.transport.Script._instanceRegistry[id];

      if (vInstance == null)
      {
        if (qx.core.Variant.isSet("qx.debug", "on"))
        {
          if (qx.core.Setting.get("qx.ioRemoteDebug")) {
            this.warn("Request finished for an unknown instance (probably aborted or timed out before)");
          }
        }
      }
      else
      {
        vInstance._responseContent = content;
        vInstance._switchReadyState(qx.io.remote.transport.Script._numericMap.complete);
      }
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    _lastReadyState : 0,




    /*
    ---------------------------------------------------------------------------
      USER METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Sends the request using "script" elements
     *
     * @return {void}
     */
    send : function()
    {
      var vUrl = this.getUrl();

      // --------------------------------------
      //   Adding parameters
      // --------------------------------------
      vUrl += (vUrl.indexOf("?") >= 0 ? "&" : "?") + qx.io.remote.transport.Script.ScriptTransport_ID_PARAM + "=" + this._uniqueId;

      var vParameters = this.getParameters();
      var vParametersList = [];

      for (var vId in vParameters)
      {
        if (vId.indexOf(qx.io.remote.transport.Script.ScriptTransport_PREFIX) == 0) {
          this.error("Illegal parameter name. The following prefix is used internally by qooxdoo): " + qx.io.remote.transport.Script.ScriptTransport_PREFIX);
        }

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
        vUrl += "&" + vParametersList.join("&");
      }

      // --------------------------------------
      //   Sending data
      // --------------------------------------
      var vData = this.getData();

      if (vData != null) {
        vUrl += "&" + qx.io.remote.transport.Script.ScriptTransport_DATA_PARAM + "=" + encodeURIComponent(vData);
      }

      qx.io.remote.transport.Script._instanceRegistry[this._uniqueId] = this;
      this._element = document.createElement("script");

      // IE needs this (it ignores the
      // encoding from the header sent by the
      // server for dynamic script tags)
      this._element.charset = "utf-8";
      this._element.src = vUrl;

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.ioRemoteDebugData"))
        {
          this.debug("Request: " + vUrl);
        }
      }

      document.body.appendChild(this._element);
    },


    /**
     * Switches the readystate by setting the internal state.
     *
     * @param vReadyState {String} readystate value
     * @return {void}
     */
    _switchReadyState : function(vReadyState)
    {
      // Ignoring already stopped requests
      switch(this.getState())
      {
        case "completed":
        case "aborted":
        case "failed":
        case "timeout":
          this.warn("Ignore Ready State Change");
          return;
      }

      // Updating internal state
      while (this._lastReadyState < vReadyState) {
        this.setState(qx.io.remote.Exchange._nativeMap[++this._lastReadyState]);
      }
    },




    /*
    ---------------------------------------------------------------------------
      REQUEST HEADER SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Sets a request header with the given value.
     *
     * This method is not implemented at the moment.
     *
     * @param vLabel {String} Request header name
     * @param vValue {var} Request header value
     * @return {void}
     */
    setRequestHeader : function(vLabel, vValue) {},

    // TODO
    // throw new Error("setRequestHeader is abstract");
    /*
    ---------------------------------------------------------------------------
      RESPONSE HEADER SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the value of the given response header.
     *
     * This method is not implemented at the moment and returns always "null".
     *
     * @param vLabel {String} Response header name
     * @return {null} Returns null
     */
    getResponseHeader : function(vLabel) {
      return null;
    },

    // TODO
    // this.error("Need implementation", "getResponseHeader");
    /**
     * Provides an hash of all response headers.
     *
     * This method is not implemented at the moment and returns an empty map.
     *
     * @return {Map} empty map
     */
    getResponseHeaders : function() {
      return {};
    },

    // TODO
    // throw new Error("getResponseHeaders is abstract");
    /*
    ---------------------------------------------------------------------------
      STATUS SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the current status code of the request if available or -1 if not.
     * This method needs implementation (returns always 200).
     *
     * @return {Integer} status code
     */
    getStatusCode : function() {
      return 200;
    },

    // TODO
    // this.error("Need implementation", "getStatusCode");
    /**
     * Provides the status text for the current request if available and null otherwise.
     * This method needs implementation (returns always an empty string)
     *
     * @return {string} TODOC
     */
    getStatusText : function() {
      return "";
    },

    // TODO
    // this.error("Need implementation", "getStatusText");
    /*
    ---------------------------------------------------------------------------
      RESPONSE DATA SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the length of the content as fetched thus far.
     * This method needs implementation (returns always 0).
     *
     * @return {Integer} Returns 0
     */
    getFetchedLength : function() {
      return 0;
    },

    // TODO
    // throw new Error("getFetchedLength is abstract");
    /**
     * Returns the content of the response.
     *
     * @return {null | String} If successful content of response as string.
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

      switch(this.getResponseType())
      {
        case "text/plain":
          // server is responsible for using a string as the response
        case "application/json":
        case "text/javascript":
          if (qx.core.Variant.isSet("qx.debug", "on"))
          {
            if (qx.core.Setting.get("qx.ioRemoteDebugData"))
            {
              this.debug("Response: " + this._responseContent);
            }
          }
          return this._responseContent || null;

        default:
          this.warn("No valid responseType specified (" + this.getResponseType() + ")!");
          return null;
      }
    }
  },



  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics, members, properties)
  {
    // basic registration to qx.io.remote.Exchange
    // the real availability check (activeX stuff and so on) follows at the first real request
    qx.io.remote.Exchange.registerType(qx.io.remote.transport.Script, "qx.io.remote.transport.Script");

    // Alias (compatibility to 0.7 qooxdoo)
    qx.io.remote.ScriptTransport = statics;
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    if (this._element)
    {
      delete qx.io.remote.transport.Script._instanceRegistry[this._uniqueId];
      document.body.removeChild(this._element);
    }

    this._disposeFields("_element", "_responseContent");
  }
});
