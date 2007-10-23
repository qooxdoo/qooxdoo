/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

************************************************************************ */

/* ************************************************************************

#module(io2)

************************************************************************ */

qx.Class.define("qx.io2.transport.HttpRequest",
{
  extend : qx.core.Object,
  
  construct : function()
  {
    this.base(arguments);
    
    this.object = qx.bom.HttpRequest.create();
  },
  
  members : 
  {
    readyState : 0,
    responseText : "",
    responseXML : null,
    status : 0,
    statusText : "",
    
    // Helper function
    __readyStateChange : function()
    {
      // TODO: Fire readystatechange
    },
    
    
    __nativeListener : function()
    {
      // Synchronize states
      this.readyState = this.object.readyState;

      try {
        this.responseText = this.object.responseText;
      } catch(e) {}

      try {
        this.responseXML = this.object.responseXML;
      } catch(e) {}

      try {
        this.status = this.object.status;
      } catch(e) {}

      try {
        this.statusText = this.object.statusText;
      } catch(e) {}
      
      

      // BUGFIX: Firefox fires unneccesary DONE when aborting
      if (this.aborted)
      {
        this.readyState = qx.bom.HttpRequest.UNSENT;
        delete this.aborted;
        
        return;
      }
      

      // TODO: Internet Explorer cache issue

      // Done reached
      if (this.readyState == qx.bom.HttpRequest.DONE)
      {
        // BUGFIX: Remove onreadystatechange (Internet Explorer memory leak)
        this.object.onreadystatechange = this.__dummyListener;

        // BUGFIX: Annoying <parsererror /> in invalid XML responses
        if (this.responseXML && this.responseXML.documentElement.tagName == "parsererror") {
          this.responseXML = null;
        }
      }


      // BUGFIX: Some browsers (Internet Explorer, Gecko) fire OPEN readystate twice
      if (nState != this.readyState) {
        this.__readyStateChange();
      }

      nState = this.readyState;
    },
  
    __dummyListener : function() {},
    
      
    /**
     * TODOC
     *
     * @type member
     * @param sMethod {String} TODOC
     * @param sUrl {String} TODOC
     * @param bAsync {Boolean} TODOC
     * @param sUser {String} TODOC
     * @param sPassword {String} TODOC
     * @return {void} 
     */
    open : function(sMethod, sUrl, bAsync, sUser, sPassword)
    {
      // Store parameters
      this.method = sMethod;
      this.url = sUrl;
      this.async = bAsync;

      // Set the onreadystatechange handler
      nState = this.readyState;

      this.object.onreadystatechange = this.__nativeListener;

      // TODO: fire "open" here

      this.object.open(sMethod, sUrl, bAsync, sUser, sPassword);

      // BUGFIX: Gecko misses readystatechange calls in synchronous requests
      if (!this.async && window.navigator.userAgent.match(/Gecko\//))
      {
        this.readyState = qx.bom.HttpRequest.OPEN;

        this.__readyStateChange();
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param vData {var} TODOC
     * @return {void} 
     */
    send : function(vData)
    {
      // Add method sniffer
      // TODO: Fire "send"

      this.object.send(vData);
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void} 
     */
    abort : function()
    {
      // Add method sniffer
      // TODO: Fire "abort"

      // BUGFIX: Firefox fires unneccesary DONE when aborting
      if (this.readyState > qx.bom.HttpRequest.UNSENT) {
        this.aborted = true;
      }

      this.object.abort();
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getAllResponseHeaders : function() {
      return this.object.getAllResponseHeaders();
    },


    /**
     * TODOC
     *
     * @type member
     * @param sName {String} TODOC
     * @return {var} TODOC
     */
    getResponseHeader : function(sName) {
      return this.object.getResponseHeader(sName);
    },


    /**
     * TODOC
     *
     * @type member
     * @param sName {String} TODOC
     * @param sValue {String} TODOC
     * @return {var} TODOC
     */
    setRequestHeader : function(sName, sValue) {
      return this.object.setRequestHeader(sName, sValue);
    }
  }
});
