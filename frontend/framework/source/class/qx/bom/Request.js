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
 *
 */
qx.Class.define("qx.bom.Request",
{
  extend : qx.core.Object,

  construct : function()
  {
    this.base(arguments);

    this.__xmlhttp = window.XMLHttpRequest ? new window.XMLHttpRequest : new window.ActiveXObject('Microsoft.XMLHTTP');
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
    readyState : 0,
    responseText : "",
    responseXML : null,
    status : 0,
    statusText : "",


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
      // Save async parameter for fixing Gecko bug with missing readystatechange in synchronous requests
      this._async = bAsync;

      // Set the onreadystatechange handler
      var oRequest = this, nState = this.readyState;

      // BUGFIX: IE - memory leak on page unload (inter-page leak)
      if (bIE)
      {
        var fOnUnload = function()
        {
          if (oRequest.__xmlhttp.readyState != qx.bom.Request.DONE) this.__cleanTransport(oRequest);
        };

        if (bAsync) window.attachEvent("onunload", fOnUnload);
      }

      this.__xmlhttp.onreadystatechange = function()
      {
        if (bGecko && !bAsync) return;

        // Synchronize state
        oRequest.readyState = oRequest.__xmlhttp.readyState;
        //
        this.__synchronizeValues(oRequest);

        // BUGFIX: Firefox fires unneccesary DONE when aborting
        if (oRequest._aborted)
        {
          // Reset readyState to UNSENT
          oRequest.readyState = qx.bom.Request.UNSENT;

          // Return now
          return ;
        }

        if (oRequest.readyState == qx.bom.Request.DONE)
        {
          //
          this.__cleanTransport(oRequest);

          // BUGFIX: IE - memory leak in interrupted
          if (bIE && bAsync) window.detachEvent("onunload", fOnUnload);
        }

        // BUGFIX: Some browsers (Internet Explorer, Gecko) fire OPEN readystate twice
        if (nState != oRequest.readyState) this.__fireReadyStateChange(oRequest);

        nState = oRequest.readyState;
      };

      this.__xmlhttp.open(sMethod, sUrl, bAsync, sUser, sPassword);

      // BUGFIX: Gecko - missing readystatechange calls in synchronous requests
      if (!bAsync && bGecko)
      {
        this.readyState = qx.bom.Request.OPENED;

        this.__fireReadyStateChange(this);
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
      // BUGFIX: Safari - fails sending documents created/modified dynamically, so an explicit serialization required
      // BUGFIX: IE - rewrites any custom mime-type to "text/xml" in case an XMLNode is sent
      // BUGFIX: Gecko - fails sending Element (this is up to the implementation either to standard)
      if (vData && vData.nodeType)
      {
        vData = window.XMLSerializer ? new window.XMLSerializer().serializeToString(vData) : vData.xml;
        if (!this._headers["Content-Type"]) this.__xmlhttp.setRequestHeader("Content-Type", "application/xml");
      }

      this.__xmlhttp.send(vData);

      // BUGFIX: Gecko - missing readystatechange calls in synchronous requests
      if (bGecko && !this._async)
      {
        this.readyState = qx.bom.Request.OPENED;

        // Synchronize state
        this.__synchronizeValues(this);

        // Simulate missing states
        while (this.readyState < qx.bom.Request.DONE)
        {
          this.readyState++;
          this.__fireReadyStateChange(this);

          // Check if we are aborted
          if (this._aborted) return;
        }
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void} 
     */
    abort : function()
    {
      // BUGFIX: Gecko - unneccesary DONE when aborting
      if (this.readyState > qx.bom.Request.UNSENT) this._aborted = true;

      this.__xmlhttp.abort();

      // BUGFIX: IE - memory leak
      this.__cleanTransport(this);
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getAllResponseHeaders : function() {
      return this.__xmlhttp.getAllResponseHeaders();
    },


    /**
     * TODOC
     *
     * @type member
     * @param sName {String} TODOC
     * @return {var} TODOC
     */
    getResponseHeader : function(sName) {
      return this.__xmlhttp.getResponseHeader(sName);
    },


    /**
     * TODOC
     *
     * @type member
     * @param sName {String} TODOC
     * @param sValue {String} TODOC
     * @return {var} TODOC
     */
    setRequestHeader : function(sName, sValue)
    {
      // BUGFIX: IE - cache issue
      if (!this._headers) this._headers = {};
      this._headers[sName] = sValue;

      return this.__xmlhttp.setRequestHeader(sName, sValue);
    },


    /**
     * TODOC
     *
     * @type member
     * @param oRequest {Object} TODOC
     * @return {void} 
     */
    __fireReadyStateChange : function(oRequest)
    {
      // Execute onreadystatechange
      if (oRequest.onreadystatechange) oRequest.onreadystatechange.apply(oRequest);
    },


    /**
     * TODOC
     *
     * @type member
     * @return {null | Object} TODOC
     */
    __getDocument : function()
    {
      var doc = this.__xmlhttp.responseXML;

      if (qx.core.Variant.isSet("qx.client", "mshtml"))
      {
        // Try parsing responseText
        if (doc && !doc.documentElement && this.__xmlhttp.getResponseHeader("Content-Type").match(/[^\/]+\/[^\+]+\+xml/))
        {
          doc = new ActiveXObject('Microsoft.XMLDOM');
          doc.loadXML(this.__xmlhttp.responseText);
        }
        
        // Check if there is no error in document
        if (doc && doc.parseError != 0) {
          return null;
        }
      }
      else if (doc)
      {
        // Check if there is no error in document
        if (doc.documentElement && doc.documentElement.tagName == "parsererror") {
          return null;
        }        
      }

      return doc;
    },


    /**
     * TODOC
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
     * TODOC
     *
     * @type member
     * @return {void} 
     */
    __cleanTransport : function()
    {
      // BUGFIX: IE - memory leak (on-page leak)
      this.__xmlhttp.onreadystatechange = new Function;

      // Delete private properties
      delete this._headers;
    }
  },
  
  
  
  
  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */  
  
  destruct : function()
  {
    if (this.__xmlhttp) 
    {
      this.__xmlhttp.onreadystatechange = new Function;
      this.__xmlhttp = null;
    }
  }  
});
