/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2012 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
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
    if (transitionDuration) {
      this.setTransitionDuration(transitionDuration);
    }

    this.__snapPointsX = [];
    this.__onMoveOffset = [0, 0];
    this.__lastOffset = [0, 0];
    this.__boundsX = [0, 0];
    this.__pages = [];
    this.__paginationLabels = [];

    var carouselScroller = this.__carouselScroller = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.HBox());
    carouselScroller.setTransformUnit("px");
    carouselScroller.addCssClass("carousel-scroller");

    carouselScroller.addListener("pointerdown", this._onPointerDown, this);
    carouselScroller.addListener("pointerup", this._onPointerUp, this);
    carouselScroller.addListener("track", this._onTrack, this);
    carouselScroller.addListener("swipe", this._onSwipe, this);

    this.addListener("touchmove", qx.bom.Event.preventDefault, this);

    this.addListener("appear", this._onContainerUpdate, this);

    qx.event.Registration.addListener(this.__carouselScroller.getContainerElement(),"transitionEnd",this._onScrollerTransitionEnd, this);
    qx.event.Registration.addListener(window, "orientationchange", this._onContainerUpdate, this);
    qx.event.Registration.addListener(window, "resize", this._onContainerUpdate, this);
    qx.event.Registration.addListener(this.getContentElement(), "scroll", this._onNativeScroll, this);

    var pagination = this.__pagination = new qx.ui.mobile.container.Composite();
    pagination.setLayout(new qx.ui.mobile.layout.HBox());
    pagination.setTransformUnit("px");
    pagination.addCssClass("carousel-pagination");

    this.setLayout(new qx.ui.mobile.layout.VBox());

    this._add(carouselScroller, {
      flex: 1
    });
    this._add(pagination, {
      flex: 1
    });
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
     * Defines the height of the carousel. If value is equal to <code>null</code>
     * the height is set to <code>100%</code>.
     */
    height : {
      check : "Number",
      init : 200,
      nullable : true,
      apply : "_updateCarouselLayout"
    },


    /**
     * The current visible page index.
     */
    currentIndex : {
      check : "Number",
      init : 0,
      apply : "_scrollToPage",
      event : "changeCurrentIndex"
    },


    /**
     * Duration of the carousel page transition.
     */
    transitionDuration : {
      check : "Number",
      init : 0.5
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
    __carouselScrollerWidth : null,
    __carouselWidth : null,
    __paginationLabels : null,
    __pagination : null,
    __snapPointsX : null,
    __onMoveOffset : null,
    __lastOffset : null,
    __boundsX : null,
    __pages : null,
    __showTransition : null,
    __isPageScrollTarget : null,
    __deltaX : null,
    __deltaY : null,


    // overridden
    /**
     * Adds a page to the end of the carousel.
     * @param page {qx.ui.mobile.container.Composite} The composite which should be added as a page to the end of carousel.
     */
    add : function(page) {
      if (qx.core.Environment.get("qx.debug")) {
        if (!page instanceof qx.ui.mobile.container.Composite) {
          throw new Error("Page is expected to be an instance of qx.ui.mobile.container.Composite.");
        }
      }

      page.addCssClass("carousel-page");

      this.__pages.push(page);
      this.__carouselScroller.add(page, {
        flex: 1
      });

      var paginationLabel = this._createPaginationLabel();
      this.__paginationLabels.push(paginationLabel);
      this.__pagination.add(paginationLabel);

      this._setTransitionDuration(0);
      this._onContainerUpdate();
    },


    /**
     * Removes a carousel page from carousel identified by its index.
     * @param pageIndex {Integer} The page index which should be removed from carousel.
     * @return {qx.ui.mobile.container.Composite} the page which was removed from carousel.
     */
    removePageByIndex : function(pageIndex) {
      if (this.__pages && this.__pages.length > pageIndex) {
        if (pageIndex <= this.getCurrentIndex() && this.getCurrentIndex() !== 0) {
          this.setCurrentIndex(this.getCurrentIndex() - 1);
        }

        var targetPage = this.__pages[pageIndex];
        var paginationLabel = this.__paginationLabels[pageIndex];

        this.__carouselScroller.remove(targetPage);
        this.__pagination.remove(paginationLabel);

        paginationLabel.removeListener("tap", this._onPaginationLabelTap, {
          self: this,
          targetIndex: pageIndex - 1
        });
        qx.util.DisposeUtil.destroyContainer(paginationLabel);

        this.__pages.splice(pageIndex, 1);
        this.__paginationLabels.splice(pageIndex, 1);

        this._onContainerUpdate();

        return targetPage;
      }
    },


    // overridden
    removeAll : function() {
      var removedPages = [];

      if (this.__pages) {
        for (var i = this.__pages.length - 1; i >= 0; i--) {
          removedPages.push(this.removePageByIndex(i));
        }
      }
      return removedPages;
    },


    /**
     * Scrolls the carousel to next page.
     */
    nextPage : function() {
      if (this.getCurrentIndex() == this.__pages.length - 1) {
        if (this.isScrollLoop() && this.__pages.length > 1) {
          this._doScrollLoop();
        }
      } else {
        this.setCurrentIndex(this.getCurrentIndex() + 1);
      }
    },


    /**
     * Scrolls the carousel to previous page.
     */
    previousPage : function() {
      if (this.getCurrentIndex() === 0) {
        if (this.isScrollLoop() && this.__pages.length > 1) {
          this._doScrollLoop();
        }
      } else {
        this.setCurrentIndex(this.getCurrentIndex() - 1);
      }
    },


    /**
    * Returns the current page count of this carousel.
    * @return {Integer} the current page count
    */
    getPageCount : function() {
      if(this.__pages) {
        return this.__pages.length;
      }

      return 0;
    },


    /**
     * Scrolls the carousel to the page with the given pageIndex.
     * @param pageIndex {Integer} the target page index, which should be visible
     * @param showTransition {Boolean ? true} flag if a transition should be shown or not
     */
    _scrollToPage : function(pageIndex, showTransition) {
      if (pageIndex >= this.__pages.length || pageIndex < 0) {
        return;
      }

      this._updatePagination(pageIndex);

      var snapPoint = -pageIndex * this.__carouselWidth;
      this._updateScrollerPosition(snapPoint);

      // Update lastOffset, because snapPoint has changed.
      this.__lastOffset[0] = snapPoint;
    },


    /**
     * Manages the the scroll loop. First fades out carousel scroller >>
     * waits till fading is done >> scrolls to pageIndex >> waits till scrolling is done
     * >> fades scroller in.
     */
    _doScrollLoop : function() {
      this._setTransitionDuration(this.getTransitionDuration());
      setTimeout(function() {
        this._setScrollersOpacity(0);
      }.bind(this), 0);
    },


    /**
    * Event handler for <code>transitionEnd</code> event on carouselScroller.
    */
    _onScrollerTransitionEnd : function() {
      var opacity = qx.bom.element.Style.get(this.__carouselScroller.getContainerElement(), "opacity");
      if (opacity === 0) {
        var pageIndex = null;
        if (this.getCurrentIndex() == this.__pages.length - 1) {
          pageIndex = 0;
        }

        if (this.getCurrentIndex() === 0) {
          pageIndex = this.__pages.length - 1;
        }
        this._setTransitionDuration(0);
        this.setCurrentIndex(pageIndex);

        setTimeout(function() {
          this._setTransitionDuration(this.getTransitionDuration());
          this._setScrollersOpacity(1);
        }.bind(this), 0);
      }
    },


    /**
     * Factory method for a paginationLabel.
     * @return {qx.ui.mobile.container.Composite} the created pagination label.
     */
    _createPaginationLabel : function() {
      var paginationIndex = this.__pages.length;
      var paginationLabel = new qx.ui.mobile.container.Composite();
      var paginationLabelText = new qx.ui.mobile.basic.Label("" + paginationIndex);
      paginationLabel.add(paginationLabelText);

      paginationLabel.addCssClass("carousel-pagination-label");
      paginationLabel.addListener("tap", this._onPaginationLabelTap, {
        self: this,
        targetIndex: paginationIndex - 1
      });
      return paginationLabel;
    },


    /**
     * Changes the opacity of the carouselScroller element.
     * @param opacity {Integer} the target value of the opacity.
     */
    _setScrollersOpacity : function(opacity) {
      if (this.__carouselScroller) {
        qx.bom.element.Style.set(this.__carouselScroller.getContainerElement(), "opacity", opacity);
      }
    },


    /**
     * Called when showPagination property is changed.
     * Manages <code>show()</code> and <code>hide()</code> of pagination container.
     */
    _applyShowPagination : function(value, old) {
      if (value) {
        if (this.__pages.length > 1) {
          this.__pagination.show();
        }
      } else {
        this.__pagination.hide();
      }
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
      if (!this.getContainerElement()) {
        return;
      }
      var carouselSize = qx.bom.element.Dimension.getSize(this.getContainerElement());
      this.__carouselWidth = carouselSize.width;

      if (this.getHeight() !== null) {
        this._setStyle("height", this.getHeight() / 16 + "rem");
      } else {
        this._setStyle("height", "100%");
      }

      qx.bom.element.Style.set(this.__carouselScroller.getContentElement(), "width", this.__pages.length * carouselSize.width + "px");

      for (var i = 0; i < this.__pages.length; i++) {
        var pageContentElement = this.__pages[i].getContentElement();
        qx.bom.element.Style.set(pageContentElement, "width", carouselSize.width + "px");
        qx.bom.element.Style.set(pageContentElement, "height", carouselSize.height + "px");
      }

      if (this.__pages.length == 1) {
        this.__pagination.exclude();
      } else {
        if (this.isShowPagination()) {
          this.__pagination.show();
        }
      }

      this._refreshScrollerPosition();
    },


    /**
     * Synchronizes the positions of the scroller to the current shown page index.
     */
    _refreshScrollerPosition : function() {
      this.__carouselScrollerWidth = qx.bom.element.Dimension.getWidth(this.__carouselScroller.getContentElement());
      this._scrollToPage(this.getCurrentIndex());
    },


    /**
     * Handles window resize, device orientatonChange or page appear events.
     */
    _onContainerUpdate : function() {
      this._setTransitionDuration(0);
      this._updateCarouselLayout();
      this._refreshScrollerPosition();
    },


    /**
     * Returns the current horizontal position of the carousel scrolling container.
     * @return {Number} the horizontal position
     */
    _getScrollerOffset : function() {
      var transformMatrix = qx.bom.element.Style.get(this.__carouselScroller.getContentElement(), "transform");
      var transformValueArray = transformMatrix.substr(7, transformMatrix.length - 8).split(', ');

      var i = 4;
      // Check if MSCSSMatrix is used.
      if('MSCSSMatrix' in window && !('WebKitCSSMatrix' in window)) {
        i = transformValueArray.length - 4;
      }

      return Math.floor(parseInt(transformValueArray[i], 10));
    },


    /**
     * Event handler for <code>pointerdown</code> events.
     * @param evt {qx.event.type.Pointer} The pointer event.
     */
    _onPointerDown : function(evt) {
      if(!evt.isPrimary()) {
        return;
      }

      this.__lastOffset[0] = this._getScrollerOffset();
      this.__isPageScrollTarget = null;

      this.__boundsX[0] = -this.__carouselScrollerWidth + this.__carouselWidth;

      this._updateScrollerPosition(this.__lastOffset[0]);
    },


    /**
     * Event handler for <code>track</code> events.
     * @param evt {qx.event.type.Track} The track event.
     */
    _onTrack : function(evt) {
      if(!evt.isPrimary()) {
        return;
      }

      this._setTransitionDuration(0);

      this.__deltaX = evt.getDelta().x;
      this.__deltaY = evt.getDelta().y;

      if (this.__isPageScrollTarget === null) {
        this.__isPageScrollTarget = (evt.getDelta().axis == "y");
      }

      if (!this.__isPageScrollTarget) {
        this.__onMoveOffset[0] = Math.floor(this.__deltaX + this.__lastOffset[0]);

        if (this.__onMoveOffset[0] >= this.__boundsX[1]) {
          this.__onMoveOffset[0] = this.__boundsX[1];
        }

        if (this.__onMoveOffset[0] <= this.__boundsX[0]) {
          this.__onMoveOffset[0] = this.__boundsX[0];
        }
        this._updateScrollerPosition(this.__onMoveOffset[0]);

        evt.preventDefault();
      }
    },


    /**
    * Handler for <code>pointerup</code> event on carousel scroller.
    * @param evt {qx.event.type.Pointer} the pointerup event.
    */
    _onPointerUp : function(evt) {
      if(!evt.isPrimary()) {
        return;
      }

      this._setTransitionDuration(this.getTransitionDuration());
      this._refreshScrollerPosition();
    },


    /**
     * Handler for swipe event on carousel scroller.
     * @param evt {qx.event.type.Swipe} The swipe event.
     */
    _onSwipe : function(evt) {
      if(!evt.isPrimary()) {
        return;
      }

      if (evt.getDuration() < 750 && Math.abs(evt.getDistance()) > 50) {
        var duration = this._calculateTransitionDuration(this.__deltaX, evt.getDuration());
        duration = Math.min(this.getTransitionDuration(),duration);

        this._setTransitionDuration(duration);
        if (evt.getDirection() == "left") {
          this.nextPage();
        } else if (evt.getDirection() == "right") {
          this.previousPage();
        }
      } else {
        this._snapCarouselPage();
      }
    },


    /**
    * Calculates the duration the transition will need till the next carousel
    * snap point is reached.
    * @param deltaX {Integer} the distance on axis between pointerdown and pointerup.
    * @param duration {Number} the swipe duration.
    * @return {Number} the transition duration.
    */
    _calculateTransitionDuration : function(deltaX, duration) {
      var distanceX = this.__carouselWidth - Math.abs(deltaX);
      var transitionDuration = (distanceX / Math.abs(deltaX)) * duration;
      return (transitionDuration / 1000);
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
    * Applies the CSS property "transitionDuration" to the carouselScroller.
    * @param value {Number} the target value of the transitionDuration.
    */
    _setTransitionDuration : function(value) {
      qx.bom.element.Style.set(this.__carouselScroller.getContentElement(), "transitionDuration", value+"s");
    },


    /**
     * Snaps carouselScroller offset to a carouselPage.
     * It determines which carouselPage is the nearest and moves
     * carouselScrollers offset till nearest carouselPage's left border is aligned to carousel's left border.
     */
    _snapCarouselPage : function() {
      this._setTransitionDuration(this.getTransitionDuration());

      var leastDistance = 10000;
      var nearestPageIndex = 0;

      // Determine nearest snapPoint.
      for (var i = 0; i < this.__pages.length; i++) {
        var snapPoint = -i * this.__carouselWidth;
        var distance = this.__onMoveOffset[0] - snapPoint;
        if (Math.abs(distance) < leastDistance) {
          leastDistance = Math.abs(distance);
          nearestPageIndex = i;
        }
      }

      if (this.getCurrentIndex() == nearestPageIndex) {
        this._refreshScrollerPosition();
      } else {
        this.setCurrentIndex(nearestPageIndex);
      }
    },


    /**
     * Updates the pagination indicator of this carousel.
     * Removes the active state from from paginationLabel with oldActiveIndex,
     * Adds actives state to paginationLabel new ActiveIndex.
     * @param newActiveIndex {Integer} Index of paginationLabel which should have active state
     */
    _updatePagination : function(newActiveIndex) {
      for (var i = 0; i < this.__paginationLabels.length; i++) {
        this.__paginationLabels[i].removeCssClass("active");
      }

      var newActiveLabel = this.__paginationLabels[newActiveIndex];
      if (newActiveLabel && newActiveLabel.getContainerElement()) {
        newActiveLabel.addCssClass("active");
      }

      if (this.__paginationLabels.length) {
        var paginationStyle = window.getComputedStyle(this.__pagination.getContentElement());
        var paginationWidth = parseFloat(paginationStyle.width,10);

        if(isNaN(paginationWidth)) {
          return;
        }

        var paginationLabelWidth = paginationWidth/this.__paginationLabels.length;

        var left = null;
        var translate = (this.__carouselWidth / 2) - newActiveIndex * paginationLabelWidth - paginationLabelWidth / 2;

        if (paginationWidth < this.__carouselWidth) {
          left = this.__carouselWidth / 2 - paginationWidth / 2 + "px";
          translate = 0;
        }

        qx.bom.element.Style.set(this.__pagination.getContentElement(), "left", left);

        this.__pagination.setTranslateX(translate);
      }
    },


    /**
     * Assign new position of carousel scrolling container.
     * @param x {Integer} scroller's x position.
     */
    _updateScrollerPosition : function(x) {
      if(isNaN(x) || this.__carouselScroller.getContentElement() === null) {
        return;
      }
      this.__carouselScroller.setTranslateX(x);
    },


    /**
     * Remove all listeners.
     */
    _removeListeners : function() {
      this.__carouselScroller.removeListener("pointerdown", this._onPointerDown, this);
      this.__carouselScroller.removeListener("track", this._onTrack, this);
      this.__carouselScroller.removeListener("pointerup", this._onPointerUp, this);
      this.__carouselScroller.removeListener("swipe", this._onSwipe, this);
      this.__carouselScroller.removeListener("touchmove", qx.bom.Event.preventDefault, this);

      this.removeListener("appear", this._onContainerUpdate, this);

      qx.event.Registration.removeListener(window, "orientationchange", this._onContainerUpdate, this);
      qx.event.Registration.removeListener(window, "resize", this._onContainerUpdate, this);
      qx.event.Registration.removeListener(this.getContentElement(), "scroll", this._onNativeScroll, this);
    }
  },


  destruct : function()
  {
    this._removeListeners();

    this._disposeObjects("__carouselScroller"," __pagination");

    qx.util.DisposeUtil.destroyContainer(this);
    qx.util.DisposeUtil.disposeArray(this,"__paginationLabels");

    this.__pages = this.__paginationLabels = this.__snapPointsX = this.__onMoveOffset = this.__lastOffset = this.__boundsX = this.__isPageScrollTarget = null;
  }
});
