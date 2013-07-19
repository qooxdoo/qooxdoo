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
 * A carousel is a widget which can switch between several sub pages {@link  qx.ui.mobile.container.Composite}.
 * A page switch is triggered by a swipe to left, for next page, or a swipe to right for
 * previous page.
 *
 * A carousel shows by default a pagination indicator at the bottom of the carousel.
 * This pagination indicator can be hidden by property <code>showPagination</code>.
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *
 *  var carousel = new qx.ui.mobile.container.Carousel();
 *  var carouselPage1 = new qx.ui.mobile.container.Composite();
 *  var carouselPage2 = new qx.ui.mobile.container.Composite();
 *
 *  carouselPage1.add(new qx.ui.mobile.basic.Label("This is a carousel. Please swipe left."));
 *  carouselPage2.add(new qx.ui.mobile.basic.Label("Now swipe right."));
 *
 *  carousel.add(carouselPage1);
 *  carousel.add(carouselPage2);
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
  * @param transitionDuration {Integer ? 0.4} transition duration on carouselPage change in seconds.
  */
  construct : function(transitionDuration)
  {
    this.base(arguments);
    if(transitionDuration) {
      this.setTransitionDuration(transitionDuration);
    }

    this.__touchStartPosition = [0,0];
    this.__snapPointsX = [];
    this.__onMoveOffset = [0,0];
    this.__lastOffset = [0,0];
    this.__boundsX = [0,0];
    this.__pages = [];
    this.__paginationLabels = [];
    this.__timers = [];

    var carouselScroller = this.__carouselScroller = new qx.ui.mobile.container.Composite();
    carouselScroller.addCssClass("carousel-scroller");

    carouselScroller.addListener("touchstart", this._onTouchStart, this);
    carouselScroller.addListener("touchmove", this._onTouchMove, this);
    carouselScroller.addListener("swipe", this._onSwipe, this);
    carouselScroller.addListener("touchend", this._onTouchEnd, this);


    this.addListener("appear", this._onContainerUpdate, this);

    qx.event.Registration.addListener(window, "orientationchange", this._onContainerUpdate, this);
    qx.event.Registration.addListener(window, "resize", this._onContainerUpdate, this);
    qx.event.Registration.addListener(this.getContentElement(), "scroll", this._onNativeScroll, this);

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


    /** Property for setting visibility of pagination indicator */
    showPagination : {
      check : "Boolean",
      init : true,
      apply : "_applyShowPagination"
    },


    /** Defines whether the carousel should scroll back to first or last page
     * when the start/end of carousel pages is reached  */
    scrollLoop : {
      check : "Boolean",
      init : true
    },


    /**
     * Defines the height of the carousel.
     */
    height : {
      check : "Number",
      init : 200,
      apply : "_updateCarouselLayout"
    },


    /**
     * The current visible page index.
     */
    currentIndex : {
      check : "Number",
      init : 0,
      apply : "_applyCurrentIndex",
      event : "changeCurrentIndex"
    },


    /**
     * Duration of the carousel page transition.
     */
    transitionDuration : {
      check : "Number",
      init : 0.4
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
    __paginationLabels : null,
    __pagination : null,
    __touchStartPosition : null,
    __snapPointsX : null,
    __onMoveOffset : null,
    __lastOffset : null,
    __boundsX : null,
    __pages : null,
    __pageWidth : 0,
    __showTransition : null,
    __swipeVelocityLimit : 0.25,
    __isPageScrollTarget : null,
    __timers : null,


    // overridden
    /**
     * Adds a page to the end of the carousel.
     * @param page {qx.ui.mobile.container.Composite} The composite which should be added as a page to the end of carousel.
     */
    add : function(page) {
      if (qx.core.Environment.get("qx.debug"))
      {
        if (!page instanceof qx.ui.mobile.container.Composite) {
          throw new Error("Page is expected to be an instance of qx.ui.mobile.container.Composite.");
        }
      }

      page.addCssClass("carousel-page");

      this.__pages.push(page);
      this.__carouselScroller.add(page);

      var paginationLabel = this._createPaginationLabel();
      this.__paginationLabels.push(paginationLabel);
      this.__pagination.add(paginationLabel);

      this._updateCarouselLayout();
    },


    /**
     * Removes a carousel page from carousel identified by its index.
     * @param pageIndex {Integer} The page index which should be removed from carousel.
     */
    removePageByIndex : function(pageIndex) {
      if(this.__pages && this.__pages.length > pageIndex) {
        var targetPage = this.__pages[pageIndex];
        var paginationLabel = this.__paginationLabels[pageIndex];

        this.__carouselScroller.remove(targetPage);
        this.__pagination.remove(paginationLabel);

        paginationLabel.removeListener("tap", this._onPaginationLabelTap, {
          self: this,
          targetIndex: pageIndex - 1
        });
        paginationLabel.dispose();

        this.__pages.splice(pageIndex,1);
        this.__paginationLabels.splice(pageIndex,1);

        if(pageIndex == this.getCurrentIndex()) {
          this.previousPage();
        }
      }
    },


    // overridden
    removeAll : function() {
      if(this.__pages) {
        for(var i = this.__pages.length - 1; i >= 0 ; i--) {
          this.removePageByIndex(i);
        }
      }
    },


    /**
     * Scrolls the carousel to next page.
     */
    nextPage : function() {
      if (this.getCurrentIndex() == this.__pages.length - 1) {
        if (this.isScrollLoop()) {
          this._doScrollLoop(0);
        }
      } else {
        this.setCurrentIndex(this.getCurrentIndex() + 1);
      }
    },


    /**
     * Scrolls the carousel to previous page.
     */
    previousPage : function() {
      if (this.getCurrentIndex() == 0) {
        if (this.isScrollLoop()) {
          this._doScrollLoop(this.__pages.length - 1);
        }
      } else {
        this.setCurrentIndex(this.getCurrentIndex() - 1);
      }
    },


    /**
    * @deprecated {3.0} Please use property "currentIndex" instead.
    * @param pageIndex {Integer} the target page index, which should be visible
    */
    scrollToPage : function(pageIndex) {
      this._scrollToPage(pageIndex);
    },


    /**
    * @deprecated {3.0} Please use method "getCurrentIndex()" instead.
    * @return {Integer} the current shown page index.
    */
    getShownPageIndex : function() {
      return this.getCurrentIndex();
    },


    /**
     * Scrolls the carousel to the page with the given pageIndex.
     * @param pageIndex {Integer} the target page index, which should be visible
     * @param showTransition {Boolean ? true} flag if a transition should be shown or not
     */
    _scrollToPage : function(pageIndex, showTransition) {
      if (pageIndex >= this.__pages.length || pageIndex < 0) {
        return
      }

      if (showTransition == null) {
        this._setShowTransition(true);
      } else {
        this._setShowTransition(showTransition);
      }

      var snapPoint = -pageIndex * this.__pageWidth;
      this._updateScrollerPosition(snapPoint, 0);

      // Update lastOffset, because snapPoint has changed.
      this.__lastOffset[0] = snapPoint;
    },


    /**
     * Manages the the scroll loop. First fades out carousel scroller >>
     * waits till fading is done >> scrolls to pageIndex >> waits till scrolling is done
     * >> fades scroller in.
     * @param pageIndex {Integer} The page index to which the scroller should move to.
     */
    _doScrollLoop : function(pageIndex) {
      this._setScrollersOpacity(0);

      var delayForLayoutUpdate = this.getTransitionDuration() * 1000;

      this.__timers.push(qx.event.Timer.once(function() {
        this.setCurrentIndex(pageIndex);
      }, this, delayForLayoutUpdate));

      this.__timers.push(qx.event.Timer.once(function() {
        this._setScrollersOpacity(1);
      }, this, delayForLayoutUpdate * 2));
    },


    /**
     * Factory method for a paginationLabel.
     * @return {qx.ui.mobile.container.Composite} the created pagination label.
     */
    _createPaginationLabel : function() {
      var paginationIndex = this.__pages.length;
      var paginationLabel = new qx.ui.mobile.container.Composite();
      var paginationLabelText = new qx.ui.mobile.basic.Label(""+paginationIndex);
      paginationLabel.add(paginationLabelText);

      paginationLabel.addCssClass("carousel-pagination-label");
      paginationLabel.addListener("tap",this._onPaginationLabelTap,{self: this, targetIndex: paginationIndex-1});
      return paginationLabel;
    },


    /**
     * Changes the opacity of the carouselScroller element.
     * @param opacity {Integer} the target value of the opacity.
     */
    _setScrollersOpacity : function(opacity) {
      qx.bom.element.Style.set(this.__carouselScroller.getContainerElement(), "opacity", opacity);
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


    // property apply
    _applyCurrentIndex : function(value, old) {
      this._updatePagination(old, value);
      this._scrollToPage(value);
    },


    /**
     * Handles a tap on paginationLabel.
     */
    _onPaginationLabelTap : function() {
      this.self.setCurrentIndex(this.targetIndex);
    },


    /**
     * Updates the layout of the carousel the carousel scroller and its pages.
     */
    _updateCarouselLayout : function() {
      var carouselContainerElement = this.getContainerElement();
      if (!carouselContainerElement) {
        return;
      }

      var carouselWidth = qx.bom.element.Dimension.getWidth(this.getContainerElement());

      var carouselScrollerWidth = this.__pages.length * carouselWidth;
      var carouselScrollerElement = this.__carouselScroller.getContentElement();

      qx.bom.element.Style.set(carouselScrollerElement, "width", carouselScrollerWidth + "px");

      this.__pageWidth = carouselWidth;

      for (var i = 0; i < this.__pages.length; i++) {
        var pageContentElement = this.__pages[i].getContentElement();
        qx.bom.element.Style.set(pageContentElement, "width", carouselWidth + "px");
        qx.bom.element.Style.set(pageContentElement, "height", this.getHeight() + "px");
      }

      this._updatePagination(this.getCurrentIndex(), this.getCurrentIndex());
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
      this.__touchStartPosition[0] = evt.getDocumentLeft();
      this.__touchStartPosition[1] = evt.getDocumentTop();

      var carouselScrollerElement = this.__carouselScroller.getContentElement();
      var carouselElement = this.getContentElement();

      var carouselScrollerWidth = qx.bom.element.Dimension.getWidth(carouselScrollerElement);
      var carouselWidth = qx.bom.element.Dimension.getWidth(carouselElement);

      this.__isPageScrollTarget = null;

      this.__boundsX[0] = -carouselScrollerWidth + carouselWidth;
    },


    /**
     * Event handler for touchmove events.
     * @param evt {qx.event.type.Touch} The touch event.
     */
    _onTouchMove : function(evt) {
      this._setShowTransition(false);

      var deltaX = evt.getDocumentLeft() - this.__touchStartPosition[0];
      var deltaY = evt.getDocumentTop() - this.__touchStartPosition[1];

      if(this.__isPageScrollTarget == null) {
        var cosDelta = deltaX/deltaY;
        this.__isPageScrollTarget = Math.abs(cosDelta) < 1;
      }

      if(!this.__isPageScrollTarget) {
        this.__onMoveOffset[0] = deltaX + this.__lastOffset[0];
        if(!(this.__onMoveOffset[0] < this.__boundsX[1])) {
          this.__onMoveOffset[0] = this.__boundsX[1];
        }

        if(!(this.__onMoveOffset[0] > this.__boundsX[0])) {
          this.__onMoveOffset[0] = this.__boundsX[0];
        }
        this._updateScrollerPosition(this.__onMoveOffset[0],this.__onMoveOffset[1]);

        evt.preventDefault();
        evt.stopPropagation();
      }
    },


    /**
     * Handler for <code>touchend</code> on carousel scroller.
     */
    _onTouchEnd : function() {
      this._setShowTransition(true);
      this._snapCarouselPage();
    },


    /**
     * Handler for swipe on carousel scroller.
     * @param evt {qx.event.type.Swipe} The swipe event.
     */
    _onSwipe : function(evt) {
      var velocityAbs = Math.abs(evt.getVelocity());
      if(velocityAbs > this.__swipeVelocityLimit) {
        if(evt.getDirection() == "left") {
          this.nextPage();
        } else if(evt.getDirection() == "right") {
          this.previousPage();
        }
      } else {
        this._snapCarouselPage();
      }
    },


    /**
     * Handles the native scroll event on the carousel container.
     * This is needed for preventing "scrollIntoView" method.
     *
     * @param evt {qx.event.type.Native} the native scroll event.
     */
    _onNativeScroll : function(evt) {
      var nativeEvent = evt.getNativeEvent();
      nativeEvent.srcElement.scrollLeft = 0;
      nativeEvent.srcElement.scrollTop = 0;
    },


    /**
     * Determines whether a transition should be shown on carouselScroller move or not.
     * Target value will be buffered, and only be set on target element when target value is different
     * to the value alreay set.
     * @param showTransition {Boolean} Target value which triggers transition.
     */
    _setShowTransition : function(showTransition) {
      if(this.__showTransition == showTransition) {
        return
      }

      var targetValue = "0s";
      if(showTransition == true) {
        targetValue = this.getTransitionDuration()+"s";
      }

      qx.bom.element.Style.set(this.__carouselScroller.getContentElement(), "transitionDuration", targetValue);

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
      var nearestPageIndex = 0;

      // Determine nearest snapPoint.
      for (var i = 0; i < this.__pages.length; i++) {
        var snapPoint = -i * this.__pageWidth;
        var distance = this.__onMoveOffset[0] - snapPoint;
        if (Math.abs(distance) < leastDistance) {
          leastDistance = Math.abs(distance);
          nearestPageIndex = i;
        }
      }

      var hasChanged = (this.getCurrentIndex() != nearestPageIndex);
      if(hasChanged) {
        this.setCurrentIndex(nearestPageIndex);
      } else {
        this._scrollToPage(nearestPageIndex);
      }
    },


    /**
     * Updates the pagination indicator of this carousel.
     * Removes the active state from from paginationLabel with oldActiveIndex,
     * Adds actives state to paginationLabel new ActiveIndex.
     * @param oldActiveIndex {Integer} Index of paginationLabel which should loose active state
     * @param newActiveIndex {Integer} Index of paginationLabel which should have active state
     */
    _updatePagination : function(oldActiveIndex, newActiveIndex) {
      var oldActiveLabel = this.__paginationLabels[oldActiveIndex];
      var newActiveLabel = this.__paginationLabels[newActiveIndex];

      if(oldActiveLabel && oldActiveLabel.getContainerElement()) {
        oldActiveLabel.removeCssClass("active");
      }

      if(newActiveLabel && newActiveLabel.getContainerElement()) {
        newActiveLabel.addCssClass("active");
      }
    },


    /**
     * Assign new position of carousel scrolling container.
     * @param x {Integer} scroller's x position.
     * @param y {Integer} scroller's y position.
     */
    _updateScrollerPosition : function(x,y) {
      if(isNaN(x) || isNaN(y)) {
        return;
      }

      this.__carouselScroller.setTranslateX(x);
      this.__carouselScroller.setTranslateY(y);
    },


    /**
     * Remove all listeners.
     */
    _removeListeners : function() {
      this.__carouselScroller.removeListener("touchstart", this._onTouchStart, this);
      this.__carouselScroller.removeListener("touchmove", this._onTouchMove, this);
      this.__carouselScroller.removeListener("swipe", this._onSwipe, this);
      this.__carouselScroller.removeListener("touchend", this._onTouchEnd, this);

      this.removeListener("appear", this._onContainerUpdate, this);

      qx.event.Registration.removeListener(window, "orientationchange", this._onContainerUpdate, this);
      qx.event.Registration.removeListener(window, "resize", this._onContainerUpdate, this);
      qx.event.Registration.removeListener(this.getContentElement(), "scroll", this._onNativeScroll, this);
    }

  },


  destruct : function()
  {
    this.removeAll();
    this._removeListeners();
    qx.util.DisposeUtil.disposeArray(this,"__timers");

    this._disposeObjects("__carouselScroller"," __pagination");
    qx.util.DisposeUtil.disposeArray(this,"__paginationLabels");

    this.__pages = this.__paginationLabels = this.__touchStartPosition = this.__snapPointsX = this.__onMoveOffset = this.__lastOffset = this.__boundsX = this.__isPageScrollTarget = null;
  }
});
