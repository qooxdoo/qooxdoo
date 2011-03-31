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

/* ************************************************************************

#ignore(XDomainRequest)

************************************************************************ */

/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 *
 * A wrapper of the XMLHttpRequest host object (or equivalent).
 *
 * Hides browser inconsistencies and works around bugs found in popular
 * implementations. Follows the interface specified in
 * <a href="http://www.w3.org/TR/XMLHttpRequest/">XmlHttpRequest</a>. Also
 * borrows some methods as described in
 * <a href="http://www.w3.org/TR/XMLHttpRequest2/">XmlHttpRequest2</a>.
 *
 * The most basic setup looks similar to this:
 *
 * <pre class="javascript">
 *  var req = new qx.bom.request.Xhr();
 *  req.onload = function() {
 *    // Handle data received
 *    req.responseText;
 *  }
 *
 *  req.open("GET", url);
 *  req.send();
 * </pre>
 */
qx.Bootstrap.define("qx.bom.request.Xhr",
{

  construct: function() {
    this.__onNativeReadyStateChangeBound = qx.Bootstrap.bind(this.__onNativeReadyStateChange, this);

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
     * {String} The response of the request as text.
     */
    responseText: "",

    /**
     * {Object} The response of the request as a Document object.
     */
    responseXML: null,

    /**
     * {Number} The HTTP status code.
     */
    status: 0,

    /**
     * {String} The HTTP status text.
     */
    statusText: "",

    /**
     * Initializes (prepares) the request.
     *
     * @lint ignoreUndefined(XDomainRequest)
     *
     * @param method {String}
     *        The HTTP method to use, either "GET" or "POST".
     * @param url {String}
     *        The URL to which to send the request.
     * @param async {Boolean?true}
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

      // Send flag may have been set on previous request
      this.__send = false;

      // Abort flag may have been set on previous request
      this.__abort = false;

      if (typeof async == "undefined") {
        async = true;
      }
      this.__async = async;

      // BUGFIX
      // IE < 9 and FF < 3.5 cannot reuse the native XHR to issue many requests
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
      this.__nativeXhr.onreadystatechange = this.__onNativeReadyStateChangeBound;

      try {
        this.__nativeXhr.open(method, url, async, user, password);

      // BUGFIX: IE, Firefox < 3.5
      // Some browsers do not support Cross-Origin Resource Sharing (CORS)
      // for XMLHttpRequest. Instead, an exception is thrown if URL is
      // cross-origin (as per XHR level 1). Use the proprietary XDomainRequest
      // if available (supports CORS) and handle error (if there is one) this
      // way. Otherwise just assume network error.
      //
      // Basically, this allows to send requests to cross-origin URLs.
      } catch(OpenFailed) {

        // Try again with XDomainRequest
        // - IE 9
        if (window.XDomainRequest) {
          // Success case not handled on purpose
          this.readyState = 4;
          this.__nativeXhr = new XDomainRequest();
          this.__nativeXhr.onerror = qx.Bootstrap.bind(function() {
            this.onreadystatechange();
            this.onerror();
            this.onloadend();
          }, this);
          this.__nativeXhr.open(method, url, async, user, password);
          return;
        }

        // Access denied
        // - IE 6: -2146828218
        // - IE 7: -2147024891
        // - Legacy Firefox
        window.setTimeout(qx.Bootstrap.bind(function() {
          this.readyState = 4;
          this.onreadystatechange();
          this.onerror();
          this.onloadend();
        }, this));
      }

      // BUGFIX: Firefox
      // Firefox < 4 fails to trigger onreadystatechange OPENED for sync requests
      if (qx.core.Environment.get("engine.name") === "gecko" &&
          parseInt(qx.core.Environment.get("engine.version"), 10) < 2 &&
          !this.__async) {
        // Native XHR is already set to readyState DONE. Fake readyState
        // and call onreadystatechange manually.
        this.readyState = qx.bom.request.Xhr.OPENED;
        this.onreadystatechange();
      }

    },

    /**
     * Sets an HTTP request header to be used by the request.
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

      // BUGFIX: Chrome
      // Chrome fires "NETWORK_ERR: XMLHttpRequest Exception 101" even when async
      // This violates XMLHttpRequest Level 2, see
      // http://www.w3.org/TR/XMLHttpRequest2/#network-error
      if (this.__async) {
        try {
          this.__nativeXhr.send(data);

          // TODO: May throw error in IE.
          // 'readyState' is null or no object.
          this.__onNativeReadyStateChange();

        } catch(NetworkError) {}
      } else {
        this.__nativeXhr.send(data);
      }

      // BUGFIX: Firefox
      // Firefox fails to trigger onreadystatechange DONE for sync requests
      if (qx.core.Environment.get("engine.name") === "gecko" && !this.__async) {
        // Properties all set, only missing native readystatechange event
        this.__onNativeReadyStateChange();
      }

      // Set send flag
      this.__send = true;
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

      this.__abort = true;
      this.__nativeXhr.abort();

      if (this.__nativeXhr) {
        this.readyState = this.__nativeXhr.readyState;
      }
    },

    /**
     * Event handler for an event that fires at every state change.
     *
     * Replace with custom method to get informed about the communication progress.
     */
    onreadystatechange: function() {},

    /**
     * Event handler for XHR event "load" that is fired on successful retrieval.
     *
     * Note: This handler is called even when the HTTP status indicates an error.
     *
     * Replace with custom method to listen to the "load" event.
     */
    onload: function() {},

    /**
     * Event handler for XHR event "loadend" that is fired on retrieval.
     *
     * Note: This handler is called even when a network error (or similar)
     * occurred.
     *
     * Replace with custom method to listen to the "loadend" event.
     */
    onloadend: function() {},

    /**
     * Event handler for XHR event "error" that is fired on a network error.
     *
     * Note: This handler is NOT called on successful retrieval, even when
     * the HTTP status code indicates an error.
     *
     * Replace with custom method to listen to the "error" event.
     */
    onerror: function() {},

    /**
     * Get a single response header from response.
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
     * Get all response headers from response.
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

    /**
     * Dispose object and wrapped native XHR.
     */
    dispose: function() {
      if (this.__disposed) {
        return false;
      }

      // Remove unload listener in IE. Aborting on unload is no longer required
      // for this instance.
      if (window.detachEvent) {
        window.detachEvent("onunload", this.__onUnloadBound);
      }

      // May fail in IE
      try {
        this.__nativeXhr.onreadystatechange;
      } catch(PropertiesNotAccessable) {
        return;
      }

      // Clear out listeners
      var noop = function() {};
      this.__nativeXhr.onreadystatechange = noop;
      this.__nativeXhr.onload = noop;
      this.__nativeXhr.onerror = noop;

      // Abort any network activity
      this.abort();

      // Remove reference to native XHR
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
     * Get wrapped native XMLHttpRequest (or equivalent).
     *
     * Can be XMLHttpRequest or ActiveX.
     *
     * @return {Object} XMLHttpRequest or equivalent.
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

    /**
     * Get protocol.
     *
     * @return {String} The current protocol.
     */
    _getProtocol: function() {
      return window.location.protocol;
    },

    /*
    ---------------------------------------------------------------------------
      PRIVATE
    ---------------------------------------------------------------------------
    */

    /**
     * {Object} XMLHttpRequest or equivalent.
     */
    __nativeXhr: null,

    /**
     * {Boolean} Whether request is async.
     */
    __async: null,

    /**
     * {Function} Bound __onNativeReadyStateChange handler.
     */
    __onNativeReadyStateChangeBound: null,

    /**
     * {Function} Bound __onUnload handler.
     */
    __onUnloadBound: null,

    /**
     * {Boolean} Send flag
     */
    __send: null,

    /**
     * {Boolean} Abort flag
     */
    __abort: null,

    /**
     * {Boolean} Whether object has been disposed.
     */
    __disposed: null,

    /**
     * Init native XHR.
     */
    __initNativeXhr: function() {
      // Create native XHR or equivalent and hold reference
      this.__nativeXhr = this._createNativeXhr();

      // Track native ready state changes
      this.__nativeXhr.onreadystatechange = this.__onNativeReadyStateChangeBound;

      // Reset flags
      this.__disposed = this.__send = this.__abort = false;
    },

    /**
     * Handle native onreadystatechange.
     *
     * Calls user-defined function onreadystatechange on each
     * state change and syncs the XHR status properties.
     */
    __onNativeReadyStateChange: function() {
      var nxhr = this.__nativeXhr,
          propertiesReadable = true;

      // BUGFIX: IE, Firefox
      // onreadystatechange() is called twice for readyState OPENED.
      //
      // Call onreadystatechange only when readyState has changed.
      if (this.readyState == nxhr.readyState) {
        return;
      }

      // Sync current readyState
      this.readyState = nxhr.readyState;

      // BUGFIX: IE
      // Superfluous onreadystatechange DONE when aborting OPENED
      // without send flag
      if (this.readyState === qx.bom.request.Xhr.DONE &&
          this.__abort && !this.__send) {
        return;
      }

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

      if (this.readyState > qx.bom.request.Xhr.OPENED) {
        // In some browsers, XHR properties are not readable
        // while request is in progress.
        try {
          this.status = nxhr.status;
          this.statusText = nxhr.statusText;
          this.responseText = nxhr.responseText;
          this.responseXML = nxhr.responseXML;
        } catch(XhrPropertiesNotReadable) {
          propertiesReadable = false;
        }

        if (propertiesReadable) {
          this.__normalizeStatus();
          this.__normalizeResponseXML();
        }
      }

      // Always fire "readystatechange"
      this.onreadystatechange();

      // Fire either "load" or "error"
      if (this.readyState === qx.bom.request.Xhr.DONE) {
        // Infer the XHR internal error flag from statusText.
        //
        // See http://www.w3.org/TR/XMLHttpRequest2/#error-flag and
        // http://www.w3.org/TR/XMLHttpRequest2/#the-statustext-attribute
        this.statusText ? this.onload() : this.onerror();

        // Always fire "onloadend" when DONE
        this.onloadend();
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
     * Normalize status property across browsers.
     */
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

    /**
     * Normalize responseXML property across browsers.
     */
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

    /**
     * Handler for native unload event.
     */
    __onUnload: function() {
      try {
        // Abort and dispose
        if (this) {
          this.dispose();
        }
      } catch(e) {}
    },

    /**
     * Helper method to determine whether browser supports reusing the
     * same native XHR to send more requests.
     */
    __supportsManyRequests: function() {
      var name = qx.core.Environment.get("engine.name");
      var version = qx.core.Environment.get("engine.version");

      return !(name == "mshtml" && version < 9 ||
               name == "gecko" && version < 3.5);
    }
  }
});
