/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

/**
 * @require(qx.module.Animation)
 * @require(qx.module.Manipulating)
 *
 * Mixin for the {@link Scroll} container. Used when the variant
 * <code>qx.mobile.nativescroll</code> is set to "on".
 */
qx.Mixin.define("qx.ui.mobile.container.MNativeScroll",
{


  construct : function()
  {
    this.addCssClass("native");

    this._snapPoints = [];

    this.addListenerOnce("appear", this._onAppear, this);
    this.addListener("trackstart", this._onTrackStart, this);
    this.addListener("trackend", this._onTrackEnd, this);

    if (qx.core.Environment.get("os.name") == "ios") {
      this.addListener("touchmove", this._onTouchMove, this);
    }
  },


  members :
  {
    _snapPoints : null,
    _lastScrollTime : null,
    _abortScrollAnimation : null,
    _snapAfterMomentum : null,


    /**
    * Event handler for <code>appear</code> event.
    */
    _onAppear: function() {
      this._calcSnapPoints();
    },


    /**
    * Event handler for <code>touchmove</code> event.
    * Needed for preventing iOS page bounce.
    * @param evt {qx.event.type.Touch} touchmove event. 
    */
    _onTouchMove : function(evt) {
      // If scroll container is scrollable
      if (this._isScrollableY()) {
        evt.stopPropagation();
      } else {
        evt.preventDefault();
      }
    },


    /**
     * Event handler for <code>trackstart</code> events.
     */
    _onTrackStart: function() {
      this._lastScrollTime = Date.now();
      this._snapAfterMomentum = false;
      this._abortScrollAnimation = true;

      if (qx.core.Environment.get("os.name") == "ios") {
        // If scroll container is scrollable
        if (this._isScrollableY()) {
          var scrollTop = this.getContentElement().scrollTop;
          var maxScrollTop = this.getContentElement().scrollHeight - this.getLayoutParent().getContentElement().offsetHeight;
          if (scrollTop === 0) {
            this.getContentElement().scrollTop = 1;
          } else if (scrollTop == maxScrollTop) {
            this.getContentElement().scrollTop = maxScrollTop - 1;
          }
        }
      }
      
    },


    /**
    * Event handler for <code>trackend</code> events.
    * @param evt {qx.event.type.Track} the <code>track</code> event
    */
    _onTrackEnd: function(evt) {
      var swipeDuration = Date.now() - this._lastScrollTime;
      if (swipeDuration < 250 && (Math.abs(evt.getDelta().y) > 10 || Math.abs(evt.getDelta().x) > 10 )) {
        setTimeout(function() {
          this._snapAfterMomentum = true;
        }.bind(this), 500);
      } else {
        this._snap();
      }
    },


    /**
    * Event handler for <code>scroll</code> events.
    */
    _onScroll : function() {
      if(this._snapTimerId) {
        clearTimeout(this._snapTimerId);
      }

      if (this._snapAfterMomentum || qx.core.Environment.get("browser.name") == "iemobile") {
        this._snapTimerId = setTimeout(function() {
          this._snap();
          this._snapAfterMomentum = false;
        }.bind(this), 100);
      }
    },


    /**
    * Calculates the snapping points for the x/y axis.
    */
    _calcSnapPoints: function() {
      if (this._scrollProperties) {
        var snap = this._scrollProperties.snap;
        if (snap) {
          qx.bom.Event.removeNativeListener(this._getContentElement(), "scroll", this._onScroll.bind(this));
          qx.bom.Event.addNativeListener(this._getContentElement(), "scroll", this._onScroll.bind(this));

          this._snapPoints = [];
          var snapTargets = this.getContentElement().querySelectorAll(snap);
          for (var i = 0; i < snapTargets.length; i++) {
            var snapPoint = qx.bom.element.Location.getRelative(this._getContentElement(), snapTargets[i], "scroll", "scroll");
            this._snapPoints.push(snapPoint);
          }
        }
      }
    },


    /**
    * Determines the next snap points for the passed current position.
    * @param current {Integer} description 
    * @param snapProperty {String} "top" or "left" 
    * @return {Integer} the determined snap point.
    */
    _determineSnapPoint: function(current, snapProperty) {
      for (var i = 0; i < this._snapPoints.length; i++) {
        var snapPoint = this._snapPoints[i];
        if (current <= -snapPoint[snapProperty]) {
          if (i > 0) {
            var previousSnapPoint = this._snapPoints[i - 1];
            var previousSnapDiff = Math.abs(current + previousSnapPoint[snapProperty]);
            var nextSnapDiff = Math.abs(current + snapPoint[snapProperty]);
            if (previousSnapDiff < nextSnapDiff) {
              return -previousSnapPoint[snapProperty];
            } else {
              return -snapPoint[snapProperty];
            }
          } else {
            return -snapPoint[snapProperty];
          }
        }
      }
      return current;
    },


    /**
    * Snaps the scrolling area to the nearest snap point.
    */
    _snap : function() {
      this._abortScrollAnimation = false;
      
      var current = this._getPosition();
      var nextX = this._determineSnapPoint(current[0],"left");
      var nextY = this._determineSnapPoint(current[1],"top");

      if(nextX != current[0] || nextY != current[1]) {
        this._scrollTo(nextX, nextY, 100);
      }
    },


    /**
     * Refreshes the scroll container. Recalculates the snap points.
     */
    _refresh : function() {
      this._calcSnapPoints();
    },


    /**
     * Mixin method. Creates the scroll element.
     *
     * @return {Element} The scroll element
     */
    _createScrollElement: function() {
      return null;
    },


    /**
     * Returns the current scroll position
     * @return {Array} an array with <code>[scrollLeft,scrollTop]</code>.
     */
    _getPosition: function() {
      return [this.getContentElement().scrollLeft, this.getContentElement().scrollTop];
    },


    /**
     * Mixin method. Returns the scroll content element.
     *
     * @return {Element} The scroll content element
     */
    _getScrollContentElement: function() {
      return null;
    },


    /**
     * Scrolls the wrapper contents to the x/y coordinates in a given period.
     *
     * @param x {Integer} X coordinate to scroll to.
     * @param y {Integer} Y coordinate to scroll to.
     * @param time {Integer} is always <code>0</code> for this mixin.
     */
    _scrollTo: function(x, y, time) {
      var element = this.getContentElement();
      if(!time) {
        element.scrollLeft = x;
        element.scrollTop = y;
        return;
      }
     
      var position = this._getPosition();

      if (x > position[0]) {
        element.scrollLeft = position[0] + 1;
      } else if (x < position[0]) {
        element.scrollLeft = position[0] - 1;
      }

      if (y > position[1]) {
        element.scrollTop = position[1] + 1;
      } else if (y < position[1]) {
        element.scrollTop = position[1] - 1;
      }

      var scrollFinished = element.scrollLeft == position[0] && element.scrollTop == position[1];
      var didNotScroll = element.scrollTop == y && element.scrollLeft == x;
      if (scrollFinished || didNotScroll) {
        this._abortScrollAnimation = true;
      }

      if(!this._abortScrollAnimation) {
        var diffX = Math.abs(position[0] - x);
        var diffY = Math.abs(position[1] - y);
        var diff = Math.sqrt(diffX * diffX + diffY * diffY);
        var refreshInterval = Math.ceil(time / diff);
        setTimeout(this._scrollTo.bind(this, x, y, time - refreshInterval), refreshInterval);
      }
    }
  },


  destruct : function() {
    qx.bom.Event.removeNativeListener(this._getContentElement(), "scroll", this._onScroll.bind(this));

    this.removeListener("touchmove", this._onTouchMove, this);

    this.removeListener("appear", this._onAppear, this);
    this.removeListener("trackstart", this._onTrackStart, this);
    this.removeListener("trackend", this._onTrackEnd, this);
  }
});
