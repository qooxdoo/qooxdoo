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
    this.__onReadyStateChangeBound = qx.Bootstrap.bind(this.__onReadyStateChange, this);

    this.__initNativeXhr();
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

    __disposed: null,

    __onReadyStateChangeBound: null,

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
      if (this.__disposed) {
        return;
      }

      if (typeof async == "undefined") {
        async = true;
      }

      // BUGFIX
      // IE < 8 and FF < 3.5 cannot reuse the native XHR to issue many requests
      if (!this.__supportsManyRequests() && this.readyState > qx.bom.request.Xhr.UNSENT) {
        // XmlHttpRequest Level 1 requires open() to abort any pending requests
        // associated to the object. Since we're dealing with a new object here,
        // we have to emulate this behavior.
        this.abort();

        // Allow old native XHR to be garbage collected
        this.dispose();

        // Replace the underlying native XHR with a new one that can
        // be used to issue new requests.
        this.__initNativeXhr();
      }

      // Restore handler in case it was removed before
      this.__nativeXhr.onreadystatechange = this.__onReadyStateChangeBound;

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
      if (this.__disposed) {
        return;
      }

      this.__nativeXhr.setRequestHeader(header, value);
    },

    /**
     * Sends the request.
     *
     * @param data {String|Document?null}
     *        Optional data to send.
     */
    send: function(data) {
      if (this.__disposed) {
        return;
      }

      // BUGFIX: Firefox 2
      // "NS_ERROR_XPC_NOT_ENOUGH_ARGS" when calling send() without arguments
      data = typeof data == "undefined" ? null : data;

      this.__nativeXhr.send(data);
    },

    /**
     * Aborts the request.
     *
     * Cancels any network activity.
     *
     */
    abort: function() {
      if (this.__disposed) {
        return;
      }

      this.__nativeXhr.abort();

      if (this.__nativeXhr) {
        this.readyState = this.__nativeXhr.readyState;
      }
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
      if (this.__disposed) {
        return;
      }

      return this.__nativeXhr.getResponseHeader(header);
    },

    /**
     * Get all response headers.
     *
     * @return {String} All response headers.
     */
    getAllResponseHeaders: function() {
      if (this.__disposed) {
        return;
      }

      return this.__nativeXhr.getAllResponseHeaders();
    },

    /*
    ---------------------------------------------------------------------------
      HELPER
    ---------------------------------------------------------------------------
    */

    dispose: function() {
      if (this.__disposed) {
        return false;
      }

      // Clear out listeners
      this.__nativeXhr.onreadystatechange = function() {};

      // Remove reference to native XHR.
      this.__nativeXhr = null;

      this.__disposed = true;
      return true;
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

    /**
     * Create XMLHttpRequest (or equivalent).
     *
     * @return {Object} XMLHttpRequest or equivalent.
     */
    _createNativeXhr: function() {
      return qx.core.Environment.get("io.xhr") ? new XMLHttpRequest() : new window.ActiveXObject("Microsoft.XMLHTTP");
    },

    _getProtocol: function() {
      return window.location.protocol;
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

    __initNativeXhr: function() {
      // Hold reference to native XHR or equivalent
      this.__nativeXhr = this._createNativeXhr();

      // Track native ready state changes
      this.__nativeXhr.onreadystatechange = this.__onReadyStateChangeBound;

      this.__disposed = false;
    },

    /**
     * Handle native onreadystatechange.
     *
     * Calls user-defined function onreadystatechange on each
     * state change and syncs the XHR properties.
     */
    __onReadyStateChange: function() {
      var nxhr = this.__nativeXhr;

      if (this.__statusPropertiesReadable()) {

        this.status = nxhr.status;

        // BUGFIX: IE
        // IE sometimes tells 1223 when it should be 204
        this.status = nxhr.status == 1223 ?
                      204 : this.status;

        // BUGFIX: Opera
        // Opera tells 0 when it should be 304
        if (nxhr.readyState === qx.bom.request.Xhr.DONE) {
          this.status = nxhr.status == 0 ?
                        304 : this.status;
        }

        // BUGFIX: Most browsers
        // Most browsers tell status 0 when it should be 200 for local files
        if (this._getProtocol() === "file:") {
          this.status = nxhr.status == 0 ?
                        200 : this.status;
        }

        this.statusText = nxhr.statusText;
        this.responseText = nxhr.responseText;
        this.responseXML = nxhr.responseXML;

      } else {
        this.status = 0;
        this.statusText = this.responseText = "";
        this.responseXML = null;
       }

       // BUGFIX: Opera
       // Opera skips HEADERS_RECEIVED and jumps right to LOADING.
       if (qx.core.Environment.get("browser.name") == "opera" &&
           nxhr.readyState === 3) {
         this.readyState = 2;
         this.onreadystatechange();
       }

       // BUGFIX: IE, Firefox
       // onreadystatechange() is called twice for readyState OPENED.
       if (this.readyState !== nxhr.readyState) {
         this.readyState = nxhr.readyState;
         this.onreadystatechange();
       }

       // BUGFIX: IE
       // Memory leak in XMLHttpRequest (on-page)
       if (this.readyState == qx.bom.request.Xhr.DONE) {
         // Allow garbage collecting of native XHR
         if (nxhr) {
           nxhr.onreadystatechange = function() {};
         }
      }

    },

    /**
     * Indicates if certain properties of the XmlHttpRequest object
     * are safe to read.
     *
     * This is true if if the request is in progress (or done) for most
     * browsers or done in IE < 8.
     *
     * @return {Boolean} Whether certain properties of the XmlHttpRequest
     *                   object are safe to read.
     */
    __statusPropertiesReadable: function() {
      // BUGFIX: IE
      // IE < 8 cannot access responseText and other properties
      // when request is in progress. "The data necessary to complete
      // this operation is not yet available".
      var isLegacyIE = qx.core.Environment.get("browser.name") == "ie" &&
                       qx.core.Environment.get("browser.version") < 8;

      return this.__nativeXhr.readyState > 1 && !isLegacyIE ||
        this.__nativeXhr.readyState == qx.bom.request.Xhr.DONE;
    },

    __supportsManyRequests: function() {
      var name = qx.core.Environment.get("browser.name");
      var version = qx.core.Environment.get("browser.version");

      return !(name == "ie" && version < 8 ||
               name == "firefox" && version < 3.5);
    }
  }
});
