/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Richard Sternagel (rsternagel)

************************************************************************ */

/**
 * Provides scrolling ability during drag session to the widget.
 */
qx.Mixin.define("qx.ui.core.MDragDropScrolling",
{
  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.addListener("drag", this.__onDrag, this);
    this.addListener("dragend", this.__onDragend, this);

    this.__xDirs = ["left", "right"];
    this.__yDirs = ["top", "bottom"];
  },

  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** The threshold for the x-axis (in pixel) to activate scrolling at the edges. */
    dragScrollThresholdX :
    {
      check : "Integer",
      init : 30
    },

    /** The threshold for the y-axis (in pixel) to activate scrolling at the edges. */
    dragScrollThresholdY :
    {
      check : "Integer",
      init : 30
    }
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __dragScrollTimer : null,
    __xDirs : null,
    __yDirs : null,

    /**
     * Finds the first scrollable parent (in the parent chain).
     *
     * @param widget {qx.ui.core.LayoutItem} The widget to start from.
     * @return {qx.ui.core.Widget} A scrollable widget.
     */
    _findScrollableParent : function(widget)
    {
      var cur = widget;
      if (cur === null) {
        return null;
      }

      while (cur.getLayoutParent()) {
        cur = cur.getLayoutParent();
        if (this._isScrollable(cur)) {
          return cur;
        }
      }
      return null;
    },

    /**
     * Whether the widget is scrollable.
     *
     * @param widget {qx.ui.core.Widget} The widget to check.
     * @return {Boolean} Whether the widget is scrollable.
     */
    _isScrollable : function(widget)
    {
      return qx.Class.hasMixin(widget.constructor, qx.ui.core.scroll.MScrollBarFactory);
    },

    /**
     * Gets the bounds of the given scrollable.
     *
     * @param scrollable {qx.ui.core.Widget} Scrollable which has scrollbar child controls.
     * @return {Map} A map with all four bounds (e.g. {"left":0, "top":20, "right":0, "bottom":80}).
     */
    _getBounds : function(scrollable)
    {
      var bounds = scrollable.getContentLocation();

      // the scrollable may dictate a nested widget for more precise bounds
      if (scrollable.getScrollAreaContainer) {
        bounds = scrollable.getScrollAreaContainer().getContentLocation();
      }

      return bounds;
    },

    /**
     * Gets the edge type or null if the mouse isn't within one of the thresholds.
     *
     * @param diff {Map} Difference map with all for edgeTypes.
     * @param thresholdX {Number} x-axis threshold.
     * @param thresholdY {Number} y-axis threshold.
     * @return {String} One of the four edgeTypes ('left', 'right', 'top', 'bottom').
     */
    _getEdgeType : function(diff, thresholdX, thresholdY)
    {
      if ((diff.left * -1) <= thresholdX && diff.left < 0) {
        return "left";
      } else if ((diff.top * -1) <= thresholdY && diff.top < 0) {
        return "top";
      } else if (diff.right <= thresholdX && diff.right > 0) {
        return "right";
      } else if (diff.bottom <= thresholdY && diff.bottom > 0) {
        return "bottom";
      } else {
        return null;
      }
    },

    /**
     * Gets the axis ('x' or 'y') by the edge type.
     *
     * @param edgeType {String} One of the four edgeTypes ('left', 'right', 'top', 'bottom').
     * @throws {Error} If edgeType is not one of the distinct four ones.
     * @return {String} Returns 'y' or 'x'.
     */
    _getAxis : function(edgeType)
    {
      if (this.__xDirs.indexOf(edgeType) !== -1) {
        return "x";
      } else if (this.__yDirs.indexOf(edgeType) !== -1) {
        return "y";
      } else {
        throw new Error("Invalid edge type given ("+edgeType+"). Must be: 'left', 'right', 'top' or 'bottom'");
      }
    },

    /**
     * Gets the threshold amount by edge type.
     *
     * @param edgeType {String} One of the four edgeTypes ('left', 'right', 'top', 'bottom').
     * @return {Number} The threshold of the x or y axis.
     */
    _getThresholdByEdgeType : function(edgeType) {
      if (this.__xDirs.indexOf(edgeType) !== -1) {
        return this.getDragScrollThresholdX();
      } else if(this.__yDirs.indexOf(edgeType) !== -1) {
        return this.getDragScrollThresholdY();
      }
    },

    /**
     * Whether the scrollbar is visible.
     *
     * @param scrollable {qx.ui.core.Widget} Scrollable which has scrollbar child controls.
     * @param axis {String} Can be 'y' or 'x'.
     * @return {Boolean} Whether the scrollbar is visible.
     */
    _isScrollbarVisible : function(scrollable, axis)
    {
      if (scrollable && scrollable._isChildControlVisible) {
        return scrollable._isChildControlVisible("scrollbar-"+axis);
      } else {
        return false;
      }
    },

    /**
     * Whether the scrollbar is exceeding it's maximum position.
     *
     * @param scrollbar {qx.ui.core.scroll.IScrollBar} Scrollbar to check.
     * @param axis {String} Can be 'y' or 'x'.
     * @param amount {Number} Amount to scroll which may be negative.
     * @return {Boolean} Whether the amount will exceed the scrollbar max position.
     */
    _isScrollbarExceedingMaxPos : function(scrollbar, axis, amount)
    {
      var newPos = 0;
      if (!scrollbar) {
        return true;
      }
      newPos = scrollbar.getPosition() + amount;
      return (newPos > scrollbar.getMaximum() || newPos < 0);
    },

    /**
     * Calculates the scroll amount (which may be negative).
     *
     * @param diff {Number} Difference value of one edgeType.
     * @param threshold {Number} x-axis or y-axis threshold.
     * @return {Number} Scroll amount (positive or negative).
     */
    _calculateScrollAmount : function(diff, threshold)
    {
      var amount = threshold - Math.abs(diff);
      return diff < 0 ? (amount * -1) : amount;
    },

    /**
     * Scrolls the given scrollable on the given axis for the given amount.
     *
     * @param scrollable {qx.ui.core.Widget} Scrollable which has scrollbar child controls.
     * @param axis {String} Can be 'y' or 'x'.
     * @param amount {Number} Amount to scroll which may be negative.
     */
    _scrollByAmount : function(scrollable, axis, amount) {
      var scrollbar = scrollable.getChildControl("scrollbar-"+axis, true);
      if (this._isScrollbarExceedingMaxPos(scrollbar, axis, amount)) {
        this.__dragScrollTimer.stop();
      }

      scrollbar.scrollBy(amount);
    },

    /*
    ---------------------------------------------------------------------------
    EVENT HANDLERS
    ---------------------------------------------------------------------------
    */

    /**
     * Event handler for the drag event.
     *
     * @param e {qx.event.type.Drag} The drag event instance.
     */
    __onDrag : function(e)
    {
      if (this.__dragScrollTimer) {
        // stop last scroll action
        this.__dragScrollTimer.stop();
      }

      var scrollable = this._findScrollableParent(e.getOriginalTarget());

      if (scrollable) {
        var bounds = this._getBounds(scrollable),
            xPos = e.getDocumentLeft(),
            yPos = e.getDocumentTop(),
            diff = {
              "left": bounds.left - xPos,
              "right": bounds.right - xPos,
              "top": bounds.top - yPos,
              "bottom": bounds.bottom - yPos
            },
            edgeType = null,
            axis = "",
            amount = 0;

        edgeType = this._getEdgeType(diff, this.getDragScrollThresholdX(), this.getDragScrollThresholdY());
        if (!edgeType) {
          // return if not within edge threshold
          return;
        }
        axis = this._getAxis(edgeType);

        if (this._isScrollbarVisible(scrollable, axis)) {
          amount = this._calculateScrollAmount(diff[edgeType], this._getThresholdByEdgeType(edgeType));

          this.__dragScrollTimer = new qx.event.Timer(50);
          this.__dragScrollTimer.addListener("interval",
            function(scrollable, axis, amount) {
              this._scrollByAmount(scrollable, axis, amount);
            }.bind(this, scrollable, axis, amount));
          this.__dragScrollTimer.start();
        }
      }
    },

    /**
     * Event handler for the dragend event.
     *
     * @param e {qx.event.type.Drag} The drag event instance.
     */
    __onDragend : function(e)
    {
      if (this.__dragScrollTimer) {
        this.__dragScrollTimer.stop();
      }
    }
  }
});
