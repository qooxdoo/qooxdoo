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

   ======================================================================

   This class contains code based on the work of:

   * Sergey Ilinsky
     http://www.ilinsky.com

     Copyright:
       2007 Sergey Ilinsky

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

     Authors:
       * Sergey Ilinsky

     Comment:
       Sergey has allowed us to use his code under a MIT license
       by written consent (original code under Apache license).
       Thanks again.

************************************************************************ */

/**
 * Cross browser compatible unified XMLHttp transport low-level implementation.
 * Mimics an ideal browser without any quirks and is API identical to
 * the W3C definition.
 *
 * Additional support for:
 *
 * * the methods {@link #getRequestHeader} and {@link #removeRequestHeader}
 * * the <code>timeout</code> property and the <code>ontimeout</code> event
 * * the <code>onabort</code> event
 * * the <code>onload</code> event
 * * the <code>onerror</code> event
 *
 * These features are being considered for a future version of the XMLHttpRequest
 * specification by the W3C at http://www.w3.org/TR/XMLHttpRequest/.
 *
 * For an higher level implementation with additional comfort please have a look
 * at {@link qx.io2.HttpRequest}.
 */
qx.Bootstrap.define("qx.bom.Request",
{
  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.__headers = {};
    this.__xmlhttp = this.__createNative();
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    UNSENT  : 0,
    OPENED  : 1,
    HEADERS_RECEIVED : 2,
    LOADING : 3,
    DONE    : 4
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    __async : null,
    __stateListener : null,
    __xmlhttp : null,
    __timeoutListener : null,
    __timeoutHandle : null,
    __aborted : null,
    __lastFired : null,
    __headers : null,

    /** {Integer} Current ready state: 0=uninitialized, 1=sending request, 2=headers loaded, 3=loading result, 4=done */
    readyState : 0,

    /** {String} String version of data returned from server process */
    responseText : "",

    /** {Element} DOM-compatible document object of data returned from server process */
    responseXML : null,

    /** {Integer} Numeric code returned by server, such as 404 for "Not Found" or 200 for "OK" */
    status : 0,

    /** {String} String message accompanying the status code */
    statusText : "",

    /** {Integer} Number of milliseconds until a timeout occour */
    timeout : 0,





    /*
    ---------------------------------------------------------------------------
      EVENT LISTENER
    ---------------------------------------------------------------------------
    */

    /**
     * Event handler for an event that fires at every state change.
     *
     * This method needs to be overwritten by the user to get
     * informed about the communication progress.
     *
     * @return {void}
     */
    onreadystatechange : function() {
      // empty
    },


    /**
     * Event handler for an event that fires when the timeout limit is reached.
     *
     * This method needs to be overwritten by the user to get
     * informed about the timeout.
     *
     * @return {void}
     */
    ontimeout : function() {
      // empty
    },


    /**
     * Method which is executed when the request was finished successfully.
     *
     * This method needs to be overwritten by the user to get
     * informed about the successful load of the request.
     *
     * @return {void}
     */
    onload : function() {
      // empty
    },


    /**
     * Method which is executed when the request fails.
     *
     * This method needs to be overwritten by the user to get
     * informed about the failure of the running request.
     *
     * @return {void}
     */
    onerror : function() {
      // empty
    },


    /**
     * Method which is executed when the user aborts the running request.
     *
     * This method needs to be overwritten by the user to get
     * informed about the user abort.
     *
     * @return {void}
     */
    onabort : function() {
      // empty
    },





    /*
    ---------------------------------------------------------------------------
      MAIN CONTROL
    ---------------------------------------------------------------------------
    */

    /**
     * Assigns destination URL, method, and other optional attributes of a pending request
     *
     * @param method {String} The HTTP method to use. Valid values: GET, POST, PUT, HEAD and DELETE.
     * @param url {String} The URL to open
     * @param async {Boolean?false} Whether the request should be asynchronous
     * @param username {String?null} Optional user name
     * @param password {String?null} Optional password
     * @return {void}
     */
    open : function(method, url, async, username, password)
    {
      // Save async parameter for fixing Gecko bug with missing readystatechange in synchronous requests
      this.__async = async;

      // Prepare and register native listeners
      this.__stateListener = qx.lang.Function.bind(this.__onNativeReadyStateChange, this);
      this.__xmlhttp.onreadystatechange = this.__stateListener;

      this.__timeoutListener = qx.lang.Function.bind(this.__onNativeTimeout, this);
      this.__xmlhttp.ontimeout = this.__timeoutListener;

      // Store timeout to request
      // Currently only supported by IE8 beta
      if (this.timeout != null && this.timeout > 0) {
        this.__xmlhttp.timeout = this.timeout;
      }

      // Natively open request
      this.__xmlhttp.open(method, url, async, username, password);

      // BUGFIX: Gecko - missing readystatechange calls in synchronous requests
      if (qx.core.Variant.isSet("qx.client", "gecko"))
      {
        if (!async)
        {
          this.readyState = qx.bom.Request.OPENED;
          this.__fireReadyStateChange();
        }
      }
    },


    /**
     * Transmits the request, optionally with postable string or XML DOM object data
     *
     * @param data {String|Element?} String or XML DOM object data
     * @return {void}
     */
    send : function(data)
    {
      var headers = this.__headers;

      // BUGFIX: Safari - fails sending documents created/modified dynamically, so an explicit serialization required
      // BUGFIX: IE - rewrites any custom mime-type to "text/xml" in case an XMLNode is sent
      // BUGFIX: Gecko - fails sending Element (this is up to the implementation either to standard)
      if (data && data.nodeType)
      {
        data = window.XMLSerializer ? new XMLSerializer().serializeToString(data) : data.xml;

        if (!headers["Content-Type"]) {
          headers["Content-Type"] = "application/xml";
        }
      }

      // Sync request headers
      for (var label in headers) {
        this.__xmlhttp.setRequestHeader(label, headers[label]);
      }

      // Attach timeout
      if (this.timeout != null && this.timeout > 0) {
        this.__timeoutHandle = window.setTimeout(this.__timeoutListener, this.timeout);
      }

      // Finally send using native method
      this.__xmlhttp.send(data);

      // BUGFIX: Gecko - missing readystatechange calls in synchronous requests
      if (qx.core.Variant.isSet("qx.client", "gecko"))
      {
        if (!this.__async)
        {
          this.readyState = qx.bom.Request.OPENED;

          // Synchronize state
          this.__synchronizeValues(this);

          // Simulate missing states
          while (this.readyState < qx.bom.Request.DONE)
          {
            this.readyState++;
            this.__fireReadyStateChange();

            // Check if we are aborted
            if (this.__aborted) {
              return;
            }
          }
        }
      }
    },


    /**
     * Wether the currently running or finished request is successful.
     *
     * @return {Boolean} Returns <code>true</code> when the request is successful.
     */
    isSuccessful : function()
    {
      var status = this.status;
      return status === 304 || (status >= 200 && status < 300);
    },


    /**
     * Stops the current request.
     *
     * @return {void}
     */
    abort : function()
    {
      // Execute abort helper
      this.__abortHelper();

      // Call listener
      this.onabort();
    },





    /*
    ---------------------------------------------------------------------------
      NATIVE EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * Internal callback for native <code>readystatechange</code> event.
     *
     * @return {void}
     */
    __onNativeReadyStateChange : function()
    {
      if (qx.core.Variant.isSet("qx.client", "gecko"))
      {
        if (!this.__async) {
          return;
        }
      }

      // Synchronize state
      this.readyState = this.__xmlhttp.readyState;

      // Synchronize values
      this.__synchronizeValues();

      // BUGFIX: Firefox fires unneccesary DONE when aborting
      // As this may affect other clients as well, keep it for all here.
      if (this.__aborted)
      {
        // Reset readyState to UNSENT
        this.readyState = qx.bom.Request.UNSENT;

        // Return now
        return;
      }

      // Fire real state change
      this.__fireReadyStateChange();

      // Cleanup native object when done
      if (this.readyState == qx.bom.Request.DONE) {
        this.__cleanTransport();
      }
    },


    /**
     * Internal callback for native <code>timeout</code> event.
     *
     * @return {void}
     */
    __onNativeTimeout : function()
    {
      // Execute abort helper
      this.__abortHelper();

      // Fire user visible event
      this.ontimeout();
    },





    /*
    ---------------------------------------------------------------------------
      RESPONSE HEADERS
    ---------------------------------------------------------------------------
    */

    /**
     * Returns complete set of headers (labels and values) as a string
     *
     * @return {String} All headers
     */
    getAllResponseHeaders : function()
    {
      try {
        return this.__xmlhttp.getAllResponseHeaders();
      } catch(ex) {
        return null;
      }
    },


    /**
     * Returns the string value of a single header label
     *
     * @param label {String} Name of the header label
     * @return {String} The selected header's value.
     */
    getResponseHeader : function(label)
    {
      try {
        return this.__xmlhttp.getResponseHeader(label);
      } catch(ex) {
        return null;
      }
    },





    /*
    ---------------------------------------------------------------------------
      REQUEST HEADERS
    ---------------------------------------------------------------------------
    */

    /**
     * Assigns a label/value pair to the header to be sent with a request.
     *
     * Uses local cache to omit dependency to <code>open()</code> call.
     *
     * @param label {String} Name of the header label
     * @param value {String} Value of the header field
     * @return {void}
     */
    setRequestHeader : function(label, value)
    {
      if (value == null) {
        delete this.__headers[label];
      } else {
        this.__headers[label] = value;
      }
    },


    /**
     * Removes a label from the header to be sent with a request.
     *
     * Uses local cache to omit dependency to <code>open()</code> call.
     *
     * @param label {String} Name of the header label
     * @param value {String} Value of the header field
     * @return {void}
     */
    removeRequestHeader : function(label, value) {
      delete this.__headers[label];
    },


    /**
     * Returns the value of a given header label.
     *
     * @param label {String} Label of the header entry
     * @return {String} The value or <code>null</code> when not defined.
     */
    getRequestHeader : function(label) {
      return this.__headers[label] || null;
    },






    /*
    ---------------------------------------------------------------------------
      INTERNAL HELPERS
    ---------------------------------------------------------------------------
    */

    /**
     * Internal helper for all aborting actions.
     *
     * @return {void}
     */
    __abortHelper : function()
    {
      // Synchronize values again
      this.__synchronizeValues();

      // BUGFIX: Gecko - unneccesary DONE when aborting
      if (this.readyState > qx.bom.Request.UNSENT) {
        this.__aborted = true;
      }

      // Natively abort request
      this.__xmlhttp.abort();

      // Cleanup listeners etc.
      this.__cleanTransport();
    },


    /**
     * Internal helper to return a new native XMLHttpRequest object suitable for
     * the client.
     *
     * @return {Object} TODOC
     * @signature function()
     */
    __createNative : qx.core.Variant.select("qx.client",
    {
      "default" : function() {
        return new XMLHttpRequest;
      },

      // IE7's native XmlHttp does not care about trusted zones. To make this
      // work in the localhost scenario, you can use the following registry setting:
      //
      // [HKEY_CURRENT_USER\Software\Microsoft\Internet Explorer\Main\
      // FeatureControl\FEATURE_XMLHTTP_RESPECT_ZONEPOLICY]
      // "Iexplore.exe"=dword:00000001
      //
      // Generally it seems that the ActiveXObject is more stable. jQuery
      // seems to use it always. We prefer the ActiveXObject for the moment, but allow
      // fallback to XMLHTTP if ActiveX is disabled.
      "mshtml" : function()
      {
        if (window.ActiveXObject && qx.xml.Document.XMLHTTP) {
          return new ActiveXObject(qx.xml.Document.XMLHTTP);
        }

        if (window.XMLHttpRequest) {
          return new XMLHttpRequest;
        }
      }
    }),


    /**
     * Internal helper to "fire" the onreadystatechange function
     *
     * @return {void}
     */
    __fireReadyStateChange : function()
    {
      // BUGFIX: Some browsers (Internet Explorer, Gecko) fire OPEN readystate twice
      if (this.__lastFired === this.readyState) {
        return;
      }

      // Execute onreadystatechange
      this.onreadystatechange();

      // Store last fired
      this.__lastFired = this.readyState;

      // Fire other events
      if (this.readyState === 4)
      {
        if (this.isSuccessful()) {
          this.onload();
        } else {
          this.onerror();
        }
      }
    },


    /**
     * Internal helper to preprocess the <code>responseXML</code> to get
     * a valid XML document.
     *
     * @return {Object} The document. If the document contained an error <code>null</code> instead.
     */
    __getDocument : function()
    {
      var doc = this.__xmlhttp.responseXML;

      if (qx.core.Variant.isSet("qx.client", "mshtml"))
      {
        // Try parsing responseText
        if (doc && !doc.documentElement && this.__xmlhttp.getResponseHeader("Content-Type").match(/[^\/]+\/[^\+]+\+xml/))
        {
          doc = new ActiveXObject(qx.xml.Document.DOMDOC);
          doc.loadXML(this.__xmlhttp.responseText);
        }

        // Check if there is no error in document
        if (doc && doc.parseError != 0) {
          return null;
        }
      }

      // Check if there is no error in document
      else if (doc && doc.documentElement && doc.documentElement.tagName == "parsererror") {
        return null;
      }

      return doc;
    },


    /**
     * Internal helper to store the values from the native object locally. This helps
     * to omit exceptions when the user tries this directly.
     *
     * @return {void}
     */
    __synchronizeValues : function()
    {
      var xmlhttp = this.__xmlhttp;

      try {
        this.responseText = xmlhttp.responseText;
      } catch(e) {}

      try {
        this.responseXML = this.__getDocument();
      } catch(e) {}

      try {
        this.status = xmlhttp.status;
      } catch(e) {}

      try {
        this.statusText = xmlhttp.statusText;
      } catch(e) {}

      // Kudos do jquery team for this code.
      // IE error sometimes returns 1223 when it should be 204 so treat it as success, see jquery bug #1450
      if (qx.core.Variant.isSet("qx.client", "mshtml"))
      {
        if (this.status === 1223) {
          this.status = 204;
        }
      }

      // Accept local transports without status code
      if (!this.status && location.protocol === "file:") {
        this.status = 204;
      }
    },


    /**
     * Cleans up the native transport object and some other internal stuff.
     *
     * @return {void}
     */
    __cleanTransport : function()
    {
      // Clear timeout handle
      if (this.__timeoutHandle) {
        window.clearTimeout(this.__timeoutHandle);
      }

      // BUGFIX: IE - memory leak (on-page leak)
      if (this.__xmlhttp)
      {
        this.__xmlhttp.onreadystatechange = this.__dummyFunction;
        this.__xmlhttp.ontimeout = this.__dummyFunction;
      }

      // Remove user listeners
      delete this.onreadystatechange;
      delete this.ontimeout;
      delete this.onload;
      delete this.onerror;
      delete this.onabort;

      // Delete private properties
      delete this.__timeoutHandle;
      delete this.__stateListener;
      delete this.__timeoutListener;
      delete this.__xmlhttp;
      delete this.__headers;
    },


    /**
     * Dummy function as fallback for internal ready state listener
     *
     * @return {void}
     */
    __dummyFunction : function() {
      // empty
    }
  }
});
