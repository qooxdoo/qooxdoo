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
 * the scrolling position. This widget can only have excactly one child.
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

    // Automatically configure a "fixed" scroll layout.
    this.setLayout(new qx.ui.layout.Scroll());
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /** Fired on resize of the content widget (after layouting). */
    resizeContent : "qx.event.type.Data"
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
      LAYOUT INTERFACE
    ---------------------------------------------------------------------------
    */

    // overridden
    _applyLayout : function(value, old)
    {
      if (old) {
        throw new Error("You cannot change the layout of qx.ui.core.ScrollPane!");
      }

      this.base(arguments, value, old);
    },





    /*
    ---------------------------------------------------------------------------
      CONTENT MANAGMENT
    ---------------------------------------------------------------------------
    */

    /**
     * Configures the content of the scroll pane.
     *
     * @type member
     * @param content {qx.ui.core.Widget?null} The content widget of the pane
     * @return {qx.ui.core.Widget|null} The current layout content
     */
    setContent : function(content)
    {
      var old = this.getLayout().getContent();
      if (old)
      {
        this.getLayout().resetContent();
        old.removeListener("resize", this._onContentResize, this);
      }

      if (content)
      {
        this.getLayout().setContent(content);
        content.addListener("resize", this._onContentResize, this);
      }

      return content || null;
    },


    /**
     * Returns the current content.
     *
     * @type member
     * @return {qx.ui.core.Widget|null} The current layout content
     */
    getContent : function() {
      return this.getLayout().getContent();
    },


    /**
     * Event listener for resize event of content
     *
     * @type member
     * @param e {Event} Resize event object
     */
    _onContentResize : function(e) {
      this.fireDataEvent("resizeContent", e.getData());
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
     * @param direct {Boolean?false} Whether the value should be applied
     *   directly (without queueing).
     * @return {void}
     */
    setScrollLeft : function(value, direct) {
      this._contentElement.setAttribute("scrollLeft", value, direct);
    },


    /**
     * Returns the scroll left position of the content
     *
     * @type member
     * @return {Integer} Horizontal scroll position
     */
    getScrollLeft : function() {
      return this._contentElement.getAttribute("scrollLeft") || 0;
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
      this._contentElement.setAttribute("scrollTop", value, direct);
    },


    /**
     * Returns the scroll top position of the content
     *
     * @type member
     * @return {Integer} Vertical scroll position
     */
    getScrollTop : function() {
      return this._contentElement.getAttribute("scrollTop") || 0;
    },


    /**
     * Scrolls the element's content horizontally by the given amount.
     *
     * @type member
     * @param left {Integer?0} Amount to scroll
     * @param direct {Boolean?false} Whether the value should be applied
     *   directly (without queueing).
     * @return {void}
     */
    scrollLeftBy : function(left, direct)
    {
      if (!left) {
        return;
      }

      var oldLeft = this.getScrollLeft();
      this.setScrollLeft(oldLeft + left, direct);
    },


    /**
     * Scrolls the element's content vertically by the given amount.
     *
     * @type member
     * @param top {Integer?0} Amount to scroll
     * @param direct {Boolean?false} Whether the value should be applied
     *   directly (without queueing).
     * @return {void}
     */
    scrollTopBy : function(top, direct)
    {
      if (!top) {
        return;
      }

      var oldTop = this.getScrollTop();
      this.setScrollTop(oldTop + top, direct);
    }
  }
});
