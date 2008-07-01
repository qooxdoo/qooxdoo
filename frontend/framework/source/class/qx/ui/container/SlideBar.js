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

    this._isHorizontal = orientation !== "vertical";

    if (this._isHorizontal) {
      this._setLayout(new qx.ui.layout.HBox());
    } else {
      this._setLayout(new qx.ui.layout.VBox());
    }

    this._scrollPane = new qx.ui.core.ScrollPane();
    this._scrollPane.addListener("update", this._onResize, this);

    this._add(this._scrollPane, {flex: 1});
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */
  
  properties :
  {
    appearance : 
    {
      refine : true,
      init : "slidebar" 
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
          this._scrollPane.add(control);
          break;
      }
      
      return control || this.base(arguments, id);
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
      var content = this._scrollPane.getChild();
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

      this._scrollPane.scrollToX(0);
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
        this._scrollPane.scrollByX(-20);
      } else {
        this._scrollPane.scrollByY(-20);
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
        this._scrollPane.scrollByX(20);
      } else {
        this._scrollPane.scrollByY(20);
      }
    }
  }
});
