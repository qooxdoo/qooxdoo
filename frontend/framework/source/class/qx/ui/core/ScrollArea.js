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

    // Create 'fixed' grid layout
    var grid = new qx.ui.layout.Grid();
    grid.setColumnFlex(0, 1);
    grid.setRowFlex(0, 1);
    this._setLayout(grid);

    // Mousewheel listener to scroll vertically
    this.addListener("mousewheel", this._onMouseWheel, this);
  },





  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    width :
    {
      refine : true,
      init : 100
    },


    // overridden
    height :
    {
      refine : true,
      init : 200
    },


    /**
     * The policy, when the horizontal scrollbar should be shown.
     * <ul>
     *   <li><b>auto</b>: Show scrollbar on demand</li>
     *   <li><b>on</b>: Always show the scrollbar</li>
     *   <li><b>off</b>: Never show the scrollbar</li>
     * </ul>
     */
    scrollbarX :
    {
      check : ["auto", "on", "off"],
      init : "auto",
      apply : "_computeScrollbars"
    },


    /**
     * The policy, when the horizontal scrollbar should be shown.
     * <ul>
     *   <li><b>auto</b>: Show scrollbar on demand</li>
     *   <li><b>on</b>: Always show the scrollbar</li>
     *   <li><b>off</b>: Never show the scrollbar</li>
     * </ul>
     */
    scrollbarY :
    {
      check : ["auto", "on", "off"],
      init : "auto",
      apply : "_computeScrollbars"
    },


    /**
     * Group property, to set the overflow of both scroll bars.
     */
    scrollbar : {
      group : [ "scrollbarX", "scrollbarY" ]
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
      CHILD CONTROL SUPPORT
    ---------------------------------------------------------------------------
    */

    // overridden
    _createChildControlImpl : function(id)
    {
      var control = this.base(arguments, id);

      switch(id)
      {
        case "pane":
          control = new qx.ui.core.ScrollPane();

          control.addListener("update", this._computeScrollbars, this);
          this._add(control, {row: 0, column: 0});
          break;


        case "scrollbarX":
          control = new qx.ui.core.ScrollBar("horizontal");

          control.exclude();
          control.addListener("scroll", this._onScrollX, this);
          control.addListener("changeVisibility", this._onChangeScrollbarXVisibility, this);

          this._add(control, {row: 1, column: 0});
          break;


        case "scrollbarY":
          control = new qx.ui.core.ScrollBar("vertical");

          control.exclude();
          control.addListener("scroll", this._onScrollY, this);
          control.addListener("changeVisibility", this._onChangeScrollbarYVisibility, this);

          this._add(control, {row: 0, column: 1});
          break;


        case "corner":
          control = new qx.ui.core.Widget();

          control.exclude();
          control.setAppearance("scrollarea-corner");

          this._add(control, {row: 1, column: 1});
          break;
      }

      return control;
    },





    /*
    ---------------------------------------------------------------------------
      SCROLL SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Scrolls the element's content to the given left coordinate
     *
     * @type member
     * @param value {Integer} The vertical position to scroll to.
     * @return {void}
     */
    scrollToX : function(value)
    {
      var scrollbar = this._getChildControl("scrollbarX", true);
      if (scrollbar) {
        scrollbar.scrollTo(value);
      }
    },


    /**
     * Scrolls the element's content by the given left offset
     *
     * @type member
     * @param value {Integer} The vertical position to scroll to.
     * @return {void}
     */
    scrollByX : function(value)
    {
      var scrollbar = this._getChildControl("scrollbarX", true);
      if (scrollbar) {
        scrollbar.scrollBy(value);
      }
    },


    /**
     * Returns the scroll left position of the content
     *
     * @type member
     * @return {Integer} Horizontal scroll position
     */
    getScrollX : function()
    {
      var scrollbar = this._getChildControl("scrollbarX", true);
      return scrollbar ? scrollbar.getPosition() : 0;
    },


    /**
     * Scrolls the element's content to the given top coordinate
     *
     * @type member
     * @param value {Integer} The horizontal position to scroll to.
     * @return {void}
     */
    scrollToY : function(value)
    {
      var scrollbar = this._getChildControl("scrollbarY", true);
      if (scrollbar) {
        scrollbar.scrollTo(value);
      }
    },


    /**
     * Scrolls the element's content by the given top offset
     *
     * @type member
     * @param value {Integer} The horizontal position to scroll to.
     * @return {void}
     */
    scrollByY : function(value)
    {
      var scrollbar = this._getChildControl("scrollbarY", true);
      if (scrollbar) {
        scrollbar.scrollBy(value);
      }
    },


    /**
     * Returns the scroll top position of the content
     *
     * @type member
     * @return {Integer} Vertical scroll position
     */
    getScrollY : function()
    {
      var scrollbar = this._getChildControl("scrollbarY", true);
      return scrollbar ? scrollbar.getPosition() : 0;
    },





    /*
    ---------------------------------------------------------------------------
      ITEM LOCATION SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the top offset of the given item in relation to the
     * inner height of this widget.
     *
     * @type member
     * @param item {qx.ui.core.Widget} Item to query
     * @return {Integer} Top offset
     */
    getItemTop : function(item)
    {
      var pane = this._getChildControl("pane");
      var top = 0;

      do
      {
        top += item.getBounds().top;
        item = item.getLayoutParent();
      }
      while (item && item !== pane);

      return top;
    },


    /**
     * Returns the top offset of the end of the given item in relation to the
     * inner height of this widget.
     *
     * @type member
     * @param item {qx.ui.core.Widget} Item to query
     * @return {Integer} Top offset
     */
    getItemBottom : function(item) {
      return this.getItemTop(item) + item.getBounds().height;
    },


    /**
     * Returns the left offset of the given item in relation to the
     * inner width of this widget.
     *
     * @type member
     * @param item {qx.ui.core.Widget} Item to query
     * @return {Integer} Top offset
     */
    getItemLeft : function(item)
    {
      var pane = this._getChildControl("pane");
      var left = 0;

      do
      {
        left += item.getBounds().left;
        item = item.getLayoutParent();
      }
      while (item && item !== pane);

      return left;
    },


    /**
     * Returns the left offset of the end of the given item in relation to the
     * inner width of this widget.
     *
     * @type member
     * @param item {qx.ui.core.Widget} Item to query
     * @return {Integer} Right offset
     */
    getItemRight : function(item) {
      return this.getItemLeft(item) + item.getBounds().width;
    },




    /*
    ---------------------------------------------------------------------------
      MORE DIMENSIONS
    ---------------------------------------------------------------------------
    */

    /**
     * The size of the pane. This is the available space for the content.
     * This already substracts a optionally visible scrollbars.
     *
     * @type member
     * @return {Map} Size of the pane (keys: <code>width</code> and <code>height</code>)
     */
    getPaneSize : function() {
      return this._getChildControl("pane").getBounds();
    },


    /**
     * The size (identical with the preferred size) of of the content.
     *
     * @type member
     * @return {Map} Size of the content (keys: <code>width</code> and <code>height</code>)
     */
    getScrollSize : function() {
      return this._getChildControl("pane").getChild().getBounds();
    },




    /*
    ---------------------------------------------------------------------------
      ITEM INTO VIEW
    ---------------------------------------------------------------------------
    */

    /**
     * The method scrolls the given item into view.
     *
     * @type static
     * @param item {qx.ui.core.Widget} Item to scroll into view
     * @param alignX {String?null} Alignment of the item. Allowed values:
     *   <code>left</code> or <code>right</code>. Could also be null.
     *   Without a given alignment the method tries to scroll the widget
     *   with the minimum effort needed.
     * @param alignY {String?null} Alignment of the item. Allowed values:
     *   <code>top</code> or <code>bottom</code>. Could also be null.
     *   Without a given alignment the method tries to scroll the widget
     *   with the minimum effort needed.
     */
    scrollItemIntoView : function(item, alignX, alignY)
    {
      this.scrollItemIntoViewX(item, alignX);
      this.scrollItemIntoViewY(item, alignY);
    },


    /**
     * The method scrolls the given item into view (x-axis only).
     *
     * @type static
     * @param item {qx.ui.core.Widget} Item to scroll into view
     * @param align {String?null} Alignment of the item. Allowed values:
     *   <code>left</code> or <code>right</code>. Could also be null.
     *   Without a given alignment the method tries to scroll the widget
     *   with the minimum effort needed.
     */
    scrollItemIntoViewX : function(item, align)
    {
      var paneSize = this.getPaneSize();
      var scrollPos = this.getScrollX();
      var itemSize = item.getBounds();
      var itemPos = this.getItemLeft(item);

      if (align === "left" || (align == null && itemPos < scrollPos)) {
        this.scrollToX(itemPos);
      } else if (align === "right" || (align == null && (itemPos + itemSize.width) > (paneSize.width + scrollPos))) {
        this.scrollToX(itemPos + itemSize.width - paneSize.width);
      }
    },


    /**
     * The method scrolls the given item into view (y-axis only).
     *
     * @type static
     * @param element {qx.ui.core.Widget} Item to scroll into view
     * @param align {String?null} Alignment of the element. Allowed values:
     *   <code>top</code> or <code>bottom</code>. Could also be null.
     *   Without a given alignment the method tries to scroll the widget
     *   with the minimum effort needed.
     */
    scrollItemIntoViewY : function(item, align)
    {
      var paneSize = this.getPaneSize();
      var scrollPos = this.getScrollY();
      var itemSize = item.getBounds();
      var itemPos = this.getItemTop(item);

      if (align === "top" || (align == null && itemPos < scrollPos)) {
        this.scrollToY(itemPos);
      } else if (align === "bottom" || (align == null && (itemPos + itemSize.height) > (paneSize.height + scrollPos))) {
        this.scrollToY(itemPos + itemSize.height - paneSize.height);
      }
    },




    /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */

    /**
     * Event handler for the scroll event of the horizontal scrollbar
     *
     * @type member
     * @param e {qx.event.type.Change} The scroll event object
     * @return {void}
     */
    _onScrollX : function(e) {
      this._getChildControl("pane").scrollToX(e.getValue());
    },


    /**
     * Event handler for the scroll event of the vertical scrollbar
     *
     * @type member
     * @param e {qx.event.type.Change} The scroll event object
     * @return {void}
     */
    _onScrollY : function(e) {
      this._getChildControl("pane").scrollToY(e.getValue());
    },


    /**
     * Event handler for the mouse wheel
     *
     * @param e {qx.event.type.Mouse} The mouse wheel event
     * @return {void}
     */
    _onMouseWheel : function(e)
    {
      var scrollbar = this._getChildControl("scrollbarY", true);
      if (scrollbar) {
        scrollbar.scrollBySteps(-e.getWheelDelta());
      }

      // Stop bubbling and native event
      e.stop();
    },


    /**
     * Event handler for visibility changes of horizontal scrollbar.
     *
     * @param e {qx.event.type.Event} Property change event
     * @return {void}
     */
    _onChangeScrollbarXVisibility : function(e)
    {
      var showX = this._isChildControlVisible("scrollbarX");
      var showY = this._isChildControlVisible("scrollbarY");

      if (!showX) {
        this.scrollToX(0);
      }

      showX && showY ? this._showChildControl("corner") : this._excludeChildControl("corner");
    },


    /**
     * Event handler for visibility changes of horizontal scrollbar.
     *
     * @param e {qx.event.type.Event} Property change event
     * @return {void}
     */
    _onChangeScrollbarYVisibility : function(e)
    {
      var showX = this._isChildControlVisible("scrollbarX");
      var showY = this._isChildControlVisible("scrollbarY");

      if (!showY) {
        this.scrollToY(0);
      }

      showX && showY ? this._showChildControl("corner") : this._excludeChildControl("corner");
    },






    /*
    ---------------------------------------------------------------------------
      HELPER METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Computes the visibility state for scrollbars.
     *
     * @type member
     * @return {void}
     */
    _computeScrollbars : function()
    {
      var content = this._getChildControl("pane").getChild();
      if (!content)
      {
        this._excludeChildControl("scrollbarX");
        this._excludeChildControl("scrollbarY");

        return;
      }

      var innerSize = this.getInnerSize();
      var paneSize = this.getPaneSize();
      var scrollSize = this.getScrollSize();

      var scrollbarX = this.getScrollbarX();
      var scrollbarY = this.getScrollbarY();

      if (scrollbarX === "auto" && scrollbarY === "auto")
      {
        // Check if the container is big enough to show
        // the full content.
        var showX = scrollSize.width > innerSize.width;
        var showY = scrollSize.height > innerSize.height;

        // Dependency check
        // We need a special intelligence here when only one
        // of the autosized axis requires a scrollbar
        // This scrollbar may then influence the need
        // for the other one as well.
        if ((showX || showY) && !(showX && showY))
        {
          if (showX) {
            showY = scrollSize.height > paneSize.height;
          } else if (showY) {
            showX = scrollSize.width > paneSize.width;
          }
        }
      }
      else
      {
        var showX = scrollbarX === "on";
        var showY = scrollbarY === "on";

        // Check auto values afterwards with already
        // corrected client dimensions
        if (scrollSize.width > (showX ? paneSize.width : innerSize.width) && scrollbarX === "auto") {
          showX = true;
        }

        if (scrollSize.height > (showX ? paneSize.height : innerSize.height) && scrollbarY === "auto") {
          showY = true;
        }
      }

      // Update scrollbars
      if (showX)
      {
        var barX = this._getChildControl("scrollbarX");

        barX.show();
        barX.setMaximum(Math.max(0, scrollSize.width - paneSize.width));
        barX.setKnobFactor(paneSize.width / scrollSize.width);
      }
      else
      {
        this._excludeChildControl("scrollbarX");
      }

      if (showY)
      {
        var barY = this._getChildControl("scrollbarY");

        barY.show();
        barY.setMaximum(Math.max(0, scrollSize.height - paneSize.height));
        barY.setKnobFactor(paneSize.height / scrollSize.height);
      }
      else
      {
        this._excludeChildControl("scrollbarY");
      }
    }
  }
});
