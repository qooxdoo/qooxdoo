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

    var scrollPane = this._scrollPane = new qx.ui.core.ScrollPane();
    scrollPane.addListener("resize", this._onResize, this);
    scrollPane.addListener("resizeContent", this._onResize, this);

    var corner = this._corner = new qx.ui.core.Widget().set({
      appearance : "scroll-pane-corner",
      width : 0,
      height : 0
    });

    corner.exclude();

    var hScrollBar = this._hScrollBar = new qx.ui.core.ScrollBar("horizontal");
    var vScrollBar = this._vScrollBar = new qx.ui.core.ScrollBar("vertical");

    hScrollBar.exclude();
    hScrollBar.addListener("changeValue", this._onHorizontalScroll, this);
    hScrollBar.addListener("changeVisibility", this._onChangeScrollBarVisibility, this);

    vScrollBar.exclude();
    vScrollBar.addListener("changeValue", this._onVerticalScroll, this);
    vScrollBar.addListener("changeVisibility", this._onChangeScrollBarVisibility, this);

    var grid = new qx.ui.layout.Grid();
    grid.setColumnFlex(0, 1);
    grid.setRowFlex(0, 1);

    grid.add(scrollPane, 0, 0);
    grid.add(vScrollBar, 0, 1);
    grid.add(hScrollBar, 1, 0);
    grid.add(corner, 1, 1);

    this.setLayout(grid);

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
    /*
    ---------------------------------------------------------------------------
      PUBLIC API
    ---------------------------------------------------------------------------
    */

    /**
     * Sets the content of the scroll area.
     *
     * @type member
     * @param value {qx.ui.core.Widget} Widget to insert
     * @return {void}
     */
    setContent : function(value) {
      this._scrollPane.setContent(value);
    },


    /**
     * Returns the content of the scroll area.
     *
     * @type member
     * @return {qx.ui.core.Widget}
     */
    getContent : function() {
      return this._scrollPane.getContent() || null;
    },


    /**
     * Compute the size of the scroll content.
     *
     * @return {Map} A map with <code>height</code> and <code>width</code> keys
     *     containing the size of the scroll content
     */
    getContentSize : function()
    {
      var content = this.getContent();

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


    _applyLineHeight : function(value, old) {
      this._vScrollBar.setButtonStep(value);
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
      this._hScrollBar.setValue(value);
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
      this._vScrollBar.setValue(value);
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
      var content = this.getContent();
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
      this._vScrollBar.setValue(this._scrollPane.getScrollTop());
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

      var hVisible = this._hScrollBar.isVisible();
      var vVisible = this._vScrollBar.isVisible();

      if (target == this._hScrollBar && !hVisible) {
        this._scrollPane.setScrollLeft(0);
      } else if (target == this._vScrollBar && !vVisible) {
        this._scrollPane.setScrollTop(0);
      }

      if (hVisible && vVisible) {
        this._corner.show();
      } else {
        this._corner.exclude();
      }
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

      if (this._hScrollBar.isVisible()) {
        this._hScrollBar.setContentSize(contentSize.width);
        this._hScrollBar.setContainerSize(paneSize.width);
      }

      if (this._vScrollBar.isVisible())
      {
        this._vScrollBar.setContentSize(contentSize.height);
        this._vScrollBar.setContainerSize(paneSize.height);
      }
    },


    /**
     * Computes whether the content overflows and updates the scroll bars
     *
     * @type member
     */
    _computeOverflow : function()
    {
      var hScrollBar = this._hScrollBar;
      var vScrollBar = this._vScrollBar;

      var content = this._scrollPane.getContent();
      if (!content)
      {
        hScrollBar.exclude();
        vScrollBar.exclude();
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
          scrollY = contentSize.height > (innerSize.height - hScrollBar.getSizeHint().height);
        }

        // More content on y-axis than available height
        // Note: scrollY is already true
        else {
          scrollX = contentSize.width > (innerSize.width - vScrollBar.getSizeHint().width);
        }

        hScrollBar.setVisibility(scrollX ? "visible" : "excluded");
        vScrollBar.setVisibility(scrollY ? "visible" : "excluded");
      }
      else if (autoX)
      {
        // We need to respect the scrollbar of the orthogonal axis when visible
        var scrollBarWidth = vScrollBar.isVisible() ? vScrollBar.getSizeHint().width : 0;
        var scrollX = contentSize.width > (innerSize.width - scrollBarWidth);

        hScrollBar.setVisibility(scrollX ? "visible" : "excluded");
      }
      else if (autoY)
      {
        // We need to respect the scrollbar of the orthogonal axis when visible
        var scrollBarHeight = hScrollBar.isVisible() ? hScrollBar.getSizeHint().height : 0;
        var scrollY = contentSize.height > (innerSize.height - scrollBarHeight);

        vScrollBar.setVisibility(scrollY ? "visible" : "excluded");
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
        this._hScrollBar.setVisibility(value === "on" ? "visible" : "excluded");
      }
    },


    // property apply
    _applyOverflowY : function(value, old)
    {
      if (value === "auto") {
        this._computeOverflow();
      } else {
        this._vScrollBar.setVisibility(value === "on" ? "visible" : "excluded");
      }
    }
  }
});
