/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tristan Koch (tristankoch)

************************************************************************ */

/**
 * A wrapper of the XMLHttpRequest host object (or equivalent).
 *
 * Hides browser inconsistencies and works around bugs found in popular
 * implementations. Follows the interface described in
 * <a href="http://www.w3.org/TR/XMLHttpRequest/">XmlHttpRequest Level 1</a>.
 */
qx.Bootstrap.define("qx.bom.request.Xhr",
{

  construct: function() {
    // Hold reference to native XHR or equivalent
    this.__nativeXhr = this.__createNativeXhr();

    // Track native ready state changes
    this.__nativeXhr.onreadystatechange =
      qx.lang.Function.bind(this.__handleReadyStateChange, this);
  },

  statics :
  {
    UNSENT: 0,
    OPENED: 1,
    HEADERS_RECEIVED: 2,
    LOADING: 3,
    DONE: 4
  },

  members :
  {
    /*
    ---------------------------------------------------------------------------
      PUBLIC
    ---------------------------------------------------------------------------
    */

    /**
     * {Number} Ready state.
     *
     * States can be:
     * UNSENT:           0,
     * OPENED:           1,
     * HEADERS_RECEIVED: 2,
     * LOADING:          3,
     * DONE:             4
     */
    readyState: 0,

    /**
     * The response of the request as text.
     */
    responseText: "",

    /**
     * The response of the request as a Document object.
     */
    responseXML: null,

    /**
     * The HTTP status code.
     */
    status: 0,

    /**
     * The HTTP status text.
     */
    statusText: "",

    /**
     * Initialize (prepare) a request.
     *
     * @param method {String}
     *        The HTTP method to use, either "GET" or "POST"
     * @param url {String}
     *        The URL to which to send the request.
     * @param async {Boolean?false}
     *        Whether or not to perform the operation asynchronously.
     * @param user {String?null}
     *        Optional user name to use for authentication purposes.
     * @param password {String?null}
     *        Optional password to use for authentication purposes.
     */
    open: function(method, url, async, user, password) {
      if (typeof async == "undefined") {
        async = true;
      }
      this.__nativeXhr.open(method, url, async, user, password);
    },

    /**
    * Sets the value of an HTTP request header.
    *
    * Note: The request must be initialized before using this method.
    *
    * @param header {String}
    *        The name of the header whose value is to be set.
    * @param value {String}
    *        The value to set as the body of the header.
    */
    setRequestHeader: function(header, value) {
      this.__nativeXhr.setRequestHeader(header, value);
    },

    /**
     * Sends the request.
     *
     * @param data {String|Document?null}
     *        Optional data to send.
     */
    send: function(data) {
      // BUGFIX: Firefox 2
      // "NS_ERROR_XPC_NOT_ENOUGH_ARGS" when calling send() without arguments
      data = typeof data == "undefined" ? null : data;

      this.__nativeXhr.send(data);
    },

    /**
     * Event handler for an event that fires at every state change.
     *
     * Override this method to get informed about the communication progress.
     */
    onreadystatechange: function() {},

    /**
     * Get a single response header.
     *
     * @param  header {String}
     *         Key of the header to get the value from.
     * @return {String}
     *         Response header.
     */
    getResponseHeader: function(header) {
      return this.__nativeXhr.getResponseHeader(header);
    },

    /**
     * Get all response headers.
     *
     * @return {String} All response headers.
     */
    getAllResponseHeaders: function() {
      return this.__nativeXhr.getAllResponseHeaders();
    },



    /*
    ---------------------------------------------------------------------------
      PROTECTED
    ---------------------------------------------------------------------------
    */

    /**
     * Get native XMLHttpRequest (or equivalent).
     *
     * Can be XMLHttpRequest or ActiveX.
     *
     */
    _getNativeXhr: function() {
      return this.__nativeXhr;
    },



    /*
    ---------------------------------------------------------------------------
      PRIVATE
    ---------------------------------------------------------------------------
    */

    /**
     * XMLHttpRequest or equivalent.
     */
    __nativeXhr: null,

    /**
     * Create XMLHttpRequest (or equivalent).
     *
     * @return {Object} XMLHttpRequest or equivalent.
     */
    __createNativeXhr: function() {
      return qx.core.Environment.get("io.xhr") ? new XMLHttpRequest() : new window.ActiveXObject("Microsoft.XMLHTTP");
    },

    /**
     * Handle native onreadystatechange.
     *
     * Calls user-defined function onreadystatechange on each
     * state change and syncs the readyState property.
     */
    __handleReadyStateChange: function() {

      // BUGFIX: IE
      // IE < 7 cannot access responseText and other properties 
      // when request is in progress. "The data necessary to complete 
      // this operation is not yet available".
      var isLegacyIE       = qx.core.Environment.get("browser.name") == "ie" &&
                             qx.core.Environment.get("browser.version") < 7;
      var inProgressOrDone = this.__nativeXhr.readyState > 1 && !isLegacyIE ||
                             this.__nativeXhr.readyState == qx.bom.request.Xhr.DONE;

      if (inProgressOrDone) {
        this.status = this.__nativeXhr.status;
        this.statusText = this.__nativeXhr.statusText;
        this.responseText = this.__nativeXhr.responseText;
        this.responseXML = this.__nativeXhr.responseXML;
      } else {
        this.status = 0;
        this.statusText = this.responseText = "";
        this.responseXML = null;
       }

       // BUGFIX: Internet Explorer, Firefox
       // onreadystatechange() is called twice for readyState OPENED.
       if (this.readyState !== this.__nativeXhr.readyState) {
         this.readyState = this.__nativeXhr.readyState;
         this.onreadystatechange();
       }

    }
  }
});
