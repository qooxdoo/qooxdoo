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

qx.Bootstrap.define("qx.bom.request.Script",
{

  construct : function()
  {
    this.__onNativeLoadBound = qx.Bootstrap.bind(this._onNativeLoad, this);
    this.__onNativeErrorBound = qx.Bootstrap.bind(this._onNativeError, this);
    this.__onTimeoutBound = qx.Bootstrap.bind(this._onTimeout, this);

    this.__scriptElement = document.createElement("script");
    this.__headElement = document.head || document.getElementsByTagName( "head" )[0] ||
                         document.documentElement;

    // BUGFIX: Browsers not supporting error handler
    // Set default timeout to capture network errors
    if (!this.__supportsErrorHandler()) {
      this.timeout = 5000;

      // BUGFIX: IE < 9
      // Legacy IEs fire "load" event on network error after about 3 seconds.
      // Unfortunately there is not way to distinguish a long loading request
      // from a network error, since the "loading" event is fired right after
      // sending.
      //
      // A work-around is to detect a timeout before "load" is fired. However,
      // a timeout of 2s can have unwanted side-effects such as detect an
      // error for long loading requests. It should be noted that browsers
      // parse the script, before a "load" is fired.
      // if (qx.core.Environment.get("engine.name") == "mshtml" &&
      //     qx.core.Environment.get("engine.version") < 9) {
      //   this.timeout = 2000;
      // }
    }
  },

  members :
  {

    readyState: 0,
    status: 0,
    statusText: null,
    timeout: 0,

    _error: null,

    __async: null,

    open: function(method, url, async) {
      if (this.__disposed) {
        return;
      }

      if (typeof async == "undefined") {
        async = true;
      }

      this.__async = async;

      // May have been aborted before
      this.__abort = false;

      this.__url = url;

      if (qx.core.Environment.get("qx.debug.io")) {
        qx.Bootstrap.debug(qx.bom.request.Script, "Open native request with " +
          "url: " + url);
      }

      this.__readyStateChange(1);
    },

    send: function() {
      if (this.__disposed) {
        return;
      }

      var script = this.__scriptElement,
          head = this.__headElement,
          that = this;

      script.src = this.__url;
      script.onerror = this.__onNativeErrorBound;
      script.onload = this.__onNativeLoadBound;

      // BUGFIX: IE < 9
      // Legacy IEs do not fire the "load" event for script elements.
      // Instead, they support the "readystatechange" event
      if (qx.core.Environment.get("engine.name") === "mshtml" &&
          qx.core.Environment.get("engine.version") < 9) {
        script.onreadystatechange = this.__onNativeLoadBound;
      }

      if (this.timeout > 0) {
        this.__timeoutId = window.setTimeout(this.__onTimeoutBound, this.timeout);
      }

      if (qx.core.Environment.get("qx.debug.io")) {
        qx.Bootstrap.debug(qx.bom.request.Script, "Send native request");
      }

      // Attach script to DOM
      head.insertBefore(script, head.firstChild);

      // The resource is loaded once the script is in DOM.
      // Assume HEADERS_RECEIVED and LOADING and dispatch async.
      window.setTimeout(function() {
        that.__readyStateChange(2);
        that.__readyStateChange(3);
      });
    },

    setRequestHeader: function(key, value) {
      if (this.__disposed) {
        return;
      }

      var param = {};

      if (this.readyState !== 1) {
        throw new Error("Invalid state");
      }

      param[key] = value;
      this.__url = qx.util.Uri.appendParamsToUrl(this.__url, param);
    },

    abort: function() {
      if (this.__disposed) {
        return;
      }

      this.__abort = true;
      this.__disposeScriptElement();
      this.onabort();
    },

    onreadystatechange: function() {},

    onload: function() {},

    onloadend: function() {},

    onerror: function() {},

    ontimeout: function() {},

    onabort: function() {},

    getResponseHeader: function(key) {
      if (this.__disposed) {
        return;
      }

      if (qx.core.Environment.get("qx.debug")) {
        qx.log.Logger.debug("Response header cannot be determined for " +
          "requests made with script transport.");
      }
      return "unknown";
    },

    getAllResponseHeaders: function() {
      if (this.__disposed) {
        return;
      }

      if (qx.core.Environment.get("qx.debug")) {
        qx.log.Logger.debug("Response headers cannot be determined for" +
          "requests made with script transport.");
      }

      return "Unknown response headers";
    },

    dispose: function() {
      var script = this.__scriptElement;

      if (!this.__disposed) {

        // Prevent memory leaks
        script.onload = script.onreadystatechange = null;

        this.__disposeScriptElement();

        if (this.__timeoutId) {
          window.clearTimeout(this.__timeoutId);
        }

        this.__disposed = true;
      }
    },

    _getUrl: function() {
      return this.__url;
    },

    _getScriptElement: function() {
      return this.__scriptElement;
    },

    __scriptElement: null,
    __headElement: null,

    __url: "",

    __onNativeLoadBound: null,
    __onNativeErrorBound: null,
    __onTimeoutBound: null,

    __timeoutId: null,

    __abort: null,
    __disposed: null,

    _onTimeout: function() {
      this.__failure();

      if (!this.__supportsErrorHandler()) {
        this.onerror();
      }

      this.ontimeout();

      if (!this.__supportsErrorHandler()) {
        this.onloadend();
      }
    },

    _onNativeLoad: function() {
      var script = this.__scriptElement,
          that = this;

      // Aborted request must not fire load
      if (this.__abort) {
        return;
      }

      // BUGFIX: IE < 9
      // When handling "readystatechange" event, skip if readyState
      // does not signal loaded script
      if (qx.core.Environment.get("engine.name") === "mshtml" &&
          qx.core.Environment.get("engine.version") < 9) {
        if (!(/loaded|complete/).test(script.readyState)) {
          return;
        } else {
          if (qx.core.Environment.get("qx.debug.io")) {
            qx.Bootstrap.debug(qx.bom.request.Script, "Received native readyState: loaded");
          }
        }
      }

      if (qx.core.Environment.get("qx.debug.io")) {
        qx.Bootstrap.debug(qx.bom.request.Script, "Received native load");
      }

      if (this._error) {
        if (qx.core.Environment.get("qx.debug.io")) {
          qx.Bootstrap.debug(qx.bom.request.Script, "Error detected");
        }

        this._onNativeError();
        return;
      }

      if (this.__timeoutId) {
        window.clearTimeout(this.__timeoutId);
      }

      window.setTimeout(function() {
        that.__success();
        that.__readyStateChange(4);
        that.onload();
        that.onloadend();
      });
    },

    _onNativeError: function() {
      this.__failure();
      this.onerror();
      this.onloadend();
    },

    __readyStateChange: function(readyState) {
      this.readyState = readyState;
      this.onreadystatechange();
    },

    __success: function() {
      this.__disposeScriptElement();
      this.readyState = 4;
      this.status = 200;
      this.statusText = "200 OK";
    },

    __failure: function() {
      this.__disposeScriptElement();
      this.readyState = 4;
      this.status = 0;
      this.statusText = null;
    },

    __supportsErrorHandler: function() {
      var isLegacyIe = qx.core.Environment.get("engine.name") === "mshtml" &&
        qx.core.Environment.get("engine.version") < 9;

      var isOpera = qx.core.Environment.get("engine.name") === "opera";

      return !(isLegacyIe || isOpera);
    },

    __disposeScriptElement: function() {
      var script = this.__scriptElement;

      if (script && script.parentNode) {
        this.__headElement.removeChild(script);
      }
    }
  },

  defer: function() {
    qx.core.Environment.add("qx.debug.io", false);
  }
});
