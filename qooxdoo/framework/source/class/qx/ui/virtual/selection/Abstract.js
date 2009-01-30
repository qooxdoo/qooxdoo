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
     * Fabian Jakobs (fjakobs)
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

qx.Class.define("qx.ui.virtual.selection.Abstract",
{
  extend : qx.ui.core.selection.Abstract,
   
  
  /*
   *****************************************************************************
      CONSTRUCTOR
   *****************************************************************************
   */

  construct : function(pane)
  {
    this.base(arguments);
    this._pane = pane;
  },
   
   
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
 
  members :
  {  
    attachMouseEvents : function()
    {
      var pane = this._pane;
      pane.addListener("mousedown", this.handleMouseDown, this);
      pane.addListener("mouseup", this.handleMouseUp, this);
      pane.addListener("mouseover", this.handleMouseOver, this);
      pane.addListener("mousemove", this.handleMouseMove, this);
      pane.addListener("losecapture", this.handleLoseCapture, this);
    },
    
    
    attachKeyEvents : function(target) {
      target.addListener("keypress", this.handleKeyPress, this);
    },
    
    
    attachListEvents : function(list)
    {
      list.addListener("addItem", this.handleAddItem, this);
      list.addListener("removeItem", this.handleRemoveItem, this);      
    },
    
    
    // overridden
    _capture : function() {
      this._pane.capture();
    },


    // overridden
    _releaseCapture : function() {
      this._pane.releaseCapture();
    },    
    
    
    // overridden
    _styleSelectable : function(item, type, enabled) {      
    },
    
    
    // overridden
    _getScroll : function()
    {
      return {
        left : this._pane.getScrollX(),
        top: this._pane.getScrollY()
      };
    },
    

    // overridden
    _scrollBy : function(xoff, yoff) 
    {
      this._pane.setScrollX(this._pane.getScrollX() + xoff);
      this._pane.setScrollY(this._pane.getScrollY() + yoff);
    },
        
    
    // overridden
    _getLocation : function()
    {
      var elem = this._pane.getContentElement().getDomElement();
      return elem ? qx.bom.element.Location.get(elem) : null;
    },
    
    
    // overridden
    _getDimension : function() {
      return this._pane.getInnerSize();
    }    
  }
});
