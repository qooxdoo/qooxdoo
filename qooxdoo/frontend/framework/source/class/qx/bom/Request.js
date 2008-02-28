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

   This class contains code based on the wonderful work of:

   * Sergey Ilinsky
     http://www.ilinsky.com

     Copyright:
       (c) 2007, Sergey Ilinsky

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

     Authors:
       * Sergey Ilinsky
       
     Comment:
       Sergey has allowed us, infact me, Sebastian Werner, to use
       his Apache licensed software and put it under a MIT license.
       This change makes it compabible to LGPL/GPL. Thank you again.

************************************************************************ */

/**
 * Cross browser compatible unified XMLHttp transport low-level implementation.
 * Mimics an ideal browser without any quirks and is API identical to
 * the W3C definition.
 *
 * For an higher level implementation with some more comfort please have a look
 * at the classes in <code>qx.io2</code>.
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
    HEADERS : 2,
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
    

    /** 
     * Event handler for an event that fires at every state change. This method
     * needs to be overwritten by the user to get informed about the communication
     * progress.
     *
     * @type member
     * @return {void}
     */
    onreadystatechange : function() {
      // empty
    },
    

    /**
     * Assigns destination URL, method, and other optional attributes of a pending request
     *
     * @type member
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

      // Prepare and register native listener
      this.__listener = qx.lang.Function.bind(this.__onNativeOnReadyStateChange, this)
      this.__xmlhttp.onreadystatechange = this.__listener;
      
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
     * Internal callback for native <code>onreadystatechange</code> event.
     *
     * @type member
     * @return {void}
     */
    __onNativeOnReadyStateChange : function()
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

      // Cleanup native object when done
      if (this.readyState == qx.bom.Request.DONE) {
        this.__cleanTransport();
      }

      // Fire real state change
      this.__fireReadyStateChange();
    },


    /**
     * Transmits the request, optionally with postable string or XML DOM object data
     *
     * @type member
     * @param data {String|Element?} String or XML DOM object data
     * @return {void} 
     */
    send : function(data)
    {
      // BUGFIX: Safari - fails sending documents created/modified dynamically, so an explicit serialization required
      // BUGFIX: IE - rewrites any custom mime-type to "text/xml" in case an XMLNode is sent
      // BUGFIX: Gecko - fails sending Element (this is up to the implementation either to standard)
      if (data && data.nodeType)
      {
        data = window.XMLSerializer ? new XMLSerializer().serializeToString(data) : data.xml;
        
        if (!this.__headers["Content-Type"]) {
          this.__xmlhttp.setRequestHeader("Content-Type", "application/xml");
        }
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
     * Stops the current request.
     *
     * @type member
     * @return {void} 
     */
    abort : function()
    {
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
     * Returns complete set of headers (labels and values) as a string
     *
     * @type member
     * @return {String} All headers
     */
    getAllResponseHeaders : function() {
      return this.__xmlhttp.getAllResponseHeaders();
    },


    /**
     * Returns the string value of a single header label
     *
     * @type member
     * @param label {String} Name of the header label
     * @return {String} The selected header's value.
     */
    getResponseHeader : function(label) {
      return this.__xmlhttp.getResponseHeader(label);
    },


    /**
     * Assigns a label/value pair to the header to be sent with a request
     *
     * @type member
     * @param label {String} Name of the header label
     * @param value {String} Value of the header field
     * @return {var} Native return value
     */
    setRequestHeader : function(label, value)
    {
      // Store locally, native implementation misses a getter
      this.__headers[name] = value;
      return this.__xmlhttp.setRequestHeader(name, value);
    },
    
    
    /**
     * Returns the value of a given header label.
     *
     * @type member
     * @param label {String} Label of the header entry
     * @return {String} The value or <code>null</code> when not defined.
     */    
    getRequestHeader : function(label) {
      return this.__headers[label] || null;
    },


    /**
     * Internal helper to return a new native XMLHttpRequest object suitable for 
     * the client.
     *
     * @type static
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
        if (window.ActiveXObject) {
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
     * @type member
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
    },


    /**
     * Internal helper to preprocess the <code>responseXML</code> to get
     * a valid XML document.
     *
     * @type member
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
          doc = new ActiveXObject(qx.xml.Document.XMLDOM);
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
     * @type member
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
    },


    /**
     * Cleans up the native transport object and some other internal stuff.
     *
     * @type member
     * @return {void} 
     */
    __cleanTransport : function()
    {
      // BUGFIX: IE - memory leak (on-page leak)
      this.__xmlhttp.onreadystatechange = this.__dummyFunction;

      // Delete private properties
      delete this.__headers;
      delete this.__listener;
    },
    
    
    /**
     * Dummy function as fallback for internal ready state listener
     *
     * @type member
     * @return {void} 
     */     
    __dummyFunction : function() {
      // empty
    }
  },
  
  
  
  
  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */  
  
  destruct : function()
  {
    if (this.__xmlhttp) {
      this.__xmlhttp.onreadystatechange = this.__dummyFunction;
    }
    
    this._disposeFields("__xmlhttp", "__headers", "__listener");
  }
});
