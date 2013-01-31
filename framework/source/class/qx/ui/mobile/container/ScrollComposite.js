/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

/**
 * The ScrollComposite is a extension of {@linkqx.ui.mobile.container.Composite},
 * and makes it possible to scroll vertically, if content size is greater than
 * scrollComposite's size.
 *
 * Every widget will be added to child's composite.
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *   // create the composite
 *   var scrollComposite = new qx.ui.mobile.container.ScrollComposite();
 *
 *   scrollComposite.setLayout(new qx.ui.mobile.layout.HBox());
 *
 *   // add some children
 *   scrollComposite.add(new qx.ui.mobile.basic.Label("Name: "), {flex:1});
 *   scrollComposite.add(new qx.ui.mobile.form.TextField());
 * </pre>
 *
 * This example horizontally groups a label and text field by using a
 * Composite configured with a horizontal box layout as a container.
 */
qx.Class.define("qx.ui.mobile.container.ScrollComposite",
{
  extend : qx.ui.mobile.container.Composite,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param layout {qx.ui.mobile.layout.Abstract?null} The layout that should be used for this
   *     container
   */
  construct : function(layout)
  {
    this.base(arguments);

    this.__targetOffset = [0,0];
    this.__currentOffset = [0,0];
    this.__touchStartPoints = [0,0];

    this.addCssClass("scrollableBottom");

    this._scrollContainer = this._createScrollContainer();
    
    this.addListener("touchstart",this._onTouchStart, this);
    this.addListener("touchmove",this._onTouchMove, this);
    this.addListener("touchend",this._onTouchEnd, this);
    this.addListener("swipe",this._onSwipe, this);

    this._setLayout(new qx.ui.mobile.layout.VBox());
    this._add(this._scrollContainer, {flex:1});
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */
  properties :
  {
    // overridden
    defaultCssClass :
    {
      refine : true,
      init : "scrollContainer"
    },
    
    /** Flag if scrolling in horizontal direction should be allowed. */
    scrollableX : 
    {
      init : false,
      check : "Boolean"
    },
    
    /** Flag if scrolling in vertical direction should be allowed. */
    scrollableY : 
    {
      init : true,
      check : "Boolean"
    }
  },


  members :
  {
    _scrollContainer : null,
    __touchStartPoints : null,
    __targetOffset : null,
    __currentOffset : null,
    __scrollTopOnStart : 0,
    __targetScrollTop : 0,
    __isVerticalScroll : null,

    
    /**
     * Factory method for the scrollContainer.
     * @return {qx.ui.mobile.container.Composite} a composite which represents the scrollContainer.
     */
    _createScrollContainer : function() {
      var scrollContainer = new qx.ui.mobile.container.Composite();
      scrollContainer.addCssClass("scrollContainerChild");
      return scrollContainer;
    },
    
    
    /**
    * TouchHandler for scrollContainer
    * @param evt {qx.event.type.Touch} The touch event
    */
    _onTouchStart : function(evt){
      this.__isVerticalScroll = null;
      
      var touchX = evt.getScreenLeft();
      var touchY = evt.getScreenTop();

      this._applyNoEasing();
      
      this.__touchStartPoints[0] = touchX;
      this.__touchStartPoints[1] = touchY;

      evt.stopPropagation();
    },


    /**
     * Handler for touch move events on scrollContainer
     * @param evt {qx.event.type.Touch} The touch event
     */
    _onTouchMove : function(evt) {
      var touchX = evt.getScreenLeft();
      var touchY = evt.getScreenTop();

      var distanceX = touchX - this.__touchStartPoints[0];
      var distanceY = touchY - this.__touchStartPoints[1];
      
      if(this.__isVerticalScroll == null) {
        var cosDelta = distanceX/distanceY;
        this.__isVerticalScroll = Math.abs(cosDelta) < 2;
      }
      
      if(this.__isVerticalScroll) {
          distanceX = 0
      } else {
          distanceY = 0;
      }

      var targetElement =  this._scrollContainer.getContainerElement();
      var lowerLimit = targetElement.scrollHeight - targetElement.offsetHeight-4;
      
      if(this.isScrollableY() && this.__isVerticalScroll) {
        // Upper Limit Y
        if(this.__currentOffset[1] >= 0) {
          this.removeCssClass("scrollableTop");
        } else {
          this.addCssClass("scrollableTop");
        }

        // Lower Limit Y
        if(this.__currentOffset[1] < -lowerLimit) {
          this.removeCssClass("scrollableBottom");
        } else {
          this.addCssClass("scrollableBottom");
        }
      } 
      
      // X
      this.__currentOffset[0] =  this.__targetOffset[0] + distanceX;
      // Y
      this.__currentOffset[1] =  this.__targetOffset[1] + distanceY;
      
      if(this.isScrollableX()) {
        this._scrollContainer.setTranslateX(this.__currentOffset[0]);
      }
      
      if(this.isScrollableY()) {
        this._scrollContainer.setTranslateY(this.__currentOffset[1]);
      }
      
      evt.stopPropagation();
    },


    /**
     * TouchHandler for scrollContainer
     * @param evt {qx.event.type.Touch} The touch event.
     */
    _onTouchEnd : function(evt) {
      this._applyMomentumEasing();
      
      evt.stopPropagation();
    },
    
    
     /**
     * Swipe handler for scrollContainer.
     * @param evt {qx.event.type.Swipe} The swipe event.
     */
    _onSwipe : function(evt) {
      var velocity = Math.abs(evt.getVelocity());
      var distance = evt.getDistance();
      var hasMomentum = (Math.abs(velocity)>1);
      
      if(!hasMomentum) {
        distance = 0;
      }
      
      if(this.__isVerticalScroll) {
        this.__currentOffset[1] = this.__currentOffset[1]+(2+velocity)*distance;
      }
      
      this.scrollTo(this.__currentOffset[0],this.__currentOffset[1]);
    },
    
    
    /**
     * Deactivates any scroll easing for the scrollContainer.
     */
    _applyNoEasing : function() {
       qx.bom.element.Style.set(this._scrollContainer.getContainerElement(),"transition", null);
    },
    
    
    /**
     * Activates momentum scrolling for the scrollContainer.
     * Appears like a "ease-out" easing function. 
     */
    _applyMomentumEasing : function() {
      qx.bom.element.Style.set(this._scrollContainer.getContainerElement(),"transition", "all 1500ms cubic-bezier(0.000, 0.075, 0.000, 1.00)");
    },
    
    
    /**
     * Activates bounce easing for the scrollContainer.
     * Used when user drags the scrollContainer over the edge manually.
     */
    _applyBounceEasing : function() {
      qx.bom.element.Style.set(this._scrollContainer.getContainerElement(),"transition", "all 400ms ease-in-out");
    },
    
    
    /**
     * Activates the scroll bounce easing for the scrollContainer.
     * Used when momentum scrolling is activated, and the momentum calculates an
     * endpoint outside of the viewport.
     * Causes the effect that scrollContainers scrolls to far, and bounces back to right position.
     */
    _applyScrollBounceEasing : function() {
       qx.bom.element.Style.set(this._scrollContainer.getContainerElement(),"transition", "all 1000ms cubic-bezier(0.000, 0.075, 0.000, 1.50)");
    },
    
    
    /**
     * Scrolls the scrollContainer to the given position,
     * depending on the state of properties scrollableX and scrollableY.
     * @param positionX {Integer} target offset x
     * @param positionY {Integer} target offset y
     */
    scrollTo : function(positionX, positionY) {
      var targetElement = this._scrollContainer.getContainerElement();
      var lowerLimitY = targetElement.scrollHeight - targetElement.offsetHeight-4;
      var lowerLimitX = targetElement.scrollWidth - targetElement.offsetWidth-4;

      var oldY = this._scrollContainer.getTranslateY();

      // Upper Limit Y
      if(positionY >= 0) {
        if(oldY < 0) {
          this._applyScrollBounceEasing();
        } else {
          this._applyBounceEasing();
        }
      
        positionY = 0;
      }

      // Lower Limit Y
      if(positionY < -lowerLimitY) {
        if(oldY > -lowerLimitY) {
          this._applyScrollBounceEasing();
        } else {
          this._applyBounceEasing();
        }
        
        positionY = -lowerLimitY;
      }
      if(!this.__isVerticalScroll ) {
        // Left Limit X
        if(positionX >= 0) {
          this._applyBounceEasing();

          positionX = 0;
        }
        // Right Limit X
        if(positionX < -lowerLimitX) {
          this._applyBounceEasing();

          positionX = -lowerLimitX;
        }
      }
      
      if(this.isScrollableX()) {
         this._scrollContainer.setTranslateX(positionX);
      }
      if(this.isScrollableY()) {
         this._scrollContainer.setTranslateY(positionY);
      }

      this.__targetOffset[0] = positionX;
      this.__targetOffset[1] = positionY;
    },


    //overridden
    add : function(child, options) {
      this._scrollContainer.add(child,options);
      this._handleSize(child);
    },


    // overridden
    addAfter : function(child, after, layoutProperties) {
      this._scrollContainer.addAfter(child, after, layoutProperties);
      this._handleSize(child);
    },


    // overridden
    addAt : function(child, index, options) {
      this._scrollContainer.addAt(child, index, options);
      this._handleSize(child);
    },


    // overridden
    addBefore : function(child, before, layoutProperties) {
      this._scrollContainer.addBefore(child, before, layoutProperties);
      this._handleSize(child);
    },


    // overridden
    getChildren : function() {
      return this._scrollContainer.getChildren();
    },


    // overridden
    getLayout : function() {
      return this._scrollContainer.getLayout();
    },


     // overridden
    setLayout : function(layout) {
      this._scrollContainer.setLayout(layout);
    },


    // overridden
    hasChildren : function() {
      return this._scrollContainer.getLayout();
    },


    indexOf : function(child) {
      this._scrollContainer.indexOf(child);
    },


    // overridden
    remove : function(child) {
      this._unhandleSize(child);
      this._scrollContainer.remove(child);
    },


    // overridden
    removeAll : function() {
      var children = this.getChildren();
      for(var i = 0; i < children.length; i++) {
        this._unhandleSize(children[i]);
      }

      this._scrollContainer.removeAll();
    },


    // overridden
    removeAt : function(index) {
      var children = this.getChildren();
      this._unhandleSize(children[index]);

      this._scrollContainer.removeAt(index);
    },


    /**
     * Checks if size handling is needed:
     * if true, it adds all listener which are needed for synchronizing the scrollHeight to
     * elements height.
     * @param child {qx.ui.mobile.core.Widget} target child widget.
     */
    _handleSize : function(child) {
      // If item is a text area, then it needs a special treatment.
      // Install listener to the textArea, for syncing the scrollHeight to
      // textAreas height.
      if(child instanceof qx.ui.mobile.form.TextArea) {
        // Check for Listener TODO
        child.addListener("appear", this._fixChildElementsHeight, child);
        child.addListener("input", this._fixChildElementsHeight, child);
        child.addListener("changeValue", this._fixChildElementsHeight, child);
      }
    },


    /**
     * Removes Listeners from a child if necessary.
     * @param child {qx.ui.mobile.core.Widget} target child widget.
     */
    _unhandleSize : function(child) {
      // If item is a text area, then it needs a special treatment.
      // Install listener to the textArea, for syncing the scrollHeight to
      // textAreas height.
      if(child instanceof qx.ui.mobile.form.TextArea) {
        // Check for Listener TODO
        child.removeListener("appear", this._fixChildElementsHeight, child);
        child.removeListener("input", this._fixChildElementsHeight, child);
        child.removeListener("changeValue", this._fixChildElementsHeight, child);
      }
    },


    /**
     * Synchronizes the elements.scrollHeight and its height.
     * Needed for making textArea scrollable.
     * @param evt {qx.event.type.Data} a custom event.
     */
    _fixChildElementsHeight : function(evt) {
        this.getContainerElement().style.height = 'auto';
        this.getContainerElement().style.height = this.getContainerElement().scrollHeight+'px';
    }
  },


  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */
  destruct : function()
  {
    this.removeListener("touchstart",this._onTouchStart,this);
    this.removeListener("touchmove",this._onTouchMove,this);
    this.removeListener("touchend",this._onTouchEnd,this);
    this.removeListener("swipe",this._onSwipe,this);
    
    var children = this.getChildren();
    for(var i = 0; i < children.length; i++) {
      this._unhandleSize(children[i]);
    }

    this._disposeObjects("_scrollContainer");
    
    this.__isVerticalScroll = null;
  }
});
