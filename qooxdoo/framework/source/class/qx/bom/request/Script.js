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
  },

  members :
  {

    // XHR Properties
    readyState: 0,
    status: 0,
    statusText: null,

    timeout: 0,

    open: function(method, url) {
      this.__url = url;

      // May have been aborted before
      this.__abort = false;

      this.__readyStateChange(1);
    },

    send: function() {
      var script = this.__scriptElement,
          head = this.__headElement;

      script.src = this.__url;
      script.onerror = this.__onNativeErrorBound;
      script.onload = this.__onNativeLoadBound;

      // BUGFIX: IE < 9
      // Legacy IEs do not fire the "load" event for script elements.
      // Instead, the support the "readystatechange" event
      if (qx.core.Environment.get("engine.name") === "mshtml" &&
          qx.core.Environment.get("engine.version") < 9) {
        script.onreadystatechange = this._onNativeLoadBound;
      }

      if (this.timeout > 0) {
        this.__timeoutId = window.setTimeout(this.__onTimeoutBound, this.timeout);
      }

      // Attach script to DOM
      head.insertBefore(script, head.firstChild);

      // The resource is loaded once the script is in DOM.
      // Assume HEADERS_RECEIVED and LOADING.
      this.__readyStateChange(2);
      this.__readyStateChange(3);
    },

    setRequestHeader: function(key, value) {
      var param = {};

      if (this.readyState !== 1) {
        throw new Error("Invalid state");
      }

      param[key] = value;
      this.__url = qx.util.Uri.appendParamsToUrl(this.__url, param);
    },

    abort: function() {
      this.__abort = true;
      this.__disposeScriptElement();
      this.onabort();
    },

    onreadystatechange: function() {},

    onload: function() {},

    onerror: function() {},

    ontimeout: function() {},

    onabort: function() {},

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
      this.ontimeout();
    },

    _onNativeLoad: function(e) {
      var script = this.__scriptElement;

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
        }
      }

      if (this.__timeoutId) {
        window.clearTimeout(this.__timeoutId);
      }

      this.__success();
      this.__readyStateChange(4);
      this.onload();
    },

    _onNativeError: function() {
      this.__failure();
      this.onerror();
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

    __disposeScriptElement: function() {
      var script = this.__scriptElement;

      if (script && script.parentNode) {
        this.__headElement.removeChild(script);
      }
    }
  }
});
