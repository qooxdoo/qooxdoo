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

    // BUGFIX: IE
    // IE keeps connections alive unless aborted on unload
    if (window.attachEvent) {
      this.__onUnloadBound = qx.Bootstrap.bind(this.__onUnload, this);
      window.attachEvent("onunload", this.__onUnloadBound);
    }

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

    __async: null,

    __disposed: null,

    __onReadyStateChangeBound: null,

    __onUnloadBound: null,

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
      this.__async = async;

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

      // BUGFIX: Firefox
      // Firefox fails to trigger onreadystatechange OPENED for sync requests
      if (qx.core.Environment.get("engine.name") === "gecko" && !this.__async) {
        // Native XHR is already set to readyState DONE. Fake readyState
        // and call onreadystatechange manually.
        this.readyState = qx.bom.request.Xhr.OPENED;
        this.onreadystatechange();
      }

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

      // BUGFIX: Firefox
      // Firefox fails to trigger onreadystatechange DONE for sync requests
      if (qx.core.Environment.get("engine.name") === "gecko" && !this.__async) {
        // Properties all set, only missing native readystatechange event
        this.__onReadyStateChange();
      }
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

      // Abort any network activity
      this.abort();

      // Remove reference to native XHR
      this.__nativeXhr = null;

      // Remove unload listener in IE. Aborting on unload is no longer required
      // for this instance.
      if (window.detachEvent) {
        window.detachEvent("onunload", this.__onUnloadBound);
      }

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
      var xhr = qx.core.Environment.get("io.xhr");

      if (xhr === "xhr") {
        return new XMLHttpRequest();
      }

      if (xhr == "activex") {
        return new window.ActiveXObject("Microsoft.XMLHTTP");
      }

      qx.log.Logger.error(this, "No XHR support available.");
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
     * state change and syncs the XHR status properties.
     */
    __onReadyStateChange: function() {
      var nxhr = this.__nativeXhr;

      // BUGFIX: IE
      // IE fires onreadystatechange HEADERS_RECEIVED and LOADING when sync
      //
      // According to spec, only onreadystatechange OPENED and DONE should
      // be fired.
      if (!this.__async && (nxhr.readyState == 2 || nxhr.readyState == 3)) {
        return;
      }

      // Default values according to spec.
      this.status = 0;
      this.statusText = this.responseText = "";
      this.responseXML = null;

      if (nxhr.readyState > qx.bom.request.Xhr.OPENED) {
        // In some browsers, XHR properties are not readable
        // while request is in progress.
        try {
          this.status = nxhr.status;
          this.statusText = nxhr.statusText;
          this.responseText = nxhr.responseText;
          this.responseXML = nxhr.responseXML;
        } catch(XhrPropertyNotReadable) {
          this.__triggerOnReadyStateChange();
          return;
        }

        this.__normalizeStatus();
        this.__normalizeResponseXML();
      }

      this.__triggerOnReadyStateChange();

      // BUGFIX: IE
      // Memory leak in XMLHttpRequest (on-page)
      if (this.readyState == qx.bom.request.Xhr.DONE) {
        // Allow garbage collecting of native XHR
        if (nxhr) {
          nxhr.onreadystatechange = function() {};
        }
      }

    },

    __triggerOnReadyStateChange: function() {
      var nxhr = this.__nativeXhr;
      
      // BUGFIX: Opera
      // Opera skips HEADERS_RECEIVED and jumps right to LOADING.
      //
      // Trigger additional onreadystatechange with LOADING readyState.
      if (qx.core.Environment.get("engine.name") == "opera" &&
          nxhr.readyState === qx.bom.request.Xhr.LOADING) {
        this.readyState = qx.bom.request.Xhr.HEADERS_RECEIVED;
        this.onreadystatechange();
      }

      // BUGFIX: IE, Firefox
      // onreadystatechange() is called twice for readyState OPENED.
      //
      // Call onreadystatechange only when readyState has changed.
      if (this.readyState == nxhr.readyState) {
        return;
      }

      // Finally, call user-defined onreadystatechange
      this.readyState = nxhr.readyState;
      this.onreadystatechange();
    },

    __normalizeStatus: function() {
      var nxhr = this.__nativeXhr;

      // BUGFIX: Most browsers
      // Most browsers tell status 0 when it should be 200 for local files
      if (this._getProtocol() === "file:" && this.status === 0) {
        this.status = 200;
      }

      // BUGFIX: IE
      // IE sometimes tells 1223 when it should be 204
      if (this.status === 1223) {
        this.status = 204;
      }

      // BUGFIX: Opera
      // Opera tells 0 when it should be 304
      if (nxhr.readyState === qx.bom.request.Xhr.DONE && this.status == 0) {
        this.status = 304;
      }
    },

    __normalizeResponseXML: function() {
      // BUGFIX: IE
      // IE does not recognize +xml extension, resulting in empty responseXML.
      //
      // Check if Content-Type is +xml, verify missing responseXML then parse
      // responseText as XML.
      if (qx.core.Environment.get("engine.name") == "mshtml" &&
          (this.getResponseHeader("Content-Type") || "").match(/[^\/]+\/[^\+]+\+xml/) &&
          !this.responseXML.documentElement) {
        var dom = new window.ActiveXObject("Microsoft.XMLDOM");
        dom.async = false;
        dom.validateOnParse = false;
        dom.loadXML(this.responseText);
        this.responseXML = dom;
      }
    },

    __onUnload: function() {
      try {
        // Abort and dispose
        if (this) {
          this.dispose();
        }
      } catch(e) {}
    },

    __supportsManyRequests: function() {
      var name = qx.core.Environment.get("engine.name");
      var version = qx.core.Environment.get("engine.version");

      return !(name == "mshtml" && version < 8 ||
               name == "gecko" && version < 3.5);
    }
  }
});
