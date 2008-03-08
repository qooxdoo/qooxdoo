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
  
  construct : function()
  {
    this.base(arguments);
    
    // Request headers
    this.__headers = {};
    
  },
  
  properties :
  {
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
  
  members : 
  {
    send : function()
    {
      // Create low level object
      var req = this.__req = new qx.bom.Request;
      
      // Bind listener
      req.onreadystatechange = qx.lang.Function.bind(this.__onchange, this);
            
      // Authentification
      var user = this.getUserName();
      var passwd = this.getPassword();
      
      if (this.getAuth() == "basic")
      {
        // Add headers
        req.setRequestHeader('Authorization', 'Basic ' + qx.util.Base64.encode(this.getUsername() + ':' + this.getPassword()));
        
        // Reset Http
        user = password = null;
      }
      
      // Add timeout (Following IE8 Beta idea)
      req.timeout = this.getTimeout();
      
      // Open request
      req.open(this.getMethod(), this.getUrl(), this.getAsync(), user, password);
      
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
    
    __onchange : function(e) {
      this.fireDataEvent("change", e.readyState);
    },
    
    
    
    
    
        
    getReadyState : function() 
    {
      var req = this.__req;
      if (req) {
        return req.readyState;
      }
    },
    
    getResponseText : function() 
    {
      var req = this.__req;
      if (req) {
        return req.responseText;
      }
    },
    
    getResponseXml : function() 
    {
      var req = this.__req;
      if (req) {
        return req.responseXML;
      }
    },        
  
    getStatusCode : function() 
    {
      var req = this.__req;
      if (req) {
        return req.status;
      }
    },
    
    getStatusText : function() 
    {
      var req = this.__req;
      if (req) {
        return req.statusText;
      }
    },     
    
    getResponseHeader : function(name)
    {
      var req = this.__req;
      if (req) {
        return req.getResponseHeader(name);
      }      
    },
    
    getAllResponseHeaders : function(name)
    {
      var req = this.__req;
      if (req) {
        return req.getAllResponseHeaders();
      }      
    },
    
    
    
     
    
    
    setRequestHeader : function(name, value)
    {
      if (value == null) {
        delete this.__headers[name];
      } else {
        this.__headers[name] = value;
      }
    },
    
    getRequestHeader : function(name) 
    {
      var value = this.__headers[name];
      if (value === undefined) {
        value = null;
      }
      
      return value;
    },
    
    
    
    
    abort : function()
    {
      if (this.__req) {
        this.__req.abort();      
      }
    }
  } 
});
