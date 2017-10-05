/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
     2006 Derrell Lipman
     2006 STZ-IDA, Germany, http://www.stz-ida.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Derrell Lipman (derrell)
     * Andreas Junghans (lucidcake)

************************************************************************ */

/* ************************************************************************


************************************************************************ */

/**
 * Transports requests to a server using an IFRAME.
 *
 * This class should not be used directly by client programmers.
 *
 * NOTE: Instances of this class must be disposed of after use
 *
 * @asset(qx/static/blank.gif)
 */
qx.Class.define("qx.io.remote.transport.Iframe",
{
  extend : qx.io.remote.transport.Abstract,
  implement: [ qx.core.IDisposable ],




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    // Unique identifiers for iframe and form
    var vUniqueId = (new Date).valueOf();
    var vFrameName = "frame_" + vUniqueId;
    var vFormName = "form_" + vUniqueId;

    // This is to prevent the "mixed secure and insecure content" warning in IE with https
    var vFrameSource;
    if ((qx.core.Environment.get("engine.name") == "mshtml")) {
      vFrameSource = "javascript:void(0)";
    }

    // Create a hidden iframe.
    // The purpose of the iframe is to receive data coming back from the server (see below).
    this.__frame = qx.bom.Iframe.create({id: vFrameName, name: vFrameName, src: vFrameSource});

    qx.bom.element.Style.set(this.__frame, "display", "none");

    // Create form element with textarea as conduit for request data.
    // The target of the form is the hidden iframe, which means the response
    // coming back from the server is written into the iframe.
    this.__form = qx.dom.Element.create("form", {id: vFormName, name: vFormName, target: vFrameName});
    qx.bom.element.Style.set(this.__form, "display", "none");
    qx.dom.Element.insertEnd(this.__form, qx.dom.Node.getBodyElement(document));

    this.__data = qx.dom.Element.create("textarea", {id: "_data_", name: "_data_"});
    qx.dom.Element.insertEnd(this.__data, this.__form);

    // Finally, attach iframe to DOM and add listeners
    qx.dom.Element.insertEnd(this.__frame, qx.dom.Node.getBodyElement(document));
    qx.event.Registration.addListener(this.__frame, "load", this._onload, this);

    // qx.event.handler.Iframe does not yet support the readystatechange event
    this.__onreadystatechangeWrapper = qx.lang.Function.listener(this._onreadystatechange, this);
    qx.bom.Event.addNativeListener(this.__frame, "readystatechange", this.__onreadystatechangeWrapper);
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Capabilities of this transport type.
     *
     * @internal
     */
    handles :
    {
      synchronous           : false,
      asynchronous          : true,
      crossDomain           : false,
      fileUpload            : true,
      programmaticFormFields : true,
      responseTypes         : [ "text/plain", "text/javascript", "application/json", "application/xml", "text/html" ]
    },


    /**
     * Returns always true, because iframe transport is supported by all browsers.
     *
     * @return {Boolean}
     */
    isSupported : function() {
      return true;
    },




    /*
    ---------------------------------------------------------------------------
      EVENT LISTENER
    ---------------------------------------------------------------------------
    */

    /**
     * For reference:
     * http://msdn.microsoft.com/en-us/library/ie/ms534359%28v=vs.85%29.aspx
     *
     * @internal
     */
    _numericMap :
    {
      "uninitialized" : 1,
      "loading"       : 2,
      "loaded"        : 2,
      "interactive"   : 3,
      "complete"      : 4
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {

    __data : null,
    __lastReadyState : 0,
    __form : null,
    __frame : null,
    __onreadystatechangeWrapper : null,

    /*
    ---------------------------------------------------------------------------
      USER METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Sends a request with the use of a form.
     *
     */
    send : function()
    {
      var vMethod = this.getMethod();
      var vUrl = this.getUrl();

      // --------------------------------------
      //   Adding parameters
      // --------------------------------------
      var vParameters = this.getParameters(false);
      var vParametersList = [];

      for (var vId in vParameters)
      {
        var value = vParameters[vId];

        if (value instanceof Array)
        {
          for (var i=0; i<value.length; i++) {
            vParametersList.push(encodeURIComponent(vId) + "=" + encodeURIComponent(value[i]));
          }
        }
        else
        {
          vParametersList.push(encodeURIComponent(vId) + "=" + encodeURIComponent(value));
        }
      }

      if (vParametersList.length > 0) {
        vUrl += (vUrl.indexOf("?") >= 0 ? "&" : "?") + vParametersList.join("&");
      }

      // --------------------------------------------------------
      //   Adding data parameters (if no data is already present)
      // --------------------------------------------------------
      if (this.getData() === null)
      {
        var vParameters = this.getParameters(true);
        var vParametersList = [];

        for (var vId in vParameters)
        {
          var value = vParameters[vId];

          if (value instanceof Array)
          {
            for (var i=0; i<value.length; i++)
            {
              vParametersList.push(encodeURIComponent(vId) +
                                   "=" +
                                   encodeURIComponent(value[i]));
            }
          }
          else
          {
            vParametersList.push(encodeURIComponent(vId) +
                                 "=" +
                                 encodeURIComponent(value));
          }
        }

        if (vParametersList.length > 0)
        {
          this.setData(vParametersList.join("&"));
        }
      }

      // --------------------------------------
      //   Adding form fields
      // --------------------------------------
      var vFormFields = this.getFormFields();

      for (var vId in vFormFields)
      {
        var vField = document.createElement("textarea");
        vField.name = vId;
        vField.appendChild(document.createTextNode(vFormFields[vId]));
        this.__form.appendChild(vField);
      }

      // --------------------------------------
      //   Preparing form
      // --------------------------------------
      this.__form.action = vUrl;
      this.__form.method = vMethod;

      // --------------------------------------
      //   Sending data
      // --------------------------------------
      this.__data.appendChild(document.createTextNode(this.getData()));
      this.__form.submit();
      this.setState("sending");
    },


    /**
     * Converting complete state to numeric value and update state property
     *
     * @signature function(e)
     * @param e {qx.event.type.Event} event object
     */
    _onload : qx.event.GlobalError.observeMethod(function(e)
    {

      // Timing-issue in Opera
      // Do not switch state to complete in case load event fires before content
      // of iframe was updated
      if (qx.core.Environment.get("engine.name") == "opera" && this.getIframeHtmlContent() == "") {
        return;
      }

      if (this.__form.src) {
        return;
      }

      this._switchReadyState(qx.io.remote.transport.Iframe._numericMap.complete);
    }),


    /**
     * Converting named readyState to numeric value and update state property
     *
     * @signature function(e)
     * @param e {qx.event.type.Event} event object
     */
    _onreadystatechange : qx.event.GlobalError.observeMethod(function(e) {
      this._switchReadyState(qx.io.remote.transport.Iframe._numericMap[this.__frame.readyState]);
    }),


    /**
     * Switches the readystate by setting the internal state.
     *
     * @param vReadyState {String} readystate value
     */
    _switchReadyState : function(vReadyState)
    {
      // Ignoring already stopped requests
      switch(this.getState())
      {
        case "completed":
        case "aborted":
        case "failed":
        case "timeout":
          this.warn("Ignore Ready State Change");
          return;
      }

      // Updating internal state
      while (this.__lastReadyState < vReadyState) {
        this.setState(qx.io.remote.Exchange._nativeMap[++this.__lastReadyState]);
      }
    },




    /*
    ---------------------------------------------------------------------------
      REQUEST HEADER SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Sets a request header with the given value.
     *
     * This method is not implemented at the moment.
     *
     * @param vLabel {String} request header name
     * @param vValue {var} request header value
     */
    setRequestHeader : function(vLabel, vValue) {},


    /*
    ---------------------------------------------------------------------------
      RESPONSE HEADER SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the value of the given response header.
     *
     * This method is not implemented at the moment and returns always "null".
     *
     * @param vLabel {String} Response header name
     * @return {null} Returns null
     */
    getResponseHeader : function(vLabel) {
      return null;
    },

    /**
     * Provides an hash of all response headers.
     *
     * This method is not implemented at the moment and returns an empty map.
     *
     * @return {Map} empty map
     */
    getResponseHeaders : function() {
      return {};
    },

    /*
    ---------------------------------------------------------------------------
      STATUS SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the current status code of the request if available or -1 if not.
     * This method needs implementation (returns always 200).
     *
     * @return {Integer} status code
     */
    getStatusCode : function() {
      return 200;
    },

    /**
     * Provides the status text for the current request if available and null otherwise.
     * This method needs implementation (returns always an empty string)
     *
     * @return {String} status code text
     */
    getStatusText : function() {
      return "";
    },

    /*
    ---------------------------------------------------------------------------
      FRAME UTILITIES
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the DOM window object of the used iframe.
     *
     * @return {Object} DOM window object
     */
    getIframeWindow : function() {
      return qx.bom.Iframe.getWindow(this.__frame);
    },


    /**
     * Returns the document node of the used iframe.
     *
     * @return {Object} document node
     */
    getIframeDocument : function() {
      return qx.bom.Iframe.getDocument(this.__frame);
    },


    /**
     * Returns the body node of the used iframe.
     *
     * @return {Object} body node
     */
    getIframeBody : function() {
      return qx.bom.Iframe.getBody(this.__frame);
    },




    /*
    ---------------------------------------------------------------------------
      RESPONSE DATA SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the iframe content (innerHTML) as text.
     *
     * @return {String} iframe content as text
     */
    getIframeTextContent : function()
    {
      var vBody = this.getIframeBody();

      if (!vBody) {
        return null;
      }

      if (!vBody.firstChild) {
        return "";
      }

      // Mshtml returns the content inside a PRE
      // element if we use plain text
      if (vBody.firstChild.tagName &&
          vBody.firstChild.tagName.toLowerCase() == "pre") {
        return vBody.firstChild.innerHTML;
      } else {
        return vBody.innerHTML;
      }
    },


    /**
     * Returns the iframe content as HTML.
     *
     * @return {String} iframe content as HTML
     */
    getIframeHtmlContent : function()
    {
      var vBody = this.getIframeBody();
      return vBody ? vBody.innerHTML : null;
    },


    /**
     * Returns the length of the content as fetched thus far.
     * This method needs implementation (returns always 0).
     *
     * @return {Integer} Returns 0
     */
    getFetchedLength : function() {
      return 0;
    },

    /**
     * Returns the content of the response
     *
     * @return {null | String} null or text of the response (=iframe content).
     */
    getResponseContent : function()
    {
      if (this.getState() !== "completed")
      {
        if (qx.core.Environment.get("qx.debug"))
        {
          if (qx.core.Environment.get("qx.debug.io.remote")) {
            this.warn("Transfer not complete, ignoring content!");
          }
        }

        return null;
      }

      if (qx.core.Environment.get("qx.debug"))
      {
        if (qx.core.Environment.get("qx.debug.io.remote")) {
          this.debug("Returning content for responseType: " + this.getResponseType());
        }
      }

      var vText = this.getIframeTextContent();

      switch(this.getResponseType())
      {
        case "text/plain":
          if (qx.core.Environment.get("qx.debug"))
          {
            if (qx.core.Environment.get("qx.debug.io.remote.data"))
            {
              this.debug("Response: " + this._responseContent);
            }
          }
          return vText;

        case "text/html":
          vText = this.getIframeHtmlContent();
          if (qx.core.Environment.get("qx.debug"))
          {
            if (qx.core.Environment.get("qx.debug.io.remote.data"))
            {
              this.debug("Response: " + this._responseContent);
            }
          }
          return vText;

        case "application/json":
          vText = this.getIframeHtmlContent();
          if (qx.core.Environment.get("qx.debug"))
          {
            if (qx.core.Environment.get("qx.debug.io.remote.data"))
            {
              this.debug("Response: " + this._responseContent);
            }
          }

          try {
            return vText && vText.length > 0 ? qx.lang.Json.parse(vText) : null;
          } catch(ex) {
            return this.error("Could not execute json: (" + vText + ")", ex);
          }

        case "text/javascript":
          vText = this.getIframeHtmlContent();
          if (qx.core.Environment.get("qx.debug"))
          {
            if (qx.core.Environment.get("qx.debug.io.remote.data"))
            {
              this.debug("Response: " + this._responseContent);
            }
          }

          try {
            return vText && vText.length > 0 ? window.eval(vText) : null;
          } catch(ex) {
            return this.error("Could not execute javascript: (" + vText + ")", ex);
          }

        case "application/xml":
          vText = this.getIframeDocument();
          if (qx.core.Environment.get("qx.debug"))
          {
            if (qx.core.Environment.get("qx.debug.io.remote.data"))
            {
              this.debug("Response: " + this._responseContent);
            }
          }
          return vText;

        default:
          this.warn("No valid responseType specified (" + this.getResponseType() + ")!");
          return null;
      }
    }
  },



  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function()
  {
    // basic registration to qx.io.remote.Exchange
    // the real availability check (activeX stuff and so on) follows at the first real request
    qx.io.remote.Exchange.registerType(qx.io.remote.transport.Iframe, "qx.io.remote.transport.Iframe");
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    if (this.__frame)
    {
      qx.event.Registration.removeListener(this.__frame, "load", this._onload, this);
      qx.bom.Event.removeNativeListener(this.__frame, "readystatechange", this.__onreadystatechangeWrapper);

      // Reset source to a blank image for gecko
      // Otherwise it will switch into a load-without-end behaviour
      if ((qx.core.Environment.get("engine.name") == "gecko")) {
        this.__frame.src = qx.util.ResourceManager.getInstance().toUri("qx/static/blank.gif");
      }

      // Finally, remove element node
      qx.dom.Element.remove(this.__frame);
    }

    if (this.__form) {
      qx.dom.Element.remove(this.__form);
    }

    this.__frame = this.__form = this.__data = null;
  }
});
