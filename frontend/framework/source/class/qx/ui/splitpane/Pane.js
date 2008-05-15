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
     * Jonathan Rass (jonathan_rass)

 ************************************************************************ */

qx.Class.define("qx.ui.splitpane.Pane",
{
  extend : qx.ui.core.Widget,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * Creates a new instance of a SplitPane. It allows the user to dynamically resize
   * the areas dropping the border between.
   *
   * Please note that the usage of percents may be problematic because you must respect the
   * divider, too. To create a typical 50,50 split please use flex units instead e.g. "1*", "1*"
   *
   * new qx.ui.splitpane.SplitPane(orientation)
   * new qx.ui.splitpane.SplitPane(orientation, firstSize, secondSize)
   *
   * @appearance splitpane
   *
   * @param orientation {String} The orientation of the splitpane control. Allowed values are "horizontal" (default) and "vertical". This is the same type as used in {@link qx.legacy.ui.layout.BoxLayout#orientation}.
   * @param firstSize {String} The size of the left (top) pane. Allowed values are any by {@link qx.ui.core.Widget} supported unit.
   * @param secondSize {String} The size of the right (bottom) pane. Allowed values are any by {@link qx.ui.core.Widget} supported unit.
   */
  construct : function(orientation, firstSize, secondSize)
  {
    this.base(arguments);

    // Create and add container
    var container = this.__container = new qx.ui.container.Composite(new qx.ui.layout.Split(orientation));
    this._add(container);
    
    // Create and add slider
    this._slider = new qx.ui.splitpane.Slider(this);
    this._add(this._slider);

    // Create splitter
    this._splitter = new qx.ui.splitpane.Splitter(this);

    // Create areas
    this._firstArea = new qx.ui.container.Composite(new qx.ui.layout.Canvas());
    this._secondArea = new qx.ui.container.Composite(new qx.ui.layout.Canvas());

    // Add widgets to container
    container.add(
      this._firstArea,
      {
        mode : "first",
        size : firstSize
      }
    );
    
    container.add(
      this._splitter,
      {
        mode : "splitter"
      }
    );
    
    container.add(
      this._secondArea,
      {
        mode : "second",
        size : secondSize
      }
    );

    // Add container to widget
    this._add(container)
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * Appearance change
     */
    appearance :
    {
      refine : true,
      init : "splitpane"
    },



    /**
     * The layout method for the splitpane. If true, the content will updated immediatly.
     */
    liveResize :
    {
      check : "Boolean",
      init : false
    },


    /**
     * The orientation of the splitpane control. Allowed values are "horizontal" (default) and "vertical".
     */
    orientation :
    {
      check : [ "horizontal", "vertical" ],
      apply : "_applyOrientation",
      init : "horizontal",
      nullable : true
    },


    /**
     * The size of the first (left/top) area.
     */
    firstSize :
    {
      apply : "_applyFirstSize",
      init : "1*"
    },


    /**
     * The size of the second (right/bottom) area.
     */
    secondSize :
    {
      apply : "_applySecondSize",
      init : "1*"
    },


    /**
     * Size of the splitter
     */
    splitterSize :
    {
      check : "Integer",
      init : 4,
      apply : "_applySplitterSize",
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
      PUBLIC METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Sets given widget as first area.
     *
     * @type member
     * @param widget {qx.core.ui.Widget} Widget
     * @return {Bool} true on sucess, false on failure
     */
    setFirst : function(widget)
    {
      this.setFirstArea(widget);
    },


    /**
     * Sets given widget as second area.
     *
     * @type member
     * @param widget {qx.core.ui.Widget} Widget
     * @return {Bool} true on sucess, false on failure
     */
    setSecond : function(widget)
    {
      this.setSecondArea(widget);
    },


    /**
     * Returns the splitter.
     *
     * @type member
     * @return {qx.legacy.ui.core.Widget} The splitter.
     */
    getSplitter : function() {
      return this._splitter;
    },


    /**
     * Returns the first area (CanvasLayout)
     *
     * @type member
     * @return {qx.legacy.ui.layout.CanvasLayout} TODOC
     */
    getFirstArea : function() {
      return this._firstArea;
    },


    /**
     * Returns the second area (CanvasLayout)
     *
     * @type member
     * @return {qx.legacy.ui.layout.CanvasLayout} TODOC
     */
    getSecondArea : function() {
      return this._secondArea;
    },




    /*
    ---------------------------------------------------------------------------
      APPLY ROUTINES
    ---------------------------------------------------------------------------
    */


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyOrientation : function(value, old)
    {
      // sync orientation to layout
      this._box.setOrientation(value);

      switch(old)
      {
        case "horizontal":
          // remove old listeners
          this._splitter.removeListener("mousedown", this._onSplitterMouseDownX, this);
          this._splitter.removeListener("mousemove", this._onSplitterMouseMoveX, this);
          this._splitter.removeListener("mouseup", this._onSplitterMouseUpX, this);

          // reconfigure states
          this._splitter.removeState("horizontal");

          // reset old dimensions
          this._firstArea.setWidth(null);
          this._secondArea.setWidth(null);
          this._splitter.setWidth(null);

          break;

        case "vertical":
          // remove old listeners
          this._splitter.removeListener("mousedown", this._onSplitterMouseDownY, this);
          this._splitter.removeListener("mousemove", this._onSplitterMouseMoveY, this);
          this._splitter.removeListener("mouseup", this._onSplitterMouseUpY, this);

          // reconfigure states
          this._splitter.removeState("vertical");

          // reset old dimensions
          this._firstArea.setHeight(null);
          this._secondArea.setHeight(null);
          this._splitter.setHeight(null);

          break;
      }

      switch(value)
      {
        case "horizontal":
          // add new listeners
          this._splitter.addListener("mousemove", this._onSplitterMouseMoveX, this);
          this._splitter.addListener("mousedown", this._onSplitterMouseDownX, this);
          this._splitter.addListener("mouseup", this._onSplitterMouseUpX, this);

          // reconfigure states
          this._splitter.addState("horizontal");

          break;

        case "vertical":
          // add new listeners
          this._splitter.addListener("mousedown", this._onSplitterMouseDownY, this);
          this._splitter.addListener("mousemove", this._onSplitterMouseMoveY, this);
          this._splitter.addListener("mouseup", this._onSplitterMouseUpY, this);

          // reconfigure states
          this._splitter.addState("vertical");

          break;
      }

      // apply new dimensions
      this._syncFirstSize();
      this._syncSecondSize();
      this._syncSplitterSize();
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyFirstSize : function(value, old) {
      this._syncFirstSize();
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applySecondSize : function(value, old) {
      this._syncSecondSize();
    },


    /**
     * TODOC
     *
     * @type member
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applySplitterSize : function(value, old) {
      this._syncSplitterSize();
    },



    /*
    ---------------------------------------------------------------------------
      EVENTS
    ---------------------------------------------------------------------------
    */

    /**
     * Initializes drag session in case of a mousedown event on splitter in a horizontal splitpane.
     *
     * @type member
     * @param e {qx.legacy.event.type.MouseEvent} The event itself.
     * @return {void}
     */
    _onSplitterMouseDownX : function(e)
    {
    },


    /**
     * Initializes drag session in case of a mousedown event on splitter in a vertical splitpane.
     *
     * @type member
     * @param e {qx.legacy.event.type.MouseEvent} The event itself.
     * @return {void}
     */
    _onSplitterMouseDownY : function(e)
    {
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _commonMouseDown : function()
    {
    },


    /**
     * Move the splitter in case of a mousemove event on splitter in a horizontal splitpane.
     *
     * @type member
     * @param e {qx.legacy.event.type.MouseEvent} The event itself.
     * @return {void}
     */
    _onSplitterMouseMoveX : function(e)
    {
    },


    /**
     * Move the splitter in case of a mousemove event on splitter in a vertical splitpane.
     *
     * @type member
     * @param e {qx.legacy.event.type.MouseEvent} The event itself.
     * @return {void}
     */
    _onSplitterMouseMoveY : function(e)
    {
    },


    /**
     * Ends the drag session and computes the new dimensions of panes in case of a mouseup event on splitter in a horizontal splitpane.
     *
     * @type member
     * @param e {qx.legacy.event.type.MouseEvent} The event itself.
     * @return {void}
     */
    _onSplitterMouseUpX : function(e)
    {
    },


    /**
     * Ends the drag session and computes the new dimensions of panes in case of a mouseup event on splitter in a vertical splitpane.
     *
     * @type member
     * @param e {qx.legacy.event.type.MouseEvent} The event itself.
     * @return {void}
     */
    _onSplitterMouseUpY : function(e)
    {
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _commonMouseUp : function()
    {

    }


  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    // TODO
  }
});
