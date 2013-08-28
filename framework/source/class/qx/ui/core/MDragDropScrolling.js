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
    // this.addListener("dragstart", function() { console.log("dragstart"); }, this, true);
    this.addListener("drag", this.__onDrag, this, true);

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
    thresholdX :
    {
      check : "Integer",
      init : 30
    },

    /** The threshold for the y-axis (in pixel) to activate scrolling at the edges. */
    thresholdY :
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
    __timer : null,
    __xDirs : null,
    __yDirs : null,

    /**
     * Finds the first scrollable parent (in the parent chain).
     *
     * @param widget {qx.ui.core.LayoutItem} The widget to start from.
     * @return {qx.ui.core.scroll.AbstractScrollArea} A scrollable widget.
     */
    _findScrollableParent : function(widget)
    {
      var cur = widget;
      if (cur === null) {
        return null;
      }

      while (cur.getLayoutParent()) {
        cur = cur.getLayoutParent();
        if (cur instanceof qx.ui.core.scroll.AbstractScrollArea) {
          return cur;
        }
      }
      return null;
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
      if ((diff.left * -1) <= thresholdX) {
        return "left";
      } else if ((diff.top * -1) <= thresholdY) {
        return "top";
      } else if (diff.right <= thresholdX) {
        return "right";
      } else if (diff.bottom <= thresholdY) {
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
        return this.getThresholdX();
      } else if(this.__yDirs.indexOf(edgeType) !== -1) {
        return this.getThresholdY();
      }
    },

    /**
     * Whether the scrollbar is visible.
     *
     * @param scrollable {qx.ui.core.scroll.AbstractScrollArea} Scrollable which has scrollbar child controls.
     * @param axis {String} Can be 'y' or 'x'.
     * @return {Boolean} Whether the scrollbar is visible.
     */
    _isScrollbarVisible : function(scrollable, axis)
    {
      return scrollable._isChildControlVisible("scrollbar-"+axis);
    },

    /**
     * Whether the scrollbar is exceeding it's maximum position.
     *
     * @param scrollable {qx.ui.core.scroll.AbstractScrollArea} Scrollable which has scrollbar child controls.
     * @param axis {String} Can be 'y' or 'x'.
     * @param amount {Number} Amount to scroll which may be negative.
     * @return {Boolean} Whether the amount will exceed the scrollbar max position.
     */
    _isScrollbarExceedingMaxPos : function(scrollable, axis, amount)
    {
      var scrollbar = scrollable.getChildControl("scrollbar-"+axis, true);
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
     * @param diff {Map} Difference map with all for edgeTypes.
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
     * @param scrollable {qx.ui.core.scroll.AbstractScrollArea} Scrollable which has scrollbar child controls.
     * @param axis {String} Can be 'y' or 'x'.
     * @param amount {Number} Amount to scroll which may be negative.
     */
    _scrollByAmount : function(scrollable, axis, amount) {
      var methodName = "scrollBy" + axis.toUpperCase();
      if (this._isScrollbarExceedingMaxPos(scrollable, axis, amount)) {
        this.__timer.stop();
      }

      scrollable[methodName](amount);
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
      if (this.__timer) {
        // stop last scroll action
        this.__timer.stop();
      }

      var scrollable = this._findScrollableParent(e.getOriginalTarget());

      if (scrollable && scrollable.isDroppable()) {
        var bounds = scrollable.getContentLocation();
        var xPos = e.getDocumentLeft();
        var yPos = e.getDocumentTop();
        var diff = {
          "left": bounds.left - xPos,
          "right": bounds.right - xPos,
          "top": bounds.top - yPos,
          "bottom": bounds.bottom - yPos
        };
        var edgeType = null;
        var axis = "";

        edgeType = this._getEdgeType(diff, this.getThresholdX(), this.getThresholdY());
        if (!edgeType) {
          // return if not within edge threshold
          return;
        }
        axis = this._getAxis(edgeType);

        if (this._isScrollbarVisible(scrollable, axis)) {
          var amount = this._calculateScrollAmount(diff[edgeType], this._getThresholdByEdgeType(edgeType));

          this.__timer = new qx.event.Timer(50);
          this.__timer.addListener("interval",
            qx.lang.Function.bind(function(scrollable, axis, amount) {
              this._scrollByAmount(scrollable, axis, amount);
            }, this, scrollable, axis, amount));
          this.__timer.start();
        }
      }
    }
  }
});
