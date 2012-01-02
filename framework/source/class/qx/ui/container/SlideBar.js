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
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * Container, which provides scrolling in one dimension (vertical or horizontal).
 *
 * @childControl button-forward {qx.ui.form.RepeatButton} button to step forward
 * @childControl button-backward {qx.ui.form.RepeatButton} button to step backward
 * @childControl content {qx.ui.container.Composite} container to hold the content
 * @childControl scrollpane {qx.ui.core.scroll.ScrollPane} the scroll pane holds the content to enable scrolling
 *
 * *Example*
 *
 * Here is a little example of how to use the widget.
 *
 * <pre class='javascript'>
 *   // create slide bar container
 *   slideBar = new qx.ui.container.SlideBar().set({
 *     width: 300
 *   });
 *
 *   // set layout
 *   slideBar.setLayout(new qx.ui.layout.HBox());
 *
 *   // add some widgets
 *   for (var i=0; i<10; i++)
 *   {
 *     slideBar.add((new qx.ui.core.Widget()).set({
 *       backgroundColor : (i % 2 == 0) ? "red" : "blue",
 *       width : 60
 *     }));
 *   }
 *
 *   this.getRoot().add(slideBar);
 * </pre>
 *
 * This example creates a SlideBar and add some widgets with alternating
 * background colors. Since the content is larger than the container, two
 * scroll buttons at the left and the right edge are shown.
 *
 * *External Documentation*
 *
 * <a href='http://manual.qooxdoo.org/${qxversion}/pages/widget/slidebar.html' target='_blank'>
 * Documentation of this widget in the qooxdoo manual.</a>
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

    var scrollPane = this.getChildControl("scrollpane");
    this._add(scrollPane, {flex: 1});

    if (orientation != null) {
      this.setOrientation(orientation);
    } else {
      this.initOrientation();
    }

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
    },

    /** The number of pixels to scroll if the buttons are pressed */
    scrollStep :
    {
      check : "Integer",
      init : 15,
      themeable : true
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
      WIDGET API
    ---------------------------------------------------------------------------
    */

    // overridden
    getChildrenContainer : function() {
      return this.getChildControl("content");
    },


    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var control;

      switch(id)
      {
        case "button-forward":
          control = new qx.ui.form.RepeatButton;
          control.addListener("execute", this._onExecuteForward, this);
          control.setFocusable(false);
          this._addAt(control, 2);
          break;

        case "button-backward":
          control = new qx.ui.form.RepeatButton;
          control.addListener("execute", this._onExecuteBackward, this);
          control.setFocusable(false);
          this._addAt(control, 0);
          break;

        case "content":
          control = new qx.ui.container.Composite();

          /*
           * Gecko < 2 does not update the scroll position after removing an
           * element. So we have to do this by hand.
           */
          if (qx.core.Environment.get("engine.name") == "gecko" &&
            parseInt(qx.core.Environment.get("engine.version")) < 2)
          {
            control.addListener("removeChildWidget", this._onRemoveChild, this);
          }

          this.getChildControl("scrollpane").add(control);
          break;

        case "scrollpane":
          control = new qx.ui.core.scroll.ScrollPane();
          control.addListener("update", this._onResize, this);
          control.addListener("scrollX", this._onScroll, this);
          control.addListener("scrollY", this._onScroll, this);
          break;
      }

      return control || this.base(arguments, id);
    },

    // overridden
    /**
     * @lint ignoreReferenceField(_forwardStates)
     */
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
      var pane = this.getChildControl("scrollpane");
      if (this.getOrientation() === "horizontal") {
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
      var pane = this.getChildControl("scrollpane");
      if (this.getOrientation() === "horizontal") {
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
    // overridden
    _applyEnabled : function(value, old, name) {
      this.base(arguments, value, old, name);
      this._updateArrowsEnabled();
    },


    // property apply
    _applyOrientation : function(value, old)
    {
      var oldLayouts = [this.getLayout(), this._getLayout()];
      var buttonForward = this.getChildControl("button-forward");
      var buttonBackward = this.getChildControl("button-backward");

      // old can also be null, so we have to check both explicitly to set
      // the states correctly.
      if (old == "vertical")
      {
        buttonForward.removeState("vertical");
        buttonBackward.removeState("vertical");
        buttonForward.addState("horizontal");
        buttonBackward.addState("horizontal");
      }
      else if (old == "horizontal")
      {
        buttonForward.removeState("horizontal");
        buttonBackward.removeState("horizontal");
        buttonForward.addState("vertical");
        buttonBackward.addState("vertical");
      }


      if (value == "horizontal")
      {
        this._setLayout(new qx.ui.layout.HBox());
        this.setLayout(new qx.ui.layout.HBox());
      }
      else
      {
        this._setLayout(new qx.ui.layout.VBox());
        this.setLayout(new qx.ui.layout.VBox());
      }

      if (oldLayouts[0]) {
        oldLayouts[0].dispose();
      }

      if (oldLayouts[1]) {
        oldLayouts[1].dispose();
      }
    },




    /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */

    /**
     * Scrolls pane on mousewheel events
     *
     * @param e {qx.event.type.Mouse} the mouse event
     */
    _onMouseWheel : function(e)
    {
      var delta = 0;
      var pane = this.getChildControl("scrollpane");
      if (this.getOrientation() === "horizontal") {
        delta = e.getWheelDelta("x");

        var position = pane.getScrollX();
        var max = pane.getScrollMaxX();
        var steps = parseInt(delta);

        // pass the event to the parent if both scrollbars are at the end
        if (!(
          steps < 0 && position <= 0 ||
          steps > 0 && position >= max ||
          delta == 0)
        ) {
          e.stop();
        }
      } else {
        delta = e.getWheelDelta("y");

        var position = pane.getScrollY();
        var max = pane.getScrollMaxY();
        var steps = parseInt(delta);

        // pass the event to the parent if both scrollbars are at the end
        if (!(
          steps < 0 && position <= 0 ||
          steps > 0 && position >= max ||
          delta == 0
        )) {
          e.stop();
        }
      }

      this.scrollBy(delta * this.getScrollStep());
    },


    /**
     * Update arrow enabled state after scrolling
     */
    _onScroll : function() {
      this._updateArrowsEnabled();
    },


    /**
     * Listener for resize event. This event is fired after the
     * first flush of the element which leads to another queuing
     * when the changes modify the visibility of the scroll buttons.
     *
     * @param e {Event} Event object
     * @return {void}
     */
    _onResize : function(e)
    {
      var content = this.getChildControl("scrollpane").getChildren()[0];
      if (!content) {
        return;
      }

      var innerSize = this.getInnerSize();
      var contentSize = content.getBounds();

      var overflow = (this.getOrientation() === "horizontal") ?
        contentSize.width > innerSize.width :
        contentSize.height > innerSize.height;

      if (overflow) {
        this._showArrows()
        this._updateArrowsEnabled();
      } else {
        this._hideArrows();
      }
    },


    /**
     * Scroll handler for left scrolling
     *
     * @return {void}
     */
    _onExecuteBackward : function() {
      this.scrollBy(-this.getScrollStep());
    },


    /**
     * Scroll handler for right scrolling
     *
     * @return {void}
     */
    _onExecuteForward : function() {
      this.scrollBy(this.getScrollStep());
    },


    /**
     * Helper function for Gecko. Modifies the scroll offset when a child is
     * removed.
     */
    _onRemoveChild : function()
    {
      qx.event.Timer.once(
        function()
        {
          // It might happen that the child control is already disposed in very
          // seldom cases - anyway check against that (Bug #5339)
          var scrollpane = this.getChildControl("scrollpane");
          if (!scrollpane.isDisposed()) {
            this.scrollBy(scrollpane.getScrollX());
          }
        },
        this,
        50
      );
    },


    /*
    ---------------------------------------------------------------------------
      UTILITIES
    ---------------------------------------------------------------------------
    */

    /**
     * Update arrow enabled state
     */
    _updateArrowsEnabled : function()
    {
      // set the disables state directly because we are overriding the
      // inheritance
      if (!this.getEnabled()) {
        this.getChildControl("button-backward").setEnabled(false);
        this.getChildControl("button-forward").setEnabled(false);
        return;
      }

      var pane = this.getChildControl("scrollpane");

      if (this.getOrientation() === "horizontal")
      {
        var position = pane.getScrollX();
        var max = pane.getScrollMaxX();
      }
      else
      {
        var position = pane.getScrollY();
        var max = pane.getScrollMaxY();
      }

      this.getChildControl("button-backward").setEnabled(position > 0);
      this.getChildControl("button-forward").setEnabled(position < max);
    },


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
