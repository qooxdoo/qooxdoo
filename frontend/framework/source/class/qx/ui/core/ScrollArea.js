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
      backgroundColor: "green",
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

      var paneSize = this._scrollPane.getComputedLayout();
      var contentSize = content.getComputedLayout();

      if (this._hScrollBar.isVisible()) {
        this._hScrollBar.setMaximum(Math.max(0, contentSize.width - paneSize.width));
      }

      if (this._vScrollBar.isVisible()) {
        this._vScrollBar.setMaximum(Math.max(0, contentSize.height - paneSize.height));
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
      var contentSize = content.getComputedLayout();

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
