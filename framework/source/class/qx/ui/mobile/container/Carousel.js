/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christopher Zuendorf (czuendorf)

************************************************************************ */

/**
 * Creates a Carousel widget. 
 * A carousel is a widget which can switch between several sub pages {@link  qx.ui.mobile.container.CarouselPage}.
 * A page switch is triggered by a swipe to left, for next page, or a swipe to right for 
 * previous page.
 * 
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *  
 *  var carousel = new qx.ui.mobile.container.Carousel(0.3);
 *  var carouselPage1 = new qx.ui.mobile.container.CarouselPage();
 *  var carouselPage2 = new qx.ui.mobile.container.CarouselPage();
 *     
 *  carouselPage1.add(new qx.ui.mobile.basic.Label("This is a carousel. Please swipe left."));
 *  carouselPage2.add(new qx.ui.mobile.basic.Label("Now swipe right."));
 *     
 *  carousel.addPage(carouselPage1);
 *  carousel.addPage(carouselPage2);
 * </pre> 
 * 
 */
qx.Class.define("qx.ui.mobile.container.Carousel",
{
  extend : qx.ui.mobile.container.Composite,
  include : qx.ui.mobile.core.MResize,
  

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
 
  /**
  * @param transitionDuration {Integer} transition duration on carouselPage change in seconds.
  */
  construct : function(transitionDuration)
  {
    this.base(arguments);
    
    if(transitionDuration) {
      this.__transitionDuration = transitionDuration;
    }

    var carouselScroller = this.__carouselScroller = new qx.ui.mobile.container.Composite();
    carouselScroller.addCssClass("carousel-scroller");
    
    this.addListener("touchstart", this._onTouchStart, this);
    this.addListener("touchmove", this._onTouchMove, this);
    this.addListener("touchend", this._onTouchEnd, this);
    
    this.addListener("appear", this._updateCarouselLayout, this);
    
    qx.event.Registration.addListener(window, "orientationchange", this._updateCarouselLayout, this);
    qx.event.Registration.addListener(window, "resize", this._updateCarouselLayout, this);
    
    this._add(carouselScroller, {flex:1});
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */
  properties : {
    // overridden
    defaultCssClass : {
      refine : true,
      init : "carousel"
    }
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
  members :
  {
    __carouselScroller : null,
    __touchStartPosition : [0,0],
    __snapPointsX : [],
    __onMoveOffset : [0,0],
    __lastOffset : [0,0],
    __boundsX : [0,0],
    __pages : [],
    __shownPageIndex : 0,
    __pageWidth : 0,
    __showTransition : null,
    __transitionDuration : 0.4,

    
    /**
     * Adds a page to the carousel.
     * @param evt {qx.ui.mobile.container.CarouselPage} The carousel page which should be added to the carousel.
     */
    addPage : function(page) {
      if (qx.core.Environment.get("qx.debug"))
      {
        this.assertEquals(page.name, "qx.ui.mobile.container.CarouselPage");
      }
       
      this.__pages.push(page);
      this.__carouselScroller.add(page);
    },
    
    
    /**
     * Removes a carousel page from carousel identified by its index.
     * @param pageIndex {Integer} The page index whould should be removed from carousel.
     */
    removePageByIndex : function(pageIndex) {
      if(this.__pages && this.__pages.length>pageIndex) {
        var targetPage = this.__pages[pageIndex];
        this.__carouselScroller.remove(targetPage);
        
        this.__pages.remove(pageIndex);
      }
    },
    
    
    /**
     * Updates the layout of the carousel the carousel scroller and its pages.
     */
    _updateCarouselLayout : function() {
      this.fixSize();
      
      this._setShowTransition(false);
      
      var carouselWidth = this._getStyle("width");
      carouselWidth = carouselWidth.substring(0, carouselWidth.length-2);
      carouselWidth = parseInt(carouselWidth,10);

      var carouselScrollerWidth = this.__pages.length*carouselWidth;
      var carouselScrollerElement = this.__carouselScroller.getContentElement();
      
      qx.bom.element.Style.set(carouselScrollerElement,"width",carouselScrollerWidth+"px");
      
      this.__pageWidth = carouselWidth;
      
      for(var i =0;i<this.__pages.length;i++) {
        var pageContentElement = this.__pages[i].getContentElement();
        qx.bom.element.Style.set(pageContentElement,"width",carouselWidth+"px");
      }
      
      var snapPoint = -this.__shownPageIndex * this.__pageWidth;
      this._updateScrollerPosition(snapPoint, 0);
      
      // Update lastOffset, because snapPoint has changed.
      this.__lastOffset[0] = snapPoint;
    },
    
    
    /**
     * Event handler for touchstart events.
     * @param evt {qx.event.type.Touch} The touch event.
     */
    _onTouchStart : function(evt) {
      this._setShowTransition(false);
      
      this.__touchStartPosition[0] = evt.getDocumentLeft();
      this.__touchStartPosition[1] = evt.getDocumentTop();
      
      var carouselScrollerElement = this.__carouselScroller.getContentElement();
      var carouselElement = this.getContentElement();
      
      var carouselScrollerWidth = qx.bom.element.Dimension.getWidth(carouselScrollerElement);
      var carouselWidth = qx.bom.element.Dimension.getWidth(carouselElement);
      
      this.__boundsX[0] = -carouselScrollerWidth+carouselWidth;
    },
    

    /**
     * Event handler for touchmove events.
     * @param evt {qx.event.type.Touch} The touch event.
     */
    _onTouchMove : function(evt) {
      var deltaX = evt.getDocumentLeft()-this.__touchStartPosition[0];
      // Needed for vertical carousel...
      // var deltaY = evt.getDocumentTop()-this.__touchStartPosition[1];
      
      this.__onMoveOffset[0] = deltaX + this.__lastOffset[0];
      // Needed for vertical carousel...
      //this.__onMoveOffset[1] = deltaY + this.__lastOffset[1];
      if(!(this.__onMoveOffset[0]>this.__boundsX[0])) {
         this.__onMoveOffset[0] = this.__boundsX[0];
      }
      
      if(!(this.__onMoveOffset[0]<this.__boundsX[1])) {
         this.__onMoveOffset[0] = this.__boundsX[1];
      } 
      
      this._updateScrollerPosition(this.__onMoveOffset[0],this.__onMoveOffset[1]);
      
      evt.stopPropagation();
    },
    
    
    /**
     * Event handler for touchend events.
     */
    _onTouchEnd : function() {
      this._setShowTransition(true);
      this._snapCarouselPage();
    },
    

    /**
     * Determines whether a transition should be shown on carouselScroller move or not.
     * Target value will be buffered, and only be set on target element when target value is different 
     * to the value alreay set.
     * @param showTransition {Boolean} Target value which triggers transition.
     */
    _setShowTransition : function(showTransition) {
      if(this.__showTransition==showTransition) {
        return
      }
      
      var targetValue = "0s";
      if(showTransition == true) {
        targetValue = this.__transitionDuration+"s";
      }
      
      var propertyKey = qx.bom.Style.getPropertyName("transitionDuration");
      qx.bom.element.Style.set(this.__carouselScroller.getContentElement(),propertyKey,targetValue);
      
      this.__showTransition = showTransition;
    },
    
    
    /**
     * Snaps carouselScroller offset to a carouselPage. 
     * It determines which carouselPage is the nearest and moves
     * carouselScrollers offset till nearest carouselPage's left border is aligned to carousel's left border.
     */
    _snapCarouselPage : function() {
      var leastDistance = 10000;
      var nearestSnapPoint = 0;
      
      // Determine nearest snapPoint.
      for(var i =0;i<this.__pages.length; i++) {
        var snapPoint = -i * this.__pageWidth;
        var distance = this.__onMoveOffset[0] - snapPoint;
        if(Math.abs(distance) < leastDistance) {
          leastDistance = Math.abs(distance);
          
          nearestSnapPoint = snapPoint;
          
          this.__shownPageIndex = i;
        }
      }
      
      this._updateScrollerPosition(nearestSnapPoint, this.__onMoveOffset[1]);
       
      this.__lastOffset[0] = nearestSnapPoint;
      this.__lastOffset[1] = this.__onMoveOffset[1];
    },
    
    
    /**
     * Assign new position of carousel scrolling container.
     * @param x {Integer} scroller's x position.
     * @param y {Integer} scroller's y position.
     */
    _updateScrollerPosition : function(x,y) {
      var carouselScrollerElement = this.__carouselScroller.getContentElement();
      
      var propertyKey = qx.bom.Style.getPropertyName("transform");
      qx.bom.element.Style.set(carouselScrollerElement,propertyKey,"translate3d("+x+"px,"+y+"px,0px)");
    }
    
  },


  destruct : function()
  {
    this._disposeObjects("__carouselScroller");
    this.__pages = this.__touchStartPosition = this.__snapPointsX = this.__onMoveOffset = this.__lastOffset = this.__boundsX = null;
  }
});
