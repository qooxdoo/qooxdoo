/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's left-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)
     * Jonathan Rass (jonathan_rass)

************************************************************************ */

/**
 * Container, which provides scrolling in one dimension (vertical or horizontal).
 */
qx.Class.define("qx.ui.container.SlideBar",
{
  extend : qx.ui.core.Widget,

  include :
  [
    qx.ui.core.MRemoteChildrenHandling,
    qx.ui.core.MRemoteLayoutHandling
  ],



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param orientation {String?"horizontal"} The slide bar orientation
   */
  construct : function(orientation)
  {
    this.base(arguments);

    var scrollPane = this._getChildControl("scrollpane");

    if (orientation != null) {
      this.setOrientation(orientation);
    } else {
      this.initOrientation();
    }

    this._add(scrollPane, {flex: 1});
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    appearance :
    {
      refine : true,
      init : "slidebar"
    },

    /** Orientation of the bar */
    orientation :
    {
      check : ["horizontal", "vertical"],
      init : "horizontal",
      apply : "_applyOrientation"
    }
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __isHorizontal : null,

    /*
    ---------------------------------------------------------------------------
      WIDGET API
    ---------------------------------------------------------------------------
    */

    // overridden
    getChildrenContainer : function() {
      return this._getChildControl("content");
    },


    // overridden
    _createChildControlImpl : function(id)
    {
      var control;

      switch(id)
      {
        case "button-forward":
          control = new qx.ui.form.RepeatButton;
          control.addListener("execute", this._onExecuteForward, this);
          control.setFocusable(false);
          this._add(control);
          break;

        case "button-backward":
          control = new qx.ui.form.RepeatButton;
          control.addListener("execute", this._onExecuteBackward, this);
          control.setFocusable(false);
          this._addAt(control, 0);
          break;

        case "content":
          control = new qx.ui.container.Composite();
          this._getChildControl("scrollpane").add(control);
          break;

        case "scrollpane":
          control = new qx.ui.core.ScrollPane();
          control.addListener("update", this._onResize, this);
          break;
      }

      return control || this.base(arguments, id);
    },

    // overridden
    _forwardStates :
    {
      barLeft : true,
      barTop : true,
      barRight : true,
      barBottom : true
    },




    /*
    ---------------------------------------------------------------------------
      PUBLIC SCROLL API
    ---------------------------------------------------------------------------
    */

    /**
     * Scrolls the element's content by the given amount.
     *
     * @param offset {Integer?0} Amount to scroll
     * @return {void}
     */
    scrollBy : function(offset)
    {
      var pane = this._getChildControl("scrollpane");
      if (this.__isHorizontal) {
        pane.scrollByX(offset);
      } else {
        pane.scrollByY(offset);
      }
    },


    /**
     * Scrolls the element's content to the given coordinate
     *
     * @param value {Integer} The position to scroll to.
     * @return {void}
     */
    scrollTo : function(value)
    {
      var pane = this._getChildControl("scrollpane");
      if (this.__isHorizontal) {
        pane.scrollToX(value);
      } else {
        pane.scrollToY(value);
      }
    },




    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyOrientation : function(value, old)
    {
      if (value == "horizontal")
      {
        this._setLayout(new qx.ui.layout.HBox());
        this.setLayout(new qx.ui.layout.HBox());
        this.__isHorizontal = true;
      }
      else
      {
        this._setLayout(new qx.ui.layout.VBox());
        this.setLayout(new qx.ui.layout.VBox());
        this.__isHorizontal = false;
      }
    },




    /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */

    /**
     * Listener for resize event. This event is fired after the
     * first flush of the element which leads to another queueing
     * when the changes modify the visibility of the scroll buttons.
     *
     * @param e {Event} Event object
     * @return {void}
     */
    _onResize : function(e)
    {
      var content = this._getChildControl("scrollpane").getChild();
      if (!content) {
        return;
      }

      var innerSize = this.getInnerSize();
      var contentSize = content.getBounds();

      var overflow = this.__isHorizontal ?
        contentSize.width > innerSize.width :
        contentSize.height > innerSize.height;

      overflow ? this._showArrows() : this._hideArrows();
    },


    /**
     * Scroll handler for left scrolling
     *
     * @return {void}
     */
    _onExecuteBackward : function() {
      this.scrollBy(-20);
    },


    /**
     * Scroll handler for right scrolling
     *
     * @return {void}
     */
    _onExecuteForward : function() {
      this.scrollBy(20);
    },




    /*
    ---------------------------------------------------------------------------
      UTILITIES
    ---------------------------------------------------------------------------
    */

    /**
     * Show the arrows (Called from resize event)
     *
     * @return {void}
     */
    _showArrows : function()
    {
      this._showChildControl("button-forward");
      this._showChildControl("button-backward");
    },


    /**
     * Hide the arrows (Called from resize event)
     *
     * @return {void}
     */
    _hideArrows : function()
    {
      this._excludeChildControl("button-forward");
      this._excludeChildControl("button-backward");

      this.scrollTo(0);
    }
  }
});
