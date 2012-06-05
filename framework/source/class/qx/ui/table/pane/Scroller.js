/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Til Schneider (til132)
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * Shows a whole meta column. This includes a {@link Header},
 * a {@link Pane} and the needed scroll bars. This class handles the
 * virtual scrolling and does all the mouse event handling.
 *
 * @childControl header {qx.ui.table.pane.Header} header pane
 * @childControl pane {qx.ui.table.pane.Pane} table pane to show the data
 * @childControl focus-indicator {qx.ui.table.pane.FocusIndicator} shows the current focused cell
 * @childControl resize-line {qx.ui.core.Widget} resize line widget
 * @childControl scrollbar-x {qx.ui.core.scroll.ScrollBar?qx.ui.core.scroll.NativeScrollBar}
 *               horizontal scrollbar widget (depends on the "qx.nativeScrollBars" setting which implementation is used)
 * @childControl scrollbar-y {qx.ui.core.scroll.ScrollBar?qx.ui.core.scroll.NativeScrollBar}
 *               vertical scrollbar widget (depends on the "qx.nativeScrollBars" setting which implementation is used)
 */
qx.Class.define("qx.ui.table.pane.Scroller",
{
  extend : qx.ui.core.Widget,
  include : qx.core.Environment.filter({
      "true"        : qx.ui.core.scroll.MScrollBarFactory,
      "event.touch" : qx.ui.core.scroll.MTouchScroll
    }),



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param table {qx.ui.table.Table} the table the scroller belongs to.
   */
  construct : function(table)
  {
    this.base(arguments);

    this.__table = table;

    // init layout
    var grid = new qx.ui.layout.Grid();
    grid.setColumnFlex(0, 1);
    grid.setRowFlex(1, 1);
    this._setLayout(grid);

    // init child controls
    this.__header = this._showChildControl("header");
    this.__tablePane = this._showChildControl("pane");

    // the top line containing the header clipper and the top right widget
    this.__top = new qx.ui.container.Composite(new qx.ui.layout.HBox()).set({
      minWidth: 0
    });
    this._add(this.__top, {row: 0, column: 0, colSpan: 2});

    // embed header into a scrollable container
    this.__headerClipper = new qx.ui.table.pane.Clipper();
    this.__headerClipper.add(this.__header);
    this.__headerClipper.addListener("losecapture", this._onChangeCaptureHeader, this);
    this.__headerClipper.addListener("mousemove", this._onMousemoveHeader, this);
    this.__headerClipper.addListener("mousedown", this._onMousedownHeader, this);
    this.__headerClipper.addListener("mouseup", this._onMouseupHeader, this);
    this.__headerClipper.addListener("click", this._onClickHeader, this);
    this.__top.add(this.__headerClipper, {flex: 1});

    // embed pane into a scrollable container
    this.__paneClipper = new qx.ui.table.pane.Clipper();
    this.__paneClipper.add(this.__tablePane);
    this.__paneClipper.addListener("mousewheel", this._onMousewheel, this);
    this.__paneClipper.addListener("mousemove", this._onMousemovePane, this);
    this.__paneClipper.addListener("mousedown", this._onMousedownPane, this);
    this.__paneClipper.addListener("mouseup", this._onMouseupPane, this);
    this.__paneClipper.addListener("click", this._onClickPane, this);
    this.__paneClipper.addListener("contextmenu", this._onContextMenu, this);
    this.__paneClipper.addListener("dblclick", this._onDblclickPane, this);
    this.__paneClipper.addListener("resize", this._onResizePane, this);

    // if we have overlayed scroll bars, we should use a separate container
    if (qx.core.Environment.get("os.scrollBarOverlayed")) {
      this.__clipperContainer = new qx.ui.container.Composite();
      this.__clipperContainer.setLayout(new qx.ui.layout.Canvas());
      this.__clipperContainer.add(this.__paneClipper, {edge: 0});
      this._add(this.__clipperContainer, {row: 1, column: 0});
    } else {
      this._add(this.__paneClipper, {row: 1, column: 0});
    }

    // init scroll bars
    this.__horScrollBar = this._showChildControl("scrollbar-x");
    this.__verScrollBar = this._showChildControl("scrollbar-y");

    // init focus indicator
    this.__focusIndicator = this.getChildControl("focus-indicator");
    // need to run the apply method at least once [BUG #4057]
    this.initShowCellFocusIndicator();

    // force creation of the resize line
    this.getChildControl("resize-line").hide();

    this.addListener("mouseout", this._onMouseout, this);
    this.addListener("appear", this._onAppear, this);
    this.addListener("disappear", this._onDisappear, this);

    this.__timer = new qx.event.Timer();
    this.__timer.addListener("interval", this._oninterval, this);
    this.initScrollTimeout();

  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {

    /** {int} The minimum width a column could get in pixels. */
    MIN_COLUMN_WIDTH         : 10,

    /** {int} The radius of the resize region in pixels. */
    RESIZE_REGION_RADIUS     : 5,


    /**
     * (int) The number of pixels the mouse may move between mouse down and mouse up
     * in order to count as a click.
     */
    CLICK_TOLERANCE          : 5,


    /**
     * (int) The mask for the horizontal scroll bar.
     * May be combined with {@link #VERTICAL_SCROLLBAR}.
     *
     * @see #getNeededScrollBars
     */
    HORIZONTAL_SCROLLBAR     : 1,


    /**
     * (int) The mask for the vertical scroll bar.
     * May be combined with {@link #HORIZONTAL_SCROLLBAR}.
     *
     * @see #getNeededScrollBars
     */
    VERTICAL_SCROLLBAR       : 2
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  events :
  {
    /** Dispatched if the pane is scolled horizontally */
    "changeScrollY" : "qx.event.type.Data",

    /** Dispatched if the pane is scrolled vertically */
    "changeScrollX" : "qx.event.type.Data",

    /**See {@link qx.ui.table.Table#cellClick}.*/
    "cellClick" : "qx.ui.table.pane.CellEvent",

    /*** See {@link qx.ui.table.Table#cellDblclick}.*/
    "cellDblclick" : "qx.ui.table.pane.CellEvent",

    /**See {@link qx.ui.table.Table#cellContextmenu}.*/
    "cellContextmenu" : "qx.ui.table.pane.CellEvent",

    /** Dispatched when a sortable header was clicked */
    "beforeSort" : "qx.event.type.Data"
  },





  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {

    /** Whether to show the horizontal scroll bar */
    horizontalScrollBarVisible :
    {
      check : "Boolean",
      init : false,
      apply : "_applyHorizontalScrollBarVisible",
      event : "changeHorizontalScrollBarVisible"
    },

    /** Whether to show the vertical scroll bar */
    verticalScrollBarVisible :
    {
      check : "Boolean",
      init : false,
      apply : "_applyVerticalScrollBarVisible",
      event : "changeVerticalScrollBarVisible"
    },

    /** The table pane model. */
    tablePaneModel :
    {
      check : "qx.ui.table.pane.Model",
      apply : "_applyTablePaneModel",
      event : "changeTablePaneModel"
    },


    /**
     * Whether column resize should be live. If false, during resize only a line is
     * shown and the real resize happens when the user releases the mouse button.
     */
    liveResize :
    {
      check : "Boolean",
      init : false
    },


    /**
     * Whether the focus should moved when the mouse is moved over a cell. If false
     * the focus is only moved on mouse clicks.
     */
    focusCellOnMouseMove :
    {
      check : "Boolean",
      init : false
    },


    /**
     * Whether to handle selections via the selection manager before setting the
     * focus.  The traditional behavior is to handle selections after setting the
     * focus, but setting the focus means redrawing portions of the table, and
     * some subclasses may want to modify the data to be displayed based on the
     * selection.
     */
    selectBeforeFocus :
    {
      check : "Boolean",
      init : false
    },


    /**
     * Whether the cell focus indicator should be shown
     */
    showCellFocusIndicator :
    {
      check : "Boolean",
      init : true,
      apply : "_applyShowCellFocusIndicator"
    },


    /**
     * By default, the "cellContextmenu" event is fired only when a data cell
     * is right-clicked. It is not fired when a right-click occurs in the
     * empty area of the table below the last data row. By turning on this
     * property, "cellContextMenu" events will also be generated when a
     * right-click occurs in that empty area. In such a case, row identifier
     * in the event data will be null, so event handlers can check (row ===
     * null) to handle this case.
     */
    contextMenuFromDataCellsOnly :
    {
      check : "Boolean",
      init : true
    },


    /**
     * Whether to reset the selection when a header cell is clicked. Since
     * most data models do not have provisions to retain a selection after
     * sorting, the default is to reset the selection in this case. Some data
     * models, however, do have the capability to retain the selection, so
     * when using those, this property should be set to false.
     */
    resetSelectionOnHeaderClick :
    {
      check : "Boolean",
      init : true
    },


    /**
     * Interval time (in milliseconds) for the table update timer.
     * Setting this to 0 clears the timer.
     */
    scrollTimeout :
    {
      check : "Integer",
      init : 100,
      apply : "_applyScrollTimeout"
    },


    appearance :
    {
      refine : true,
      init : "table-scroller"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __lastRowCount : null,
    __table : null,

    __updateInterval : null,
    __updateContentPlanned : null,
    __onintervalWrapper : null,

    __moveColumn : null,
    __lastMoveColPos : null,
    __lastMoveTargetX : null,
    __lastMoveTargetScroller : null,
    __lastMoveMousePageX : null,

    __resizeColumn : null,
    __lastResizeMousePageX : null,
    __lastResizeWidth : null,

    __lastMouseDownCell : null,
    __firedClickEvent : false,
    __ignoreClick : null,
    __lastMousePageX : null,
    __lastMousePageY : null,

    __focusedCol : null,
    __focusedRow : null,

    __cellEditor : null,
    __cellEditorFactory : null,

    __topRightWidget : null,
    __horScrollBar : null,
    __verScrollBar : null,
    __header : null,
    __headerClipper : null,
    __tablePane : null,
    __paneClipper : null,
    __clipperContainer : null,
    __focusIndicator : null,
    __top : null,

    __timer : null,


    /**
     * The right inset of the pane. The right inset is the maximum of the
     * top right widget width and the scrollbar width (if visible).
     *
     * @return {Integer} The right inset of the pane
     */
    getPaneInsetRight : function()
    {
      var topRight = this.getTopRightWidget();
      var topRightWidth =
        topRight && topRight.isVisible() && topRight.getBounds() ?
          topRight.getBounds().width + topRight.getMarginLeft() + topRight.getMarginRight() :
          0;

      var scrollBar = this.__verScrollBar;
      var scrollBarWidth = this.getVerticalScrollBarVisible() ?
        this.getVerticalScrollBarWidth() + scrollBar.getMarginLeft() + scrollBar.getMarginRight() :
        0;

      return Math.max(topRightWidth, scrollBarWidth);
    },


    /**
     * Set the pane's width
     *
     * @param width {Integer} The pane's width
     */
    setPaneWidth : function(width)
    {
      if (this.isVerticalScrollBarVisible()) {
        width += this.getPaneInsetRight();
      }
      this.setWidth(width);
    },


    // overridden
    _createChildControlImpl : function(id, hash)
    {
      var control;

      switch(id)
      {
        case "header":
          control = (this.getTable().getNewTablePaneHeader())(this);
          break;

        case "pane":
          control = (this.getTable().getNewTablePane())(this);
          break;

        case "focus-indicator":
          control = new qx.ui.table.pane.FocusIndicator(this);
          control.setUserBounds(0, 0, 0, 0);
          control.setZIndex(1000);
          control.addListener("mouseup", this._onMouseupFocusIndicator, this);
          this.__paneClipper.add(control);
          control.show();             // must be active for editor to operate
          control.setDecorator(null); // it can be initially invisible, though.
          break;

        case "resize-line":
          control = new qx.ui.core.Widget();
          control.setUserBounds(0, 0, 0, 0);
          control.setZIndex(1000);
          this.__paneClipper.add(control);
          break;

        case "scrollbar-x":
          control = this._createScrollBar("horizontal").set({
            alignY: "bottom"
          });
          control.addListener("scroll", this._onScrollX, this);

          if (this.__clipperContainer != null) {
            control.setMinHeight(qx.bom.element.Overflow.DEFAULT_SCROLLBAR_WIDTH);
            this.__clipperContainer.add(control, {bottom: 0, right: 0, left: 0});
          } else {
            this._add(control, {row: 2, column: 0});
          }
          break;

        case "scrollbar-y":
          control = this._createScrollBar("vertical");
          control.addListener("scroll", this._onScrollY, this);

          if (this.__clipperContainer != null) {
            this.__clipperContainer.add(control, {right: 0, bottom: 0, top: 0});
          } else {
            this._add(control, {row: 1, column: 1});
          }
          break;
      }

      return control || this.base(arguments, id);
    },


    // property modifier
    _applyHorizontalScrollBarVisible : function(value, old) {
      this.__horScrollBar.setVisibility(value ? "visible" : "excluded");
    },


    // property modifier
    _applyVerticalScrollBarVisible : function(value, old) {
      this.__verScrollBar.setVisibility(value ? "visible" : "excluded");
    },


    // property modifier
    _applyTablePaneModel : function(value, old)
    {
      if (old != null) {
        old.removeListener("modelChanged", this._onPaneModelChanged, this);
      }

      value.addListener("modelChanged", this._onPaneModelChanged, this);
    },


    // property modifier
    _applyShowCellFocusIndicator : function(value, old)
    {
      if(value) {
        this.__focusIndicator.setDecorator("table-scroller-focus-indicator");
        this._updateFocusIndicator();
      }
      else {
        if(this.__focusIndicator) {
          this.__focusIndicator.setDecorator(null);
        }
      }
    },


    /**
     * Get the current position of the vertical scroll bar.
     *
     * @return {Integer} The current scroll position.
     */
    getScrollY : function() {
      return this.__verScrollBar.getPosition();
    },


    /**
     * Set the current position of the vertical scroll bar.
     *
     * @param scrollY {Integer} The new scroll position.
     * @param renderSync {Boolean?false} Whether the table update should be
     *     performed synchonously.
     */
    setScrollY : function(scrollY, renderSync)
    {
      this.__verScrollBar.scrollTo(scrollY);
      if (renderSync) {
        this._updateContent();
      }
    },


    /**
     * Get the current position of the vertical scroll bar.
     *
     * @return {Integer} The current scroll position.
     */
    getScrollX : function() {
      return this.__horScrollBar.getPosition();
    },


    /**
     * Set the current position of the vertical scroll bar.
     *
     * @param scrollX {Integer} The new scroll position.
     */
    setScrollX : function(scrollX) {
      this.__horScrollBar.scrollTo(scrollX);
    },


    /**
     * Returns the table this scroller belongs to.
     *
     * @return {qx.ui.table.Table} the table.
     */
    getTable : function() {
      return this.__table;
    },


    /**
     * Event handler. Called when the visibility of a column has changed.
     */
    onColVisibilityChanged : function()
    {
      this.updateHorScrollBarMaximum();
      this._updateFocusIndicator();
    },


    /**
     * Sets the column width.
     *
     * @param col {Integer} the column to change the width for.
     * @param width {Integer} the new width.
     * @return {void}
     */
    setColumnWidth : function(col, width)
    {
      this.__header.setColumnWidth(col, width);
      this.__tablePane.setColumnWidth(col, width);

      var paneModel = this.getTablePaneModel();
      var x = paneModel.getX(col);

      if (x != -1)
      {
        // The change was in this scroller
        this.updateHorScrollBarMaximum();
        this._updateFocusIndicator();
      }
    },


    /**
     * Event handler. Called when the column order has changed.
     *
     * @return {void}
     */
    onColOrderChanged : function()
    {
      this.__header.onColOrderChanged();
      this.__tablePane.onColOrderChanged();

      this.updateHorScrollBarMaximum();
    },


    /**
     * Event handler. Called when the table model has changed.
     *
     * @param firstRow {Integer} The index of the first row that has changed.
     * @param lastRow {Integer} The index of the last row that has changed.
     * @param firstColumn {Integer} The model index of the first column that has changed.
     * @param lastColumn {Integer} The model index of the last column that has changed.
     */
    onTableModelDataChanged : function(firstRow, lastRow, firstColumn, lastColumn)
    {
      this.__tablePane.onTableModelDataChanged(firstRow, lastRow, firstColumn, lastColumn);
      var rowCount = this.getTable().getTableModel().getRowCount();

      if (rowCount != this.__lastRowCount)
      {
        this.updateVerScrollBarMaximum();

        if (this.getFocusedRow() >= rowCount)
        {
          if (rowCount == 0) {
            this.setFocusedCell(null, null);
          } else {
            this.setFocusedCell(this.getFocusedColumn(), rowCount - 1);
          }
        }
        this.__lastRowCount = rowCount;
      }
    },


    /**
     * Event handler. Called when the selection has changed.
     */
    onSelectionChanged : function() {
      this.__tablePane.onSelectionChanged();
    },


    /**
     * Event handler. Called when the table gets or looses the focus.
     */
    onFocusChanged : function() {
      this.__tablePane.onFocusChanged();
    },


    /**
     * Event handler. Called when the table model meta data has changed.
     *
     * @return {void}
     */
    onTableModelMetaDataChanged : function()
    {
      this.__header.onTableModelMetaDataChanged();
      this.__tablePane.onTableModelMetaDataChanged();
    },


    /**
     * Event handler. Called when the pane model has changed.
     */
    _onPaneModelChanged : function()
    {
      this.__header.onPaneModelChanged();
      this.__tablePane.onPaneModelChanged();
    },


    /**
     * Event listener for the pane clipper's resize event
     */
    _onResizePane : function()
    {
      this.updateHorScrollBarMaximum();
      this.updateVerScrollBarMaximum();

      // The height has changed -> Update content
      this._updateContent();
      this.__header._updateContent();
      this.__table._updateScrollBarVisibility();
    },


    /**
     * Updates the maximum of the horizontal scroll bar, so it corresponds to the
     * total width of the columns in the table pane.
     */
    updateHorScrollBarMaximum : function()
    {
      var paneSize = this.__paneClipper.getInnerSize();
      if (!paneSize) {
        // will be called on the next resize event again
        return;
      }
      var scrollSize = this.getTablePaneModel().getTotalWidth();

      var scrollBar = this.__horScrollBar;

      if (paneSize.width < scrollSize)
      {
        var max = Math.max(0, scrollSize - paneSize.width);

        scrollBar.setMaximum(max);
        scrollBar.setKnobFactor(paneSize.width / scrollSize);

        var pos = scrollBar.getPosition();
        scrollBar.setPosition(Math.min(pos, max));
      }
      else
      {
        scrollBar.setMaximum(0);
        scrollBar.setKnobFactor(1);
        scrollBar.setPosition(0);
      }
    },


    /**
     * Updates the maximum of the vertical scroll bar, so it corresponds to the
     * number of rows in the table.
     */
    updateVerScrollBarMaximum : function()
    {
      var paneSize = this.__paneClipper.getInnerSize();
      if (!paneSize) {
        // will be called on the next resize event again
        return;
      }

      var tableModel = this.getTable().getTableModel();
      var rowCount = tableModel.getRowCount();

      if (this.getTable().getKeepFirstVisibleRowComplete()) {
        rowCount += 1;
      }

      var rowHeight = this.getTable().getRowHeight();
      var scrollSize = rowCount * rowHeight;
      var scrollBar = this.__verScrollBar;

      if (paneSize.height < scrollSize)
      {
        var max = Math.max(0, scrollSize - paneSize.height);

        scrollBar.setMaximum(max);
        scrollBar.setKnobFactor(paneSize.height / scrollSize);

        var pos = scrollBar.getPosition();
        scrollBar.setPosition(Math.min(pos, max));
      }
      else
      {
        scrollBar.setMaximum(0);
        scrollBar.setKnobFactor(1);
        scrollBar.setPosition(0);
      }
    },


    /**
     * Event handler. Called when the table property "keepFirstVisibleRowComplete"
     * changed.
     */
    onKeepFirstVisibleRowCompleteChanged : function()
    {
      this.updateVerScrollBarMaximum();
      this._updateContent();
    },


    /**
     * Event handler for the scroller's appear event
     */
    _onAppear : function() {
      // after the Scroller appears we start the interval again
      this._startInterval(this.getScrollTimeout());
    },


    /**
     * Event handler for the disappear event
     */
    _onDisappear : function()
    {
      // before the scroller disappears we need to stop it
      this._stopInterval();
    },


    /**
     * Event handler. Called when the horizontal scroll bar moved.
     *
     * @param e {Map} the event.
     * @return {void}
     */
    _onScrollX : function(e)
    {
      var scrollLeft = e.getData();

      this.fireDataEvent("changeScrollX", scrollLeft, e.getOldData());
      this.__headerClipper.scrollToX(scrollLeft);
      this.__paneClipper.scrollToX(scrollLeft);
    },


    /**
     * Event handler. Called when the vertical scroll bar moved.
     *
     * @param e {Map} the event.
     * @return {void}
     */
    _onScrollY : function(e)
    {
      this.fireDataEvent("changeScrollY", e.getData(), e.getOldData());
      this._postponedUpdateContent();
    },


    /**
     * Event handler. Called when the user moved the mouse wheel.
     *
     * @param e {Map} the event.
     * @return {void}
     */
    _onMousewheel : function(e)
    {
      var table = this.getTable();

      if (!table.getEnabled()) {
        return;
      }

      // vertical scrolling
      var delta = e.getWheelDelta("y");
      // normalize that at least one step is scrolled at a time
      if (delta > 0 && delta < 1) {
        delta = 1;
      } else if (delta < 0 && delta > -1) {
        delta = -1;
      }
      this.__verScrollBar.scrollBySteps(delta);

      // horizontal scrolling
      delta = e.getWheelDelta("x");
      // normalize that at least one step is scrolled at a time
      if (delta > 0 && delta < 1) {
        delta = 1;
      } else if (delta < 0 && delta > -1) {
        delta = -1;
      }
      this.__horScrollBar.scrollBySteps(delta);

      // Update the focus
      if (this.__lastMousePageX && this.getFocusCellOnMouseMove()) {
        this._focusCellAtPagePos(this.__lastMousePageX, this.__lastMousePageY);
      }

      var position = this.__verScrollBar.getPosition();
      var max = this.__verScrollBar.getMaximum();
      // pass the event to the parent if the scrollbar is at an edge
      if (delta < 0 && position <= 0 || delta > 0 && position >= max) {
        return;
      }

      e.stop();
    },


    /**
     * Common column resize logic.
     *
     * @param pageX {Integer} the current mouse x position.
     * @return {void}
     */
    __handleResizeColumn : function(pageX)
    {
      var table = this.getTable();
      // We are currently resizing -> Update the position
      var headerCell = this.__header.getHeaderWidgetAtColumn(this.__resizeColumn);
      var minColumnWidth = headerCell.getSizeHint().minWidth;

      var newWidth = Math.max(minColumnWidth, this.__lastResizeWidth + pageX - this.__lastResizeMousePageX);

      if (this.getLiveResize()) {
        var columnModel = table.getTableColumnModel();
        columnModel.setColumnWidth(this.__resizeColumn, newWidth, true);
      } else {
        this.__header.setColumnWidth(this.__resizeColumn, newWidth, true);

        var paneModel = this.getTablePaneModel();
        this._showResizeLine(paneModel.getColumnLeft(this.__resizeColumn) + newWidth);
      }

      this.__lastResizeMousePageX += newWidth - this.__lastResizeWidth;
      this.__lastResizeWidth = newWidth;
    },


    /**
     * Common column move logic.
     *
     * @param pageX {Integer} the current mouse x position.
     * @return {void}
     *
     */
    __handleMoveColumn : function(pageX)
    {
      // We are moving a column

      // Check whether we moved outside the click tolerance so we can start
      // showing the column move feedback
      // (showing the column move feedback prevents the onclick event)
      var clickTolerance = qx.ui.table.pane.Scroller.CLICK_TOLERANCE;
      if (this.__header.isShowingColumnMoveFeedback()
        || pageX > this.__lastMoveMousePageX + clickTolerance
        || pageX < this.__lastMoveMousePageX - clickTolerance)
      {
        this.__lastMoveColPos += pageX - this.__lastMoveMousePageX;

        this.__header.showColumnMoveFeedback(this.__moveColumn, this.__lastMoveColPos);

        // Get the responsible scroller
        var targetScroller = this.__table.getTablePaneScrollerAtPageX(pageX);
        if (this.__lastMoveTargetScroller && this.__lastMoveTargetScroller != targetScroller) {
          this.__lastMoveTargetScroller.hideColumnMoveFeedback();
        }
        if (targetScroller != null) {
          this.__lastMoveTargetX = targetScroller.showColumnMoveFeedback(pageX);
        } else {
          this.__lastMoveTargetX = null;
        }

        this.__lastMoveTargetScroller = targetScroller;
        this.__lastMoveMousePageX = pageX;
      }
    },


    /**
     * Event handler. Called when the user moved the mouse over the header.
     *
     * @param e {Map} the event.
     * @return {void}
     */
    _onMousemoveHeader : function(e)
    {
      var table = this.getTable();

      if (! table.getEnabled()) {
        return;
      }

      var useResizeCursor = false;
      var mouseOverColumn = null;

      var pageX = e.getDocumentLeft();
      var pageY = e.getDocumentTop();

      // Workaround: In onmousewheel the event has wrong coordinates for pageX
      //       and pageY. So we remember the last move event.
      this.__lastMousePageX = pageX;
      this.__lastMousePageY = pageY;

      if (this.__resizeColumn != null)
      {
        // We are currently resizing -> Update the position
        this.__handleResizeColumn(pageX);
        useResizeCursor = true;
        e.stopPropagation();
      }
      else if (this.__moveColumn != null)
      {
        // We are moving a column
        this.__handleMoveColumn(pageX);
        e.stopPropagation();
      }
      else
      {
        var resizeCol = this._getResizeColumnForPageX(pageX);
        if (resizeCol != -1)
        {
          // The mouse is over a resize region -> Show the right cursor
          useResizeCursor = true;
        }
        else
        {
          var tableModel = table.getTableModel();
          var col = this._getColumnForPageX(pageX);
          if (col != null && tableModel.isColumnSortable(col)) {
            mouseOverColumn = col;
          }
        }
      }

      var cursor = useResizeCursor ? "col-resize" : null;
      this.getApplicationRoot().setGlobalCursor(cursor);
      this.setCursor(cursor);
      this.__header.setMouseOverColumn(mouseOverColumn);
    },


    /**
     * Event handler. Called when the user moved the mouse over the pane.
     *
     * @param e {Map} the event.
     * @return {void}
     */
    _onMousemovePane : function(e)
    {
      var table = this.getTable();

      if (! table.getEnabled()) {
        return;
      }

      //var useResizeCursor = false;

      var pageX = e.getDocumentLeft();
      var pageY = e.getDocumentTop();

      // Workaround: In onmousewheel the event has wrong coordinates for pageX
      //       and pageY. So we remember the last move event.
      this.__lastMousePageX = pageX;
      this.__lastMousePageY = pageY;

      var row = this._getRowForPagePos(pageX, pageY);
      if (row != null && this._getColumnForPageX(pageX) != null) {
        // The mouse is over the data -> update the focus
        if (this.getFocusCellOnMouseMove()) {
          this._focusCellAtPagePos(pageX, pageY);
        }
      }
      this.__header.setMouseOverColumn(null);
    },


    /**
     * Event handler. Called when the user pressed a mouse button over the header.
     *
     * @param e {Map} the event.
     * @return {void}
     */
    _onMousedownHeader : function(e)
    {
      if (! this.getTable().getEnabled()) {
        return;
      }

      var pageX = e.getDocumentLeft();

      // mouse is in header
      var resizeCol = this._getResizeColumnForPageX(pageX);
      if (resizeCol != -1)
      {
        // The mouse is over a resize region -> Start resizing
        this._startResizeHeader(resizeCol, pageX);
        e.stop();
      }
      else
      {
        // The mouse is not in a resize region
        var moveCol = this._getColumnForPageX(pageX);
        if (moveCol != null)
        {
          this._startMoveHeader(moveCol, pageX);
          e.stop();
        }
      }
    },


    /**
     * Start a resize session of the header.
     *
     * @param resizeCol {Integer} the column index
     * @param pageX {Integer} x coordinate of the mouse event
     * @return {void}
     */
    _startResizeHeader : function(resizeCol, pageX)
    {
      var columnModel = this.getTable().getTableColumnModel();

      // The mouse is over a resize region -> Start resizing
      this.__resizeColumn = resizeCol;
      this.__lastResizeMousePageX = pageX;
      this.__lastResizeWidth = columnModel.getColumnWidth(this.__resizeColumn);
      this.__headerClipper.capture();
    },


    /**
     * Start a move session of the header.
     *
     * @param moveCol {Integer} the column index
     * @param pageX {Integer} x coordinate of the mouse event
     * @return {void}
     */
    _startMoveHeader : function(moveCol, pageX)
    {
      // Prepare column moving
      this.__moveColumn = moveCol;
      this.__lastMoveMousePageX = pageX;
      this.__lastMoveColPos = this.getTablePaneModel().getColumnLeft(moveCol);
      this.__headerClipper.capture();
    },



    /**
     * Event handler. Called when the user pressed a mouse button over the pane.
     *
     * @param e {Map} the event.
     * @return {void}
     */
    _onMousedownPane : function(e)
    {
      var table = this.getTable();

      if (! table.getEnabled()) {
        return;
      }

      if (table.isEditing()) {
        table.stopEditing();
      }

      var pageX = e.getDocumentLeft();
      var pageY = e.getDocumentTop();
      var row = this._getRowForPagePos(pageX, pageY);
      var col = this._getColumnForPageX(pageX);

      if (row !== null)
      {
        // The focus indicator blocks the click event on the scroller so we
        // store the current cell and listen for the mouseup event on the
        // focus indicator
        //
        // INVARIANT:
        //  The members of this object always contain the last position of
        //  the cell on which the mousedown event occurred.
        //  *** These values are never cleared! ***.
        //  Different browsers/OS combinations issue events in different
        //  orders, and the context menu event, in particular, can be issued
        //  early or late (Firefox on Linux issues it early; Firefox on
        //  Windows issues it late) so no one may clear these values.
        //
        this.__lastMouseDownCell = {
          row : row,
          col : col
        };

        // On the other hand, we need to know if we've issued the click event
        // so we don't issue it twice, both from mouse-up on the focus
        // indicator, and from the click even on the pane. Both possibilities
        // are necessary, however, to maintain the qooxdoo order of events.
        this.__firedClickEvent = false;

        var selectBeforeFocus = this.getSelectBeforeFocus();

        if (selectBeforeFocus) {
          table.getSelectionManager().handleMouseDown(row, e);
        }

        // The mouse is over the data -> update the focus
        if (! this.getFocusCellOnMouseMove()) {
          this._focusCellAtPagePos(pageX, pageY);
        }

        if (! selectBeforeFocus) {
          table.getSelectionManager().handleMouseDown(row, e);
        }
      }
    },


    /**
     * Event handler for the focus indicator's mouseup event
     *
     * @param e {qx.event.type.Mouse} The mouse event
     */
    _onMouseupFocusIndicator : function(e)
    {
      if (this.__lastMouseDownCell &&
          !this.__firedClickEvent &&
          !this.isEditing() &&
          this.__focusIndicator.getRow() == this.__lastMouseDownCell.row &&
          this.__focusIndicator.getColumn() == this.__lastMouseDownCell.col)
      {
        this.fireEvent("cellClick",
                       qx.ui.table.pane.CellEvent,
                       [
                         this,
                         e,
                         this.__lastMouseDownCell.row,
                         this.__lastMouseDownCell.col
                       ],
                       true);
        this.__firedClickEvent = true;
      } else if (!this.isEditing()) {
        // if no cellClick event should be fired, act like a mousedown which
        // invokes the change of the selection e.g. [BUG #1632]
        this._onMousedownPane(e);
      }
    },


    /**
     * Event handler. Called when the event capturing of the header changed.
     * Stops/finishes an active header resize/move session if it lost capturing
     * during the session to stay in a stable state.
     *
     * @param e {qx.event.type.Data} The data event
     */
    _onChangeCaptureHeader : function(e)
    {
      if (this.__resizeColumn != null) {
        this._stopResizeHeader();
      }

      if (this.__moveColumn != null) {
        this._stopMoveHeader();
      }
    },


    /**
     * Stop a resize session of the header.
     *
     * @return {void}
     */
    _stopResizeHeader : function()
    {
      var columnModel = this.getTable().getTableColumnModel();

      // We are currently resizing -> Finish resizing
      if (! this.getLiveResize()) {
        this._hideResizeLine();
        columnModel.setColumnWidth(this.__resizeColumn,
                                   this.__lastResizeWidth,
                                   true);
      }

      this.__resizeColumn = null;
      this.__headerClipper.releaseCapture();

      this.getApplicationRoot().setGlobalCursor(null);
      this.setCursor(null);

      // handle edit cell if available
      if (this.isEditing()) {
        var height = this.__cellEditor.getBounds().height;
        this.__cellEditor.setUserBounds(0, 0, this.__lastResizeWidth, height);
      }
    },


    /**
     * Stop a move session of the header.
     *
     * @return {void}
     */
    _stopMoveHeader : function()
    {
      var columnModel = this.getTable().getTableColumnModel();
      var paneModel = this.getTablePaneModel();

      // We are moving a column -> Drop the column
      this.__header.hideColumnMoveFeedback();
      if (this.__lastMoveTargetScroller) {
        this.__lastMoveTargetScroller.hideColumnMoveFeedback();
      }

      if (this.__lastMoveTargetX != null)
      {
        var fromVisXPos = paneModel.getFirstColumnX() + paneModel.getX(this.__moveColumn);
        var toVisXPos = this.__lastMoveTargetX;
        if (toVisXPos != fromVisXPos && toVisXPos != fromVisXPos + 1)
        {
          // The column was really moved to another position
          // (and not moved before or after itself, which is a noop)

          // Translate visible positions to overall positions
          var fromCol = columnModel.getVisibleColumnAtX(fromVisXPos);
          var toCol   = columnModel.getVisibleColumnAtX(toVisXPos);
          var fromOverXPos = columnModel.getOverallX(fromCol);
          var toOverXPos = (toCol != null) ? columnModel.getOverallX(toCol) : columnModel.getOverallColumnCount();

          if (toOverXPos > fromOverXPos) {
            // Don't count the column itself
            toOverXPos--;
          }

          // Move the column
          columnModel.moveColumn(fromOverXPos, toOverXPos);

          // update the focus indicator including the editor
          this._updateFocusIndicator();
        }
      }

      this.__moveColumn = null;
      this.__lastMoveTargetX = null;
      this.__headerClipper.releaseCapture();
    },


    /**
     * Event handler. Called when the user released a mouse button over the pane.
     *
     * @param e {Map} the event.
     * @return {void}
     */
    _onMouseupPane : function(e)
    {
      var table = this.getTable();

      if (! table.getEnabled()) {
        return;
      }

      var row = this._getRowForPagePos(e.getDocumentLeft(), e.getDocumentTop());
      if (row != -1 && row != null && this._getColumnForPageX(e.getDocumentLeft()) != null) {
        table.getSelectionManager().handleMouseUp(row, e);
      }
    },


    /**
     * Event handler. Called when the user released a mouse button over the header.
     *
     * @param e {Map} the event.
     * @return {void}
     */
    _onMouseupHeader : function(e)
    {
      var table = this.getTable();

      if (! table.getEnabled()) {
        return;
      }

      if (this.__resizeColumn != null)
      {
        this._stopResizeHeader();
        this.__ignoreClick = true;
        e.stop();
      }
      else if (this.__moveColumn != null)
      {
        this._stopMoveHeader();
        e.stop();
      }
    },


    /**
     * Event handler. Called when the user clicked a mouse button over the header.
     *
     * @param e {Map} the event.
     * @return {void}
     */
    _onClickHeader : function(e)
    {
      if (this.__ignoreClick)
      {
        this.__ignoreClick = false;
        return;
      }

      var table = this.getTable();

      if (!table.getEnabled()) {
        return;
      }

      var tableModel = table.getTableModel();

      var pageX = e.getDocumentLeft();

      var resizeCol = this._getResizeColumnForPageX(pageX);

      if (resizeCol == -1)
      {
        // mouse is not in a resize region
        var col = this._getColumnForPageX(pageX);

        if (col != null && tableModel.isColumnSortable(col))
        {
          // Sort that column
          var sortCol = tableModel.getSortColumnIndex();
          var ascending = (col != sortCol) ? true : !tableModel.isSortAscending();

          var data =
            {
              column     : col,
              ascending  : ascending,
              clickEvent : e
            };

          if (this.fireDataEvent("beforeSort", data, null, true))
          {
            // Stop cell editing
            if (table.isEditing()) {
              table.stopEditing();
            }

            tableModel.sortByColumn(col, ascending);
            if (this.getResetSelectionOnHeaderClick())
            {
              table.getSelectionModel().resetSelection();
            }
          }
        }
      }

      e.stop();
    },


    /**
     * Event handler. Called when the user clicked a mouse button over the pane.
     *
     * @param e {Map} the event.
     * @return {void}
     */
    _onClickPane : function(e)
    {
      var table = this.getTable();

      if (!table.getEnabled()) {
        return;
      }

      var pageX = e.getDocumentLeft();
      var pageY = e.getDocumentTop();
      var row = this._getRowForPagePos(pageX, pageY);
      var col = this._getColumnForPageX(pageX);

      if (row != null && col != null)
      {
        table.getSelectionManager().handleClick(row, e);

        if (this.__focusIndicator.isHidden() ||
            (this.__lastMouseDownCell &&
             !this.__firedClickEvent &&
             !this.isEditing() &&
             row == this.__lastMouseDownCell.row &&
             col == this.__lastMouseDownCell.col))
        {
          this.fireEvent("cellClick",
                         qx.ui.table.pane.CellEvent,
                         [this, e, row, col],
                         true);
          this.__firedClickEvent = true;
        }
      }
    },


    /**
     * Event handler. Called when a context menu is invoked in a cell.
     *
     * @param e {qx.event.type.Mouse} the event.
     * @return {void}
     */
    _onContextMenu : function(e)
    {
      var pageX = e.getDocumentLeft();
      var pageY = e.getDocumentTop();
      var row = this._getRowForPagePos(pageX, pageY);
      var col = this._getColumnForPageX(pageX);

      /*
       * The 'row' value will be null if the right-click was in the blank
       * area below the last data row. Some applications desire to receive
       * the context menu event anyway, and can set the property value of
       * contextMenuFromDataCellsOnly to false to achieve that.
       */
      if (row === null && this.getContextMenuFromDataCellsOnly())
      {
        return;
      }

      if (! this.getShowCellFocusIndicator() ||
          row === null ||
          (this.__lastMouseDownCell &&
           row == this.__lastMouseDownCell.row &&
           col == this.__lastMouseDownCell.col))
      {
        this.fireEvent("cellContextmenu",
                       qx.ui.table.pane.CellEvent,
                       [this, e, row, col],
                       true);

        // Now that the cellContextmenu handler has had a chance to build
        // the menu for this cell, display it (if there is one).
        var menu = this.getTable().getContextMenu();
        if (menu)
        {
          // A menu with no children means don't display any context menu
          // including the default context menu even if the default context
          // menu is allowed to be displayed normally. There's no need to
          // actually show an empty menu, though.
          if (menu.getChildren().length > 0) {
            menu.openAtMouse(e);
          }
          else
          {
            menu.exclude();
          }

          // Do not show native menu
          e.preventDefault();
        }
      }
    },


    // overridden
    _onContextMenuOpen : function(e)
    {
      // This is Widget's context menu handler which typically retrieves
      // and displays the menu as soon as it receives a "contextmenu" event.
      // We want to allow the cellContextmenu handler to create the menu,
      // so we'll override this method with a null one, and do the menu
      // placement and display handling in our _onContextMenu method.
    },


    /**
     * Event handler. Called when the user double clicked a mouse button over the pane.
     *
     * @param e {Map} the event.
     * @return {void}
     */
    _onDblclickPane : function(e)
    {
      var pageX = e.getDocumentLeft();
      var pageY = e.getDocumentTop();


      this._focusCellAtPagePos(pageX, pageY);
      this.startEditing();

      var row = this._getRowForPagePos(pageX, pageY);
      if (row != -1 && row != null) {
        this.fireEvent("cellDblclick", qx.ui.table.pane.CellEvent, [this, e, row], true);
      }
    },


    /**
     * Event handler. Called when the mouse moved out.
     *
     * @param e {Map} the event.
     * @return {void}
     */
    _onMouseout : function(e)
    {
      var table = this.getTable();

      if (!table.getEnabled()) {
        return;
      }

      // Reset the resize cursor when the mouse leaves the header
      // If currently a column is resized then do nothing
      // (the cursor will be reset on mouseup)
      if (this.__resizeColumn == null)
      {
        this.setCursor(null);
        this.getApplicationRoot().setGlobalCursor(null);
      }

      this.__header.setMouseOverColumn(null);

      // in case the focus follows the mouse, it should be remove on mouseout
      if (this.getFocusCellOnMouseMove()) {
        this.__table.setFocusedCell();
      }
    },


    /**
     * Shows the resize line.
     *
     * @param x {Integer} the position where to show the line (in pixels, relative to
     *      the left side of the pane).
     * @return {void}
     */
    _showResizeLine : function(x)
    {
      var resizeLine = this._showChildControl("resize-line");

      var width = resizeLine.getWidth();
      var paneBounds = this.__paneClipper.getBounds();
      resizeLine.setUserBounds(
        x - Math.round(width/2), 0, width, paneBounds.height
      );
    },


    /**
     * Hides the resize line.
     */
    _hideResizeLine : function() {
      this._excludeChildControl("resize-line");
    },


    /**
     * Shows the feedback shown while a column is moved by the user.
     *
     * @param pageX {Integer} the x position of the mouse in the page (in pixels).
     * @return {Integer} the visible x position of the column in the whole table.
     */
    showColumnMoveFeedback : function(pageX)
    {
      var paneModel = this.getTablePaneModel();
      var columnModel = this.getTable().getTableColumnModel();
      var paneLeft = this.__tablePane.getContainerLocation().left;
      var colCount = paneModel.getColumnCount();

      var targetXPos = 0;
      var targetX = 0;
      var currX = paneLeft;

      for (var xPos=0; xPos<colCount; xPos++)
      {
        var col = paneModel.getColumnAtX(xPos);
        var colWidth = columnModel.getColumnWidth(col);

        if (pageX < currX + colWidth / 2) {
          break;
        }

        currX += colWidth;
        targetXPos = xPos + 1;
        targetX = currX - paneLeft;
      }

      // Ensure targetX is visible
      var scrollerLeft = this.__paneClipper.getContainerLocation().left;
      var scrollerWidth = this.__paneClipper.getBounds().width;
      var scrollX = scrollerLeft - paneLeft;

      // NOTE: +2/-1 because of feedback width
      targetX = qx.lang.Number.limit(targetX, scrollX + 2, scrollX + scrollerWidth - 1);

      this._showResizeLine(targetX);

      // Return the overall target x position
      return paneModel.getFirstColumnX() + targetXPos;
    },


    /**
     * Hides the feedback shown while a column is moved by the user.
     */
    hideColumnMoveFeedback : function() {
      this._hideResizeLine();
    },


    /**
     * Sets the focus to the cell that's located at the page position
     * <code>pageX</code>/<code>pageY</code>. If there is no cell at that position,
     * nothing happens.
     *
     * @param pageX {Integer} the x position in the page (in pixels).
     * @param pageY {Integer} the y position in the page (in pixels).
     * @return {void}
     */
    _focusCellAtPagePos : function(pageX, pageY)
    {
      var row = this._getRowForPagePos(pageX, pageY);

      if (row != -1 && row != null)
      {
        // The mouse is over the data -> update the focus
        var col = this._getColumnForPageX(pageX);
        this.__table.setFocusedCell(col, row);
      }
    },


    /**
     * Sets the currently focused cell.
     *
     * @param col {Integer} the model index of the focused cell's column.
     * @param row {Integer} the model index of the focused cell's row.
     * @return {void}
     */
    setFocusedCell : function(col, row)
    {
      if (!this.isEditing())
      {
        this.__tablePane.setFocusedCell(col, row, this.__updateContentPlanned);

        this.__focusedCol = col;
        this.__focusedRow = row;

        this._updateFocusIndicator();
      }
    },


    /**
     * Returns the column of currently focused cell.
     *
     * @return {Integer} the model index of the focused cell's column.
     */
    getFocusedColumn : function() {
      return this.__focusedCol;
    },


    /**
     * Returns the row of currently focused cell.
     *
     * @return {Integer} the model index of the focused cell's column.
     */
    getFocusedRow : function() {
      return this.__focusedRow;
    },


    /**
     * Scrolls a cell visible.
     *
     * @param col {Integer} the model index of the column the cell belongs to.
     * @param row {Integer} the model index of the row the cell belongs to.
     * @return {void}
     */
    scrollCellVisible : function(col, row)
    {
      var paneModel = this.getTablePaneModel();
      var xPos = paneModel.getX(col);

      if (xPos != -1)
      {
        var clipperSize = this.__paneClipper.getInnerSize();
        if (!clipperSize) {
          return;
        }

        var columnModel = this.getTable().getTableColumnModel();

        var colLeft = paneModel.getColumnLeft(col);
        var colWidth = columnModel.getColumnWidth(col);
        var rowHeight = this.getTable().getRowHeight();
        var rowTop = row * rowHeight;

        var scrollX = this.getScrollX();
        var scrollY = this.getScrollY();

        // NOTE: We don't use qx.lang.Number.limit, because min should win if max < min
        var minScrollX = Math.min(colLeft, colLeft + colWidth - clipperSize.width);
        var maxScrollX = colLeft;
        this.setScrollX(Math.max(minScrollX, Math.min(maxScrollX, scrollX)));

        var minScrollY = rowTop + rowHeight - clipperSize.height;

        if (this.getTable().getKeepFirstVisibleRowComplete()) {
          minScrollY += rowHeight;
        }

        var maxScrollY = rowTop;
        this.setScrollY(Math.max(minScrollY, Math.min(maxScrollY, scrollY)), true);
      }
    },


    /**
     * Returns whether currently a cell is editing.
     *
     * @return {var} whether currently a cell is editing.
     */
    isEditing : function() {
      return this.__cellEditor != null;
    },


    /**
     * Starts editing the currently focused cell. Does nothing if already
     * editing, if the column is not editable, or if the cell editor for the
     * column ascertains that the particular cell is not editable.
     *
     * @return {Boolean} whether editing was started
     */
    startEditing : function()
    {
      var table = this.getTable();
      var tableModel = table.getTableModel();
      var col = this.__focusedCol;

      if (
        !this.isEditing() &&
        (col != null) &&
        tableModel.isColumnEditable(col)
      ) {
        var row = this.__focusedRow;
        var xPos = this.getTablePaneModel().getX(col);
        var value = tableModel.getValue(col, row);

        // scroll cell into view
        this.scrollCellVisible(xPos, row);

        this.__cellEditorFactory = table.getTableColumnModel().getCellEditorFactory(col);

        var cellInfo =
        {
          col   : col,
          row   : row,
          xPos  : xPos,
          value : value,
          table : table
        };

        // Get a cell editor
        this.__cellEditor = this.__cellEditorFactory.createCellEditor(cellInfo);

        // We handle two types of cell editors: the traditional in-place
        // editor, where the cell editor returned by the factory must fit in
        // the space of the table cell; and a modal window in which the
        // editing takes place.  Additionally, if the cell editor determines
        // that it does not want to edit the particular cell being requested,
        // it may return null to indicate that that cell is not editable.
        if (this.__cellEditor === null)
        {
          // This cell is not editable even though its column is.
          return false;
        }
        else if (this.__cellEditor instanceof qx.ui.window.Window)
        {
          // It's a window.  Ensure that it's modal.
          this.__cellEditor.setModal(true);

          // At least for the time being, we disallow the close button.  It
          // acts differently than a cellEditor.close(), and invokes a bug
          // someplace.  Modal window cell editors should provide their own
          // buttons or means to activate a cellEditor.close() or equivalently
          // cellEditor.hide().
          this.__cellEditor.setShowClose(false);

          // Arrange to be notified when it is closed.
          this.__cellEditor.addListener(
            "close",
            this._onCellEditorModalWindowClose,
            this);

          // If there's a pre-open function defined for the table...
          var f = table.getModalCellEditorPreOpenFunction();
          if (f != null) {
            f(this.__cellEditor, cellInfo);
          }

          // Open it now.
          this.__cellEditor.open();
        }
        else
        {
          // The cell editor is a traditional in-place editor.
          var size = this.__focusIndicator.getInnerSize();
          this.__cellEditor.setUserBounds(0, 0, size.width, size.height);

          // prevent click event from bubbling up to the table
          this.__focusIndicator.addListener("mousedown", function(e)
          {
            this.__lastMouseDownCell = {
              row : this.__focusedRow,
              col : this.__focusedCol
            };
            e.stopPropagation();
          }, this);

          this.__focusIndicator.add(this.__cellEditor);
          this.__focusIndicator.addState("editing");
          this.__focusIndicator.setKeepActive(false);

          // Make the focus indicator visible during editing
          this.__focusIndicator.setDecorator("table-scroller-focus-indicator");

          this.__cellEditor.focus();
          this.__cellEditor.activate();
        }

        return true;
      }

      return false;
    },


    /**
     * Stops editing and writes the editor's value to the model.
     */
    stopEditing : function()
    {
      // If the focus indicator is not being shown normally...
      if (! this.getShowCellFocusIndicator())
      {
        // ... then hide it again
        this.__focusIndicator.setDecorator(null);
      }

      this.flushEditor();
      this.cancelEditing();
    },


    /**
     * Writes the editor's value to the model.
     */
    flushEditor : function()
    {
      if (this.isEditing())
      {
        var value = this.__cellEditorFactory.getCellEditorValue(this.__cellEditor);
        var oldValue = this.getTable().getTableModel().getValue(this.__focusedCol, this.__focusedRow);
        this.getTable().getTableModel().setValue(this.__focusedCol, this.__focusedRow, value);

        this.__table.focus();

        // Fire an event containing the value change.
        this.__table.fireDataEvent("dataEdited",
                                   {
                                     row      : this.__focusedRow,
                                     col      : this.__focusedCol,
                                     oldValue : oldValue,
                                     value    : value
                                   });
      }
    },


    /**
     * Stops editing without writing the editor's value to the model.
     */
    cancelEditing : function()
    {
      if (this.isEditing() && ! this.__cellEditor.pendingDispose)
      {
        if (this._cellEditorIsModalWindow)
        {
          this.__cellEditor.destroy();
          this.__cellEditor = null;
          this.__cellEditorFactory = null;
          this.__cellEditor.pendingDispose = true;
        }
        else
        {
          this.__focusIndicator.removeState("editing");
          this.__focusIndicator.setKeepActive(true);
          this.__cellEditor.destroy();
          this.__cellEditor = null;
          this.__cellEditorFactory = null;
        }
      }
    },


    /**
     * Event handler. Called when the modal window of the cell editor closes.
     *
     * @param e {Map} the event.
     * @return {void}
     */
    _onCellEditorModalWindowClose : function(e) {
      this.stopEditing();
    },


    /**
     * Returns the model index of the column the mouse is over or null if the mouse
     * is not over a column.
     *
     * @param pageX {Integer} the x position of the mouse in the page (in pixels).
     * @return {Integer} the model index of the column the mouse is over.
     */
    _getColumnForPageX : function(pageX)
    {
      var columnModel = this.getTable().getTableColumnModel();
      var paneModel = this.getTablePaneModel();
      var colCount = paneModel.getColumnCount();
      var currX = this.__tablePane.getContentLocation().left;

      for (var x=0; x<colCount; x++)
      {
        var col = paneModel.getColumnAtX(x);
        var colWidth = columnModel.getColumnWidth(col);
        currX += colWidth;

        if (pageX < currX) {
          return col;
        }
      }

      return null;
    },


    /**
     * Returns the model index of the column that should be resized when dragging
     * starts here. Returns -1 if the mouse is in no resize region of any column.
     *
     * @param pageX {Integer} the x position of the mouse in the page (in pixels).
     * @return {Integer} the column index.
     */
    _getResizeColumnForPageX : function(pageX)
    {
      var columnModel = this.getTable().getTableColumnModel();
      var paneModel = this.getTablePaneModel();
      var colCount = paneModel.getColumnCount();
      var currX = this.__header.getContainerLocation().left;
      var regionRadius = qx.ui.table.pane.Scroller.RESIZE_REGION_RADIUS;

      for (var x=0; x<colCount; x++)
      {
        var col = paneModel.getColumnAtX(x);
        var colWidth = columnModel.getColumnWidth(col);
        currX += colWidth;

        if (pageX >= (currX - regionRadius) && pageX <= (currX + regionRadius)) {
          return col;
        }
      }

      return -1;
    },


    /**
     * Returns the model index of the row the mouse is currently over. Returns -1 if
     * the mouse is over the header. Returns null if the mouse is not over any
     * column.
     *
     * @param pageX {Integer} the mouse x position in the page.
     * @param pageY {Integer} the mouse y position in the page.
     * @return {Integer} the model index of the row the mouse is currently over.
     */
    _getRowForPagePos : function(pageX, pageY)
    {
      var panePos = this.__tablePane.getContentLocation();

      if (pageX < panePos.left || pageX > panePos.right)
      {
        // There was no cell or header cell hit
        return null;
      }

      if (pageY >= panePos.top && pageY <= panePos.bottom)
      {
        // This event is in the pane -> Get the row
        var rowHeight = this.getTable().getRowHeight();

        var scrollY = this.__verScrollBar.getPosition();

        if (this.getTable().getKeepFirstVisibleRowComplete()) {
          scrollY = Math.floor(scrollY / rowHeight) * rowHeight;
        }

        var tableY = scrollY + pageY - panePos.top;
        var row = Math.floor(tableY / rowHeight);

        var tableModel = this.getTable().getTableModel();
        var rowCount = tableModel.getRowCount();

        return (row < rowCount) ? row : null;
      }

      var headerPos = this.__header.getContainerLocation();

      if (
        pageY >= headerPos.top &&
        pageY <= headerPos.bottom &&
        pageX <= headerPos.right)
      {
        // This event is in the pane -> Return -1 for the header
        return -1;
      }

      return null;
    },


    /**
     * Sets the widget that should be shown in the top right corner.
     *
     * The widget will not be disposed, when this table scroller is disposed. So the
     * caller has to dispose it.
     *
     * @param widget {qx.ui.core.Widget} The widget to set. May be null.
     * @return {void}
     */
    setTopRightWidget : function(widget)
    {
      var oldWidget = this.__topRightWidget;

      if (oldWidget != null) {
        this.__top.remove(oldWidget);
      }

      if (widget != null) {
        this.__top.add(widget);
      }

      this.__topRightWidget = widget;
    },


    /**
     * Get the top right widget
     *
     * @return {qx.ui.core.Widget} The top right widget.
     */
    getTopRightWidget : function() {
      return this.__topRightWidget;
    },


    /**
     * Returns the header.
     *
     * @return {qx.ui.table.pane.Header} the header.
     */
    getHeader : function() {
      return this.__header;
    },


    /**
     * Returns the table pane.
     *
     * @return {qx.ui.table.pane.Pane} the table pane.
     */
    getTablePane : function() {
      return this.__tablePane;
    },


    /**
     * Get the rendered width of the vertical scroll bar. The return value is
     * <code>0</code> if the scroll bar is invisible or not yet rendered.
     *
     * @internal
     * @return {Integer} The width of the vertical scroll bar
     */
    getVerticalScrollBarWidth : function()
    {
      var scrollBar = this.__verScrollBar;
      return scrollBar.isVisible() ? (scrollBar.getSizeHint().width || 0) : 0;
    },


    /**
     * Returns which scrollbars are needed.
     *
     * @param forceHorizontal {Boolean ? false} Whether to show the horizontal
     *      scrollbar always.
     * @param preventVertical {Boolean ? false} Whether to show the vertical scrollbar
     *      never.
     * @return {Integer} which scrollbars are needed. This may be any combination of
     *      {@link #HORIZONTAL_SCROLLBAR} or {@link #VERTICAL_SCROLLBAR}
     *      (combined by OR).
     */
    getNeededScrollBars : function(forceHorizontal, preventVertical)
    {
      var verScrollBar = this.__verScrollBar;
      var verBarWidth = verScrollBar.getSizeHint().width
        + verScrollBar.getMarginLeft() + verScrollBar.getMarginRight();

      var horScrollBar = this.__horScrollBar;
      var horBarHeight = horScrollBar.getSizeHint().height
        + horScrollBar.getMarginTop() + horScrollBar.getMarginBottom();

      // Get the width and height of the view (without scroll bars)
      var clipperSize = this.__paneClipper.getInnerSize();
      var viewWidth = clipperSize ? clipperSize.width : 0;

      if (this.getVerticalScrollBarVisible()) {
        viewWidth += verBarWidth;
      }

      var viewHeight = clipperSize ? clipperSize.height : 0;

      if (this.getHorizontalScrollBarVisible()) {
        viewHeight += horBarHeight;
      }

      var tableModel = this.getTable().getTableModel();
      var rowCount = tableModel.getRowCount();

      // Get the (virtual) width and height of the pane
      var paneWidth = this.getTablePaneModel().getTotalWidth();
      var paneHeight = this.getTable().getRowHeight() * rowCount;

      // Check which scrollbars are needed
      var horNeeded = false;
      var verNeeded = false;

      if (paneWidth > viewWidth) {
        horNeeded = true;

        if (paneHeight > viewHeight - horBarHeight) {
          verNeeded = true;
        }
      } else if (paneHeight > viewHeight) {
        verNeeded = true;

        if (!preventVertical && (paneWidth > viewWidth - verBarWidth)) {
          horNeeded = true;
        }
      }

      // Create the mask
      var horBar = qx.ui.table.pane.Scroller.HORIZONTAL_SCROLLBAR;
      var verBar = qx.ui.table.pane.Scroller.VERTICAL_SCROLLBAR;
      return ((forceHorizontal || horNeeded) ? horBar : 0) | ((preventVertical || !verNeeded) ? 0 : verBar);
    },


    /**
     * Return the pane clipper. It is sometimes required for special activities
     * such as tracking events for drag&drop.
     *
     * @return {qx.ui.table.pane.Clipper}
     *   The pane clipper for this scroller.
     */
    getPaneClipper : function()
    {
      return this.__paneClipper;
    },

    // property apply method
    _applyScrollTimeout : function(value, old) {
      this._startInterval(value);
    },


    /**
     * Starts the current running interval
     *
     * @param timeout {Integer} The timeout between two table updates
     */
    _startInterval : function (timeout)
    {
      this.__timer.setInterval(timeout);
      this.__timer.start();
    },


    /**
     * stops the current running interval
     */
    _stopInterval : function ()
    {
      this.__timer.stop();
    },


    /**
     * Does a postponed update of the content.
     *
     * @see #_updateContent
     */
    _postponedUpdateContent : function()
    {
      //this.__updateContentPlanned = true;
      this._updateContent();
    },


    /**
     * Timer event handler. Periodically checks whether a table update is
     * required. The update interval is controlled by the {@link #scrollTimeout}
     * property.
     *
     * @signature function()
     */
    _oninterval : qx.event.GlobalError.observeMethod(function()
    {
      if (this.__updateContentPlanned && !this.__tablePane._layoutPending)
      {
        this.__updateContentPlanned = false;
        this._updateContent();
      }
    }),


    /**
     * Updates the content. Sets the right section the table pane should show and
     * does the scrolling.
     */
    _updateContent : function()
    {
      var paneSize = this.__paneClipper.getInnerSize();
      if (!paneSize) {
        return;
      }
      var paneHeight = paneSize.height;

      var scrollX = this.__horScrollBar.getPosition();
      var scrollY = this.__verScrollBar.getPosition();
      var rowHeight = this.getTable().getRowHeight();

      var firstRow = Math.floor(scrollY / rowHeight);
      var oldFirstRow = this.__tablePane.getFirstVisibleRow();
      this.__tablePane.setFirstVisibleRow(firstRow);

      var visibleRowCount = Math.ceil(paneHeight / rowHeight);
      var paneOffset = 0;
      var firstVisibleRowComplete = this.getTable().getKeepFirstVisibleRowComplete();

      if (!firstVisibleRowComplete)
      {

        // NOTE: We don't consider paneOffset, because this may cause alternating
        //       adding and deleting of one row when scrolling. Instead we add one row
        //       in every case.
        visibleRowCount++;

        paneOffset = scrollY % rowHeight;
      }

      this.__tablePane.setVisibleRowCount(visibleRowCount);

      if (firstRow != oldFirstRow) {
        this._updateFocusIndicator();
      }

      this.__paneClipper.scrollToX(scrollX);

      // Avoid expensive calls to setScrollTop if
      // scrolling is not needed
      if (! firstVisibleRowComplete ) {
        this.__paneClipper.scrollToY(paneOffset);
      }
    },

    /**
     * Updates the location and the visibility of the focus indicator.
     *
     * @return {void}
     */
    _updateFocusIndicator : function()
    {
      var table = this.getTable();

      if (!table.getEnabled()) {
        return;
      }

      this.__focusIndicator.moveToCell(this.__focusedCol, this.__focusedRow);
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._stopInterval();

    // this object was created by the table on init so we have to clean it up.
    var tablePaneModel = this.getTablePaneModel();
    if (tablePaneModel)
    {
      tablePaneModel.dispose();
    }

    this.__lastMouseDownCell = this.__topRightWidget = this.__table = null;
    this._disposeObjects("__horScrollBar", "__verScrollBar",
                         "__headerClipper", "__paneClipper", "__focusIndicator",
                         "__header", "__tablePane", "__top", "__timer",
                         "__clipperContainer");
  }
});
