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
     * Christian Schmidt (chris_schmidt)

************************************************************************ */

/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 * 
 * The Flash widget embeds the HMTL Flash element
 * 
 * @experimental Perhaps the API can change during the development process.
 */
qx.Class.define("qx.ui.embed.Flash",
{
  extend : qx.ui.core.Widget,

  
  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  
  /**
   * Constructs a flash widget. 
   * 
   * @param source {String} The URL of the Flash movie to display.
   * @param id {String?null} The unique id for the Flash movie.
   */
  construct : function(source, id)
  {
    this.base(arguments);
    
    // TODO check incoming parameters
    this.setSource(source);
    
    if (id) {
      this.setId(id);
    } else {
      this.setId("flash" + this.toHashCode());
    }
    
    /*
     * Creates the Flash DOM element (movie) on appear,
     * because otherwise IE 7 and higher blocks the 
     * ExternelInterface from Flash.
     */
    this.addListenerOnce("appear", function()
    {
      this.getContentElement().createFlash();
    }, this);
  },
  
  
  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */
  
  
  properties :
  {
    /**
     * The URL of the Flash movie.
     */
    source :
    {
      check : "String",
      apply : "_applySource"
    },

    /**
     * The unique Flash movie id.
     */
    id :
    {
      check : "String",
      apply : "_applyId"
    },

    /**
     * Set the quality attribute for the Flash movie.
     */
    quality :
    {
      check : ["low", "autolow", "autohigh", "medium", "high", "best"],
      nullable : true,
      apply : "_applyQuality"
    },

    /**
     * Set the scale attribute for the Flash movie.
     */
    scale :
    {
      check : ["showall", "noborder", "excactfit", "noscale"],
      nullable : true,
      apply : "_applyScale"
    },

    /**
     * Set the wmode attribute for the Flash movie.
     */
    wmode :
    {
      check : ["window", "opaque", "transparent"],
      nullable : true,
      apply : "_applyWmode"
    },

    /**
     * Set the play attribute for the Flash movie.
     */
    play :
    {
      check : "Boolean",
      nullable : true,
      apply : "_applyPlay"
    },

    /**
     * Set the loop attribute for the Flash movie.
     */
    loop :
    {
      check : "Boolean",
      nullable : true,
      apply : "_applyLoop"
    },

    /**
     * Set the menu attribute for the Flash movie.
     */
    menu :
    {
      check : "Boolean",
      nullable : true,
      apply : "_applyMenu"
    },
    
    /**
     * Set the 'FlashVars' to pass variables to the Flash movie.
     */
    variables :
    {
      init : {},
      check : "Map",
      apply : "_applyVariables"
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
     * Returns the DOM element of the Flash movie.
     * 
     * @return {Element|null} The DOM element of the Flash movie.
     */
    getFlashElement : function()
    {
      var element = this.getContentElement();
      
      if (!element) {
        element = element.getFlashElement();
      }
      
      return element;
    },
    
    
    // overridden
    _createContentElement : function() {
      return new qx.html.Flash();
    },
    
    
    /*
    ---------------------------------------------------------------------------
     APPLY METHODS
    ---------------------------------------------------------------------------
    */
    
    
    // property apply
    _applySource : function(value, old)
    {
      // TODO check if the resource manager is enough to get the URL
      var source = qx.util.ResourceManager.toUri(value);
      this.getContentElement().setSource(source);
      qx.ui.core.queue.Layout.add(this);
    },

    // property apply
    _applyId : function(value, old)
    {
      this.getContentElement().setId(value);
      qx.ui.core.queue.Layout.add(this);
    },
    
    // property apply
    _applyVariables : function(value, old)
    {
      this.getContentElement().setVariables(value);
      qx.ui.core.queue.Layout.add(this);
    },
    
    // property apply
    _applyQuality : function(value, old) {
      this.__flashParamHelper("quality", value);
    },
    
    // property apply
    _applyScale : function(value, old) {
      this.__flashParamHelper("scale", value);
    },
    
    // property apply
    _applyWmode : function(value, old) {
      this.__flashParamHelper("wmode", value);
    },
    
    // property apply
    _applyPlay : function(value, old) {
      this.__flashParamHelper("play", value);
    },
    
    // property apply
    _applyLoop : function(value, old) {
      this.__flashParamHelper("loop", value);
    },
    
    // property apply
    _applyMenu : function(value, old) {
      this.__flashParamHelper("menu", value);
    },
    
    // overridden
    _applyBackgroundColor : function(value, old) {
      value = this.__convertToHexString(value);
      this.__flashParamHelper("bgcolor", value);
    },
    
    /*
    ---------------------------------------------------------------------------
     HELPER METHODS
    ---------------------------------------------------------------------------
    */
    
    /**
     * Set the attribute for the Flash DOM element.
     * 
     * @param key {String} Flash Player attribute name.
     * @param value {String?null} The value for the attribute, <code>null</code>
     *    if the attribut should be removed from the DOM element.
     */
    __flashParamHelper : function(key, value)
    {
      this.getContentElement().setParam(key, value);
      qx.ui.core.queue.Layout.add(this);
    },
    
    /**
     * Convert the <code>Color</code> to a hex string like <code>#ABCDEF</code>.
     * 
     * @param color {Color} Color to convert.
     * @return {String} Hex string starting with <code>#</code>.
     */
    __convertToHexString : function(color)
    {
      if (!color) {
        return color;
      }
        
      var rgb = qx.util.ColorUtil.stringToRgb(color);
      return "#" + qx.util.ColorUtil.rgbToHexString(rgb);
    }
  }
});
