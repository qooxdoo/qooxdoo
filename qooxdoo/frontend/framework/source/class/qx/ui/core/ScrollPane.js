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
