/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Alexander Back (aback)
   ________________________________________________________________________

   This class contains code based on the following work:

     SWFObject: Javascript Flash Player detection and embed script
     http://blog.deconcept.com/swfobject/
     Version: 1.5

     Copyright:
       2007 Geoff Stearns

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

       Permission is hereby granted, free of charge, to any person obtaining a
       copy of this software and associated documentation files (the "Software"),
       to deal in the Software without restriction, including without limitation
       the rights to use, copy, modify, merge, publish, distribute, sublicense,
       and/or sell copies of the Software, and to permit persons to whom the
       Software is furnished to do so, subject to the following conditions:

       The above copyright notice and this permission notice shall be included in
       all copies or substantial portions of the Software.

       THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
       IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
       FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
       AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
       LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
       FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
       DEALINGS IN THE SOFTWARE.

     Authors:
       * Geoff Stearns (geoff@deconcept.com)

************************************************************************ */

/* ************************************************************************


************************************************************************ */

/**
 * Flash Player detection and embed.
 *
 * This class contains code based on the following work:<br/>
 *   SWFObject: Javascript Flash Player detection and embed script<br/>
 *   http://blog.deconcept.com/swfobject/</br>
 *   Version: 1.5
 *
 * License:<br/>
 *   MIT: http://www.opensource.org/licenses/mit-license.php<br/>
 *   For more info, please see the corresponding source file.
 */
