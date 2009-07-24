/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Alexander Back (aback)

************************************************************************ */

/* ************************************************************************
#require(qx.bom.Element)
#require(qx.bom.Iframe)
 ************************************************************************ */

/**
 * This class provides a unified blocker to block either the whole document
 * or acts as underlying layer for DIV elements to block native browser controls
 * like select boxes.
 */
qx.Class.define("qx.bom.Blocker", 
{
  statics : 
  {
    __iframeElement : null,
    __blockerElement : null,
    __blockedElement : null,
    __defaultZIndex: 10000,
    __defaultBlockerOpacity: 0,
    __defaultBlockerColor: "transparent",
    
    /*
    ---------------------------------------------------------------------------
      PUBLIC API
    ---------------------------------------------------------------------------
    */
    
    /**
     * Blocks the whole document (if no parameter is given) or acts as an
     * underlying blocker for native controls.
     * 
     * @param element {element?null} If no element is given the whole document is blocked.
     */
    block : function(element)
    {
      this.__blockedElement = element;
      
      // it's easier to set a zIndex for the element to block to not mix up
      // the zIndex of the blocker and iframe blocker element
      if (!this.__isWholeDocumentBlockTarget()) {
        qx.bom.element.Style.set(this.__blockedElement, "zIndex", this.__defaultZIndex);
      }
      
      var styles = this.__calculateStyles();  
      this.__styleAndInsertBlocker(styles);
    },
    
    
    /**
     * Releases the block
     */
    unblock : function()
    {
      if (!this.__isWholeDocumentBlockTarget()) {
        qx.bom.element.Style.reset(this.__blockedElement, "zIndex");
      }
      
      this.__removeBlocker();
    },
    
    
    /**
     * Sets the color of the blocker element. Be sure to set also a suitable 
     * opacity value to get the desired result. {@see setBlockerOpacity}
     * 
     * @param color {String} CSS color value
     * @return {void}
     */
    setBlockerColor : function(color) {
      qx.bom.element.Style.set(this.__blockerElement, "backgroundColor", color);
    },
    
    
    /**
     * Returns the current blocker color.
     * 
     * @return {String} CSS color value
     */
    getBlockerColor : function() {
      return qx.bom.element.Style.get(this.__blockerElement, "backgroundColor");
    },
    
    
    /**
     * Sets the blocker opacity. Be sure to set also a suitable blocker color
     * value to get the desired result. {@see setBlockerColor}
     * 
     * @param opacity {String} CSS opacity value
     * @return {void}
     */
    setBlockerOpacity : function(opacity) {
      qx.bom.element.Opacity.set(this.__blockerElement, opacity);
    },
    
    
    /**
     * Returns the blocker opacity value.
     * 
     * @return {Integer} CSS opacity value
     */
    getBlockerOpacity : function() {
      return qx.bom.element.Opacity.get(this.__blockerElement);
    },
    
    
    /**
     * Set the zIndex of the blocker element. For most use cases you do not need 
     * to manipulate this value.
     * 
     * @param zIndex {Integer} CSS zIndex value
     */
    setBlockerZIndex : function(zIndex) {
      qx.bom.element.Style.set(this.__blockerElement, "zIndex", zIndex);
    },
    
    
    /**
     * Returns the blocker zIndex value
     * 
     * @return {Integer} CSS zIndex value
     */
    getBlockerZIndex : function() {
      return qx.bom.element.Style.get(this.__blockerElement, "zIndex");
    },
    
        
    
    
    /*
    ---------------------------------------------------------------------------
      PRIVATE API
    ---------------------------------------------------------------------------
    */
   
    /**
     * Setups the elements and registers a "resize" event.
     */
    __init : function()
    {
      this.__setupBlockerElement();
      this.__setupIframeElement();
      
      qx.event.Registration.addListener(window, "resize", this.__onResize, this);
    },
    
    
    /**
     * Create blocker element and set initial styles.
     */
    __setupBlockerElement : function()
    {
      this.__blockerElement = qx.bom.Element.create("div", { id: "__qxBlockerElement" });
      qx.bom.element.Style.setStyles(this.__blockerElement, 
      {
        display: "block",
        opacity: this.__defaultBlockerOpacity,
        backgroundColor: this.__defaultBlockerColor
      });
    },
    
    
    /**
     * Create iframe blocker element and set initial styles.
     * 
     * Needed to block native form elements 
     * // see: http://www.macridesweb.com/oltest/IframeShim.html
     */
    __setupIframeElement : function()
    {
      this.__iframeElement = qx.bom.Iframe.create({ id: "__qxBlockerIframeElement" });
      
      qx.bom.element.Attribute.set(this.__iframeElement, "allowTransparency", false);
      qx.bom.element.Attribute.set(this.__iframeElement, "src", "javascript:false;");
      qx.bom.element.Style.setStyles(this.__iframeElement, 
      {
        display: "block",
        opacity: this.__defaultBlockerOpacity
      });
    },
    
    
    /**
     * Calculates the necessary styles for the blocker element.
     * Either the values of the document or of the element to block are used.
     * 
     * @return {Map} Object with necessary style infos
     */
    __calculateStyles : function()
    {
      var styles = { position: "absolute" };
      
      if (this.__isWholeDocumentBlockTarget())
      {
        styles.left = "0px";
        styles.top = "0px";
        styles.right = null;
        styles.bottom = null;
        styles.width = qx.bom.Document.getWidth() + "px";
        styles.height = qx.bom.Document.getHeight() + "px";
        styles.zIndex = this.__defaultZIndex;
      }
      else
      {
        var location = qx.bom.element.Location.get(this.__blockedElement);
        for (var key in location) {
          styles[key] = location[key] + "px";
        }
        
        var dimension = qx.bom.element.Dimension.getSize(this.__blockedElement);
        for (var key in dimension) {
          styles[key] = dimension[key] + "px";
        }
        
        styles.zIndex = this.__defaultZIndex - 1;
      }
      
      return styles;
    },
    
   
    /**
     * Apply the given styles and inserts the blocker.
     * 
     * @param styles {Object} styles to apply
     */
    __styleAndInsertBlocker : function(styles)
    {
      var target;
      if(this.__isWholeDocumentBlockTarget()) {
        target = document.body;
      } else {
        target = qx.dom.Node.getBodyElement(this.__blockedElement);
      }
        
      qx.bom.element.Style.setStyles(this.__blockerElement, styles);
      qx.dom.Element.insertBegin(this.__blockerElement, target);      
      
      styles.zIndex = styles.zIndex - 1;
      qx.bom.element.Style.setStyles(this.__iframeElement, styles);
      qx.dom.Element.insertBegin(this.__iframeElement, target);
    },
    
    
    /**
     * Remove the blocker elements.
     */
    __removeBlocker: function()
    {
      qx.dom.Element.remove(this.__blockerElement);
      qx.dom.Element.remove(this.__iframeElement);
    },
    
    
    /**
     * Reacts on window resize and adapts the new size for the blocker element
     * if the whole document is blocked.
     * 
     * @param e {qx.event.type.Event} event instance
     */
    __onResize : function(e)
    {
      if (this.__isWholeDocumentBlockTarget())
      {
        // reset the blocker to get the right calculated document dimension
        this.__resizeBlocker({ width: "0px", height: "0px" });
        this.__resizeBlocker({ width: qx.bom.Document.getWidth() + "px",
                               height: qx.bom.Document.getHeight() + "px" });
      }
    },
    
    
    /**
     * Does the resizing for blocker element and blocker iframe element (IE)
     * 
     * @param dimension {Object} Map with width and height as keys
     */
    __resizeBlocker : function(dimension)
    {
      qx.bom.element.Style.setStyles(this.__blockerElement, dimension);
      qx.bom.element.Style.setStyles(this.__iframeElement, dimension);
    },
    
    
    /**
     * Checks whether the whole document is be blocked.
     * 
     * @return {Boolean} block mode
     */
    __isWholeDocumentBlockTarget : function() {
      return (this.__blockedElement == null || 
              qx.dom.Node.isWindow(this.__blockedElement) || 
              qx.dom.Node.isDocument(this.__blockedElement));
    }
  },
  
  
  defer : function(statics) {
    statics.__init();
  }
});