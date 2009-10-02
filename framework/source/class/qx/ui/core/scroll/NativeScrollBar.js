/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's left-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * The scroll bar widget wraps the native browser scroll bars as a qooxdoo widget.
 * It can be uses instead of the styled qooxdoo scroll bars.
 *
 * Scroll bars are used by the {@link qx.ui.container.Scoll} container. Usually
 * a scroll bar is not used directly.
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *   var scrollBar = new qx.ui.core.scroll.NativeScrollBar("horizontal");
 *   scrollBar.set({
 *     maximum: 500
 *   })
 *   this.getRoot().add(scrollBar);
 * </pre>
 *
 * This example creates a horizontal scroll bar with a maximum value of 500.
 *
 * *External Documentation*
 *
 * <a href='http://qooxdoo.org/documentation/0.8/widget/NativeScrollBar' target='_blank'>
 * Documentation of this widget in the qooxdoo wiki.</a>
 */
qx.Class.define("qx.ui.core.scroll.NativeScrollBar",
{
  extend : qx.ui.core.Widget,
  implement : qx.ui.core.scroll.IScrollBar,


  /**
   * @param orientation {String?"horizontal"} The initial scroll bar orientation
   */
  construct : function(orientation)
  {
    this.base(arguments);

    this.addState("native");
    
    this.getContainerElement().addListener("scroll", this._onScroll, this);
    
    // Configure orientation
    if (orientation != null) {
      this.setOrientation(orientation);
    } else {
      this.initOrientation();
    }
  },


  properties :
  {
    // overridden
    appearance :
    {
      refine : true,
      init : "scrollbar"
    },
    
    
    // overridden
    anonymous :
    {
      refine : true,
      init : true
    },


    // interface implementation
    orientation :
    {
      check : [ "horizontal", "vertical" ],
      init : "horizontal",
      apply : "_applyOrientation"
    },


    // interface implementation
    maximum :
    {
      check : "PositiveInteger",
      apply : "_applyMaximum",
      init : 100
    },


    // interface implementation
    position :
    {
      check : "qx.lang.Type.isNumber(value)&&value>=0&&value<=this.getMaximum()",
      init : 0,
      apply : "_applyPosition",
      event : "scroll"
    },

    
    /**
     * Step size for each click on the up/down or left/right buttons.
     */
    singleStep :
    {
      check : "Integer",
      init : 20
    },

    
    // interface implementation
    knobFactor :
    {
      check : "PositiveNumber",
      nullable : true
    }
  },


  members :
  {
    /*
    ---------------------------------------------------------------------------
      WIDGET API
    ---------------------------------------------------------------------------
    */
    
    renderLayout : function(left, top, width, height)
    {
      var changes = this.base(arguments, left, top, width, height);
      
      this._updateScrollBar();
      return changes;
    },
      
      
    _getContentHint : function()
    {
      var scrollbarWidth = qx.bom.element.Overflow.getScrollbarWidth();
      return {
        width: this.__isHorizontal ? 100 : scrollbarWidth,
        maxWidth: this.__isHorizontal ? null : scrollbarWidth,
        minWidth: this.__isHorizontal ? null : scrollbarWidth,            
        height: this.__isHorizontal ? scrollbarWidth : 100,
        maxHeight: this.__isHorizontal ? scrollbarWidth : null,                    
        minHeight: this.__isHorizontal ? scrollbarWidth : null                    
      }
    },
    
    
    _applyDecorator : function(value)
    {
      if (value) {
        this.setDecorator(null);
      }
    },

    
    _applyShadow : function(value)
    {
      if (value) {
        this.setShadow(null);
      }
    },
    
    
    _applyPadding : function(value, old, name) 
    {
      if (value) {
        this["set" + qx.lang.String.firstUp(name)](0);
      }
    },
    
    
    _applyEnabled : function(value, old)
    {
      this.base(arguments, value, old);
      this._updateScrollBar();
    },
    
    
    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyMaximum : function(value) {
      this._updateScrollBar();
    },


    // property apply
    _applyPosition : function(value) {
      this.scrollTo(value);
    },


    // property apply
    _applyOrientation : function(value, old)
    {
      var isHorizontal = this.__isHorizontal = value === "horizontal";

      this.set({
        allowGrowX : isHorizontal,
        allowShrinkX : isHorizontal,
        allowGrowY : !isHorizontal,
        allowShrinkY : !isHorizontal
      });
      
      if (isHorizontal) {
        this.replaceState("vertical", "horizontal");
      } else {
        this.replaceState("horizontal", "vertical");
      }
      
      this.getContainerElement().setStyles({
        overflowX: isHorizontal ? "scroll" : "hidden",
        overflowY: isHorizontal ? "hidden" : "scroll"
      });
      
      // Update layout
      qx.ui.core.queue.Layout.add(this);
    },


    /**
     * Update the scroll bar according to its current size, max value and
     * enabled state. 
     */
    _updateScrollBar : function()
    {
      var isHorizontal = this.__isHorizontal;
      
      var bounds = this.getBounds();
      if (!bounds) {
        return;
      }
      
      if (this.isEnabled()) 
      {
        var containerSize = isHorizontal ? bounds.width : bounds.height;
        var innerSize = this.getMaximum() + containerSize;
      } else {
        innerSize = 0;
      }
      
      this.getContentElement().setStyles({
        left: 0,
        top: 0,
        width: (isHorizontal ? innerSize : 1) + "px", 
        height: (isHorizontal ? 1 : innerSize) + "px" 
      });
      
      this.scrollTo(this.getPosition());
    },
    
    
    // interface implementation
    scrollTo : function(position)
    {
      var container = this.getContainerElement();      
      
      if (this.__isHorizontal) {
        container.scrollToX(position)
      } else {
        container.scrollToY(position);
      }
    },


    // interface implementation
    scrollBy : function(offset) {
      this.scrollTo(this.getPosition() + offset)
    },


    // interface implementation
    scrollBySteps : function(steps)
    {
      var size = this.getSingleStep();
      this.scrollBy(steps * size);
    },
    
    
    /**
     * Scroll event handler
     * 
     * @param e {qx.event.type.Event} the scroll event
     */
    _onScroll : function(e) 
    {
      var container = this.getContainerElement();      
      var position = this.__isHorizontal ? container.getScrollX() : container.getScrollY(); 
      this.setPosition(position);
    }
  }
});