qx.Class.define("qx.html2.element.Flash",
{
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param vSource {String} Url of the SWF file to embed
   * @param vVersion {String} Flash version of the SWF file
   */
  construct : function(vSource, vVersion)
  {
    this.base(arguments);

    // Use background handling of qx.ui.core.Widget instead
    this._params = {};
    this._variables = {};

    
    if (vSource != null) {
      this.setSource(vSource);
    }

    this.setVersion(vVersion != null ? vVersion : qx.html2.element.Flash.MINREQUIRED);
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** Version number for express install */
    EXPRESSINSTALL : [ 6, 0, 65 ],
    
    MINREQUIRED : "1",
    
    /** Detected player version (using {@link qx.html2.client.Flash} class) */
    PLAYERVERSION : qx.html2.client.Flash.PLAYERVERSION,
    
    PLUGINKEY : "Shockwave Flash",
    
    ACTIVEXKEY : "ShockwaveFlash.ShockwaveFlash"
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** The source of the flash file */
    source :
    {
      check : "String",
      nullable : true,
      apply : "_applySource"
    },

    /** Version of the flash file */
    version : {
      apply : "_applyVersion",
      nullable : true
    },

    /** Whether expressInstall should be enabled or not */
    enableExpressInstall :
    {
      check : "Boolean",
      init : false
    },

    /** Whether flash player detection should be used or not  */
    enableDetection :
    {
      check : "Boolean",
      init : true
    },

    /** Redirect url in case the flash file is not usable */
    redirectUrl :
    {
      check : "String",
      init : ""
    },

    /** The quality of the flash file */
    quality :
    {
      init : "high",
      check : [ "low", "autolow", "autohigh", "medium", "high", "best" ],
      apply : "_applyQuality"
    },

    /** The scaling of the flash file */
    scale :
    {
      init : "showall",
      check : [ "showall", "noborder", "excactfit", "noscale" ],
      apply : "_applyScale"
    },

    /** The window mode of the flash file */
    wmode :
    {
      init : "",
      check : [ "window", "opaque", "transparent", "" ],
      apply : "_applyWmode"
    },

    /** Play/Stop the flash file */
    play :
    {

      check : "Boolean",
      init : true,
      apply : "_applyPlay"
    },

    /** Controls if the flash file is played in a loop or once */
    loop :
    {
      check : "Boolean",
      init : true,
      apply : "_applyLoop"
    },

    /** Controls the menu of the flash file */
    menu :
    {
      check : "Boolean",
      init : true,
      apply : "_applyMenu"
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
      BASICS
    ---------------------------------------------------------------------------
    */

    _version : null,
    _source : "",
    _html : null,
    _generated : false,

    
    /**
     * Lazy generation of the html code for embedding the flash file
     *
     * @type member
     * @return {String} the html for embedding the flash file
     */
    getHtml : function()
    {
      if (this._generated == false)
      {
         this._applyGeneration();
      }
      return this._html;
    },
    
    
    /**
     * Returns a DOM node for embedding the flash file
     *
     * @type member
     * @return {qx.html2.element.Node} the DOM node containing the html code for embedding
     */
    getDOMNode : function()
    {
       var node = qx.html2.element.Node.createElement("div");
       node.innerHTML = this.getHtml();
       
       return node;
    },
    

    /**
     * Checks if the flash player of the client is capable and then 
     * starts the generation of the html code.
     *
     * @type member
     * @return {void}
     */
    _applyGeneration : function()
    {
      // Check for ExpressInstall
      this._expressInstall = false;

      if (this.getEnableExpressInstall())
      {
        // check to see if we need to do an express install
        var expressInstallReqVer = new qx.util.Version(qx.html2.element.Flash.EXPRESSINSTALL);
        var installedVer = qx.html2.Flash.PLAYERVERSION;

        if (installedVer.versionIsValid(expressInstallReqVer) && !installedVer.versionIsValid(this._version)) {
          this._expressInstall = true;
        }
      }

      // this.debug("ExpressInstall Enabled: " + this._expressInstall);
      // Apply HTML
      if (!this.getEnableDetection() || this._expressInstall || qx.html2.element.Flash.PLAYERVERSION.versionIsValid(this._version))
      {
        this._html       = this.__generateHTML();
        this._generation = true;
      }
      else
      {
        var redir = this.getRedirectUrl();

        if (redir != "") {
          document.location.replace(redir);
        }
      }
    },




    /*
    ---------------------------------------------------------------------------
      HTML GENERATOR
    ---------------------------------------------------------------------------
    */

    /**
     * Does the generation of the html code.
     * 
     * @signature function()
     */
    __generateHTML : qx.lang.Object.select(navigator.plugins && navigator.mimeTypes && navigator.mimeTypes.length ? "plugin" : "activeX",
    {
      // Netscape Plugin Architecture
      "plugin" : function()
      {
        var html = [];

        // Express Install Handling
        if (this._expressInstall)
        {
          document.title = document.title.slice(0, 47) + ' - Flash Player Installation';

          this.addVariable('MMredirectURL', escape(window.location));
          this.addVariable('MMdoctitle', document.title);
          this.addVariable('MMplayerType', 'PlugIn');
        }

        html.push("<embed type='application/x-shockwave-flash' width='100%' height='100%' src='");
        html.push(this._source);
        html.push("'");

        var params = this.getParams();

        for (var key in params)
        {
          this.debug(key + " " + params[key]);
          
          html.push(" ");
          html.push(key);
          html.push("=");
          html.push("'");
          html.push(params[key]);
          html.push("'");
        }

        var pairs = this.getVariablePairs();

        if (pairs.length > 0)
        {
          html.push(" ");
          html.push("flashvars");
          html.push("=");
          html.push("'");
          html.push(pairs);
          html.push("'");
        }

        html.push("></embed>");

        return html.join("");
      },

      // Internet Explorer ActiveX Architecture
      "activeX" : function()
      {
        var html = [];

        // Express Install Handling
        if (this._expressInstall)
        {
          document.title = document.title.slice(0, 47) + ' - Flash Player Installation';

          this.addVariable("MMredirectURL", escape(window.location));
          this.addVariable("MMdoctitle", document.title);
          this.addVariable("MMplayerType", "ActiveX");
        }

        html.push("<object classid='clsid:D27CDB6E-AE6D-11cf-96B8-444553540000' width='100%' height='100%'>");
        html.push("<param name='movie' value='");
        html.push(this._source);
        html.push("'/>");

        var tags = this.generateParamTags();

        if (tags.length > 0) {
          html.push(tags);
        }

        var pairs = this.getVariablePairs();

        if (pairs.length > 0)
        {
          html.push("<param name='flashvars' value='");
          html.push(pairs);
          html.push("'/>");
        }

        html.push("</object>");

        return html.join("");
      }
    }),




    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     * @param propName {var} TODOC
     */
    _applySource : function(value, old, propName) {
      this._source = qx.util.Validation.isValidString(value) ? qx.io.Alias.getInstance().resolve(value) : "";
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyVersion : function(value, old)
    {
      if (this._version)
      {
        this._version.dispose();
        this._version = null;
      }

      if (qx.util.Validation.isValidString(value)) {
        this._version = new qx.util.Version(value);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyQuality : function(value, old)
    {
      this.setParam("quality", value.toString());
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyScale : function(value, old)
    {
      this.setParam("scale", value.toString());
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyWmode : function(value, old)
    {
      this.setParam("wmode", value.toString());
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyPlay : function(value, old)
    {
      this.setParam("play", value.toString());
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyLoop : function(value, old)
    {
      this.setParam("loop", value.toString());
    },



    /*
    ---------------------------------------------------------------------------
      PARAMS
    ---------------------------------------------------------------------------
    */

    /**
     * Sets a parameter. These parameters are passed to the
     * flash player via the embed/object element
     *
     * @type member
     * @param name {var} Name of the parameter
     * @param value {var} Value of the parameter
     * @return {void}
     */
    setParam : function(name, value) {
      this._params[name] = value;
    },


    /**
     * Get one specific parameter value
     *
     * @type member
     * @param name {var} Name of the parameter
     * @return {var} Parameter value
     */
    getParam : function(name) {
      return this._params[name];
    },


    /**
     * Get all parameters
     *
     * @type member
     * @return {Object} Hash of all parameters
     */
    getParams : function() {
      return this._params;
    },




    /*
    ---------------------------------------------------------------------------
      VARIABLES
    ---------------------------------------------------------------------------
    */

    /**
     * Set a variable. These variables are passed to flash player using 
     * the <b>flashVars</b> attribute of the embed/object element.
     *
     * @type member
     * @param name {var} Name of the variable
     * @param value {var} Value of the variable
     * @return {void}
     */
    setVariable : function(name, value) {
      this._variables[name] = value;
    },


    /**
     * Get one specific variable value
     *
     * @type member
     * @param name {var} Name of the variable
     * @return {var} Value of the variable
     */
    getVariable : function(name) {
      return this._variables[name];
    },


    /**
     * Get all variables
     *
     * @type member
     * @return {Object} Hash of all variables
     */
    getVariables : function() {
      return this._variables;
    },




    /*
    ---------------------------------------------------------------------------
      HTML UTILITIES
    ---------------------------------------------------------------------------
    */

    /**
     * Generate the param tags. This is used for embedding 
     * an flash file with the object element. The param tags are
     * used to pass parameter to the flash player.
     *
     * @type member
     * @return {String} String containing all param tags
     */
    generateParamTags : function()
    {
      var vParams = this.getParams();
      var vParamTags = [];

      for (var vKey in vParams)
      {
        vParamTags.push("<param name='");
        vParamTags.push(vKey);
        vParamTags.push("' value='");
        vParamTags.push(vParams[vKey]);
        vParamTags.push("'/>");
      }

      return vParamTags.join("");
    },


    /**
     * Generate the variable pairs to use them for 
     * the embed/object element (for passing the variables
     * and their values to the flash player).
     *
     * @type member
     * @return {String} String containing all the variables and their values
     */
    getVariablePairs : function()
    {
      var variables = this.getVariables();
      var variablePairs = [];

      for (var key in variables) {
        variablePairs.push(key + "=" + variables[key]);
      }

      return variablePairs.join("&");
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeObjects("_version");
    this._disposeFields("_source", "_params", "_variables");
  }
});
