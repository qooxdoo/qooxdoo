/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org
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

/* ************************************************************************

#module(io_remote)

************************************************************************ */

/**
 * This class is used to send HTTP requests to the server.
 */
qx.Class.define("qx.io.remote.Request",
{
  extend : qx.core.Target,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param vUrl {String}
   *   Target url to issue the request to.
   *
   * @param vMethod {String}
   *   Determines that type of request to issue (GET or POST). Default is GET.
   *
   * @param vResponseType {String}
   *   The mime type of the response. Default is text/plain {@link qx.util.Mime}.
   */
  construct : function(vUrl, vMethod, vResponseType)
  {
    this.base(arguments);

    this._requestHeaders = {};
    this._parameters = {};
    this._formFields = {};

    if (vUrl !== undefined) {
      this.setUrl(vUrl);
    }

    if (vMethod !== undefined) {
      this.setMethod(vMethod);
    }

    if (vResponseType !== undefined) {
      this.setResponseType(vResponseType);
    }

    this.setProhibitCaching(true);

    // Prototype-Style Request Headers
    this.setRequestHeader("X-Requested-With", "qooxdoo");
    this.setRequestHeader("X-Qooxdoo-Version", qx.core.Version.toString());

    // Get the next sequence number for this request
    this._seqNum = ++qx.io.remote.Request._seqNum;
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events : {

    /** Fired when the Request object changes its state to 'created' */
    "created" : "qx.event.type.Event",

    /** Fired when the Request object changes its state to 'configured' */
    "configured" : "qx.event.type.Event",

    /** Fired when the Request object changes its state to 'sending' */
    "sending" : "qx.event.type.Event",

    /** Fired when the Request object changes its state to 'receiving' */
    "receiving" : "qx.event.type.Event",

    /**
     * Fired once the request has finished successfully. The event object
     * can be used to read the transferred data.
     */
    "completed" : "qx.io.remote.Response",

    /** Fired when the pending request has been aborted. */
    "aborted" : "qx.io.remote.Response",

    /** Fired when the pending request failes. */
    "failed" : "qx.io.remote.Response",

    /** Fired when the pending request times out. */
    "timeout" : "qx.io.remote.Response"
  },



  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /*
    ---------------------------------------------------------------------------
      SEQUENCE NUMBER
    ---------------------------------------------------------------------------
    */

    /**
     * Sequence (id) number of a request, used to associate a response or error
     * with its initiating request.
     */
    _seqNum : 0
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * Target url to issue the request to.
     */
    url :
    {
      check : "String",
      init : ""
    },


    /**
     * Determines what type of request to issue (GET or POST).
     */
    method :
    {
      check : [ qx.net.Http.METHOD_GET, qx.net.Http.METHOD_POST, qx.net.Http.METHOD_PUT, qx.net.Http.METHOD_HEAD, qx.net.Http.METHOD_DELETE ],
      apply : "_applyMethod",
      init : qx.net.Http.METHOD_GET
    },


    /**
     * Set the request to asynchronous.
     */
    asynchronous :
    {
      check : "Boolean",
      init : true
    },


    /**
     * Set the data to be sent via this request
     */
    data :
    {
      check : "String",
      nullable : true
    },


    /**
     * Username to use for HTTP authentication.
     * Set to NULL if HTTP authentication is not used.
     */
    username :
    {
      check : "String",
      nullable : true
    },


    /**
     * Password to use for HTTP authentication.
     * Set to NULL if HTTP authentication is not used.
     */
    password :
    {
      check : "String",
      nullable : true
    },


    /**
     * The state that the request is in, while being processed.
     */
    state :
    {
      check : [ "configured", "queued", "sending", "receiving", "completed", "aborted", "timeout", "failed" ],
      init : "configured",
      apply : "_applyState",
      event : "changeState"
    },


    /**
     * Response type of request.
     *
     * The response type is a MIME type, default is text/plain. Other supported
     * MIME types are text/javascript, text/html, application/json,
     * application/xml.
     *
     * @see qx.util.Mime
     */
    responseType :
    {
      check : [ qx.util.Mime.TEXT, qx.util.Mime.JAVASCRIPT, qx.util.Mime.JSON, qx.util.Mime.XML, qx.util.Mime.HTML ],
      init : qx.util.Mime.TEXT,
      apply : "_applyResponseType"
    },


    /**
     * Number of millieseconds before the request is being timed out.
     *
     * If this property is null, the timeout for the request comes is the
     * qx.io.remote.RequestQueue's property defaultTimeout.
     */
    timeout :
    {
      check : "Integer",
      nullable : true
    },


    /**
     * Prohibit request from being cached.
     *
     * Setting the value to <i>true</i> adds a parameter "nocache" to the request
     * with a value of the current time. Setting the value to <i>false</i> removes
     * the parameter.
     */
    prohibitCaching :
    {
      check : "Boolean",
      init : true,
      apply : "_applyProhibitCaching"
    },


    /**
     * Indicate that the request is cross domain.
     *
     * A request is cross domain if the request's URL points to a host other than
     * the local host. This switches the concrete implementation that is used for
     * sending the request from qx.io.remote.XmlHttpTransport to
     * qx.io.remote.ScriptTransport, because only the latter can handle cross
     * domain requests.
     */
    crossDomain :
    {
      check : "Boolean",
      init : false
    },


    /**
     * Indicate that the request will be used for a file upload.
     *
     * The request will be used for a file upload.  This switches the concrete
     * implementation that is used for sending the request from
     * qx.io.remote.XmlHttpTransport to qx.io.remote.IFrameTransport, because only
     * the latter can handle file uploads.
     */
    fileUpload :
    {
      check : "Boolean",
      init : false
    },


    /**
     * The transport instance used for the request.
     *
     * This is necessary to be able to abort an asynchronous request.
     */
    transport :
    {
      check : "qx.io.remote.Exchange",
      nullable : true
    },


    /**
     * Use Basic HTTP Authentication.
     */
    useBasicHttpAuth :
    {
      check : "Boolean",
      init : false
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
     * Schedule this request for transport to server.
     *
     * The request is added to the singleton class qx.io.remote.RequestQueue's
     * list of pending requests.
     *
     * @type member
     * @return {void}
     */
    send : function() {
      qx.io.remote.RequestQueue.getInstance().add(this);
    },


    /**
     * Abort sending this request.
     *
     * The request is removed from the singleton class qx.io.remote.RequestQueue's
     * list of pending events. If the request haven't been scheduled this
     * method is a noop.
     *
     * @type member
     * @return {void}
     */
    abort : function() {
      qx.io.remote.RequestQueue.getInstance().abort(this);
    },


    /**
     * Abort sending this request if it has not already been aborted.
     *
     * @type member
     * @return {void}
     */
    reset : function()
    {
      switch(this.getState())
      {
        case "sending":
        case "receiving":
          this.error("Aborting already sent request!");

          // no break

        case "queued":
          this.abort();
          break;
      }
    },




    /*
    ---------------------------------------------------------------------------
      STATE ALIASES
    ---------------------------------------------------------------------------
    */

    /**
     * Determine if this request is in the configured state.
     *
     * @type member
     * @return {Boolean} <true> if the request is in the configured state; <false> otherwise.
     */
    isConfigured : function() {
      return this.getState() === "configured";
    },


    /**
     * Determine if this request is in the queued state.
     *
     * @type member
     * @return {Boolean} <true> if the request is in the queued state; <false> otherwise.
     */
    isQueued : function() {
      return this.getState() === "queued";
    },


    /**
     * Determine if this request is in the sending state.
     *
     * @type member
     * @return {Boolean} <true> if the request is in the sending state; <false> otherwise.
     */
    isSending : function() {
      return this.getState() === "sending";
    },


    /**
     * Determine if this request is in the receiving state.
     *
     * @type member
     * @return {Boolean} <true> if the request is in the receiving state; <false> otherwise.
     */
    isReceiving : function() {
      return this.getState() === "receiving";
    },


    /**
     * Determine if this request is in the completed state.
     *
     * @type member
     * @return {Boolean} <true> if the request is in the completed state; <false> otherwise.
     */
    isCompleted : function() {
      return this.getState() === "completed";
    },


    /**
     * Determine if this request is in the aborted state.
     *
     * @type member
     * @return {Boolean} <true> if the request is in the aborted state; <false> otherwise.
     */
    isAborted : function() {
      return this.getState() === "aborted";
    },


    /**
     * Determine if this request is in the timeout state.
     *
     * @type member
     * @return {Boolean} <true> if the request is in the timeout state; <false> otherwise.
     */
    isTimeout : function() {
      return this.getState() === "timeout";
    },


    /**
     * Determine if this request is in the failed state.
     *
     * @type member
     * @return {Boolean} <true> if the request is in the failed state; <false> otherwise.
     */
    isFailed : function() {
      return this.getState() === "failed";
    },




    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * Event handler called when the request enters the queued state.
     *
     * @type member
     * @param e {qx.event.type.Event} Event indicating state change
     * @return {void}
     */
    _onqueued : function(e)
    {
      // Modify internal state
      this.setState("queued");

      // Bubbling up
      this.dispatchEvent(e);
    },


    /**
     * Event handler called when the request enters the sending state.
     *
     * @type member
     * @param e {qx.event.type.Event} Event indicating state change
     * @return {void}
     */
    _onsending : function(e)
    {
      // Modify internal state
      this.setState("sending");

      // Bubbling up
      this.dispatchEvent(e);
    },


    /**
     * Event handler called when the request enters the receiving state.
     *
     * @type member
     * @param e {qx.event.type.Event} Event indicating state change
     * @return {void}
     */
    _onreceiving : function(e)
    {
      // Modify internal state
      this.setState("receiving");

      // Bubbling up
      this.dispatchEvent(e);
    },


    /**
     * Event handler called when the request enters the completed state.
     *
     * @type member
     * @param e {qx.event.type.Event} Event indicating state change
     * @return {void}
     */
    _oncompleted : function(e)
    {
      // Modify internal state
      this.setState("completed");

      // Bubbling up
      this.dispatchEvent(e);

      // Automatically dispose after event completion
      this.dispose();
    },


    /**
     * Event handler called when the request enters the aborted state.
     *
     * @type member
     * @param e {qx.event.type.Event} Event indicating state change
     * @return {void}
     */
    _onaborted : function(e)
    {
      // Modify internal state
      this.setState("aborted");

      // Bubbling up
      this.dispatchEvent(e);

      // Automatically dispose after event completion
      this.dispose();
    },


    /**
     * Event handler called when the request enters the timeout state.
     *
     * @type member
     * @param e {qx.event.type.Event} Event indicating state change
     * @return {void}
     */
    _ontimeout : function(e)
    {
      /*
        // User's handler can block until timeout.
        switch(this.getState())
        {
          // If we're no longer running...
          case "completed":
          case "timeout":
          case "aborted":
          case "failed":
            // then don't bubble up the timeout event
            return;
        }
      */

      // Modify internal state
      this.setState("timeout");

      // Bubbling up
      this.dispatchEvent(e);

      // Automatically dispose after event completion
      this.dispose();
    },


    /**
     * Event handler called when the request enters the failed state.
     *
     * @type member
     * @param e {qx.event.type.Event} Event indicating state change
     * @return {void}
     */
    _onfailed : function(e)
    {
      // Modify internal state
      this.setState("failed");

      // Bubbling up
      this.dispatchEvent(e);

      // Automatically dispose after event completion
      this.dispose();
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
    _applyState : function(value, old)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.ioRemoteDebug")) {
          this.debug("State: " + value);
        }
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyProhibitCaching : function(value, old)
    {
      if (value)
      {
        // This works by making the URL unique on each request.  The actual id,
        // "nocache" is irrelevant; it's the fact that a (usually) different date
        // is added to the URL on each request that prevents caching.
        this.setParameter("nocache", new Date().valueOf());

        // Add the HTTP 1.0 request to avoid use of a cache
        this.setRequestHeader("Pragma", "no-cache");

        // Add the HTTP 1.1 request to avoid use of a cache
        this.setRequestHeader("Cache-Control", "no-cache");
      }
      else
      {
        this.removeParameter("nocache");
        this.removeRequestHeader("Pragma");
        this.removeRequestHeader("Cache-Control");
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyMethod : function(value, old)
    {
      if (value === qx.net.Http.METHOD_POST) {
        this.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
      } else {
        this.removeRequestHeader("Content-Type");
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyResponseType : function(value, old) {
      this.setRequestHeader("X-Qooxdoo-Response-Type", value);
    },




    /*
    ---------------------------------------------------------------------------
      REQUEST HEADER
    ---------------------------------------------------------------------------
    */

    /**
     * Add a request header to the request.
     *
     * Example: request.setRequestHeader("Content-Type", qx.util.Mime.HTML)
     *
     * @type member
     * @param vId {String} The identifier to use for this added header
     * @param vValue {String} The value to use for this added header
     * @return {void}
     */
    setRequestHeader : function(vId, vValue) {
      this._requestHeaders[vId] = vValue;
    },


    /**
     * Remove a previously-added request header
     *
     * @type member
     * @param vId {String} The id of the header to be removed
     * @return {void}
     */
    removeRequestHeader : function(vId) {
      delete this._requestHeaders[vId];
    },


    /**
     * Retrieve the value of a header which was previously set
     *
     * @type member
     * @param vId {String} The id of the header value being requested
     * @return {String} The value of the header wiith the specified id
     */
    getRequestHeader : function(vId) {
      return this._requestHeaders[vId] || null;
    },


    /**
     * Return the object containing all of the headers which have been added.
     *
     * @type member
     * @return {Object} The returned object has as its property names each of the ids of headers
     *     which have been added, and as each property value, the value of the
     *     property corresponding to that id.
     */
    getRequestHeaders : function() {
      return this._requestHeaders;
    },




    /*
    ---------------------------------------------------------------------------
      PARAMETERS
    ---------------------------------------------------------------------------
    */

    /**
     * Add a parameter to the request.
     *
     * @type member
     * @param vId {String} String identifier of the parameter to add.
     * @param vValue {var} Value of parameter. May be a string (for one parameter) or an array of
     *     strings (for setting multiple parameter values with the same parameter
     *     name).
     * @return {void}
     */
    setParameter : function(vId, vValue) {
      this._parameters[vId] = vValue;
    },


    /**
     * Remove a parameter from the request.
     *
     * @type member
     * @param vId {String} Identifier of the parameter to remove.
     * @return {void}
     */
    removeParameter : function(vId) {
      delete this._parameters[vId];
    },


    /**
     * Get a parameter in the request.
     *
     * @type member
     * @param vId {String} Identifier of the parameter to get.
     * @return {var} TODOC
     */
    getParameter : function(vId) {
      return this._parameters[vId] || null;
    },


    /**
     * Returns the object containg all parameters for the request.
     *
     * @type member
     * @return {Object} The returned object has as its property names each of the ids of
     *     parameters which have been added, and as each property value, the value
     *     of the property corresponding to that id.
     */
    getParameters : function() {
      return this._parameters;
    },




    /*
    ---------------------------------------------------------------------------
      FORM FIELDS
    ---------------------------------------------------------------------------
    */

    /**
     * Add a form field to the POST request.
     *
     * NOTE: Adding any programatic form fields using this method will switch the
     *       Transport implementation to IframeTransport.
     *
     * NOTE: Use of these programatic form fields disallow use of synchronous
     *       requests and cross-domain requests.  Be sure that you do not need
     *       those features when setting these programatic form fields.
     *
     * @type member
     * @param vId {String} String identifier of the form field to add.
     * @param vValue {String} Value of form field
     * @return {void}
     */
    setFormField : function(vId, vValue) {
      this._formFields[vId] = vValue;
    },


    /**
     * Remove a form field from the POST request.
     *
     * @type member
     * @param vId {String} Identifier of the form field to remove.
     * @return {void}
     */
    removeFormField : function(vId) {
      delete this._formFields[vId];
    },


    /**
     * Get a form field in the POST request.
     *
     * @type member
     * @param vId {String} Identifier of the form field to get.
     * @return {var} TODOC
     */
    getFormField : function(vId) {
      return this._formFields[vId] || null;
    },


    /**
     * Returns the object containg all form fields for the POST request.
     *
     * @type member
     * @return {Object} The returned object has as its property names each of the ids of
     *     form fields which have been added, and as each property value, the value
     *     of the property corresponding to that id.
     */
    getFormFields : function() {
      return this._formFields;
    },


    /**
     * Obtain the sequence (id) number used for this request
     *
     * @type member
     * @return {Integer} The sequence number of this request
     */
    getSequenceNumber : function() {
      return this._seqNum;
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this.setTransport(null);
    this._disposeFields("_requestHeaders", "_parameters", "_formFields");
  }
});
