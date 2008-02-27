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
qx.Class.define("qx.bom.HttpRequest",
{
  extend : qx.core.Object,

  construct : function()
  {
    this.base(arguments);

    this._object = window.XMLHttpRequest ? new window.XMLHttpRequest : new window.ActiveXObject('Microsoft.XMLHTTP');
  },

  statics :
  {
    UNSENT           : 0,
    OPENED           : 1,
    HEADERS_RECEIVED : 2,
    LOADING          : 3,
    DONE             : 4
  },

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
          if (oRequest._object.readyState != qx.bom.HttpRequest.DONE) this.__cleanTransport(oRequest);
        };

        if (bAsync) window.attachEvent("onunload", fOnUnload);
      }

      this._object.onreadystatechange = function()
      {
        if (bGecko && !bAsync) return;

        // Synchronize state
        oRequest.readyState = oRequest._object.readyState;
        //
        this.__synchronizeValues(oRequest);

        // BUGFIX: Firefox fires unneccesary DONE when aborting
        if (oRequest._aborted)
        {
          // Reset readyState to UNSENT
          oRequest.readyState = qx.bom.HttpRequest.UNSENT;

          // Return now
          return ;
        }

        if (oRequest.readyState == qx.bom.HttpRequest.DONE)
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

      this._object.open(sMethod, sUrl, bAsync, sUser, sPassword);

      // BUGFIX: Gecko - missing readystatechange calls in synchronous requests
      if (!bAsync && bGecko)
      {
        this.readyState = qx.bom.HttpRequest.OPENED;

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
        if (!this._headers["Content-Type"]) this._object.setRequestHeader("Content-Type", "application/xml");
      }

      this._object.send(vData);

      // BUGFIX: Gecko - missing readystatechange calls in synchronous requests
      if (bGecko && !this._async)
      {
        this.readyState = qx.bom.HttpRequest.OPENED;

        // Synchronize state
        this.__synchronizeValues(this);

        // Simulate missing states
        while (this.readyState < qx.bom.HttpRequest.DONE)
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
      if (this.readyState > qx.bom.HttpRequest.UNSENT) this._aborted = true;

      this._object.abort();

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
      return this._object.getAllResponseHeaders();
    },


    /**
     * TODOC
     *
     * @type member
     * @param sName {String} TODOC
     * @return {var} TODOC
     */
    getResponseHeader : function(sName) {
      return this._object.getResponseHeader(sName);
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

      return this._object.setRequestHeader(sName, sValue);
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
     * @param oRequest {Object} TODOC
     * @return {null | Object} TODOC
     */
    __getDocument : function(oRequest)
    {
      var oDocument = oRequest.responseXML;

      // Try parsing responseText
      if (bIE && oDocument && !oDocument.documentElement && oRequest.getResponseHeader("Content-Type").match(/[^\/]+\/[^\+]+\+xml/))
      {
        oDocument = new ActiveXObject('Microsoft.XMLDOM');
        oDocument.loadXML(oRequest.responseText);
      }

      // Check if there is no error in document
      if (oDocument) if ((bIE && oDocument.parseError != 0) || (oDocument.documentElement && oDocument.documentElement.tagName == "parsererror")) return null;
      return oDocument;
    },


    /**
     * TODOC
     *
     * @type member
     * @param oRequest {Object} TODOC
     * @return {void} 
     */
    __synchronizeValues : function(oRequest)
    {
      try {
        oRequest.responseText = oRequest._object.responseText;
      } catch(e) {}

      try {
        oRequest.responseXML = this.__getDocument(oRequest._object);
      } catch(e) {}

      try {
        oRequest.status = oRequest._object.status;
      } catch(e) {}

      try {
        oRequest.statusText = oRequest._object.statusText;
      } catch(e) {}
    },


    /**
     * TODOC
     *
     * @type member
     * @param oRequest {Object} TODOC
     * @return {void} 
     */
    __cleanTransport : function(oRequest)
    {
      // BUGFIX: IE - memory leak (on-page leak)
      oRequest._object.onreadystatechange = new window.Function;

      // Delete private properties
      delete oRequest._headers;
    }
  }
});
