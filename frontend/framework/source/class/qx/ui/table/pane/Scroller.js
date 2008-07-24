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

************************************************************************ */

/**
 * Shows a whole meta column. This includes a {@link TablePaneHeader},
 * a {@link TablePane} and the needed scroll bars. This class handles the
 * virtual scrolling and does all the mouse event handling.
 *
 * @appearance table-focus-indicator {qx.ui.core.Widget}
 */
qx.Class.define("qx.ui.table.pane.Scroller",
{
  extend : qx.ui.core.Widget,




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

    this._table = table;

    // init layout
    var grid = new qx.ui.layout.Grid();
    grid.setColumnFlex(0, 1);
    grid.setRowFlex(1, 1);
    this._setLayout(grid);

    // init child controls
    this._horScrollBar = this._showChildControl("scrollbar-x");
    this._verScrollBar = this._showChildControl("scrollbar-y");
    this._header = this._showChildControl("header");
    this._tablePane = this._showChildControl("pane");
    this._focusIndicator = this._getChildControl("focus-indicator");

    // embed header into a scrollable container
    this._headerClipper = new qx.ui.core.ScrollPane();
    this._headerClipper.add(this._header);
    this._headerClipper.addListener("losecapture", this._onChangeCaptureHeader, this);
    this._headerClipper.addListener("mousemove", this._onMousemoveHeader, this);
    this._headerClipper.addListener("mousedown", this._onMousedownHeader, this);
    this._headerClipper.addListener("mouseup", this._onMouseupHeader, this);
    this._headerClipper.addListener("click", this._onClickHeader, this);
    this._add(this._headerClipper, {row: 0, column: 0});

    // embed pane into a scrollable container
    this._paneClipper = new qx.ui.core.ScrollPane();
    this._paneClipper.add(this._tablePane);
    this._paneClipper.addListener("mousewheel", this._onMousewheel, this);
    this._paneClipper.addListener("mousemove", this._onMousemovePane, this);
    this._paneClipper.addListener("mousedown", this._onMousedownPane, this);
    this._paneClipper.addListener("mouseup", this._onMouseupPane, this);
    this._paneClipper.addListener("click", this._onClickPane, this);
    this._paneClipper.addListener("contextmenu", this._onContextMenu, this);
    this._paneClipper.addListener("dblclick", this._onDblclickPane, this);
    this._add(this._paneClipper, {row: 1, column: 0});


    // force creation of the resize line
    this._getChildControl("resize-line");
    this._excludeChildControl("resize-line");

    this.addListener("mouseout", this._onMouseout, this);
    this.addListener("resize", this._onResize, this);
    this.addListener("appear", this._onAppear, this);
    this.addListener("disappear", this._onDisappear, this);

    // Set up wrapper if required
    if (!this._onintervalWrapper) {
      this._onintervalWrapper = qx.lang.Function.bind(this._oninterval, this);
    }

    this.initScrollTimeout();
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {

    /** {int} The minimum width a colum could get in pixels. */
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
    "changeScrollY" : "qx.event.type.ChangeEvent",

    /** Dispatched if the pane is scrolled vertically */
    "changeScrollX" : "qx.event.type.ChangeEvent",

    /**See {@link qx.ui.table.Table#cellClick}.*/
    "cellClick" : "qx.ui.table.pane.CellEvent",

    /*** See {@link qx.ui.table.Table#cellDblclick}.*/
    "cellDblclick" : "qx.ui.table.pane.CellEvent",

    /**See {@link qx.ui.table.Table#cellContextmenu}.*/
    "cellContextmenu" : "qx.ui.table.pane.CellEvent"
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
      init : true,
      apply : "_applyHorizontalScrollBarVisible",
      event : "changeHorizontalScrollBarVisible"
    },

    /** Whether to show the vertical scroll bar */
    verticalScrollBarVisible :
    {
      check : "Boolean",
      init : true,
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
    // overridden
    _createChildControlImpl : function(id)
    {
      var control;

      switch(id)
      {
        case "header":
          control = this.getTable().getNewTablePaneHeader()(this);
          break;

        case "pane":
          control = this.getTable().getNewTablePane()(this);
          break;

        case "focus-indicator":
          control = new qx.ui.table.pane.FocusIndicator(this);
          control.setUserBounds(0, 0, 0, 0);
          control.setZIndex(1000);
          control.addListener("mouseup", this._onMouseupFocusIndicator, this);
          this._add(control);
          control.exclude();
          break;

        case "resize-line":
          control = new qx.ui.core.Widget();
          control.setUserBounds(0, 0, 0, 0);
          control.setZIndex(1000);
          this._add(control);
          break;

        case "scrollbar-x":
          control = new qx.ui.core.ScrollBar("horizontal");
          control.addListener("scroll", this._onScrollX, this);
          this._add(control, {row: 2, column: 0});
          break;

        case "scrollbar-y":
          control = new qx.ui.core.ScrollBar("vertical");
          control.addListener("scroll", this._onScrollY, this);
          this._add(control, {row: 1, column: 1});
          break;
      }

      return control || this.base(arguments, id);
    },


    // property modifier
    _applyHorizontalScrollBarVisible : function(value, old)
    {
      this._horScrollBar.setVisibility(value ? "visible" : "excluded");
      if (!value) {
        this.setScrollY(0, true);
      }
      this._updateContent();
    },


    // property modifier
    _applyVerticalScrollBarVisible : function(value, old)
    {
      this._verScrollBar.setVisibility(value ? "visible" : "exclude");
      if (!value) {
        this.setScrollX(0);
      }
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
        this._updateFocusIndicator();
      }
      else {
        if(this._focusIndicator) {
          this._focusIndicator.hide();
        }
      }
    },


    /**
     * Get the current position of the vertical scroll bar.
     *
     * @return {Integer} The current scroll position.
     */
    getScrollY : function() {
      return this._verScrollBar.getPosition();
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
      this._ignoreScrollYEvent = renderSync;
      this._verScrollBar.scrollTo(scrollY);
      if (renderSync) {
        this._updateContent()
      }
      this._ignoreScrollYEvent = false;
    },


    /**
     * Get the current position of the vertical scroll bar.
     *
     * @return {Integer} The current scroll position.
     */
    getScrollX : function() {
      return this._horScrollBar.getPosition();
    },


    /**
     * Set the current position of the vertical scroll bar.
     *
     * @param scrollX {Integer} The new scroll position.
     */
    setScrollX : function(scrollX) {
      this._horScrollBar.scrollTo(scrollX);
    },


    /**
     * Returns the table this scroller belongs to.
     *
     * @return {qx.ui.table.Table} the table.
     */
    getTable : function() {
      return this._table;
    },


    getPaneClipper : function() {
      return this._paneClipper;
    },


    /**
     * Event handler. Called when the visibility of a column has changed.
     */
    onColVisibilityChanged : function()
    {
      this._updateHorScrollBarMaximum();
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
      this._header.setColumnWidth(col, width);
      this._tablePane.setColumnWidth(col, width);

      var paneModel = this.getTablePaneModel();
      var x = paneModel.getX(col);

      if (x != -1)
      {
        // The change was in this scroller
        this._updateHorScrollBarMaximum();
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
      this._header.onColOrderChanged();
      this._tablePane.onColOrderChanged();

      this._updateHorScrollBarMaximum();
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
      this._tablePane.onTableModelDataChanged(firstRow, lastRow, firstColumn, lastColumn);
      var rowCount = this.getTable().getTableModel().getRowCount();

      if (rowCount != this._lastRowCount)
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
        this._lastRowCount = rowCount;
      }
    },


    /**
     * Event handler. Called when the selection has changed.
     */
    onSelectionChanged : function() {
      this._tablePane.onSelectionChanged();
    },


    /**
     * Event handler. Called when the table gets or looses the focus.
     */
    onFocusChanged : function()
    {
      this._tablePane.onFocusChanged();
    },


    /**
     * Event handler. Called when the table model meta data has changed.
     *
     * @return {void}
     */
    onTableModelMetaDataChanged : function()
    {
      this._header.onTableModelMetaDataChanged();
      this._tablePane.onTableModelMetaDataChanged();
    },


    /**
     * Event handler. Called when the pane model has changed.
     *
     * @param evt {Map} the event.
     * @return {void}
     */
    _onPaneModelChanged : function()
    {
      this._header.onPaneModelChanged();
      this._tablePane.onPaneModelChanged();
    },


    /**
     * Updates the maximum of the horizontal scroll bar, so it corresponds to the
     * total width of the columns in the table pane.
     */
    _updateHorScrollBarMaximum : function()
    {
      var scrollSize = this.getTablePaneModel().getTotalWidth();
      var paneSize = this._paneClipper.getBounds().width;

      if (paneSize < scrollSize)
      {
        this._horScrollBar.setMaximum(Math.max(0, scrollSize - paneSize));
        this._horScrollBar.setKnobFactor(paneSize / scrollSize);
      }
      else
      {
        this._horScrollBar.setMaximum(0);
        this._horScrollBar.setKnobFactor(1);
      }
    },


    /**
     * Updates the maximum of the vertical scroll bar, so it corresponds to the
     * number of rows in the table.
     */
    updateVerScrollBarMaximum : function()
    {
      var rowCount = this.getTable().getTableModel().getRowCount();
      var rowHeight = this.getTable().getRowHeight();

      var scrollSize = rowCount * rowHeight;
      var paneSize = this._paneClipper.getBounds().height;

      if (paneSize < scrollSize)
      {
        this._verScrollBar.setMaximum(Math.max(0, scrollSize - paneSize));
        this._verScrollBar.setKnobFactor(paneSize / scrollSize);
      }
      else
      {
        this._verScrollBar.setMaximum(0);
        this._verScrollBar.setKnobFactor(1);
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


    _onResize : function(e)
    {
      // The height has changed -> Update content
      this._updateContent();
    },


    // overridden
    _onAppear : function()
    {
      this._updateContent();
      this._header._updateContent();
      this._updateHorScrollBarMaximum();
      this.updateVerScrollBarMaximum();

      // after the Scroller appears we start the interval again
      this._startInterval();
    },


    // overridden
    _onDisappear : function()
    {
      this.base(arguments);

      // before the Scroller disappears we need to stop it
      this._stopInterval();
    },


    /**
     * Event handler. Called when the horizontal scroll bar moved.
     *
     * @param evt {Map} the event.
     * @return {void}
     */
    _onScrollX : function(evt)
    {
      var scrollLeft = evt.getData();

      this.fireDataEvent("changeScrollX", scrollLeft, evt.getOldData());
      this._headerClipper.scrollToX(scrollLeft);
      this._paneClipper.scrollToX(scrollLeft);
    },


    /**
     * Event handler. Called when the vertical scroll bar moved.
     *
     * @param evt {Map} the event.
     * @return {void}
     */
    _onScrollY : function(evt)
    {
      this.fireDataEvent("changeScrollY", evt.getData(), evt.getOldData());
      this._postponedUpdateContent();
    },


    /**
     * Event handler. Called when the user moved the mouse wheel.
     *
     * @param evt {Map} the event.
     * @return {void}
     */
    _onMousewheel : function(evt)
    {
      var table = this.getTable();

      if (!table.getEnabled()) {
        return;
      }

      this._verScrollBar.scrollTo(
        this._verScrollBar.getPosition() +
        ((evt.getWheelDelta() * 3) * table.getRowHeight())
      );

      // Update the focus
      if (this._lastMousePageX && this.getFocusCellOnMouseMove()) {
        this._focusCellAtPagePos(this._lastMousePageX, this._lastMousePageY);
      }
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
      var headerCell = this._header.getHeaderWidgetAtColumn(this._resizeColumn);
      var minColumnWidth = headerCell.getSizeHint().minWidth;

      var newWidth = Math.max(minColumnWidth, this._lastResizeWidth + pageX - this._lastResizeMousePageX);

      if (this.getLiveResize()) {
        var columnModel = table.getTableColumnModel();
        columnModel.setColumnWidth(this._resizeColumn, newWidth);
      } else {
        this._header.setColumnWidth(this._resizeColumn, newWidth);

        var paneModel = this.getTablePaneModel();
        this._showResizeLine(paneModel.getColumnLeft(this._resizeColumn) + newWidth);
      }

      this._lastResizeMousePageX += newWidth - this._lastResizeWidth;
      this._lastResizeWidth = newWidth;
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
      if (this._header.isShowingColumnMoveFeedback()
        || pageX > this._lastMoveMousePageX + clickTolerance
        || pageX < this._lastMoveMousePageX - clickTolerance)
      {
        this._lastMoveColPos += pageX - this._lastMoveMousePageX;

        this._header.showColumnMoveFeedback(this._moveColumn, this._lastMoveColPos);

        // Get the responsible scroller
        var targetScroller = this._table.getTablePaneScrollerAtPageX(pageX);
        if (this._lastMoveTargetScroller && this._lastMoveTargetScroller != targetScroller) {
          this._lastMoveTargetScroller.hideColumnMoveFeedback();
        }
        if (targetScroller != null) {
          this._lastMoveTargetX = targetScroller.showColumnMoveFeedback(pageX);
        } else {
          this._lastMoveTargetX = null;
        }

        this._lastMoveTargetScroller = targetScroller;
        this._lastMoveMousePageX = pageX;
      }
    },


    /**
     * Event handler. Called when the user moved the mouse over the header.
     *
     * @param evt {Map} the event.
     * @return {void}
     */
    _onMousemoveHeader : function(evt)
    {
      var table = this.getTable();

      if (! table.getEnabled()) {
        return;
      }

      var useResizeCursor = false;
      var mouseOverColumn = null;

      var pageX = evt.getDocumentLeft();
      var pageY = evt.getDocumentTop();

      // Workaround: In onmousewheel the event has wrong coordinates for pageX
      //       and pageY. So we remember the last move event.
      this._lastMousePageX = pageX;
      this._lastMousePageY = pageY;

      if (this._resizeColumn != null)
      {
        // We are currently resizing -> Update the position
        this.__handleResizeColumn(pageX);
        useResizeCursor = true;
      }
      else if (this._moveColumn != null)
      {
        // We are moving a column
        this.__handleMoveColumn(pageX);
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

      this.getApplicationRoot().setGlobalCursor(useResizeCursor ? "ew-resize" : null);
      this._header.setMouseOverColumn(mouseOverColumn);
    },


    /**
     * Event handler. Called when the user moved the mouse over the pane.
     *
     * @param evt {Map} the event.
     * @return {void}
     */
    _onMousemovePane : function(evt)
    {
      var table = this.getTable();

      if (! table.getEnabled()) {
        return;
      }

      //var useResizeCursor = false;

      var pageX = evt.getDocumentLeft();
      var pageY = evt.getDocumentTop();

      // Workaround: In onmousewheel the event has wrong coordinates for pageX
      //       and pageY. So we remember the last move event.
      this._lastMousePageX = pageX;
      this._lastMousePageY = pageY;

      var row = this._getRowForPagePos(pageX, pageY);
      if (row != null && this._getColumnForPageX(pageX) != null) {
        // The mouse is over the data -> update the focus
        if (this.getFocusCellOnMouseMove()) {
          this._focusCellAtPagePos(pageX, pageY);
        }
      }
      this._header.setMouseOverColumn(null);
    },


    /**
     * Event handler. Called when the user pressed a mouse button over the header.
     *
     * @param evt {Map} the event.
     * @return {void}
     */
    _onMousedownHeader : function(evt)
    {
      if (! this.getTable().getEnabled()) {
        return;
      }

      var pageX = evt.getDocumentLeft();

      // mouse is in header
      var resizeCol = this._getResizeColumnForPageX(pageX);
      if (resizeCol != -1) {
        // The mouse is over a resize region -> Start resizing
        this._startResizeHeader(resizeCol, pageX);
      } else {
        // The mouse is not in a resize region
        var moveCol = this._getColumnForPageX(pageX);
        if (moveCol != null) {
          this._startMoveHeader(moveCol, pageX);
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
      this._resizeColumn = resizeCol;
      this._lastResizeMousePageX = pageX;
      this._lastResizeWidth = columnModel.getColumnWidth(this._resizeColumn);
      this._headerClipper.capture();
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
      this._moveColumn = moveCol;
      this._lastMoveMousePageX = pageX;
      this._lastMoveColPos = this.getTablePaneModel().getColumnLeft(moveCol);
      this._headerClipper.capture();
    },



    /**
     * Event handler. Called when the user pressed a mouse button over the pane.
     *
     * @param evt {Map} the event.
     * @return {void}
     */
    _onMousedownPane : function(evt)
    {
      var table = this.getTable();

      if (! table.getEnabled()) {
        return;
      }

      if (this.isEditing()) {
        this.stopEditing();
      }

      var pageX = evt.getDocumentLeft();
      var pageY = evt.getDocumentTop();
      var row = this._getRowForPagePos(pageX, pageY);
      var col = this._getColumnForPageX(pageX);

      if (row != null && col != null)
      {
        // The focus indicagtor blocks the click event on the scroller so we
        // store the current cell and listen for the mouseup event on the
        // focus indicator
        this._lastMouseDownCell = {
          row : row,
          col : col
        };

        var selectBeforeFocus = this.getSelectBeforeFocus();

        if (selectBeforeFocus) {
          table.getSelectionManager().handleMouseDown(row, evt);
        }

        // The mouse is over the data -> update the focus
        if (! this.getFocusCellOnMouseMove())
        {
          this._focusIndicator.setAnonymous(false);
          this._focusCellAtPagePos(pageX, pageY);
        }

        if (! selectBeforeFocus) {
          table.getSelectionManager().handleMouseDown(row, evt);
        }
      }
    },


    _onMouseupFocusIndicator : function(e)
    {
      if (
        this._lastMouseDownCell &&
        this._focusIndicator.getRow() == this._lastMouseDownCell.row &&
        this._focusIndicator.getColumn() == this._lastMouseDownCell.col
      ) {
        this._lastMouseDownCell = {};

        if (this.hasListener("cellClick"))
        {
          this.dispatchEvent(new qx.ui.table.pane.CellEvent(this, "cellClick", e), true);
        }
      }
      this._focusIndicator.setAnonymous(true);
    },


    /**
     * Event handler. Called when the event capturing of the header changed.
     * Stops/finishes an active header resize/move session if it lost capturing
     * during the session to stay in a stable state.
     */
    _onChangeCaptureHeader : function(e)
    {
      if (this._resizeColumn != null && e.getData() == false) {
        this._stopResizeHeader();
      }

      if (this._moveColumn != null && e.getData() == false) {
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
        columnModel.setColumnWidth(this._resizeColumn, this._lastResizeWidth);
      }

      this._resizeColumn = null;
      this._headerClipper.releaseCapture();

      this.getApplicationRoot().setGlobalCursor(null);
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
      this._header.hideColumnMoveFeedback();
      if (this._lastMoveTargetScroller) {
        this._lastMoveTargetScroller.hideColumnMoveFeedback();
      }

      if (this._lastMoveTargetX != null) {
        var fromVisXPos = paneModel.getFirstColumnX() + paneModel.getX(this._moveColumn);
        var toVisXPos = this._lastMoveTargetX;
        if (toVisXPos != fromVisXPos && toVisXPos != fromVisXPos + 1) {
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
        }
      }

      this._moveColumn = null;
      this._lastMoveTargetX = null;
      this._headerClipper.releaseCapture();
    },


    /**
     * Event handler. Called when the user released a mouse button over the pane.
     *
     * @param evt {Map} the event.
     * @return {void}
     */
    _onMouseupPane : function(evt)
    {
      var table = this.getTable();

      if (! table.getEnabled()) {
        return;
      }

      var row = this._getRowForPagePos(evt.getDocumentLeft(), evt.getDocumentTop());
      if (row != -1 && row != null && this._getColumnForPageX(evt.getDocumentLeft()) != null) {
        table.getSelectionManager().handleMouseUp(row, evt);
      }
    },


    /**
     * Event handler. Called when the user released a mouse button over the header.
     *
     * @param evt {Map} the event.
     * @return {void}
     */
    _onMouseupHeader : function(evt)
    {
      var table = this.getTable();

      if (! table.getEnabled()) {
        return;
      }

      if (this._resizeColumn != null)
      {
        this._stopResizeHeader();
        this.__ignoreClick = true;
      }
      else if (this._moveColumn != null)
      {
        this._stopMoveHeader();
      }
    },


    /**
     * Event handler. Called when the user clicked a mouse button over the header.
     *
     * @param evt {Map} the event.
     * @return {void}
     */
    _onClickHeader : function(evt)
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

      var pageX = evt.getDocumentLeft();

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

          tableModel.sortByColumn(col, ascending);
          table.getSelectionModel().clearSelection();
        }
      }
    },


    /**
     * Event handler. Called when the user clicked a mouse button over the pane.
     *
     * @param evt {Map} the event.
     * @return {void}
     */
    _onClickPane : function(evt)
    {
      var table = this.getTable();

      if (!table.getEnabled()) {
        return;
      }

      var pageX = evt.getDocumentLeft();
      var pageY = evt.getDocumentTop();
      var row = this._getRowForPagePos(pageX, pageY);
      var col = this._getColumnForPageX(pageX);

      if (row != null && col != null)
      {
        table.getSelectionManager().handleClick(row, evt);

        if (
          this._lastMouseDownCell &&
          row == this._lastMouseDownCell.row &&
          col == this._lastMouseDownCell.col
        ) {
          this._lastMouseDownCell = {};

          if (this.hasListener("cellClick")) {
            this.dispatchEvent(new qx.ui.table.pane.CellEvent(this, "cellClick", evt), true);
          }
        }
      }
    },


    /**
     * Event handler. Called when a context menu is invoked in a cell.
     *
     * @type member
     * @param evt {qx.event.type.Mouse} the event.
     * @return {void}
     */
    _onContextMenu : function(evt)
    {
      var pageX = evt.getDocumentLeft();
      var pageY = evt.getDocumentTop();
      var row = this._getRowForPagePos(pageX, pageY);
      var col = this._getColumnForPageX(pageX);

      if (
        this._lastMouseDownCell &&
        row == this._lastMouseDownCell.row &&
        col == this._lastMouseDownCell.col
      ) {
        this._lastMouseDownCell = {};

        if (this.hasListener("cellContextmenu"))
        {
          this.dispatchEvent(new qx.ui.table.pane.CellEvent(this, "cellContextmenu", evt), true);
        }
      }
    },


    /**
     * Event handler. Called when the user double clicked a mouse button over the pane.
     *
     * @param evt {Map} the event.
     * @return {void}
     */
    _onDblclickPane : function(evt)
    {
      var pageX = evt.getDocumentLeft();
      var pageY = evt.getDocumentTop();


      this._focusCellAtPagePos(pageX, pageY);
      this.startEditing();
      if (this.hasListener("cellDblclick"))
      {
        var row = this._getRowForPagePos(pageX, pageY);
        if (row != -1 && row != null)
        {
          this.dispatchEvent(new qx.ui.table.pane.CellEvent(this, "cellDblclick", evt), true);
        }
      }
    },


    /**
     * Event handler. Called when the mouse moved out.
     *
     * @param evt {Map} the event.
     * @return {void}
     */
    _onMouseout : function(evt)
    {
      var table = this.getTable();

      if (!table.getEnabled()) {
        return;
      }

      // Reset the resize cursor when the mouse leaves the header
      // If currently a column is resized then do nothing
      // (the cursor will be reset on mouseup)
      if (this._resizeColumn == null) {
        this.getApplicationRoot().setGlobalCursor(null);
      }

      this._header.setMouseOverColumn(null);
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
      var paneBounds = this._paneClipper.getBounds();
      resizeLine.setUserBounds(
        x - Math.round(width/2), paneBounds.top, width, paneBounds.height
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
     * @type member
     * @param pageX {Integer} the x position of the mouse in the page (in pixels).
     * @return {Integer} the visible x position of the column in the whole table.
     */
    showColumnMoveFeedback : function(pageX)
    {
      var paneModel = this.getTablePaneModel();
      var columnModel = this.getTable().getTableColumnModel();
      var paneLeft = this._tablePane.getContainerLocation().left;
      var paneWidth = this._tablePane.getBounds().width;
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
      var scrollerLeft = this._paneClipper.getContainerLocation().left;
      var scrollerWidth = this._paneClipper.getBounds().width;
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

        if (col != null) {
          this._table.setFocusedCell(col, row);
        }
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
        this._tablePane.setFocusedCell(col, row, this._updateContentPlanned);

        this._focusedCol = col;
        this._focusedRow = row;

        // Move the focus indicator
        if (!this._updateContentPlanned) {
          this._updateFocusIndicator();
        }
      }
    },


    /**
     * Returns the column of currently focused cell.
     *
     * @type member
     * @return {Integer} the model index of the focused cell's column.
     */
    getFocusedColumn : function() {
      return this._focusedCol;
    },


    /**
     * Returns the row of currently focused cell.
     *
     * @type member
     * @return {Integer} the model index of the focused cell's column.
     */
    getFocusedRow : function() {
      return this._focusedRow;
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
        var columnModel = this.getTable().getTableColumnModel();

        var colLeft = paneModel.getColumnLeft(col);
        var colWidth = columnModel.getColumnWidth(col);
        var rowHeight = this.getTable().getRowHeight();
        var rowTop = row * rowHeight;

        var scrollX = this.getScrollX();
        var scrollY = this.getScrollY();

        var clipperSize = this._paneClipper.getBounds();

        // NOTE: We don't use qx.lang.Number.limit, because min should win if max < min
        var minScrollX = Math.min(colLeft, colLeft + colWidth - clipperSize.width);
        var maxScrollX = colLeft;
        this.setScrollX(Math.max(minScrollX, Math.min(maxScrollX, scrollX)));

        var minScrollY = rowTop + rowHeight - clipperSize.height;

        if (this.getTable().getKeepFirstVisibleRowComplete()) {
          minScrollY += rowHeight - 1;
        }

        var maxScrollY = rowTop;
        this.setScrollY(Math.max(minScrollY, Math.min(maxScrollY, scrollY)), true);
      }
    },


    /**
     * Returns whether currently a cell is editing.
     *
     * @type member
     * @return {var} whether currently a cell is editing.
     */
    isEditing : function() {
      return this._cellEditor != null;
    },


    /**
     * Starts editing the currently focused cell. Does nothing if already
     * editing, if the column is not editable, or if the cell editor for the
     * column ascertains that the particular cell is not editable.
     *
     * @type member
     * @return {Boolean} whether editing was started
     */
    startEditing : function()
    {
      var table = this.getTable();
      var tableModel = table.getTableModel();
      var col = this._focusedCol;

      if (!this.isEditing() &&
          (col != null) &&
          tableModel.isColumnEditable(col))
      {
        var row = this._focusedRow;
        var xPos = this.getTablePaneModel().getX(col);
        var value = tableModel.getValue(col, row);

        this._cellEditorFactory =
          table.getTableColumnModel().getCellEditorFactory(col);

        var cellInfo =
        {
          col   : col,
          row   : row,
          xPos  : xPos,
          value : value,
          table : table
        };

        // Get a cell editor
        this._cellEditor =
          this._cellEditorFactory.createCellEditor(cellInfo);

        // We handle two types of cell editors: the traditional in-place
        // editor, where the cell editor returned by the factory must fit in
        // the space of the table cell; and a modal window in which the
        // editing takes place.  Additionally, if the cell editor determines
        // that it does not want to edit the particular cell being requested,
        // it may return null to indicate that that cell is not editable.
        if (this._cellEditor === null)
        {
          // This cell is not editable even though its column is.
          return false;
        }
        else if (this._cellEditor instanceof qx.ui.window.Window)
        {
          // It's a window.  Ensure that it's modal.
          this._cellEditor.setModal(true);

          // At least for the time being, we disallow the close button.  It
          // acts differently than a cellEditor.close(), and invokes a bug
          // someplace.  Modal window cell editors should provide their own
          // buttons or means to activate a cellEditor.close() or equivalently
          // cellEditor.hide().
          this._cellEditor.setShowClose(false);

          // Add the cell editor to the document
          this._cellEditor.addToDocument();

          // Arrange to be notified when it is closed.
          this._cellEditor.addListener(
            "disappear",
            this._onCellEditorModalWindowClose,
            this
          );

          // If there's a pre-open function defined for the table...
          var f = table.getModalCellEditorPreOpenFunction();
          if (f != null)
          {
            f(this._cellEditor, cellInfo);
          }

          // Open it now.
          this._cellEditor.open();
        }
        else
        {
          // The cell editor is a traditional in-place editor.
          this._cellEditor.set(
          {
            width  : "100%",
            height : "100%"
          });

          // prevent click event from bubbling up to the table
          this._focusIndicator.addListener("mousedown", function(e) {
            e.stopPropagation();
          });

          this._focusIndicator.add(this._cellEditor);
          this._focusIndicator.addState("editing");

          // Workaround: Calling focus() directly has no effect
          qx.event.Timer.once(function()
          {
            if (this.isDisposed())
            {
              return;
            }

            this._cellEditor.focus();
          }, this, 0);
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
        var value = this._cellEditorFactory.getCellEditorValue(this._cellEditor);
        this.getTable().getTableModel().setValue(this._focusedCol, this._focusedRow, value);

        this._table.focus();
      }
    },


    /**
     * Stops editing without writing the editor's value to the model.
     */
    cancelEditing : function()
    {
      if (this.isEditing() && ! this._cellEditor.pendingDispose)
      {
        if (this._cellEditorIsModalWindow)
        {
          // Defer the actual disposing of the cell editor briefly, as there
          // may be more accesses to it for a short while after we leave this
          // function.
          qx.event.Timer.once(function()
          {
            var d = qx.ui.core.ClientDocument.getInstance();
            d.remove(this._cellEditor);

            this._cellEditor.removeListener(
              "disappear",
              this._onCellEditorModalWindowClose,
              this
            );

            this._cellEditor.dispose();
            this._cellEditor = null;
            this._cellEditorFactory = null;
          }, this, 0);

          this._cellEditor.pendingDispose = true;
        }
        else
        {
          this._focusIndicator.remove(this._cellEditor);
          this._focusIndicator.removeState("editing");
          this._cellEditor.dispose();
          this._cellEditor = null;
          this._cellEditorFactory = null;
        }
      }
    },


    /**
     * Event handler. Called when the modal window of the cell editor closes.
     *
     * @param evt {Map} the event.
     * @return {void}
     */
    _onCellEditorModalWindowClose : function(evt)
    {
      this.stopEditing();
    },


    /**
     * Returns the model index of the column the mouse is over or null if the mouse
     * is not over a column.
     *
     * @type member
     * @param pageX {Integer} the x position of the mouse in the page (in pixels).
     * @return {Integer} the model index of the column the mouse is over.
     */
    _getColumnForPageX : function(pageX)
    {
      var columnModel = this.getTable().getTableColumnModel();
      var paneModel = this.getTablePaneModel();
      var colCount = paneModel.getColumnCount();
      var currX = this._header.getContainerLocation().left;

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
     * @type member
     * @param pageX {Integer} the x position of the mouse in the page (in pixels).
     * @return {Integer} the column index.
     */
    _getResizeColumnForPageX : function(pageX)
    {
      var columnModel = this.getTable().getTableColumnModel();
      var paneModel = this.getTablePaneModel();
      var colCount = paneModel.getColumnCount();
      var currX = this._header.getContainerLocation().left;
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
      var panePos = this._tablePane.getContentLocation();

      if (pageX < panePos.left || pageX > panePos.right)
      {
        // There was no cell or header cell hit
        return null;
      }

      if (pageY >= panePos.top && pageY <= panePos.bottom)
      {
        // This event is in the pane -> Get the row
        var rowHeight = this.getTable().getRowHeight();

        var scrollY = this._verScrollBar.getPosition();

        if (this.getTable().getKeepFirstVisibleRowComplete()) {
          scrollY = Math.floor(scrollY / rowHeight) * rowHeight;
        }

        var tableY = scrollY + pageY - panePos.top;
        var row = Math.floor(tableY / rowHeight);

        var rowCount = this.getTable().getTableModel().getRowCount();
        return (row < rowCount) ? row : null;
      }

      var headerPos = this._header.getContainerLocation();

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
      var oldWidget = this._topRightWidget;

      if (oldWidget != null) {
        this._remove(oldWidget);
      }

      if (widget != null) {
        this._add(widget, {row: 0, column: 1});
      }

      this._topRightWidget = widget;
    },


    /**
     * Returns the header.
     *
     * @type member
     * @return {qx.ui.table.pane.Header} the header.
     */
    getHeader : function() {
      return this._header;
    },


    /**
     * Returns the table pane.
     *
     * @type member
     * @return {qx.ui.table.pane.Pane} the table pane.
     */
    getTablePane : function() {
      return this._tablePane;
    },


    /**
     * Returns which scrollbars are needed.
     *
     * @type member
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
      var barWidth = this._verScrollBar.getSizeHint().width;

      // Get the width and height of the view (without scroll bars)
      var clipperSize = this._paneClipper.getBounds();
      var viewWidth = clipperSize.width;

      if (this.getVerticalScrollBarVisible()) {
        viewWidth += barWidth;
      }

      var viewHeight = clipperSize.height;

      if (this.getHorizontalScrollBarVisible()) {
        viewHeight += barWidth;
      }

      // Get the (virtual) width and height of the pane
      var paneWidth = this.getTablePaneModel().getTotalWidth();
      var paneHeight = this.getTable().getRowHeight() * this.getTable().getTableModel().getRowCount();

      // Check which scrollbars are needed
      var horNeeded = false;
      var verNeeded = false;

      if (paneWidth > viewWidth)
      {
        horNeeded = true;

        if (paneHeight > viewHeight - barWidth) {
          verNeeded = true;
        }
      }
      else if (paneHeight > viewHeight)
      {
        verNeeded = true;

        if (!preventVertical && (paneWidth > viewWidth - barWidth)) {
          horNeeded = true;
        }
      }

      // Create the mask
      var horBar = qx.ui.table.pane.Scroller.HORIZONTAL_SCROLLBAR;
      var verBar = qx.ui.table.pane.Scroller.VERTICAL_SCROLLBAR;
      return ((forceHorizontal || horNeeded) ? horBar : 0) | ((preventVertical || !verNeeded) ? 0 : verBar);
    },


    // property apply method
    _applyScrollTimeout : function(value, old)
    {
      this._startInterval(value);
    },


    /**
     * starts the current running interval
     */
    _startInterval : function (value)
    {
      value = (value != null) ? value : this.getScrollTimeout();

      // stops the current one
      this._stopInterval();

      // Set up new timer if interval is non-zero
      if (value) {
        this._updateInterval = window.setInterval(this._onintervalWrapper, value);
      }
    },


    /**
     * stops the current running interval
     */
    _stopInterval : function ()
    {
      // Clear old timer if it's present
      if (this._updateInterval)
      {
        window.clearInterval(this._updateInterval);
        this._updateInterval = null;
      }
    },


    /**
     * Does a postponed update of the content.
     *
     * @see #_updateContent
     */
    _postponedUpdateContent : function()
    {
      this._updateContentPlanned = true;
    },


    /**
     * Timer event handler. Periodically checks whether a tabe update is
     * required. The update interval is controled by the {@link #scrollTimeout}
     * property.
     */
    _oninterval : function()
    {
      if (this._updateContentPlanned && !this._tablePane._layoutPending) {
        this._updateContentPlanned = false;
        this._updateContent();
      }
    },


    /**
     * Updates the content. Sets the right section the table pane should show and
     * does the scrolling.
     */
    _updateContent : function()
    {
      var paneHeight = this._tablePane.getBounds().height;
      var scrollX = this._horScrollBar.getPosition();
      var scrollY = this._verScrollBar.getPosition();
      var rowHeight = this.getTable().getRowHeight();

      var firstRow = Math.floor(scrollY / rowHeight);
      var oldFirstRow = this._tablePane.getFirstVisibleRow();
      this._tablePane.setFirstVisibleRow(firstRow);

      var rowCount = Math.ceil(paneHeight / rowHeight);
      var paneOffset = 0;
      var firstVisibleRowComplete = this.getTable().getKeepFirstVisibleRowComplete();

      if (!firstVisibleRowComplete)
      {

        // NOTE: We don't consider paneOffset, because this may cause alternating
        //       adding and deleting of one row when scrolling. Instead we add one row
        //       in every case.
        rowCount++;

        paneOffset = scrollY % rowHeight;
      }

      this._tablePane.setVisibleRowCount(rowCount);

      if (firstRow != oldFirstRow) {
        this._updateFocusIndicator();
      }

      this._paneClipper.scrollToX(scrollX);

      // Avoid expensive calls to setScrollTop if
      // scrolling is not needed
      //
      if (! firstVisibleRowComplete ) {
        this._paneClipper.scrollToX(paneOffset);
      }
    },

    /**
     * Updates the location and the visibility of the focus indicator.
     *
     * @return {void}
     */
    _updateFocusIndicator : function()
    {
      if(!this.getShowCellFocusIndicator()) {
        return;
      }

      var table = this.getTable();

      if (!table.getEnabled()) {
        return;
      }

      this._focusIndicator.moveToCell(this._focusedCol, this._focusedRow);
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

    this._disposeFields("_lastMouseDownCell");
  }
});
