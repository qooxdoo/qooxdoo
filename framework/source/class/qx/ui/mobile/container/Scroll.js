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
 * Container, which allows, depending on the set variant <code>qx.mobile.nativescroll</code>,
 * vertical and horizontal scrolling if the contents is larger than the container.
 *
 * Note that this class can only have one child widget. This container has a
 * fixed layout, which cannot be changed.
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *   // create the scroll widget
 *   var scroll = new qx.ui.mobile.container.Scroll()
 *
 *   // add a children
 *   scroll.add(new qx.ui.mobile.basic.Label("Name: "));
 *
 *   this.getRoot().add(scroll);
 * </pre>
 *
 * This example creates a scroll container and adds a label to it.
 */
qx.Class.define("qx.ui.mobile.container.Scroll",
{
  extend : qx.ui.mobile.container.Composite,


  /**
  * @param scrollProperties {Object} A map with scroll properties which are passed to the scrolling container (may contain iScroll properties).
  */
  construct : function(scrollProperties)
  {
    this.base(arguments);

    if(scrollProperties) {
      this._scrollProperties = scrollProperties;
    }

    this.addListener("appear", this._updateWaypoints, this);
    this.addListener("domupdated", this._updateWaypoints, this);

    this._waypointsX = [];
    this._waypointsY = [];

    this._currentX = 0;
    this._currentY = 0;
  },


  events :
  {
    /** Fired when the user scrolls to the end of scroll area. */
    pageEnd : "qx.event.type.Event",


    /** Fired when a vertical or horizontal waypoint is triggered. Data: 
    * <code> {"offset": 0,
    *        "input": "10%",
    *        "index": 0}</code>
    */
    waypoint : "qx.event.type.Data",


    /**
    * Fired when a momentum starts on an iOS device.
    */
    momentumStart : "qx.event.type.Event",

    /**
    * Fired when a momentum ends on an iOS device.
    */
    momentumEnd : "qx.event.type.Data"
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
      init : "scroll"
    },


    /**
     * Delegation object which can have one or more functions defined by the
     * {@link qx.ui.mobile.container.IScrollDelegate} interface.
     *
     * @internal
     */
    delegate :
    {
      init: null,
      nullable: true
    }
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {
    _scrollProperties: null,
    _activeWaypointIndex : null,
    _waypointsX: null,
    _waypointsY: null,
    _currentX : null,
    _currentY : null,


    /**
    * Sets the current x position.
    * @param value {Number} the current horizontal position. 
    */
    _setCurrentX : function(value) {
      var old = this._currentX;
      this._currentX = value;
      this._fireWaypoint(value, old, "x");
    },


    /**
    * Sets the current y position.
    * @param value {Number} the current vertical position.  
    */
    _setCurrentY : function(value) {
      var old = this._currentY;
      this._currentY = value;
      this._fireWaypoint(value, old,  "y");
    },


   /**
    * Sets the horizontal trigger points, where a <code>waypoint</code> event will be fired.
    * @param waypoints {Array} description 
    */
    setWaypointsX : function(waypoints) {
      this._waypointsX = this._parseWaypoints(waypoints, "x");
    },


    /**
     * Sets the vertical trigger points, where a <code>waypoint</code> event will be fired.
     * @param waypoints {Array} an array with waypoint descriptions. Allowed are percentage description as string, or pixel trigger points defined as numbers. <code>["20%",200]</code>
     */
    setWaypointsY : function(waypoints) {
      this._waypointsY = this._parseWaypoints(waypoints, "y");
    },


    /**
     * Returns the scroll height.
     * @return {Number} the scroll height.
     */
    getScrollHeight: function() {
      return this._getScrollHeight();
    },


    /**
     * Returns the scroll width.
     * @return {Number} the scroll width.
     */
    getScrollWidth: function() {
      return this._getScrollWidth();
    },
    

    /**
     * Re-calculates the internal waypoint offsets.
     */
    _updateWaypoints: function() {
      this._calcWaypoints(this._waypointsX, this.getScrollWidth());
      this._calcWaypoints(this._waypointsY, this.getScrollHeight());
    },


    /**
     * Validates and checks the waypoint offsets.
     * @param waypoints {Array} an array with waypoint descriptions.
     * @param scrollSize {Number} the vertical or horizontal scroll size.
     */
    _calcWaypoints: function(waypoints, scrollSize) {
      for (var i = 0; i < waypoints.length; i++) {
        var waypoint = waypoints[i];
        var offset = null;

        if (qx.lang.Type.isString(waypoint.input) && qx.lang.String.endsWith(waypoint.input, "%")) {
          offset = parseInt(waypoint.input, 10) * (scrollSize / 100);
        } else if (qx.lang.Type.isNumber(waypoint.input)) {
          offset = waypoint.input;
        }

        waypoint["offset"] = offset;
      }

      waypoints.sort(function(a, b) {
        return a.offset - b.offset;
      });
    },


    /**
     * Parse the plain waypoint array into waypoint objects.
     * @param waypoints {Array} an array with waypoints description. String with description: "20%" or a number.
     * @param axis {String} "x" or "y".
     * @return {Array} an array with waypoint objects.
     */
    _parseWaypoints: function(waypoints, axis) {
      var parsedWaypoints = [];

      for (var i = 0; i < waypoints.length; i++) {
        var waypoint = waypoints[i];

        if (waypoint !== null) {
          parsedWaypoints.push({
            "offset": null,
            "input": waypoint,
            "index": i
          });
        }
      }
      return parsedWaypoints;
    },


    /**
     * Fires a waypoints, when scroll position
     * @param value {Number} old scroll position.
     * @param old {Number} old scroll position.
     * @param axis {String} "x" or "y".
     */
    _fireWaypoint: function(value, old, axis) {
      var waypoints = null;
      if (axis === "x") {
        waypoints = this._waypointsX;
      } else if (axis === "y") {
        waypoints = this._waypointsY;
      } else {
        return;
      }

      var targetWaypoint = null;
      for (var i = 0; i < waypoints.length; i++) {
        var waypoint = waypoints[i];
        if (waypoint.offset != null && value >= waypoint.offset) {
          targetWaypoint = waypoint;
        }
      }
      if (targetWaypoint === null) {
        return;
      }

      var direction = null;
      if (old <= value) {
        if (axis == "x") {
          direction = "left";
        } else {
          direction = "down";
        }
      } else {
        if (axis == "x") {
          direction = "right";
        } else {
          direction = "up";
        }
      }

      if (this._activeWaypointIndex !== targetWaypoint.index) {
        this._activeWaypointIndex = targetWaypoint.index;

        this.fireDataEvent("waypoint", {
          "axis": axis,
          "index": targetWaypoint.index,
          "direction": direction
        });
      }
    },


    // overridden
    _createContainerElement: function() {
      var element = this.base(arguments);
      var scrollElement = this._createScrollElement();
      if (scrollElement) {
        return scrollElement;
      }

      return element;
    },


    // overridden
    _getContentElement: function() {
      var contentElement = this.base(arguments);

      var scrollContentElement = this._getScrollContentElement();

      return scrollContentElement || contentElement;
    },


    /**
     * Calls the refresh function the used scrolling method. Needed to recalculate the
     * scrolling container.
     */
    refresh: function() {
      this._refresh();
    },


    /**
     * Scrolls the wrapper contents to the x/y coordinates in a given time.
     *
     * @param x {Integer} X coordinate to scroll to.
     * @param y {Integer} Y coordinate to scroll to.
     * @param time {Integer} Time slice in which scrolling should
     *              be done.
     */
    scrollTo: function(x, y, time) {
      this._scrollTo(x, y, time);
    },


    /**
     * Returns the current scroll position
     * @return {Array} an array with <code>[scrollLeft,scrollTop]</code>.
     */
    getPosition: function() {
      return this._getPosition();
    },


    /**
     * Detects whether this scroll container is scrollable or not.
     * @return {Boolean} <code>true</code> or <code>false</code>
     */
    isScrollable: function() {
      return this._isScrollable();
    },


    /**
     * Detects whether this scroll container is scrollable or not.
     * @return {Boolean} <code>true</code> or <code>false</code>
     */
    _isScrollable: function() {
      return this._isScrollableX() || this._isScrollableY();
    },


    /**
     * Detects whether this scroll container is scrollable on x axis or not.
     * @return {Boolean} <code>true</code> or <code>false</code>
     */
    _isScrollableX: function() {
      if (this.getLayoutParent() === null) {
        return false;
      }

      var parentWidth = this.getContainerElement().clientWidth;
      var contentWidth = this.getContentElement().scrollWidth;

      var scrollContentElement = this._getScrollContentElement();
      if(scrollContentElement) {
        contentWidth = qx.bom.element.Dimension.getWidth(scrollContentElement);
      }

      return parentWidth < contentWidth;
    },


    /**
     * Detects whether this scroll container is scrollable on y axis or not.
     * @return {Boolean} <code>true</code> or <code>false</code>
     */
    _isScrollableY: function() {
      if (this.getLayoutParent() === null) {
        return false;
      }

      var parentHeight = this.getContainerElement().clientHeight;
      var contentHeight = this.getContentElement().scrollHeight;

      var scrollContentElement = this._getScrollContentElement();
      if(scrollContentElement) {
        contentHeight = qx.bom.element.Dimension.getHeight(scrollContentElement);
      }

      return parentHeight < contentHeight;
    },


    /**
     * Scrolls the wrapper contents to the widgets coordinates in a given
     * period.
     *
     * @param target {Element} the element to which the scroll container should scroll to.
     * @param time {Integer?0} Time slice in which scrolling should
     *              be done (in seconds).
     *
     */
    scrollToElement: function(target, time) {
      this._scrollToElement(target, time);
    },


    /**
    * Scrolls the wrapper contents to the widgets coordinates in a given
    * period.
    *
    * @param element {String} the element to which the scroll container should scroll to.
    * @param time {Integer?0} Time slice in which scrolling should be done (in seconds).
    *
    */
    _scrollToElement : function(element, time)
    {
      if (this._getContentElement() && this._isScrollable()) {
        if (typeof time === "undefined") {
          time = 0;
        }

        var location = qx.bom.element.Location.getRelative(this._getContentElement(), element, "scroll", "scroll");
        var offset = this._getScrollOffset();

        this._scrollTo(-location.left - offset[0], -location.top - offset[1], time);
      }
    },


    /**
     *
     * Determines the scroll offset for the <code>_scrollToElement</code> method.
     * If a delegate is available, the method calls
     * <code>qx.ui.mobile.container.IScrollDelegate.getScrollOffset()</code> for offset calculation.
     *
     * @return {Array} an array with x,y offset.
     */
    _getScrollOffset : function()
    {
      var delegate = this.getDelegate();
      if (delegate != null && delegate.getScrollOffset) {
        return delegate.getScrollOffset.bind(this)();
      } else {
        return [0,0];
      }
    },


    /**
     * Scrolls the wrapper contents to the widgets coordinates in a given
     * period.
     *
     * @param widget {qx.ui.mobile.core.Widget} the widget, the scroll container should scroll to.
     * @param time {Integer} Time slice in which scrolling should
     *              be done.
     */
    scrollToWidget: function(widget, time) {
      if (widget) {
        this._scrollToElement(widget.getContentElement(), time);
      }
    }
  },


  defer : function(statics)
  {
    if (qx.core.Environment.get("qx.mobile.nativescroll") == false)
    {
      qx.Class.include(statics, qx.ui.mobile.container.MIScroll);
    } else {
      qx.Class.include(statics, qx.ui.mobile.container.MNativeScroll);
    }
  },


  destruct : function() {
    this.removeListener("appear", this._updateWaypoints, this);
    this.removeListener("domupdated", this._updateWaypoints, this);

    this._waypointsX = this._waypointsY = null;
  }
});
