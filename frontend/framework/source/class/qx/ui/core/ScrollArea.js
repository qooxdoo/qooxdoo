/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copybottom:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's left-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * The ScrollArea provides a container widget with on demand scroll bars
 * if the content size exceeds the size of the container.
 */
qx.Class.define("qx.ui.core.ScrollArea",
{
  extend : qx.ui.core.Widget,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    var grid = new qx.ui.layout.Grid();
    grid.setColumnFlex(0, 1);
    grid.setRowFlex(0, 1);
    this._setLayout(grid);

    var scrollPane = this._scrollPane = new qx.ui.core.ScrollPane();
    scrollPane.addListener("resize", this._onResize, this);
    scrollPane.addListener("resizeContent", this._onResize, this);
    this._add(scrollPane, {row: 0, column: 0});

    this._scrollbars = {};

    this.addListener("mousewheel", this._onMousewheel, this);
  },





  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * The policy, when the horizontal scroll bar should be shown.
     * <ul>
     *   <li><b>auto</b>: Show scroll bar on demand</li>
     *   <li><b>on</b>: Always show the scroll bar</li>
     *   <li><b>off</b>: Never show the scroll bar</li>
     * </ul>
     */
    overflowX :
    {
      check : ["auto", "on", "off"],
      init : "auto",
      apply : "_applyOverflowX",
      event : "changeOverflowX"
    },


    /**
     * The policy, when the horizontal scroll bar should be shown.
     * <ul>
     *   <li><b>auto</b>: Show scroll bar on demand</li>
     *   <li><b>on</b>: Always show the scroll bar</li>
     *   <li><b>off</b>: Never show the scroll bar</li>
     * </ul>
     */
    overflowY :
    {
      check : ["auto", "on", "off"],
      init : "auto",
      apply : "_applyOverflowY",
      event : "changeOverflowY"
    },


    /**
     * Group property, to set the overflow of both scroll bars.
     */
    overflow : {
      group : [ "overflowX", "overflowY" ]
    },


    /**
     * The scroll content's line height. This infromation will be used to compute
     * the scroll steps.
     */
    lineHeight :
    {
      check : "Integer",
      init : 16,
      event : "changeLineHeight",
      apply : "_applyLineHeight"
    }
  },






  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Returns whether the scrollbar is visible
     *
     * @param orientation {String} selects the scrollbar to check. Either
     *     <code>"horizontal"</code> or <code>"vertical"</code>.
     * @return {Boolean} Whether the selected scrollbar is visible
     */
    _isScrollBarVisible : function(orientation)
    {
      var scrollbar = this._scrollbars[orientation];
      if (!scrollbar) {
        return false;
      }

      return scrollbar.getVisibility() === "visible";
    },


    /**
     * Sets the scrollbar's visibility
     *
     * @param orientation {String} selects the scrollbar to update. Either
     *     <code>"horizontal"</code> or <code>"vertical"</code>.
     * @param isVisible {Boolean} Whether the scrollbar should be visible
     */
    _setScrollBarVisibility : function(orientation, isVisible)
    {
      var scrollbar = this._scrollbars[orientation];

      if (isVisible)
      {
        if (!scrollbar) {
          scrollbar = this._getScrollBar(orientation);
        }
        scrollbar.show();
      }
      else
      {
        if (scrollbar) {
          scrollbar.exclude();
        }
      }
    },


    /**
     * Get a scrollbar instance. Create the instance if neccesary.
     *
     * @param orientation {String} selects the scrollbar to get. Either
     *     <code>"horizontal"</code> or <code>"vertical"</code>.
     * @return {qx.ui.core.ScrollBar} The scrollbar
     */
    _getScrollBar : function(orientation)
    {
      if (this._scrollbars[orientation]) {
        return this._scrollbars[orientation];
      }

      var scrollbar = new qx.ui.core.ScrollBar(orientation);

      scrollbar.exclude();
      scrollbar.addListener(
        "changeValue",
        orientation == "horizontal" ? this._onHorizontalScroll :this._onVerticalScroll,
        this
      );
      scrollbar.addListener("changeVisibility", this._onChangeScrollBarVisibility, this);

      if (orientation == "horizontal")
      {
        this._add(scrollbar, {row: 1, column: 0});
      }
      else
      {
        scrollbar.setButtonStep(this.getLineHeight());
        this._add(scrollbar, {row: 0, column: 1});
      }
      this._scrollbars[orientation] = scrollbar;
      return scrollbar;
    },


    /**
     * Sets the corner widget's visibility
     *
     * @param isVisible {Boolean} Whether the corner widget should be visible
     */
    _setCornerVisibility : function(isVisible)
    {
      var corner = this._corner;
      if (isVisible)
      {
        if (!corner) {
          corner = this._getCornerWidget();
        }
        corner.show();
      }
      else {
        corner && corner.exclude();
      }
    },


    /**
     * Get the corner widget instance. Create the instance if neccesary.
     *
     * @return {qx.ui.core.Widget} The corner widget
     */
    _getCornerWidget : function()
    {
      var corner = this._corner = new qx.ui.core.Widget().set({
        appearance : "scroll-pane-corner",
        width : 0,
        height : 0
      });

      corner.exclude();
      this._add(corner, {row: 1, column: 1});

      this._corner = corner;
      return corner;
    },


    /*
    ---------------------------------------------------------------------------
      PUBLIC API
    ---------------------------------------------------------------------------
    */

    /**
     * Compute the size of the scroll content.
     *
     * @return {Map} A map with <code>height</code> and <code>width</code> keys
     *     containing the size of the scroll content
     */
    getContentSize : function()
    {
      var content = this._scrollPane.getContent();

      if (content)
      {
        var layout = content.getBounds();
        if (layout)
        {
          return {
            height: layout.height,
            width: layout.width
          };
        }
      }
      return {
        height: 0,
        width: 0
      }
    },


    /**
     * Compute the size of the scroll content's visible area.
     *
     * @return {Map} A map with <code>height</code> and <code>width</code> keys
     *     containing the visible size of the scroll area
     */
    getVisibleContentSize : function()
    {
      var layout = this._scrollPane.getComputedInnerSize();
      if (layout)
      {
        return {
          height: layout.height,
          width: layout.width
        };
      }
      else
      {
        return {
          height: 0,
          width: 0
        }
      }
    },


    /*
    ---------------------------------------------------------------------------
      SCROLL SUPPORT
    ---------------------------------------------------------------------------
    */


    // property apply
    _applyLineHeight : function(value, old)
    {
      if (this._scrollbars.vertical) {
        this._scrollbars.vertical.setButtonStep(value);
      }
    },


    /**
     * Scrolls the element's content to the given left coordinate
     *
     * @type member
     * @param value {Integer} The vertical position to scroll to.
     * @param direct {Boolean?false} Whether the value should be applied
     *   directly (without queueing).
     * @return {void}
     */
    setScrollLeft : function(value, direct) {
      this._getScrollBar("horizontal").setValue(value);
    },


    /**
     * Returns the scroll left position of the content
     *
     * @type member
     * @return {Integer} Horizontal scroll position
     */
    getScrollLeft : function() {
      return this._scrollPane.getScrollLeft();
    },


    /**
     * Scrolls the element's content to the given top coordinate
     *
     * @type member
     * @param value {Integer} The horizontal position to scroll to.
     * @param direct {Boolean?false} Whether the value should be applied
     *   directly (without queueing).
     * @return {void}
     */
    setScrollTop : function(value, direct) {
      this._getScrollBar("vertical").setValue(value);
    },


    /**
     * Returns the scroll top position of the content
     *
     * @type member
     * @return {Integer} Vertical scroll position
     */
    getScrollTop : function() {
      return this._scrollPane.getScrollTop();
    },


    /**
     * Scroll a widget, which is nested somewhere inside of this scroll area,
     * into the visible part of the scroll area.
     *
     * @param item {qx.ui.core.Widget} widget to scroll into view
     * @param hAlign {String?"top"} Valid values: <code>top</code> and
     *     <code>bottom</code>.If the item's height is larger than the
     *     scroll area's height, this value sets, whether the top or the or the
     *     bottom of the item becomes visible.
     * @param vAlign {String?"left"} Valid values: <code>left</code> and
     *     <code>right</code>.If the item's width is larger than the
     *     scroll area's width, this value sets, whether the left or the or the
     *     right part of the item becomes visible.
     */
    scrollItemIntoView : function(item, hAlign, vAlign)
    {
      hAlign = hAlign || "left";
      vAlign = vAlign || "top";

      // This method can only work after the item has been rendered
      // If this is not the case wiat for the item's resize event and
      // try again.
      if (!item.getBounds()) {
        item.addListener("resize", function(e)
        {
          item.removeListener("resize", arguments.callee, this);
          this.scrollItemIntoView(item);
        }, this);
        return;
      }

      var itemSize = item.getBounds();
      var content = this._scrollPane.getContent();
      var left = 0;
      var top = 0;
      do {
        var pos = item.getBounds();
        left += pos.left;
        top += pos.top;
        item = item.getLayoutParent();
      } while (item && item !== content);

      var scrollTop = this.getScrollTop();
      var containerSize = this._scrollPane.getBounds();

      if (scrollTop + containerSize.height < top + itemSize.height) {
        this.setScrollTop(top + itemSize.height - containerSize.height);
      }

      if (vAlign == "top" && this.getScrollTop() > top) {
        this.setScrollTop(top);
      }

      var scrollLeft = this.getScrollLeft();

      if (scrollLeft + containerSize.width < left + itemSize.width) {
        this.setScrollLeft(left + itemSize.width - containerSize.width);
      }

      if (hAlign == "left" && scrollLeft > left) {
        this.setScrollLeft(left);
      }

    },



    /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */

    /**
     * Event handler for the scroll event of the horizontal scroll bar
     *
     * @type member
     * @param e {qx.event.type.Change} The scroll event object
     */
    _onHorizontalScroll : function(e) {
      this._scrollPane.setScrollLeft(e.getValue(), true);
    },


    /**
     * Event handler for the scroll event of the vertical scroll bar
     *
     * @type member
     * @param e {qx.event.type.Change} The scroll event object
     */
    _onVerticalScroll : function(e) {
      this._scrollPane.setScrollTop(e.getValue(), true);
    },


    /**
     * Event handler for the mouse wheel
     *
     * @param e {qx.event.type.Mouse} The mouse wheel event
     */
    _onMousewheel : function(e)
    {
      var wheelIncrement = Math.round(-e.getWheelDelta());
      if (wheelIncrement == 0) {
        wheelIncrement = wheelIncrement <= 0 ? -1 : 1;
      }
      this._scrollPane.scrollTopBy(wheelIncrement * this.getLineHeight(), true);

      var computedTop = this._scrollPane.getScrollTop();
      if (this._scrollbars.vertical || computedTop !== 0) {
        this._getScrollBar("vertical").setValue(computedTop);
      }
      e.stopPropagation();
    },


    /**
     * Listener for resize event. This event is fired after the
     * first flush of the element which leads to another queueing
     * when the changes modify the visibility of the scroll buttons.
     *
     * @type member
     * @param e {qx.event.type.Change} Event object
     * @return {void}
     */
    _onResize : function(e)
    {
      this._computeOverflow();
      this._syncScrollBars();
    },


    /**
     * Listener for scrollbar visibility changes of the scrollbars.
     * Controls the scroll offset and the visibility of the corner
     * widget.
     *
     * @type member
     * @param e {qx.event.type.Change} Event object
     * @return {void}
     */
    _onChangeScrollBarVisibility : function(e)
    {
      var target = e.getTarget();

      var hVisible = this._isScrollBarVisible("horizontal");
      var vVisible = this._isScrollBarVisible("vertical");

      if (target == this._scrollbars.horizontal && !hVisible) {
        this._scrollPane.setScrollLeft(0);
      } else if (target == this._scrollbars.vertical && !vVisible) {
        this._scrollPane.setScrollTop(0);
      }

      this._setCornerVisibility(hVisible && vVisible);
    },





    /*
    ---------------------------------------------------------------------------
      HELPER METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Updates the maximum property for all scrollbars. This is required
     * after any resize event to keep the range up-to-date.
     *
     * @type member
     */
    _syncScrollBars : function()
    {
      // Update scrollbar maximum for visible scrollbars
      var content = this._scrollPane.getContent();

      if (!content) {
        return;
      }

      var paneSize = this._scrollPane.getBounds();
      var contentSize = content.getBounds();

      if (this._isScrollBarVisible("horizontal")) {
        this._scrollbars.horizontal.setContentSize(contentSize.width);
        this._scrollbars.horizontal.setContainerSize(paneSize.width);
      }

      if (this._isScrollBarVisible("vertical"))
      {
        this._scrollbars.vertical.setContentSize(contentSize.height);
        this._scrollbars.vertical.setContainerSize(paneSize.height);
      }
    },


    /**
     * Computes whether the content overflows and updates the scroll bars
     *
     * @type member
     */
    _computeOverflow : function()
    {
      var content = this._scrollPane.getContent();
      if (!content)
      {
        this._setScrollBarVisibility("horizontal", false);
        this._setScrollBarVisibility("vertical", false);
        return;
      }

      // Read dimension data
      var innerSize = this.getComputedInnerSize();
      var contentSize = content.getBounds();

      // Read auto values
      var autoX = this.getOverflowX() === "auto";
      var autoY = this.getOverflowY() === "auto";

      if (autoX && autoY)
      {
        var scrollX = true;
        var scrollY = true;

        var moreWidth = contentSize.width > innerSize.width;
        var moreHeight = contentSize.height > innerSize.height;

        // If both axes have more content than free space, switch
        // both scrollbars to the same visibility
        if (moreWidth === moreHeight) {
          scrollX = scrollY = moreWidth;
        }

        // More content on x-axis than available width
        // Note: scrollX is already true
        else if (moreWidth) {
          scrollY = contentSize.height > (innerSize.height - this._getScrollBar("horizontal").getSizeHint().height);
        }

        // More content on y-axis than available height
        // Note: scrollY is already true
        else {
          scrollX = contentSize.width > (innerSize.width - this._getScrollBar("vertical").getSizeHint().width);
        }

        this._setScrollBarVisibility("horizontal", scrollX);
        this._setScrollBarVisibility("vertical", scrollY);
      }
      else if (autoX)
      {
        // We need to respect the scrollbar of the orthogonal axis when visible
        var scrollBarWidth = vScrollBar.isVisible() ? this._getScrollBar("vertical").getSizeHint().width : 0;
        var scrollX = contentSize.width > (innerSize.width - scrollBarWidth);

        this._setScrollBarVisibility("horizontal", scrollX);
      }
      else if (autoY)
      {
        // We need to respect the scrollbar of the orthogonal axis when visible
        var scrollBarHeight = hScrollBar.isVisible() ? this._getScrollBar("horizontal").getSizeHint().height : 0;
        var scrollY = contentSize.height > (innerSize.height - scrollBarHeight);

        this._setScrollBarVisibility("vertical", scrollY);
      }
    },





    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyOverflowX : function(value, old)
    {
      if (value === "auto") {
        this._computeOverflow();
      } else {
        this._setScrollBarVisibility("horizontal", value === "on");
      }
    },


    // property apply
    _applyOverflowY : function(value, old)
    {
      if (value === "auto") {
        this._computeOverflow();
      } else {
        this._setScrollBarVisibility("vertical", value === "on");
      }
    }
  }
});
