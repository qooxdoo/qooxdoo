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
     * Volker Pauli (vpauli)
     * Sebastian Werner (wpbasti)
     * Carsten Lergenmueller (carstenL)

 ************************************************************************ */

qx.Class.define("qx.legacy.ui.splitpane.SplitPane",
{
  extend : qx.legacy.ui.layout.CanvasLayout,




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
   * new qx.legacy.ui.splitpane.SplitPane(orientation)
   * new qx.legacy.ui.splitpane.SplitPane(orientation, firstSize, secondSize)
   *
   * @appearance splitpane
   *
   * @param orientation {String} The orientation of the splitpane control. Allowed values are "horizontal" (default) and "vertical". This is the same type as used in {@link qx.legacy.ui.layout.BoxLayout#orientation}.
   * @param firstSize {String} The size of the left (top) pane. Allowed values are any by {@link qx.legacy.ui.core.Widget} supported unit.
   * @param secondSize {String} The size of the right (bottom) pane. Allowed values are any by {@link qx.legacy.ui.core.Widget} supported unit.
   */
  construct : function(orientation, firstSize, secondSize)
  {
    this.base(arguments);

    // CREATE INNER BOX LAYOUT
    var box = this._box = new qx.legacy.ui.layout.BoxLayout;
    box.setEdge(0);
    this.add(box);

    /*
     the splitpane itself is a boxlayout resides on top of a canvas for easier computing of positional values
     ---------------------------------------------------------------------------------------
    |  canvas                                                                               |
    |  -----------------------------------------------------------------------------------  |
    | | box                                                                               | |
    | | ---------------------------  ---  ----------------------------------------------- | |
    | | |                         |  | |  |                                             | | |
    | | | firstArea               |  |s|  | secondArea                                  | | |
    | | |                         |  |p|  |                                             | | |
    | | |                         |  |l|  |                                             | | |
    | | |                         |  |i|  |                                             | | |
    | | |                         |  |t|  |                                             | | |
    | | |                         |  |t|  |                                             | | |
    | | |                         |  |e|  |                                             | | |
    | | |                         |  |r|  |                                             | | |
    | | |                         |  | |  |                                             | | |
    | | ---------------------------  ---  ----------------------------------------------- | |
    |  -----------------------------------------------------------------------------------  |
    |                                                                                       |
    ---------------------------------------------------------------------------------------
     */

    // CREATE SLIDER
    this._slider = new qx.legacy.ui.splitpane.SplitPaneSlider(this);
    this.add(this._slider);

    // CREATE SPLITTER
    this._splitter = new qx.legacy.ui.splitpane.SplitPaneSplitter(this);

    // CREATE KNOB
    this._knob = new qx.legacy.ui.splitpane.SplitPaneKnob;
    this._splitter.add(this._knob);

    // CREATE AREAS
    this._firstArea = new qx.legacy.ui.layout.CanvasLayout;
    this._secondArea = new qx.legacy.ui.layout.CanvasLayout;

    // FILL BOX
    box.add(this._firstArea, this._splitter, this._secondArea);

    // APPLY ORIENTATION
    if (orientation == "vertical") {
      this.setOrientation(orientation);
    } else {
      this.initOrientation();
    }

    // APPLY DIMENSIONS
    if (firstSize != null) {
      this.setFirstSize(firstSize);
    } else {
      this.initFirstSize();
    }

    if (secondSize != null) {
      this.setSecondSize(secondSize);
    } else {
      this.initSecondSize();
    }

    this.initShowKnob();
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
     * Show the knob
     */
    showKnob :
    {
      check : "Boolean",
      init : true,
      apply : "_applyShowKnob",
      themeable : true
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
     * adds one or more widget(s) to the left pane
     *
     * @return {var} TODOC
     */
    addLeft : function()
    {
      var c = this.getFirstArea();
      return c.add.apply(c, arguments);
    },


    /**
     * adds one or more widget(s) to the top pane
     *
     * @return {var} TODOC
     */
    addTop : function()
    {
      var c = this.getFirstArea();
      return c.add.apply(c, arguments);
    },


    /**
     * adds one or more widget(s) to the right pane
     *
     * @return {var} TODOC
     */
    addRight : function()
    {
      var c = this.getSecondArea();
      return c.add.apply(c, arguments);
    },


    /**
     * adds one or more widget(s) to the bottom pane
     *
     * @return {var} TODOC
     */
    addBottom : function()
    {
      var c = this.getSecondArea();
      return c.add.apply(c, arguments);
    },


    /**
     * Returns the splitter.
     *
     * @return {qx.legacy.ui.core.Widget} The splitter.
     */
    getSplitter : function() {
      return this._splitter;
    },


    /**
     * Returns the knob.
     *
     * @return {qx.legacy.ui.core.Widget} The knob.
     */
    getKnob : function() {
      return this._knob;
    },


    /**
     * Returns the left area (CanvasLayout)
     *
     * @return {qx.legacy.ui.layout.CanvasLayout} TODOC
     */
    getLeftArea : function() {
      return this.getFirstArea();
    },


    /**
     * Returns the top area (CanvasLayout)
     *
     * @return {qx.legacy.ui.layout.CanvasLayout} TODOC
     */
    getTopArea : function() {
      return this.getFirstArea();
    },


    /**
     * Returns the right area (CanvasLayout)
     *
     * @return {qx.legacy.ui.layout.CanvasLayout} TODOC
     */
    getRightArea : function() {
      return this.getSecondArea();
    },


    /**
     * Returns the bottom area (CanvasLayout)
     *
     * @return {qx.legacy.ui.layout.CanvasLayout} TODOC
     */
    getBottomArea : function() {
      return this.getSecondArea();
    },


    /**
     * Returns the first area (CanvasLayout)
     *
     * @return {qx.legacy.ui.layout.CanvasLayout} TODOC
     */
    getFirstArea : function() {
      return this._firstArea;
    },


    /**
     * Returns the second area (CanvasLayout)
     *
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
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyShowKnob : function(value, old) {
      this._knob.setVisibility(value);
    },


    /**
     * TODOC
     *
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
          this._knob.removeListener("mousedown", this._onSplitterMouseDownX, this);
          this._knob.removeListener("mousemove", this._onSplitterMouseMoveX, this);
          this._knob.removeListener("mouseup", this._onSplitterMouseUpX, this);

          // reconfigure states
          this._splitter.removeState("horizontal");
          this._knob.removeState("horizontal");

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
          this._knob.removeListener("mousedown", this._onSplitterMouseDownY, this);
          this._knob.removeListener("mousemove", this._onSplitterMouseMoveY, this);
          this._knob.removeListener("mouseup", this._onSplitterMouseUpY, this);

          // reconfigure states
          this._splitter.removeState("vertical");
          this._knob.removeState("vertical");

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
          this._knob.addListener("mousemove", this._onSplitterMouseMoveX, this);
          this._knob.addListener("mousedown", this._onSplitterMouseDownX, this);
          this._knob.addListener("mouseup", this._onSplitterMouseUpX, this);

          // reconfigure states
          this._splitter.addState("horizontal");
          this._knob.addState("horizontal");

          break;

        case "vertical":
          // add new listeners
          this._splitter.addListener("mousedown", this._onSplitterMouseDownY, this);
          this._splitter.addListener("mousemove", this._onSplitterMouseMoveY, this);
          this._splitter.addListener("mouseup", this._onSplitterMouseUpY, this);
          this._knob.addListener("mousedown", this._onSplitterMouseDownY, this);
          this._knob.addListener("mousemove", this._onSplitterMouseMoveY, this);
          this._knob.addListener("mouseup", this._onSplitterMouseUpY, this);

          // reconfigure states
          this._splitter.addState("vertical");
          this._knob.addState("vertical");

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
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applyFirstSize : function(value, old) {
      this._syncFirstSize();
    },


    /**
     * TODOC
     *
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applySecondSize : function(value, old) {
      this._syncSecondSize();
    },


    /**
     * TODOC
     *
     * @param value {var} Current value
     * @param old {var} Previous value
     */
    _applySplitterSize : function(value, old) {
      this._syncSplitterSize();
    },


    /**
     * TODOC
     *
     * @return {void}
     */
    _syncFirstSize : function()
    {
      switch(this.getOrientation())
      {
        case "horizontal":
          this._firstArea.setWidth(this.getFirstSize());
          break;

        case "vertical":
          this._firstArea.setHeight(this.getFirstSize());
          break;
      }
    },


    /**
     * TODOC
     *
     * @return {void}
     */
    _syncSecondSize : function()
    {
      switch(this.getOrientation())
      {
        case "horizontal":
          this._secondArea.setWidth(this.getSecondSize());
          break;

        case "vertical":
          this._secondArea.setHeight(this.getSecondSize());
          break;
      }
    },


    /**
     * TODOC
     *
     * @return {void}
     */
    _syncSplitterSize : function()
    {
      switch(this.getOrientation())
      {
        case "horizontal":
          this._splitter.setWidth(this.getSplitterSize());
          break;

        case "vertical":
          this._splitter.setHeight(this.getSplitterSize());
          break;
      }
    },




    /*
    ---------------------------------------------------------------------------
      EVENTS
    ---------------------------------------------------------------------------
    */

    /**
     * Initializes drag session in case of a mousedown event on splitter in a horizontal splitpane.
     *
     * @param e {qx.legacy.event.type.MouseEvent} The event itself.
     * @return {void}
     */
    _onSplitterMouseDownX : function(e)
    {
      if (!e.isLeftButtonPressed()) {
        return;
      }

      this._commonMouseDown();

      // activate global cursor
      this.getTopLevelWidget().setGlobalCursor("col-resize");
      this._slider.addState("dragging");
      this._knob.addState("dragging");

      // initialize the drag session
      this._dragMin = qx.bom.element.Location.getLeft(this._box.getElement(), "border");
      this._dragMax = this._dragMin + this._box.getInnerWidth() - this._splitter.getBoxWidth();
      this._dragOffset = e.getPageX() - qx.bom.element.Location.getLeft(this._splitter.getElement());
    },


    /**
     * Initializes drag session in case of a mousedown event on splitter in a vertical splitpane.
     *
     * @param e {qx.legacy.event.type.MouseEvent} The event itself.
     * @return {void}
     */
    _onSplitterMouseDownY : function(e)
    {
      if (!e.isLeftButtonPressed()) {
        return;
      }

      this._commonMouseDown();

      // activate global cursor
      this.getTopLevelWidget().setGlobalCursor("row-resize");
      this._slider.addState("dragging");
      this._knob.addState("dragging");

      // initialize the drag session
      // dragStart = position of layout + mouse offset on splitter
      this._dragMin = qx.bom.element.Location.getTop(this._box.getElement(), "border");
      this._dragMax = this._dragMin + this._box.getInnerHeight() - this._splitter.getBoxHeight();
      this._dragOffset = e.getPageY() - qx.bom.element.Location.getTop(this._splitter.getElement());
    },


    /**
     * TODOC
     *
     * @return {void}
     */
    _commonMouseDown : function()
    {
      // enable capturing
      this._splitter.setCapture(true);

      // initialize the slider
      if (!this.isLiveResize())
      {
        this._slider.setLeft(this._splitter.getOffsetLeft());
        this._slider.setTop(this._splitter.getOffsetTop());
        this._slider.setWidth(this._splitter.getBoxWidth());
        this._slider.setHeight(this._splitter.getBoxHeight());

        this._slider.show();
      }
    },


    /**
     * Move the splitter in case of a mousemove event on splitter in a horizontal splitpane.
     *
     * @param e {qx.legacy.event.type.MouseEvent} The event itself.
     * @return {void}
     */
    _onSplitterMouseMoveX : function(e)
    {
      if (!this._splitter.getCapture()) {
        return;
      }

      this.isLiveResize() ? this._syncX(e) : this._slider._renderRuntimeLeft(this._normalizeX(e));
      e.preventDefault();
    },


    /**
     * Move the splitter in case of a mousemove event on splitter in a vertical splitpane.
     *
     * @param e {qx.legacy.event.type.MouseEvent} The event itself.
     * @return {void}
     */
    _onSplitterMouseMoveY : function(e)
    {
      if (!this._splitter.getCapture()) {
        return;
      }

      this.isLiveResize() ? this._syncY(e) : this._slider._renderRuntimeTop(this._normalizeY(e));
      e.preventDefault();
    },


    /**
     * Ends the drag session and computes the new dimensions of panes in case of a mouseup event on splitter in a horizontal splitpane.
     *
     * @param e {qx.legacy.event.type.MouseEvent} The event itself.
     * @return {void}
     */
    _onSplitterMouseUpX : function(e)
    {
      if (!this._splitter.getCapture()) {
        return;
      }

      if (!this.isLiveResize()) {
        this._syncX(e);
      }

      this._commonMouseUp();
    },


    /**
     * Ends the drag session and computes the new dimensions of panes in case of a mouseup event on splitter in a vertical splitpane.
     *
     * @param e {qx.legacy.event.type.MouseEvent} The event itself.
     * @return {void}
     */
    _onSplitterMouseUpY : function(e)
    {
      if (!this._splitter.getCapture()) {
        return;
      }

      if (!this.isLiveResize()) {
        this._syncY(e);
      }

      this._commonMouseUp();
    },


    /**
     * TODOC
     *
     * @return {void}
     */
    _commonMouseUp : function()
    {
      // hide helpers
      this._slider.hide();

      // disable capturing
      this._splitter.setCapture(false);

      // reset the global cursor
      this.getTopLevelWidget().setGlobalCursor(null);

      // cleanup dragsession
      this._slider.removeState("dragging");
      this._knob.removeState("dragging");
    },


    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {void}
     */
    _syncX : function(e)
    {
      var first = this._normalizeX(e);
      var second = this._box.getInnerWidth() - this._splitter.getBoxWidth() - first;

      this._syncCommon(first, second);
    },


    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {void}
     */
    _syncY : function(e)
    {
      var first = this._normalizeY(e);
      var second = this._box.getInnerHeight() - this._splitter.getBoxHeight() - first;

      this._syncCommon(first, second);
    },


    /**
     * TODOC
     *
     * @param first {var} TODOC
     * @param second {var} TODOC
     * @return {void}
     */
    _syncCommon : function(first, second)
    {
      this.setFirstSize(first + "*");
      this.setSecondSize(second + "*");
    },


    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {var} TODOC
     */
    _normalizeX : function(e) {
      return qx.lang.Number.limit(e.getPageX() - this._dragOffset, this._dragMin, this._dragMax) - this._dragMin;
    },


    /**
     * TODOC
     *
     * @param e {Event} TODOC
     * @return {var} TODOC
     */
    _normalizeY : function(e) {
      return qx.lang.Number.limit(e.getPageY() - this._dragOffset, this._dragMin, this._dragMax) - this._dragMin;
    }

  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("_box", "_firstArea", "_secondArea", "_splitter", "_slider", "_knob");
  }
});
