/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(io_remote)

************************************************************************ */


qx.Clazz.define("qx.io.remote.AbstractRemoteTransport",
{
  extend : qx.core.Target,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function() {
    qx.core.Target.call(this);
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */
  
  events : {
    "created" : "qx.event.type.Event",
    "configured" : "qx.event.type.Event",
    "sending" : "qx.event.type.Event",
    "receiving" : "qx.event.type.Event",
    "completed" : "qx.event.type.Event",
    "aborted" : "qx.event.type.Event",
    "failed" : "qx.event.type.Event",
    "timeout" : "qx.event.type.Event"
  },



  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /*
    ---------------------------------------------------------------------------
      PROPERTIES
    ---------------------------------------------------------------------------
    */

    /** Target url to issue the request to */
    url :
    {
      _legacy : true,
      type    : "string"
    },


    /** Determines what type of request to issue */
    method :
    {
      _legacy : true,
      type    : "string"
    },


    /** Set the request to asynchronous */
    asynchronous :
    {
      _legacy : true,
      type    : "boolean"
    },


    /** Set the data to be sent via this request */
    data :
    {
      _legacy : true,
      type    : "string"
    },


    /** Username to use for HTTP authentication */
    username :
    {
      _legacy : true,
      type    : "string"
    },


    /** Password to use for HTTP authentication */
    password :
    {
      _legacy : true,
      type    : "string"
    },


    /** The state of the current request */
    state :
    {
      _legacy : true,
      type : "string",

      possibleValues : [ "created", "configured", "sending", "receiving", "completed", "aborted", "timeout", "failed" ],

      defaultValue : "created"
    },


    /** Request headers */
    requestHeaders :
    {
      _legacy : true,
      type    : "object"
    },


    /** Request parameters to send. */
    parameters :
    {
      _legacy : true,
      type    : "object"
    },


    /** Response Type */
    responseType :
    {
      _legacy : true,
      type    : "string"
    },


    /** Use Basic HTTP Authentication */
    useBasicHttpAuth :
    {
      _legacy : true,
      type    : "boolean"
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
      USER METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @abstract 
     * @return {void} 
     * @throws the abstract function warning.
     */
    send : function() {
      throw new Error("send is abstract");
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void} 
     */
    abort : function()
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.ioRemoteDebug")) {
          this.warn("Aborting...");
        }
      }

      this.setState("aborted");
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void} 
     */
    timeout : function()
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.ioRemoteDebug")) {
          this.warn("Timeout...");
        }
      }

      this.setState("timeout");
    },


    /**
     * Force the transport into the failed state ("failed").
     * 
     *  Listeners of the "failed" signal are notified about the event.
     *
     * @type member
     * @return {void} 
     */
    failed : function()
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.ioRemoteDebug")) {
          this.warn("Failed...");
        }
      }

      this.setState("failed");
    },




    /*
    ---------------------------------------------------------------------------
      REQUEST HEADER SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Add a request header to this transports qx.io.remote.Request.
     * 
     *  This method is virtual and concrete subclasses are supposed to
     *  implement it.
     *
     * @type member
     * @abstract 
     * @param vLabel {var} TODOC
     * @param vValue {var} TODOC
     * @return {void} 
     * @throws the abstract function warning.
     */
    setRequestHeader : function(vLabel, vValue) {
      throw new Error("setRequestHeader is abstract");
    },




    /*
    ---------------------------------------------------------------------------
      RESPONSE HEADER SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @abstract 
     * @param vLabel {var} TODOC
     * @return {void} 
     * @throws the abstract function warning.
     */
    getResponseHeader : function(vLabel) {
      throw new Error("getResponseHeader is abstract");
    },


    /**
     * Provides an hash of all response headers.
     *
     * @type member
     * @abstract 
     * @return {void} 
     * @throws the abstract function warning.
     */
    getResponseHeaders : function() {
      throw new Error("getResponseHeaders is abstract");
    },




    /*
    ---------------------------------------------------------------------------
      STATUS SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the current status code of the request if available or -1 if not.
     *
     * @type member
     * @abstract 
     * @return {void} 
     * @throws the abstract function warning.
     */
    getStatusCode : function() {
      throw new Error("getStatusCode is abstract");
    },


    /**
     * Provides the status text for the current request if available and null otherwise.
     *
     * @type member
     * @abstract 
     * @return {void} 
     * @throws the abstract function warning.
     */
    getStatusText : function() {
      throw new Error("getStatusText is abstract");
    },




    /*
    ---------------------------------------------------------------------------
      RESPONSE DATA SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Provides the response text from the request when available and null otherwise.
     *  By passing true as the "partial" parameter of this method, incomplete data will
     *  be made available to the caller.
     *
     * @type member
     * @abstract 
     * @return {void} 
     * @throws the abstract function warning.
     */
    getResponseText : function() {
      throw new Error("getResponseText is abstract");
    },


    /**
     * Provides the XML provided by the response if any and null otherwise.
     *  By passing true as the "partial" parameter of this method, incomplete data will
     *  be made available to the caller.
     *
     * @type member
     * @abstract 
     * @return {void} 
     * @throws the abstract function warning.
     */
    getResponseXml : function() {
      throw new Error("getResponseXml is abstract");
    },


    /**
     * Returns the length of the content as fetched thus far
     *
     * @type member
     * @abstract 
     * @return {void} 
     * @throws the abstract function warning.
     */
    getFetchedLength : function() {
      throw new Error("getFetchedLength is abstract");
    },




    /*
    ---------------------------------------------------------------------------
      MODIFIER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {boolean} TODOC
     */
    _modifyState : function(propValue, propOldValue, propData)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.ioRemoteDebug")) {
          this.debug("State: " + propValue);
        }
      }

      switch(propValue)
      {
        case "created":
          this.createDispatchEvent("created");
          break;

        case "configured":
          this.createDispatchEvent("configured");
          break;

        case "sending":
          this.createDispatchEvent("sending");
          break;

        case "receiving":
          this.createDispatchEvent("receiving");
          break;

        case "completed":
          this.createDispatchEvent("completed");
          break;

        case "aborted":
          this.createDispatchEvent("aborted");
          break;

        case "failed":
          this.createDispatchEvent("failed");
          break;

        case "timeout":
          this.createDispatchEvent("timeout");
          break;
      }

      return true;
    }
  }
});
