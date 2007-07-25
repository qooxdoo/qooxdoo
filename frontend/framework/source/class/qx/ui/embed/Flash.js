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
   
************************************************************************ */

/* ************************************************************************
#require(qx.html2.element.Flash)

************************************************************************ */

/**
 * Flash Player embed.
 * 
 */
qx.Class.define("qx.ui.embed.Flash",
{
  extend : qx.ui.basic.Terminator,


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

    this.setFlashObject(new qx.html2.element.Flash(vSource, vVersion));
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */
  
  properties :
  {
    /** Underlying flash object */
    flashObject :
    {
       check    : "qx.html2.element.Flash",
       nullable : false 
    } 
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Wrapper for {@link qx.html2.element.Flash#setVariable}
     * 
     * @param name {String} name of the variable
     * @param value {String} value of the variable
     * @return {void}
     */
    setVariable : function(name, value)
    {
       this.getFlashObject().setVariable(name, value);
    },
    
    
    /**
     * Wrapper for {@link qx.html2.element.Flash#getVariable}
     * 
     * @param name {String} name of the variable
     * @return {String} value of the variable
     */
    getVariable : function(name)
    {
       return this.getFlashObject().getVariable(name); 
    },
    
    
    /**
     * Wrapper for {@link qx.html2.element.Flash#setSource}
     * 
     * @param source {String} source of the flash file
     * @return {void}
     */
    setSource : function(source)
    {
       this.getFlashObject().setSource(source);
    },
    
    
    /**
     * Wrapper for {@link qx.html2.element.Flash#getSource}
     * 
     * @return {String} source of the flash file
     */
    getSource : function()
    {
       return this.getFlashObject().getSource();
    },
    
    
    /**
     * Wrapper for {@link qx.html2.element.Flash#setVersion}
     * 
     * @param version {String} version of the flash file
     * @return {void}
     */
    setVersion : function(version)
    {
       this.getFlashObject().setVersion(version);
    },
    
    
    /**
     * Wrapper for {@link qx.html2.element.Flash#getVersion}
     * 
     * @return {String} version of the flash file
     */
    getVersion : function()
    {
       return this.getFlashObject().getVersion();
    },
    
    
    /**
     * Wrapper for {@link qx.html2.element.Flash#setQuality}
     * 
     * @param quality {String} quality of the flash file
     * @return {void}
     */
    setQuality : function(quality)
    {
       this.getFlashObject().setQuality(quality);
    },
    
    
    /**
     * Wrapper for {@link qx.html2.element.Flash#getQuality}
     * 
     * @return {String} quality of the flash file
     */
    getQuality : function()
    {
       return this.getFlashObject().getQuality();
    },
    
    
    /**
     * Wrapper for {@link qx.html2.element.Flash#setScale}
     * 
     * @param scale {String} scale of the flash file
     * @return {void}
     */
    setScale : function(scale)
    {
       this.getFlashObject().setScale(scale);
    },
    
    
    /**
     * Wrapper for {@link qx.html2.element.Flash#getScale}
     * 
     * @return {String} scale of the flash file
     */
    getScale : function()
    {
       return this.getFlashObject().getScale();
    },
    
    
    /**
     * Wrapper for {@link qx.html2.element.Flash#setWmode}
     * 
     * @param wmode {String} wmode of the flash file
     * @return {void}
     */
    setWmode : function(wmode)
    {
       this.getFlashObject().setWmode(wmode);
    },
    
    
    /**
     * Wrapper for {@link qx.html2.element.Flash#getWmode}
     * 
     * @return {String} wmode of the flash file
     */
    getWmode : function()
    {
       return this.getFlashObject().getWmode();
    },
    
    
    /**
     * Wrapper for {@link qx.html2.element.Flash#setPlay}
     * 
     * @param play {String} play/stop the flash file
     * @return {void}
     */
    setPlay : function(play)
    {
       this.getFlashObject().setPlay(play);
    },
    
    
    /**
     * Wrapper for {@link qx.html2.element.Flash#getPlay}
     * 
     * @return {String} play/stop the flash file
     */
    getPlay : function()
    {
       return this.getFlashObject().getPlay();
    },
    
    
    /**
     * Wrapper for {@link qx.html2.element.Flash#setLoop}
     * 
     * @param loop {String} controls if the flash file is played in an endless loop 
     * @return {void}
     */
    setLoop : function(loop)
    {
       this.getFlashObject().setLoop(loop);
    },
    
    
    /**
     * Wrapper for {@link qx.html2.element.Flash#getLoop}
     * 
     * @return {String} returns if the flash file is played in an endless loop
     */
    getLoop : function()
    {
       return this.getFlashObject().getLoop();
    },
    
    
    /**
     * Wrapper for {@link qx.html2.element.Flash#setEnableExpressInstall}
     * 
     * @param expressInstall {Boolean} whether expressInstall should be used or not
     * @return {void}
     */
    setEnableExpressInstall : function(expressInstall)
    {
       this.getFlashObject().setEnableExpressInstall(expressInstall);
    },
    
    
    /**
     * Wrapper for {@link qx.html2.element.Flash#getEnableExpressInstall}
     * 
     * @return {Boolean} use of enableExpressInstall
     */
    getEnableExpressInstall : function()
    {
       return this.getFlashObject().getEnableExpressInstall();
    },
    
    
    /**
     * Wrapper for {@link qx.html2.element.Flash#setEnableDetection}
     * 
     * @param detection {Boolean} use version detection or not
     * @return {void}
     */
    setEnableDetection : function(detection)
    {
       this.getFlashObject().setEnableDetection(detection);
    },
    
    
    /**
     * Wrapper for {@link qx.html2.element.Flash#getEnableDetection}
     * 
     * @return {Boolean} use of version detection
     */
    getEnableDetection : function()
    {
       return this.getFlashObject().getEnableDetection();
    },
    
    
    /**
     * Wrapper for {@link qx.html2.element.Flash#setMenu}
     * 
     * @param menu {Boolean} use menu or not
     * @return {void}
     */
    setMenu : function(menu)
    {
       this.getFlashObject().setEnableDetection(detection);
    },
    
    
    /**
     * Wrapper for {@link qx.html2.element.Flash#getMenu}
     * 
     * @return {Boolean} use of menu
     */
    getMenu : function()
    {
       return this.getFlashObject().getMenu();
    },
    
    
    /**
     * Wrapper for {@link qx.html2.element.Flash#setRedirectUrl}
     * 
     * @param redirectUrl {String} redirectUrl of the flash file
     * @return {void}
     */
    setRedirectUrl : function(redirectUrl)
    {
       this.getFlashObject().setRedirectUrl(redirectUrl);
    },
    
    
    /**
     * Wrapper for {@link qx.html2.element.Flash#getRedirectUrl}
     * 
     * @return {String} redirectUrl of the flash file
     */
    getRedirectUrl : function()
    {
       return this.getFlashObject().getRedirectUrl();
    },
    
    
    /**
     * Overwritten method of {@link qx.ui.core.Widget} to embed flash html
     *
     * @type member
     * @param el {Element} Given DOM element
     * @return {void}
     */
    _applyElementData : function(el)
    {
      this.base(arguments, el);

      if (this.getFlashObject().getHtml() != null)
      {
        el.innerHTML = this.getFlashObject().getHtml();
      }
      else
      {
         this.error("Unable to insert flash embed");
      }
    },


    /*
    ---------------------------------------------------------------------------
      OVERWRITE BACKGROUND COLOR HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * Overwritten from {@link qx.ui.core.Widget}. Sets the background color of
     * the flash object by calling the {@link #_setBackgroundProperty} method.
     *
     * @type member
     * @param value {var} Current value
     */
    _styleBackgroundColor : function(value)
    {
      if (value)
      {
        this._setBackgroundColorProperty(value);
      }
      else
      {
        this._resetBackgroundColorProperty();
      }
    },


    /**
     * Sets the background color of the flash object by passing it
     * the corresponding parameter (bgcolor).
     *
     * @type member
     * @param vNewValue {var} new background color value
     * @return {void}
     */
    _setBackgroundColorProperty : function(vNewValue) {
      this.getFlashObject().setParam("bgcolor", vNewValue);
    },


    /*
    ---------------------------------------------------------------------------
      METHODS TO GIVE THE LAYOUTERS INFORMATIONS
    ---------------------------------------------------------------------------
    */

    /**
     * Returns true
     * 
     * @signature function()
     * @return {Boolean}
     */
    _isWidthEssential : qx.lang.Function.returnTrue,

    /**
     * Returns true
     * 
     * @signature function()
     * @return {Boolean}
     */
    _isHeightEssential : qx.lang.Function.returnTrue,




    /*
    ---------------------------------------------------------------------------
      PREFERRED DIMENSIONS
    ---------------------------------------------------------------------------
    */

    /**
     * Returns zero
     * 
     * @signature function()
     * @return {Integer}
     */
    _computePreferredInnerWidth : qx.lang.Function.returnZero,

    /**
     * Returns zero
     * 
     * @signature function()
     * @return {Integer}
     */
    _computePreferredInnerHeight : qx.lang.Function.returnZero
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {}
});
