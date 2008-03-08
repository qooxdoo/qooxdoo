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
     
************************************************************************ */
     
qx.Class.define("qx.io2.HttpRequest",
{
  extend : qx.core.Object,
  


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param url {String} URL to load
   */
  construct : function(url)
  {
    this.base(arguments);
    
    // Request headers
    this.__headers = {};
    
    // Add url
    if (url != null) {
      this.setUrl(url);
    }
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */
  
  statics : 
  {
    /** Cached for modification dates of already loaded URLs */
    __modified : {}
  },
  



  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */
  
  events : 
  {
    /** Fires when the request change its state, data field contains the state. */
    "change" : "qx.event.type.Data",
    
    /** Fires when the request reached the timeout limit. */
    "timeout" : "qx.event.type.Event"
  },
  
  
  
  
  
  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */
  
  properties :
  {
    /**
     * Allow the request to be successful only if the response has changed since 
     * the last request. This is done by checking the Last-Modified header. Default 
     * value is false, ignoring the header.
     */
    refresh : 
    {
      check : "Booleam",
      init : false
    },
    
    
    /**
     * Determines what type of request to issue (GET or POST).
     */
    method :
    {
      check : [ "GET", "POST", "PUT", "HEAD", "DELETE" ],
      init : "GET"
    },


    /**
     * Set the request to asynchronous.
     */
    async :
    {
      check : "Boolean",
      init : true
    },
    
    
    /**
     * Response mimetype
     */
    mime : 
    {
      check : [ "text/plain", "text/javascript", "application/json", "application/xml", "text/html" ],
      init : "text/plain"
    },
    
    
    /**
     * Target url to issue the request to.
     */
    url :
    {
      check : "String",
      init : ""
    },
    
    /**
     * Username to use for HTTP authentication.
     * Set to NULL if HTTP authentication is not used.
     */
    username :
    {
      check : "String",
      nullable : true
    },


    /**
     * Password to use for HTTP authentication.
     * Set to NULL if HTTP authentication is not used.
     */
    password :
    {
      check : "String",
      nullable : true
    },
    
    
    /**
     * Authentification method to use.
     */
    auth : 
    {
      check : [ "http", "basic" ],
      init : "http"
    },
    
    
    /**
     * Number of millieseconds before the request is being timed out.
     */
    timeout :
    {
      check : "Integer",
      nullable : true
    },


    /**
     * Setting the value to <i>false</i> adds a parameter "nocache" to the request
     * with a value of the current time. Setting the value to <i>false</i> removes
     * the parameter.
     */
    cache :
    {
      check : "Boolean",
      init : false
    } 
  },
  
  
  

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members : 
  {
    /*
    ---------------------------------------------------------------------------
      REQUEST DATA
    ---------------------------------------------------------------------------
    */
        
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
      if (value == null) {
        delete this.__headers[label];
      } else {
        this.__headers[label] = value;
      }
    },
    
    
    /**
     * Returns the value of a given header label.
     *
     * @type member
     * @param label {String} Label of the header entry
     * @return {String} The value or <code>null</code> when not defined.
     */     
    getRequestHeader : function(label) 
    {
      var value = this.__headers[label];
      if (value === undefined) {
        value = null;
      }
      
      return value;
    },





    /*
    ---------------------------------------------------------------------------
      RESPONSE DATA
    ---------------------------------------------------------------------------
    */
      
    /**
     * Returns the (currently downloaded) response text.
     *
     * @type member
     * @return {String} String version of data returned from server process
     */      
    getResponseText : function() 
    {
      var req = this.__req;
      if (req) {
        return req.responseText;
      }
    },

    
    /**
     * Returns the XML document of the response (only available if content in mimetype application/xml was send).
     *
     * @type member
     * @return {Element} DOM-compatible document object of data returned from server process
     */      
    getResponseXml : function() 
    {
      var req = this.__req;
      if (req) {
        return req.responseXML;
      }
    },        
      
    
    /**
     * Returns the string value of a single header label
     *
     * @type member
     * @param label {String} Name of the header label
     * @return {String} The selected header's value.
     */
    getResponseHeader : function(label)
    {
      var req = this.__req;
      if (req) {
        return req.getResponseHeader(label);
      }      
    },
    

    /**
     * Returns complete set of headers (labels and values) as a string
     *
     * @type member
     * @return {String} All headers
     */    
    getAllResponseHeaders : function()
    {
      var req = this.__req;
      if (req) {
        return req.getAllResponseHeaders();
      }      
    },
    
    
    


    /*
    ---------------------------------------------------------------------------
      MAIN CONTROL
    ---------------------------------------------------------------------------
    */
    
    /**
     * Wether the currently running or finished request returns modified results.
     *
     * @type member
     * @return {Boolean} Returns <code>true</code> when the request contains modified results.
     */    
    isNotModified : function()
    {
      var req = this.__req;
      
      if (!req) {
        return false;
      }
      
      var modified = req.getResponseHeader("Last-Modified");
      return req.status === 304 || qx.io2.HttpRequest.__modified[this.getUrl()] === modified;
    },
    
    
    /**
     * Wether the currently running or finished request is successful.
     *
     * @type member
     * @return {Boolean} Returns <code>true</code> when the request is successful.
     */
    isSuccessful : function()
    {
      var req = this.__req;
      
      if (!req) {
        return true;
      }
      
      var status = req.status;
      return status === 304 || (status >= 200 && status < 300);
    },
    
      
    /**
     * Returns the response status code.
     * 
     * @type member
     * @return {Integer} Numeric code returned by server, such as 404 for "Not Found" or 200 for "OK"
     */
    getStatusCode : function() 
    {
      var req = this.__req;
      if (req) {
        return req.status;
      }
    },
    
    
    /**
     * Returns the response status text. This is the human readable version of {@link #getStatusCode}.
     *
     * @type member
     * @return {String} String message accompanying the status code
     */
    getStatusText : function() 
    {
      var req = this.__req;
      if (req) {
        return req.statusText;
      }
    }, 
    
          
    /**
     * Returns the current request state.
     * 
     * * 0 = uninitialized
     * * 1 = sending request
     * * 2 = headers loaded
     * * 3 = loading result
     * * 4 = done
     * 
     * @type member
     * @return {Integer} Ready state of the request
     */
    getState : function() 
    {
      var req = this.__req;
      if (req) {
        return req.readyState;
      }
    },

        
    /** 
     * Sends the configured request
     *
     * @type member
     * @return {void}
     */
    send : function()
    {
      // Create low level object
      var req = this.__req = new qx.bom.Request;
      
      // Bind listeners
      req.onreadystatechange = qx.lang.Function.bind(this.__onchange, this);
      req.ontimeout = qx.lang.Function.bind(this.__ontimeout, this);      
            
      // Authentification
      var username = this.getUsername();
      var password = this.getPassword();
      
      if (this.getAuth() == "basic")
      {
        // Add headers
        req.setRequestHeader('Authorization', 'Basic ' + qx.util.Base64.encode(username + ':' + password));
        
        // Reset Http
        username = password = null;
      }
      
      // Read url
      var url = this.getUrl();
      
      // Add modified since hint
      if (this.getRefresh()) {
        req.setRequestHeader("If-Modified-Since",	qx.io2.HttpRequest.__modified[url] || "Thu, 01 Jan 1970 00:00:00 GMT" );      
      }
      
      // Add timeout
      req.timeout = this.getTimeout();
      
      // Open request
      req.open(this.getMethod(), url, this.getAsync(), username, password);
      
      // Syncronize headers
      var headers = this.__headers;
      for (var name in headers) {
        req.setRequestHeader(key, headers[name]);
      }
      
      // TODO Collect data
      var data = "";
      
      // Finally send request
      req.send(data);
    },
    
        
    /**
     * Aborts a running request
     *
     * @type member
     * @return {void}
     */
    abort : function()
    {
      if (this.__req) {
        this.__req.abort();      
      }
    },
    
    


    /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */
    
    /**
     * Internal change listener
     *
     * @type member
     * @return {void}
     */    
    __onchange : function() 
    {
      // Fire user event
      this.fireDataEvent("change", this.getState());
      
      // Store modification date
      // It is important that this is stored after the user event.
      // Otherwise the modification field gets written to early.
      if (this.readyState === 4 && this.getRefresh() && this.isSuccessful())
      {
        var modified = this.getResponseHeader("Last-Modified");
        if (modified) {
          qx.io2.HttpRequest.__modified[this.getUrl()] = modified;
        }
      }      
    },
    
    
    /**
     * Internal timeout listener
     *
     * @type member
     * @return {void}
     */    
    __ontimeout : function() {
      this.fireEvent("timeout");
    }     
  },
  
  
  
  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */
  
  destruct : function()
  {  
    this._disposeObjects("_req");
    this._disposeFields("__headers");    
  }
});
