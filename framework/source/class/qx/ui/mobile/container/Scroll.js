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
  },


  events :
  {
    /** Fired when the user scrolls to the end of scroll area. */
    pageEnd : "qx.event.type.Event"
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
  }
});
