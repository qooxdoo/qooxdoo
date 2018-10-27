/* ************************************************************************

   SQville Software

   http://sqville.com

   Copyright:
     None

   License:
     MIT:

   Authors:
     * Chris Eskew (chris.eskew@sqville.com)

************************************************************************ */

/**
 * A mixin that enables the font property, and thus, font handling abilities to the Image object
 * This mixin is needed to enable font icons to show up using the Font object
 */
qx.Mixin.define("qx.theme.clean.MImage",
{
  
  
  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */
 
  properties :
  {
  	/** Control the text alignment */
    textAlign :
    {
      check : ["left", "center", "right", "justify"],
      nullable : true,
      themeable : true,
      apply : "_applyTextAlign",
      event : "changeTextAlign"
    },
    
    /** Font size of the widget */
    textSize :
    {
      check : "Integer",
      init : null,
      apply : "_applyTextSize",
      themeable : true,
      nullable : true
    },
    
    /** Font size, width and calculated height all in one property - 
     * Array values in order:
     *  0 = size
     *  1 = adjustment
     *   */
    dynamicSize :
    {
      check : "Array",
      init : null,
      apply : "_applyDynamicSize",
      themeable : true,
      nullable : true
    },
    
    /** Any text string which can contain HTML, too */
    html :
    {
      check : "String",
      apply : "_applyHtml",
      event : "changeHtml",
      nullable : true,
      themeable : true
    },
    
    /** Color of the svg fill property */
    fill :
    {
      check : "Color",
      nullable : true,
      themeable : true,
      apply : "_applyFill"
    },
    
    /** Any text string to populate the image tag's data-type attribute */
    datatype :
    {
      check : "String",
      apply : "_applyDataType",
      nullable : true,
      themeable : true
    }
  	
  },
  
  

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
  	
  	__font : null,
    __invalidContentSize : null,
    __tapListenerId : null,
    __webfontListenerId : null,
  	
  	
  	// overridden
    _applyFill : function(value, old)
    {
      if (value) {
        var svgelem = this.getContentElement();
        var attval = svgelem.getAttribute("html");
        if (svgelem != null){
        	svgelem.setStyle("fill", qx.theme.manager.Color.getInstance().resolve(value));
        }
      }
    },
    
    _applyTextSize : function(value, old)
    {
      if (value)
        this.getContentElement().setStyle("font-size", value + "px");
    },
    
    _applyDynamicSize : function(value, old)
    {
      if (value)
        this.setTextSize(value[0]);
        this.setWidth(value[0]);     
        this.setHeight(Math.round(value[0]*value[1]));
    },
  	
  	// property apply
    _applyHtml : function(value, old)
    {
      var elem = this.getContentElement();
      // Workaround for http://bugzilla.qooxdoo.org/show_bug.cgi?id=7679
      if (qx.core.Environment.get("engine.name") == "mshtml" &&
        qx.core.Environment.get("browser.documentmode") == 9)
      {
        elem.setStyle("position", "relative");
      }

      // Insert HTML content
      elem.setAttribute("html", value||"");
    },
  	
  	// property apply
    _applyTextAlign : function(value, old) {
      this.getContentElement().setStyle("textAlign", value);
    },
    
    // property apply
    _applyDataType : function(value, old)
    {
      var elem = this.getContentElement();

      // Insert data-type content
      elem.setAttribute("data-type", value||"");
    },


    // overridden
    /*_applyTextColor : function(value, old)
    {
      if (value) {
        this.getContentElement().setStyle("color", qx.theme.manager.Color.getInstance().resolve(value));
      } else {
        this.getContentElement().removeStyle("color");
      }
    },*/
    
    
    // property apply
    _applyFont : function(value, old)
    {
      if (old && this.__font && this.__webfontListenerId) {
        this.__font.removeListenerById(this.__webfontListenerId);
        this.__webfontListenerId = null;
      }
      // Apply
      var styles;
      if (value)
      {
        this.__font = qx.theme.manager.Font.getInstance().resolve(value);
        if (this.__font instanceof qx.bom.webfonts.WebFont) {
          this.__webfontListenerId = this.__font.addListener("changeStatus", this._onWebFontStatusChange, this);
        }
        styles = this.__font.getStyles();
      }
      else
      {
        this.__font = null;
        styles = qx.bom.Font.getDefaultStyles();
      }

      // check if text color already set - if so this local value has higher priority
      if (this.getTextColor() != null) {
        delete styles["color"];
      }
      
      // check if text size already set - if so this local value has higher priority
      if (this.getTextSize() != null) {
        delete styles["fontSize"];
      }

      this.getContentElement().setStyles(styles);

      // Invalidate text size
      this.__invalidContentSize = true;

      // Update layout
      qx.ui.core.queue.Layout.add(this);
    },
    
    /**
     * Triggers layout recalculation after a web font was loaded
     *
     * @param ev {qx.event.type.Data} "changeStatus" event
     */
    _onWebFontStatusChange : function(ev)
    {
      if (ev.getData().valid === true) {

        // safari has trouble resizing, adding it again fixed the issue [BUG #8786]
        if (qx.core.Environment.get("browser.name") == "safari" &&
          parseFloat(qx.core.Environment.get("browser.version")) >= 8) {
            window.setTimeout(function() {
              this.__invalidContentSize = true;
              qx.ui.core.queue.Layout.add(this);
            }.bind(this), 0);
        }

        this.__invalidContentSize = true;
        qx.ui.core.queue.Layout.add(this);
      }
    }
  }
});