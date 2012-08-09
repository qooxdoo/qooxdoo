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
    this.addListener("swipe", this._onSwipe, this);
    
    this.addListener("appear", this._onContainerUpdate, this);
    
    qx.event.Registration.addListener(window, "orientationchange", this._onContainerUpdate, this);
    qx.event.Registration.addListener(window, "resize", this._onContainerUpdate, this);
    
    var pagination = this.__pagination = new qx.ui.mobile.container.Composite();
    pagination.addCssClass("carousel-pagination");
    
    this._add(carouselScroller, {flex:1});
    this._add(pagination, {flex:1});
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
    },
    
    // Property for setting the visibility of pagination indicator.
    showPagination : {
      check : "Boolean",
      init : true,
      apply : "_applyShowPagination"
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
    __paginationLabels : [],
    __shownPageIndex : 0,
    __pageWidth : 0,
    __showTransition : null,
    __transitionDuration : 0.4,
    __pagination : null,
    __swipeVelocityLimit : 1.5,

    
    /**
     * Adds a page to the end of the carousel.
     * @param evt {qx.ui.mobile.container.CarouselPage} The carousel page which should be added to the carousel.
     */
    addPage : function(page) {
      if (qx.core.Environment.get("qx.debug"))
      {
        this.assertEquals(page.name, "qx.ui.mobile.container.CarouselPage");
      }
       
      this.__pages.push(page);
      this.__carouselScroller.add(page);
      
      var paginationIndex = this.__pages.length;

      var paginationLabel = new qx.ui.mobile.container.Composite();
      var paginationLabelText = new qx.ui.mobile.basic.Label(""+paginationIndex);
      paginationLabel.add(paginationLabelText);

      paginationLabel.addCssClass("carousel-pagination-label");
      paginationLabel.addListener("tap",this._onPaginationLabelTap,{self:this,targetIndex:paginationIndex-1});

      this.__paginationLabels.push(paginationLabel);
      this.__pagination.add(paginationLabel);
      
      this._updatePagination(0, this.__shownPageIndex);
    },
    
    
    /**
     * Removes a carousel page from carousel identified by its index.
     * @param pageIndex {Integer} The page index which should be removed from carousel.
     */
    removePageByIndex : function(pageIndex) {
      if(this.__pages && this.__pages.length>pageIndex) {
        var targetPage = this.__pages[pageIndex];
        var targetPaginationLabel = this.__paginationLabels[pageIndex];
        
        this.__carouselScroller.remove(targetPage);
        this.__pagination.remove(targetPaginationLabel);
        
        this.__pages.splice(pageIndex,1); 
        this.__paginationLabels.splice(pageIndex,1);
        
        this._updatePagination(0,this.__shownPageIndex);
      }
    },
    
    
    /**
     * Scrolls the carousel to the page with the given pageIndex.
     * @param pageIndex {Integer} the target page index, which should be visible.
     */
    scrollToPage : function(pageIndex) {
      if(pageIndex >= this.__pages.length || pageIndex < 0) {
        return
      }
      
      this._setShowTransition(true);
      
      this._updatePagination(this.__shownPageIndex,pageIndex);
      this.__shownPageIndex = pageIndex;
      
      this._updateCarouselLayout();
    },
    
    
    /**
     * Scrolls the carousel to next page.
     */
    nextPage : function() {
      if(this.__shownPageIndex==this.__pages.length-1) {
        return;
      }
      
      this._setShowTransition(true);
      
      var oldIndex = this.__shownPageIndex;
      this.__shownPageIndex = this.__shownPageIndex +1;
      
      this._updatePagination(oldIndex,this.__shownPageIndex);
      this._updateCarouselLayout();
    },
    
    
    /**
     * Scrolls the carousel to previous page.
     */
    previousPage : function() {
      if(this.__shownPageIndex==0) {
        return;
      }
      
      this._setShowTransition(true);
      
      var oldIndex = this.__shownPageIndex;
      this.__shownPageIndex = this.__shownPageIndex - 1;
      
      this._updatePagination(oldIndex,this.__shownPageIndex);
      this._updateCarouselLayout();
    },
    
    
    /**
     * Called when showPagination property is changed.
     * Manages show(), hide() of pagination container.
     */
    _applyShowPagination : function(value, old) {
      if(value) {
        this.__pagination.show();
      } else {
        this.__pagination.hide();
      }
    },
    
    
    /**
     * Handles a tap on paginationLabel. 
     */
    _onPaginationLabelTap : function() {
      this.self.scrollToPage(this.targetIndex);
    },
    
    
    /**
     * Updates the layout of the carousel the carousel scroller and its pages.
     */
    _updateCarouselLayout : function() {
      this.fixSize();
      
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
     * Handles window resize, device orientatonChange or page appear events.
     */
    _onContainerUpdate : function() {
      this._setShowTransition(false);
      this._updateCarouselLayout();
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
     * Handler for swipe on carousel scroller.
     * @param evt {qx.event.type.Swipe} The swipe event.
     */
    _onSwipe : function(evt) {
      this._setShowTransition(true);
      
      var velocityAbs = Math.abs(evt.getVelocity());
      if(velocityAbs > this.__swipeVelocityLimit) {
        var direction = evt.getDirection();
        var oldPageIndex = this.__shownPageIndex;
        
        if(direction=="left") {
          if(this.__shownPageIndex < this.__pages.length-1){
            this.__shownPageIndex = this.__shownPageIndex+1;
          }
        } else if(direction=="right") {
          if(this.__shownPageIndex>0) {
            this.__shownPageIndex = this.__shownPageIndex-1;
          }
        }
        
        this._updatePagination(oldPageIndex,this.__shownPageIndex);
        
        this._updateCarouselLayout();
      } else {
        this._snapCarouselPage();
      }
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
     * If velocity of swipe is above this value, the swipe will trigger a page change on carousel.
     * A swipe to left would trigger an increase, a swipe to right a decrease of pageIndex.
     * If velocity is below the limit, the snap mechanism of carousel will be used:
     * A page change is only caused when the horizontal center of the page is moved above/below 
     * the horizontal center of the carousel.
     * 
     * @param limit {Integer} Target value of swipeVelocityLimit. Typical within the range of [0.1-10]. Default value is 1.5
     */
    setSwipeVelocityLimit : function(limit) {
      this.__swipeVelocityLimit = limit;
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
          
          this._updatePagination(this.__shownPageIndex,i);
          
          this.__shownPageIndex = i;
        }
      }
      
      this._updateScrollerPosition(nearestSnapPoint, this.__onMoveOffset[1]);
       
      this.__lastOffset[0] = nearestSnapPoint;
      this.__lastOffset[1] = this.__onMoveOffset[1];
    },
    
    
    /**
     * Updates the pagination indicator of this carousel.
     * Removes the active state from from paginationLabel with oldActiveIndex,
     * Adds actives state to paginationLabel new ActiveIndex.
     * @param oldActiveIndex {Integer} Index of paginationLabel which should loose active state
     * @param newActiveIndex {Integer} Index of paginationLabel which should have active state
     */
    _updatePagination : function(oldActiveIndex,newActiveIndex) {
      var oldActiveLabel = this.__paginationLabels[oldActiveIndex];
      var newActiveLabel = this.__paginationLabels[newActiveIndex];
      
      if(oldActiveLabel) {
        oldActiveLabel.removeCssClass("active");
      }
      
      if(newActiveLabel) {
        newActiveLabel.addCssClass("active");
      }
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
    this._disposeObjects("__carouselScroller, __pagination");
    this.__pages = this.__touchStartPosition = this.__snapPointsX = this.__onMoveOffset = this.__lastOffset = this.__boundsX = null;
  }
});
