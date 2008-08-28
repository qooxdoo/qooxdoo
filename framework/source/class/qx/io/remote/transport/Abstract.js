/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/**
 * Abstract for all transport implementations
 */
qx.Class.define("qx.io.remote.transport.Abstract",
{
  type : "abstract",
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function() {
    this.base(arguments);
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

    /** Event when a request is send */
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
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** Target url to issue the request to */
    url :
    {
      check : "String",
      nullable : true
    },


    /** Determines what type of request to issue */
    method :
    {
      check : "String",
      nullable : true
    },


    /** Set the request to asynchronous */
    asynchronous :
    {
      check : "Boolean",
      nullable : true
    },


    /** Set the data to be sent via this request */
    data :
    {
      check : "String",
      nullable : true
    },


    /** Username to use for HTTP authentication */
    username :
    {
      check : "String",
      nullable : true
    },


    /** Password to use for HTTP authentication */
    password :
    {
      check : "String",
      nullable : true
    },


    /** The state of the current request */
    state :
    {
      check : [ "created", "configured", "sending", "receiving", "completed", "aborted", "timeout", "failed" ],
      init : "created",
      event : "changeState",
      apply : "_applyState"
    },


    /** Request headers */
    requestHeaders :
    {
      check : "Object",
      nullable : true
    },


    /** Request parameters to send. */
    parameters :
    {
      check : "Object",
      nullable : true
    },


    /** Request form fields to send. */
    formFields :
    {
      check : "Object",
      nullable : true
    },


    /** Response Type */
    responseType :
    {
      check : "String",
      nullable : true
    },


    /** Use Basic HTTP Authentication */
    useBasicHttpAuth :
    {
      check : "Boolean",
      nullable : true
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
     * Sending a request.
     *
     * This method is virtual and concrete subclasses are supposed to
     * implement it.
     *
     * @abstract
     * @return {void}
     * @throws the abstract function warning.
     */
    send : function() {
      throw new Error("send is abstract");
    },


    /**
     * Force the transport into the aborted state ("aborted").
     *
     * Listeners of the "aborted" signal are notified about the event.
     *
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
     * Force the transport into the timeout state ("timeout").
     *
     * Listeners of the "timeout" signal are notified about the event.
     *
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
     * Listeners of the "failed" signal are notified about the event.
     *
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
     * This method is virtual and concrete subclasses are supposed to
     * implement it.
     *
     * @abstract
     * @param vLabel {String} Request header name
     * @param vValue {var} Value for the header
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
     * Returns the request header of the request.
     *
     * This method is virtual and concrete subclasses are supposed to
     * implement it.
     *
     * @abstract
     * @param vLabel {String} Response header name
     * @return {Object}
     * @throws the abstract function warning.
     */
    getResponseHeader : function(vLabel) {
      throw new Error("getResponseHeader is abstract");
    },


    /**
     * Provides an hash of all response headers.
     *
     * This method is virtual and concrete subclasses are supposed to
     * implement it.
     *
     * @abstract
     * @return {Object}
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
     * This method is virtual and concrete subclasses are supposed to
     * implement it.
     *
     * @abstract
     * @return {Integer}
     * @throws the abstract function warning.
     */
    getStatusCode : function() {
      throw new Error("getStatusCode is abstract");
    },


    /**
     * Provides the status text for the current request if available and null otherwise.
     *
     * This method is virtual and concrete subclasses are supposed to
     * implement it.
     *
     * @abstract
     * @return {String}
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
     * By passing true as the "partial" parameter of this method, incomplete data will
     * be made available to the caller.
     *
     * This method is virtual and concrete subclasses are supposed to
     * implement it.
     *
     * @abstract
     * @return {String}
     * @throws the abstract function warning.
     */
    getResponseText : function() {
      throw new Error("getResponseText is abstract");
    },


    /**
     * Provides the XML provided by the response if any and null otherwise.
     * By passing true as the "partial" parameter of this method, incomplete data will
     * be made available to the caller.
     *
     * This method is virtual and concrete subclasses are supposed to
     * implement it.
     *
     * @abstract
     * @return {Object}
     * @throws the abstract function warning.
     */
    getResponseXml : function() {
      throw new Error("getResponseXml is abstract");
    },


    /**
     * Returns the length of the content as fetched thus far.
     *
     * This method is virtual and concrete subclasses are supposed to
     * implement it.
     *
     * @abstract
     * @return {Integer}
     * @throws the abstract function warning.
     */
    getFetchedLength : function() {
      throw new Error("getFetchedLength is abstract");
    },




    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    /**
     * Apply method for "state" property. For each state value a corresponding
     * event is fired to inform the listeners.
     *
     * @param value {var} Current value
     * @param old {var} Previous value
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

        case "aborted":
          this.fireEvent("aborted");
          break;

        case "failed":
          this.fireEvent("failed");
          break;

        case "timeout":
          this.fireEvent("timeout");
          break;
      }

      return true;
    }
  }
});
