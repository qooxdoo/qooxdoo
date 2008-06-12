/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * This class represents a scrollable pane. This means that this widget
 * may contains content which is bigger than the available (inner)
 * dimensions of this widget. The widget also offer methods to control
 * the scrolling position. It can only have excactly one child.
 */
qx.Class.define("qx.ui.core.ScrollPane",
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

    // Automatically configure a "fixed" grow layout.
    this._setLayout(new qx.ui.layout.Grow());

    // Add resize listener to "translate" event
    this.addListener("resize", this._onUpdate);
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /** Fired on resize of both the container or the content. */
    update : "qx.event.type.Event"
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
      CONTENT MANAGMENT
    ---------------------------------------------------------------------------
    */

    /**
     * Configures the content of the scroll pane. Replaces any existing child
     * with the newly given one.
     *
     * @type member
     * @param widget {qx.ui.core.Widget?null} The content widget of the pane
     * @return {void}
     */
    add : function(widget)
    {
      var old = this._getChildren()[0];
      if (old)
      {
        this._remove(old);
        old.removeListener("resize", this._onUpdate, this);
      }

      if (widget)
      {
        this._add(widget);
        widget.addListener("resize", this._onUpdate, this);
      }
    },


    /**
     * Removes the given widget from the content. The pane is empty
     * afterwards as only one child is supported by the pane.
     *
     * @type member
     * @param widget {qx.ui.core.Widget?null} The content widget of the pane
     * @return {void}
     */
    remove : function(widget)
    {
      if (widget)
      {
        this._remove(widget);
        widget.removeListener("resize", this._onUpdate, this);
      }
    },


    /**
     * Returns the current content.
     *
     * @type member
     * @return {qx.ui.core.Widget|null} The current layout content
     */
    getChild : function() {
      return this._getChildren()[0] || null;
    },


    /*
    ---------------------------------------------------------------------------
      EVENT LISTENER
    ---------------------------------------------------------------------------
    */

    /**
     * Event listener for resize event of content and  container
     *
     * @type member
     * @param e {Event} Resize event object
     */
    _onUpdate : function(e) {
      this.fireEvent("update");
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
      var top = 0;

      do
      {
        top += item.getBounds().top;
        item = item.getLayoutParent();
      }
      while (item && item !== this);

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
      var left = 0;
      var parent;

      do
      {
        left += item.getBounds().left;
        parent = item.getLayoutParent();
        if (parent) {
          left += parent.getInsets().left;
        }
        item = parent;
      }
      while (item && item !== this);

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
      var paneSize = this.getBounds();
      var itemSize = item.getBounds();

      if (!paneSize || !itemSize)
      {
        this.__lazyScrollIntoViewX = [ item, align ];
        if (!this.__lazyScrollIntoViewY) {
          this.addListener("appear", this._onAppear);
        }
      }
      else
      {
        delete this.__lazyScrollIntoViewX;
        if (!this.__lazyScrollIntoViewY) {
          this.removeListener("appear", this._onAppear);
        }

        var scrollPos = this.getScrollX();
        var itemPos = this.getItemLeft(item);

        if (align == null && itemSize.width > paneSize.width)
        {
          if (itemPos > scrollPos) {
            this.scrollToX(itemPos);
          } else if ((itemPos + itemSize.width) < (paneSize.width + scrollPos)) {
            this.scrollToX(itemPos + itemSize.width - paneSize.width);
          }
        }
        else if (align === "left" || (align == null &&itemPos < scrollPos))
        {
          this.scrollToX(itemPos);
        }
        else if (align === "right" || (align == null && (itemPos + itemSize.width) > (paneSize.width + scrollPos)))
        {
          this.scrollToX(itemPos + itemSize.width - paneSize.width);
        }
      }
    },


    /**
     * The method scrolls the given item into view (y-axis only).
     *
     * @type static
     * @param item {qx.ui.core.Widget} Item to scroll into view
     * @param align {String?null} Alignment of the element. Allowed values:
     *   <code>top</code> or <code>bottom</code>. Could also be null.
     *   Without a given alignment the method tries to scroll the widget
     *   with the minimum effort needed.
     */
    scrollItemIntoViewY : function(item, align)
    {
      var paneSize = this.getBounds();
      var itemSize = item.getBounds();

      if (!paneSize || !itemSize)
      {
        this.__lazyScrollIntoViewY = [ item, align ];
        if (!this.__lazyScrollIntoViewX) {
          this.addListener("appear", this._onAppear);
        }
      }
      else
      {
        delete this.__lazyScrollIntoViewY;
        if (!this.__lazyScrollIntoViewX) {
          this.removeListener("appear", this._onAppear);
        }

        var scrollPos = this.getScrollY();
        var itemPos = this.getItemTop(item);

        if (align == null && itemSize.height > paneSize.height)
        {
          if (itemPos > scrollPos) {
            this.scrollToX(itemPos);
          } else if ((itemPos + itemSize.height) < (paneSize.height + scrollPos)) {
            this.scrollToX(itemPos + itemSize.height - paneSize.height);
          }
        }
        else if (align === "top" || (align == null && itemPos < scrollPos))
        {
          this.scrollToY(itemPos);
        }
        else if (align === "bottom" || (align == null && (itemPos + itemSize.height) > (paneSize.height + scrollPos)))
        {
          this.scrollToY(itemPos + itemSize.height - paneSize.height);
        }
      }
    },


    /**
     * Event handler to handle appear event and synchronize scroll position
     *
     * @param e {qx.event.type.Event} Property change event
     * @return {void}
     */
    _onAppear : function(e)
    {
      var intoViewX = this.__lazyScrollIntoViewX;
      if (intoViewX)
      {
        this.scrollItemIntoViewX.apply(this, intoViewX);
        delete this.__lazyScrollIntoViewX;
      }

      var intoViewY = this.__lazyScrollIntoViewY;
      if (intoViewY)
      {
        this.scrollItemIntoViewY.apply(this, intoViewY);
        delete this.__lazyScrollIntoViewY;
      }

      this.removeListener("appear", this._onAppear);
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
    scrollToX : function(value) {
      this._contentElement.scrollToX(value);
    },


    /**
     * Returns the scroll left position of the content
     *
     * @type member
     * @return {Integer} Horizontal scroll position
     */
    getScrollX : function() {
      return this._contentElement.getScrollX();
    },


    /**
     * Scrolls the element's content to the given top coordinate
     *
     * @type member
     * @param value {Integer} The horizontal position to scroll to.
     * @return {void}
     */
    scrollToY : function(value){
      this._contentElement.scrollToY(value);
    },


    /**
     * Returns the scroll top position of the content
     *
     * @type member
     * @return {Integer} Vertical scroll position
     */
    getScrollY : function() {
      return this._contentElement.getScrollY();
    },


    /**
     * Scrolls the element's content horizontally by the given amount.
     *
     * @type member
     * @param x {Integer?0} Amount to scroll
     * @return {void}
     */
    scrollByX : function(x) {
      this.scrollToX(this.getScrollX() + x);
    },


    /**
     * Scrolls the element's content vertically by the given amount.
     *
     * @type member
     * @param y {Integer?0} Amount to scroll
     * @return {void}
     */
    scrollByY : function(y) {
      this.scrollToY(this.getScrollY() + y);
    }
  }
});
