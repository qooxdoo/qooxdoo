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

qx.Bootstrap.define("qx.bom.request.Xhr",
{

  construct: function() {
    // Hold reference to native XHR or equivalent
    this.__nativeXhr = this.__createNativeXhr();

    // Track native ready state changes
    this.__nativeXhr.onreadystatechange =
      qx.lang.Function.bind(this.__handleReadyStateChange, this);

    // Initial state is UNSENT
    this.readyState = qx.bom.request.Xhr.UNSENT;
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
    readyState: null,

    /**
    *
    */
    responseText: "",

    /**
    *
    */
    open: function(method, url) {
      this.__nativeXhr.open(method, url);
    },

    /**
    *
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
    * This method needs to be overwritten by the user to get
    * informed about the communication progress.
    */
    onreadystatechange: function() {},



    /*
    ---------------------------------------------------------------------------
      PROTECTED
    ---------------------------------------------------------------------------
    */

    /**
    * Get native XHR.
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
    *
    * @return {Object} XMLHttpRequest or equivalent.
    */
    __createNativeXhr: function() {
      return qx.core.Environment.get("io.xhr") ? new XMLHttpRequest() : new window.ActiveXObject("Microsoft.XMLHTTP");
    },

    /**
    * Call user-defined function onreadystatechange on state change and
    * sync readyState.
    */
    __handleReadyStateChange: function() {

      // BUGFIX: IE
      // IE < 7 cannot access responseText while LOADING
      // "The data necessary to complete this operation is not yet available".

      var isLegacyIE = qx.core.Environment.get("browser.name") == "ie" &&
                       qx.core.Environment.get("browser.version") < 7;
      var isLoading  = this.__nativeXhr.readyState == qx.bom.request.Xhr.LOADING;
      var isDone     = this.__nativeXhr.readyState == qx.bom.request.Xhr.DONE

      if ((!isLegacyIE && isLoading) || isDone) {
        this.responseText = this.__nativeXhr.responseText;
      } else {
        // Set to empty string as specified in XMLHttpRequest Level 1.
        this.responseText = "";
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
