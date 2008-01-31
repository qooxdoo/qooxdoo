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

    var hScrollBar = this._hScrollBar = new qx.ui2.core.ScrollBar("horizontal");
    var vScrollBar = this._vScrollBar = new qx.ui2.core.ScrollBar("vertical");

    hScrollBar.exclude();
    hScrollBar.addListener("scroll", this._onHorizontalScroll, this);

    vScrollBar.exclude();
    vScrollBar.addListener("scroll", this._onVerticalScroll, this);

    var scrollPane = this._scrollPane = new qx.ui2.core.ScrollPane();
    scrollPane.addListener("resize", this._onResize, this);
    scrollPane.addListener("resizeContent", this._onResize, this);

    var corner = this._corner = new qx.ui2.core.Widget().set({
      backgroundColor: "green",
      width : 0,
      height : 0
    });

    corner.exclude();

    var grid = new qx.ui2.layout.Grid();
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
    /**
     * Sets the content of the scroll area.
     *
     * @type member
     * @param value {qx.ui2.core.Widget} Widget to insert
     * @return {void}
     */
    setContent : function(value)
    {
      this._scrollPane.setContent(value);
      this._computeOverflow();
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
    _onResize : function(e) {
      this._computeOverflow();
    },


    /**
     * Computes whether the content overflows and updates the scroll bars
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
      var contentSize = content.getComputedLayout();

      // Read auto values
      var autoX = this.getOverflowX() === "auto";
      var autoY = this.getOverflowY() === "auto";

      if (autoX && autoY)
      {
        var moreWidth = contentSize.width > innerSize.width;
        var moreHeight = contentSize.height > innerSize.height;

        var scrollX = true;
        var scrollY = true;

        // If both axes have more content than free space, switch
        // both scrollbars to the same visibility
        if (moreWidth === moreHeight) {
          scrollX = scrollY = moreWidth;
        }

        // More content on x-axis than available width
        // Note: scrollX is already true
        else if (moreWidth) {
          scrollY = contentSize.height > (innerSize.height - this._hScrollBar.getSizeHint().height);
        }

        // More content on y-axis than available height
        // Note: scrollY is already true
        else {
          scrollX = contentSize.width > (innerSize.width - this._vScrollBar.getSizeHint().width);
        }

        this._setScrollBarVisibility("horizontal", scrollX);
        this._setScrollBarVisibility("vertical", scrollY);
      }
      else if (autoX)
      {
        // We need to respect the scrollbar of the orthogonal axis when visible
        var scrollBarWidth = this._vScrollBar.isShown() ? this._vScrollBar.getSizeHint().width : 0;
        this._setScrollBarVisibility("horizontal", contentSize.width > (innerSize.width - scrollBarWidth));
      }
      else if (autoY)
      {
        // We need to respect the scrollbar of the orthogonal axis when visible
        var scrollBarHeight = this._hScrollBar.isShown() ? this._hScrollBar.getSizeHint().height : 0;
        this._setScrollBarVisibility("vertical", contentSize.height > (innerSize.height - scrollBarHeight));
      }
    },


    /**
     * Set the visibility of the scroll bars.
     *
     * @type member
     * @param orientation {String} The scrollbar to change. Possible values are
     *     <code>horizontal</code> and <code>vertical</code>.
     * @param visibility {Boolean} Whether to show or the hide the scroll bar.
     */
    _setScrollBarVisibility : function(orientation, visibility)
    {
      this.debug("SET: " + orientation + ": " + visibility);
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
        if (scrollBar.getVisibility() == "visible") {
          return false;
        }

        scrollBar.show();

        if (otherScrollBar.getVisibility() == "visible") {
          this._corner.show();
        }
      }
      else
      {
        if (scrollBar.getVisibility() == "excluded") {
          return false;
        }

        scrollBar.exclude();
        this._corner.exclude();

        if (isHorizontal) {
          this._scrollPane.setScrollLeft(0);
        } else {
          this._scrollPane.setScrollTop(0);
        }
      }

      return true;
    },


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
