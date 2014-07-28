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

    qx.bom.Event.addNativeListener(this._getContentElement(), "scroll", this._onScroll.bind(this));

    if (qx.core.Environment.get("os.name") == "ios") {
      this.addListener("touchmove", this._onTouchMove, this);
    }
  },


  members :
  {
    _snapPoints : null,
    _isMomentum : null,
    _momentumStartTimerID : null,


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
    _onTrackStart: function(evt) {
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
      this._snap();
    },


    /**
    * Event handler for <code>scroll</code> events.
    */
    _onScroll : function() {
      var scrollLeft = this.getContentElement().scrollLeft;
      var scrollTop = this.getContentElement().scrollTop;

      if (qx.core.Environment.get("os.name") == "ios") {
        var scrollDeltaY = Math.abs(this._currentY - scrollTop);
        var lowerLimitY = this.getContentElement().scrollHeight - this.getContentElement().offsetHeight;

        if(this._momentumStartTimerID) {
          clearTimeout(this._momentumStartTimerID);
        }

        if (scrollDeltaY > 2 && scrollTop > 1 && scrollTop < lowerLimitY && !this._isMomentum) {
          this._momentumStartTimerID = setTimeout(function() {
            this.fireEvent("momentumStart");
            this._isMomentum = true;
          }.bind(this), 50);
        }

        if(scrollDeltaY > 100 || scrollTop <= 0 || scrollTop < this.getContentElement().scrollHeight) {
          if(this._isMomentum) {
            this._snap();
            this._isMomentum = false;
            this.fireDataEvent("momentumEnd",this.getContentElement().scrollTop);
          }
        }
      }

      this._setCurrentX(scrollLeft);
      this._setCurrentY(scrollTop);
    },


    /**
    * Calculates the snapping points for the x/y axis.
    */
    _calcSnapPoints: function() {
      if (this._scrollProperties) {
        var snap = this._scrollProperties.snap;
        if (snap) {
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
    * Returns the scrolling height of the inner container.
    * @return {Number} the scrolling height.
    */
    _getScrollHeight : function() {
      if(!this.getContentElement()) {
        return 0;
      }
      
      return this.getContentElement().scrollHeight - this.getContentElement().offsetHeight;
    },


    /**
    * Returns the scrolling width of the inner container.
    * @return {Number} the scrolling width.
    */
    _getScrollWidth : function() {
      if(!this.getContentElement()) {
        return 0;
      }
      
      return this.getContentElement().scrollWidth - this.getContentElement().offsetWidth;
    },


    /**
     * Scrolls the wrapper contents to the x/y coordinates in a given period.
     *
     * @param x {Integer} X coordinate to scroll to.
     * @param y {Integer} Y coordinate to scroll to.
     * @param time {Integer} is always <code>0</code> for this mixin.
     */
    _scrollTo: function(x, y, time) {
      var position = this._getPosition();

      var element = this.getContentElement();

      var startX = -position[0] + element.scrollLeft;
      var startY = -position[1] + element.scrollTop;
      var endX = -x + element.scrollLeft;
      var endY = -y + element.scrollTop;

      if(!this._isScrollableY()) {
        endY = 0;
      }

      if(!this._isScrollableX()) {
        endX = 0;
      }

      var animationMap = {
        "duration": time,
        "keyFrames": {
          0: {
            "transform": "translate3d(" + startX + "px," + startY + "px,0)"
          },
          100: {
            "transform": "translate3d(" + endX + "px," + endY + "px,0)"
          }
        },
        "timing": "ease-out"
      };

      if (element && element.children.length > 0) {
        var animationHandle = qx.bom.element.Animation.animate(element.children[0], animationMap);

        animationHandle.addListener("end", function() {
          element.scrollLeft = x;
          element.scrollTop = y;
        }, this);
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
