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
 * Preliminary test class for overflow handling. Could be used
 * for scrolling tab panes etc. in the future.
 */
qx.Class.define("qx.ui.container.SlideBar",
{
  extend : qx.ui.core.Widget,

  include : [
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
    /*
    ---------------------------------------------------------------------------
      WIDGET INTERNALS
    ---------------------------------------------------------------------------
    */

    // overridden
    getChildrenContainer : function() {
      return this._getChildControl("pane");
    },


    // overridden
    _getStyleTarget : function() {
      return this._getChildControl("pane");
    },




    /*
    ---------------------------------------------------------------------------
      CHILD CONTROL SUPPORT
    ---------------------------------------------------------------------------
    */

    // overridden
    _createChildControlImpl : function(id)
    {
      var control;

      switch(id)
      {
        case "button-forward":
          control = new qx.ui.form.RepeatButton(">");
          control.addListener("execute", this._onExecuteForward, this);
          this._add(control);
          break;

        case "button-backward":
          control = new qx.ui.form.RepeatButton("<");
          control.addListener("execute", this._onExecuteBackward, this);
          this._addAt(control, 0);
          break;

        case "pane":
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

    _applyOrientation : function(value, old)
    {
      if (value == "horizontal")
      {
        this._setLayout(new qx.ui.layout.HBox());
        this.setLayout(new qx.ui.layout.HBox());
        this._isHorizontal = true;
      }
      else
      {
        this._setLayout(new qx.ui.layout.VBox());
        this.setLayout(new qx.ui.layout.VBox());
        this._isHorizontal = false;
      }
    },

    /**
     * Listener for resize event. This event is fired after the
     * first flush of the element which leads to another queueing
     * when the changes modify the visibility of the scroll buttons.
     *
     * @type member
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

      var overflow = this._isHorizontal ?
        contentSize.width > innerSize.width :
        contentSize.height > innerSize.height;

      overflow ? this._showArrows() : this._hideArrows();
    },


    /**
     * Show the arrows (Called from resize event)
     *
     * @type member
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
     * @type member
     * @return {void}
     */
    _hideArrows : function()
    {
      this._excludeChildControl("button-forward");
      this._excludeChildControl("button-backward");

      this._getChildControl("scrollpane").scrollToX(0);
    },


    /**
     * Scroll handler for left scrolling
     *
     * @type member
     * @return {void}
     */
    _onExecuteBackward : function()
    {
      if (this._isHorizontal) {
        this._getChildControl("scrollpane").scrollByX(-20);
      } else {
        this._getChildControl("scrollpane").scrollByY(-20);
      }
    },


    /**
     * Scroll handler for right scrolling
     *
     * @type member
     * @return {void}
     */
    _onExecuteForward : function()
    {
      if (this._isHorizontal) {
        this._getChildControl("scrollpane").scrollByX(20);
      } else {
        this._getChildControl("scrollpane").scrollByY(20);
      }
    }
  }
});
