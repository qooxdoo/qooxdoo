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
qx.Class.define("qx.ui2.core.ScrollArea",
{
  extend : qx.ui2.core.Widget,


  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);


    this._hScrollBar = new qx.ui2.core.ScrollBar("horizontal").set({
      visibility: "excluded"
    });

    this._vScrollBar = new qx.ui2.core.ScrollBar("vertical").set({
      visibility: "excluded"
    });

    this._hScrollBar.addListener("scroll", this._onHorizontalScroll, this);
    this._vScrollBar.addListener("scroll", this._onVerticalScroll, this);

    this._hBarHeight = this._hScrollBar.getSizeHint().height;
    this._vBarWidth = this._vScrollBar.getSizeHint().width;

    this._scrollPane = new qx.ui2.core.ScrollPane();

    this._scrollPane.addListener("resize", this._onResize, this);
    this._scrollPane.addListener("resizeContent", this._onResize, this);

    this._cornerWidget = new qx.ui2.core.Widget().set({
      width: this._vBarWidth,
      height: this._hBarHeight,
      backgroundColor: "green",
      visibility: "excluded"
    });


    var grid = new qx.ui2.layout.Grid();
    this.setLayout(grid);
    grid.setColumnFlex(0, 1);
    grid.setRowFlex(0, 1);

    grid.add(this._scrollPane, 0, 0);
    grid.add(this._vScrollBar, 0, 1);
    grid.add(this._hScrollBar, 1, 0);
    grid.add(this._cornerWidget, 1, 1);
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
    /**
     * Sets the content of the scroll area.
     *
     * @type member
     * @param value {qx.ui2.core.Widget} Widget to insert
     * @return {void}
     */
    setContent : function(value) {
      this._scrollPane.setContent(value);
    },


    /**
     * Returns the content of the scroll area.
     *
     * @type member
     * @return {qx.ui2.core.Widget}
     */
    getContent : function() {
      return this._scrollPane.getContent() || null;
    },


    /**
     * Event handler for the scroll event of the horizontal scroll bar
     *
     * @param e {qx.event.type.Change} The scroll event object
     */
    _onHorizontalScroll : function(e) {
      this._scrollPane.setScrollLeft(e.getValue());
    },


    /**
     * Event handler for the scroll event of the vertical scroll bar
     *
     * @param e {qx.event.type.Change} The scroll event object
     */
    _onVerticalScroll : function(e) {
      this._scrollPane.setScrollTop(e.getValue());
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
    _onResize : function(e) {
      this._computeOverflow();
    },


    /**
     * Computes whether the content overflows and updates the scroll bars
     */
    _computeOverflow : function()
    {
      var content = this._scrollPane.getContent();
      if (!content) {
        return;
      }

      // Compute the rendered inner width of this widget.
      var areaInsets = this._scrollPane.getInsets();
      var areaSize = this._scrollPane.getComputedLayout();
      var areaWidth = areaSize.width - areaInsets.left - areaInsets.right;
      var areaHeight = areaSize.height - areaInsets.top - areaInsets.bottom;

      // The final rendered width of the content
      var contentSize = content.getComputedLayout();

      if (this.getOverflowY() == "auto")
      {
        if (
          this.getOverflowX() == "auto" &&
          this._hScrollBar.getVisibility() == "visible"
        ) {
          areaHeight += this._hBarHeight;
        }
        if (contentSize.height > areaHeight) {
          this._setScrollBarVisibility("vertical", true);
        } else {
          this._setScrollBarVisibility("vertical", false);
        }
      }

      if (this.getOverflowX() == "auto")
      {
        if (
          this.getOverflowY() == "auto" &&
          this._vScrollBar.getVisibility() == "visible"
        ) {
          areaWidth += this._vBarWidth;
        }
        if (contentSize.width > areaWidth) {
          this._setScrollBarVisibility("horizontal", true);
        } else {
          this._setScrollBarVisibility("horizontal", false);
        }
      }

      // Update scrollbar maximum for visible scrollbars
      if (this._hScrollBar.getVisibility() == "visible") {
        this._hScrollBar.setMaximum(Math.max(0, contentSize.width - areaWidth));
      }

      if (this._vScrollBar.getVisibility() == "visible") {
        this._vScrollBar.setMaximum(Math.max(0, contentSize.height - areaHeight));
      }
    },


    /**
     * Set the visibility of the scroll bars.
     *
     * @param orientation {String} The scrollbar to change. Possible values are
     *     <code>"horizontal"</code> and <code>"vertical"</code>.
     * @param visibility {Boolean} Whether to show or the hide the scroll bar.
     */
    _setScrollBarVisibility : function(orientation, visibility)
    {
      var isHorizontal = orientation == "horizontal";

      if (isHorizontal)
      {
        var scrollBar = this._hScrollBar;
        var otherScrollBar = this._vScrollBar;
      }
      else
      {
        var scrollBar = this._vScrollBar;
        var otherScrollBar = this._hScrollBar;
      }

      if (visibility)
      {
        scrollBar.show();
        if (otherScrollBar.getVisibility() == "visible") {
          this._cornerWidget.show();
        }
      }
      else
      {
        scrollBar.exclude();
        this._cornerWidget.exclude();

        if (isHorizontal) {
          this._scrollPane.setScrollLeft(0);
        } else {
          this._scrollPane.setScrollTop(0);
        }
      }
    },


    // property apply
    _applyOverflowX : function(value, old)
    {
      switch (value)
      {
        case "on":
          this._setScrollBarVisibility("horizontal", true);
          break;

        case "off":
          this._setScrollBarVisibility("horizontal", false);
          break;

        case "auto":
          this._computeOverflow();
          break;
      }
    },


    // property apply
    _applyOverflowY : function(value, old)
    {
      switch (value)
      {
        case "on":
          this._setScrollBarVisibility("vertical", true);
          break;

        case "off":
          this._setScrollBarVisibility("vertical", false);
          break;

        case "auto":
          this._computeOverflow();
          break;
      }
    }


  }
});