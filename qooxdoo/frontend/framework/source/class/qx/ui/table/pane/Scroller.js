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

/* ************************************************************************

#module(ui_table)

************************************************************************ */

/**
 * Shows a whole meta column. This includes a {@link TablePaneHeader},
 * a {@link TablePane} and the needed scroll bars. This class handles the
 * virtual scrolling and does all the mouse event handling.
 *
 * @appearance table-focus-indicator {qx.ui.layout.HorizontalBoxLayout}
 */
qx.Class.define("qx.ui.table.pane.Scroller",
{
  extend : qx.ui.layout.VerticalBoxLayout,




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

    // init scrollbars
    this._verScrollBar = new qx.ui.basic.ScrollBar(false);
    this._horScrollBar = new qx.ui.basic.ScrollBar(true);

    var scrollBarWidth = this._verScrollBar.getPreferredBoxWidth();

    this._verScrollBar.setWidth("auto");
    this._horScrollBar.setHeight("auto");
    this._horScrollBar.setPaddingRight(scrollBarWidth);
    this._horScrollBar.addEventListener("changeValue", this._onScrollX, this);
    this._verScrollBar.addEventListener("changeValue", this._onScrollY, this);

    // init header
    this._header = this.getTable().getNewTablePaneHeader()(this);

    this._header.set(
    {
      width  : "auto",
      height : "auto"
    });

    this._headerClipper = new qx.ui.layout.CanvasLayout;
    this._headerClipper.setDimension("1*", "auto");
    this._headerClipper.setOverflow("hidden");
    this._headerClipper.add(this._header);

    this._spacer = new qx.ui.basic.Terminator;
    this._spacer.setWidth(scrollBarWidth);

    this._top = new qx.ui.layout.HorizontalBoxLayout;
    this._top.setHeight("auto");
    this._top.add(this._headerClipper, this._spacer);

    // init pane
    this._tablePane = this.getTable().getNewTablePane()(this);

    this._tablePane.set(
    {
      width  : "auto",
      height : "auto"
    });

    this._showCellFocusIndicator = this.getShowCellFocusIndicator();

    this._focusIndicator = new qx.ui.table.pane.FocusIndicator(this);

    this._paneClipper = new qx.ui.layout.CanvasLayout;
    this._paneClipper.setWidth("1*");
    this._paneClipper.setOverflow("hidden");
    this._paneClipper.add(this._tablePane, this._focusIndicator);
    this._paneClipper.addEventListener("mousewheel", this._onmousewheel, this);

    // add all child widgets
    var scrollerBody = new qx.ui.layout.HorizontalBoxLayout;
    scrollerBody.setHeight("1*");
    scrollerBody.add(this._paneClipper, this._verScrollBar);

    this.add(this._top, scrollerBody, this._horScrollBar);

    // init event handlers
    this._headerClipper.addEventListener("changeCapture", this._onChangeCaptureHeader, this);

    this._headerClipper.addEventListener("mousemove", this._onmousemoveHeader, this);
    this._paneClipper.addEventListener("mousemove", this._onmousemovePane, this);

    this._headerClipper.addEventListener("mousedown", this._onmousedownHeader, this);
    this._paneClipper.addEventListener("mousedown", this._onmousedownPane, this);

    this._focusIndicator.addEventListener("mouseup", this._onMouseupFocusIndicator, this);
    this._headerClipper.addEventListener("mouseup", this._onmouseupHeader, this);
    this._paneClipper.addEventListener("mouseup", this._onmouseupPane, this);

    this._headerClipper.addEventListener("click", this._onclickHeader, this);
    this._paneClipper.addEventListener("click", this._onclickPane, this);
    this._paneClipper.addEventListener("contextmenu", this._onContextMenu, this);
    this._paneClipper.addEventListener("dblclick", this._ondblclickPane, this);

    this.addEventListener("mouseout", this._onmouseout, this);

    var tableModel = this.getTable().getTableModel();
    this._lastRowCount = tableModel ? tableModel.getRowCount() : 0;

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
    VERTICAL_SCROLLBAR       : 2,


    /**
     * (string) The correct value for the CSS style attribute "cursor" for the
     * horizontal resize cursor.
     */
    CURSOR_RESIZE_HORIZONTAL : (qx.core.Client.getInstance().isGecko() && (qx.core.Client.getInstance().getMajor() > 1 || qx.core.Client.getInstance().getMinor() >= 8)) ? "ew-resize" : "e-resize"
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
    }

  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // property modifier
    _applyHorizontalScrollBarVisible : function(value, old)
    {
      // Workaround: We can't use setDisplay, because the scroll bar needs its
      //       correct height in order to check its value. When using
      //       setDisplay(false) the height isn't relayouted any more
      if (value) {
        this._horScrollBar.setHeight("auto");
      } else {
        this._horScrollBar.setHeight(0);
      }

      this._horScrollBar.setVisibility(value);
      this._updateContent();
    },


    // property modifier
    _applyVerticalScrollBarVisible : function(value, old)
    {
      // Workaround: See _applyHorizontalScrollBarVisible
      if (value) {
        this._verScrollBar.setWidth("auto");
      } else {
        this._verScrollBar.setWidth(0);
      }

      this._verScrollBar.setVisibility(value);

      var scrollBarWidth = value ? this._verScrollBar.getPreferredBoxWidth() : 0;
      this._horScrollBar.setPaddingRight(scrollBarWidth);
      this._spacer.setWidth(scrollBarWidth);
    },


    // property modifier
    _applyTablePaneModel : function(value, old)
    {
      if (old != null) {
        old.removeEventListener("modelChanged", this._onPaneModelChanged, this);
      }

      value.addEventListener("modelChanged", this._onPaneModelChanged, this);
    },


    // property modifier
    _applyShowCellFocusIndicator : function(value, old) {
      this._showCellFocusIndicator = value;

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
      return this._verScrollBar.getValue();
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
      this._verScrollBar.setValue(scrollY);
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
      return this._horScrollBar.getValue();
    },


    /**
     * Set the current position of the vertical scroll bar.
     *
     * @param scrollX {Integer} The new scroll position.
     */
    setScrollX : function(scrollX)
    {
      this._horScrollBar.setValue(scrollX);
    },


    /**
     * Returns the table this scroller belongs to.
     *
     * @type member
     * @return {qx.ui.table.Table} the table.
     */
    getTable : function() {
      return this._table;
    },


    /**
     * Event handler. Called when the visibility of a column has changed.
     *
     * @type member
     * @param evt {Map} the event.
     * @return {void}
     */
    _onColVisibilityChanged : function(evt)
    {
      this._updateHorScrollBarMaximum();
      this._updateFocusIndicator();
    },


    /**
     * Event handler. Called when the width of a column has changed.
     *
     * @type member
     * @param evt {Map} the event.
     * @return {void}
     */
    _onColWidthChanged : function(evt)
    {
      this._header._onColWidthChanged(evt);
      this._tablePane._onColWidthChanged(evt);

      var data = evt.getData();
      var paneModel = this.getTablePaneModel();
      var x = paneModel.getX(data.col);

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
     * @type member
     * @param evt {Map} the event.
     * @return {void}
     */
    _onColOrderChanged : function(evt)
    {
      this._header._onColOrderChanged(evt);
      this._tablePane._onColOrderChanged(evt);

      this._updateHorScrollBarMaximum();
    },


    /**
     * Event handler. Called when the table model has changed.
     *
     * @type member
     * @param evt {Map} the event.
     * @return {void}
     */
    _onTableModelDataChanged : function(evt)
    {
      this._tablePane._onTableModelDataChanged(evt);
      var rowCount = this.getTable().getTableModel().getRowCount();

      if (rowCount != this._lastRowCount)
      {
        this._updateVerScrollBarMaximum();

        var removedRows = this._lastRowCount - rowCount;
        if (removedRows > 0) {
          this.getTable().getSelectionModel().removeSelectionInterval(this._lastRowCount-1, rowCount);
        }

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
     *
     * @type member
     * @param evt {Map} the event.
     * @return {void}
     */
    _onSelectionChanged : function(evt) {
      this._tablePane._onSelectionChanged(evt);
    },


    /**
     * Event handler. Called when the table gets or looses the focus.
     *
     * @type member
     * @param evt {Map} the event.
     * @return {void}
     */
    _onFocusChanged : function(evt)
    {
      this._tablePane._onFocusChanged(evt);
    },


    /**
     * Event handler. Called when the table model meta data has changed.
     *
     * @type member
     * @param evt {Map} the event.
     * @return {void}
     */
    _onTableModelMetaDataChanged : function(evt)
    {
      this._header._onTableModelMetaDataChanged(evt);
      this._tablePane._onTableModelMetaDataChanged(evt);
    },


    /**
     * Event handler. Called when the pane model has changed.
     *
     * @type member
     * @param evt {Map} the event.
     * @return {void}
     */
    _onPaneModelChanged : function(evt)
    {
      this._header._onPaneModelChanged(evt);
      this._tablePane._onPaneModelChanged(evt);
    },


    /**
     * Updates the maximum of the horizontal scroll bar, so it corresponds to the
     * total width of the columns in the table pane.
     *
     * @type member
     * @return {void}
     */
    _updateHorScrollBarMaximum : function() {
      this._horScrollBar.setMaximum(this.getTablePaneModel().getTotalWidth());
    },


    /**
     * Updates the maximum of the vertical scroll bar, so it corresponds to the
     * number of rows in the table.
     *
     * @type member
     * @return {void}
     */
    _updateVerScrollBarMaximum : function()
    {
      var rowCount = this.getTable().getTableModel().getRowCount();
      var rowHeight = this.getTable().getRowHeight();

      if (this.getTable().getKeepFirstVisibleRowComplete()) {
        this._verScrollBar.setMaximum((rowCount + 1) * rowHeight);
      } else {
        this._verScrollBar.setMaximum(rowCount * rowHeight);
      }
    },


    /**
     * Event handler. Called when the table property "keepFirstVisibleRowComplete"
     * changed.
     *
     * @type member
     * @return {void}
     */
    _onKeepFirstVisibleRowCompleteChanged : function()
    {
      this._updateVerScrollBarMaximum();
      this._updateContent();
    },


    // overridden
    _changeInnerHeight : function(vNew, vOld)
    {
      // The height has changed -> Update content
      this._postponedUpdateContent();

      return this.base(arguments, vNew, vOld);
    },


    // overridden
    _afterAppear : function()
    {
      this.base(arguments);

      this.getElement().onselectstart = qx.lang.Function.returnFalse;

      this._updateContent();
      this._header._updateContent();
      this._updateHorScrollBarMaximum();
      this._updateVerScrollBarMaximum();
    },


    /**
     * Event handler. Called when the horizontal scroll bar moved.
     *
     * @type member
     * @param evt {Map} the event.
     * @return {void}
     */
    _onScrollX : function(evt)
    {
      this.createDispatchChangeEvent("changeScrollX", evt.getValue(), evt.getOldValue());
      var scrollLeft = evt.getValue();

      // Workaround: See _updateContent
      this._header.setLeft(-scrollLeft);

      // Cache the scrollLeft value of the paneClipper
      //
      this._paneClipper.__scrollLeft = scrollLeft;
      this._paneClipper.setScrollLeft(scrollLeft);
    },


    /**
     * Event handler. Called when the vertical scroll bar moved.
     *
     * @type member
     * @param evt {Map} the event.
     * @return {void}
     */
    _onScrollY : function(evt)
    {
      this.createDispatchChangeEvent("changeScrollY", evt.getValue(), evt.getOldValue());
      this._postponedUpdateContent();
    },


    /**
     * Event handler. Called when the user moved the mouse wheel.
     *
     * @type member
     * @param evt {Map} the event.
     * @return {void}
     */
    _onmousewheel : function(evt)
    {
      var table = this.getTable();

      if (!table.getEnabled()) {
        return;
      }

      this._verScrollBar.setValue(this._verScrollBar.getValue() - (evt.getWheelDelta() * 3) * table.getRowHeight());

      // Update the focus
      if (this._lastMousePageX && this.getFocusCellOnMouseMove()) {
        this._focusCellAtPagePos(this._lastMousePageX, this._lastMousePageY);
      }
    },


    /**
     * Common column resize logic.
     *
     * @type member
     * @param pageX {Integer} the current mouse x position.
     * @return {void}
     */
    __handleResizeColumn : function(pageX)
    {
      var table = this.getTable();
      // We are currently resizing -> Update the position
      var minColumnWidth = qx.ui.table.pane.Scroller.MIN_COLUMN_WIDTH;
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
     * @type member
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
     * @type member
     * @param evt {Map} the event.
     * @return {void}
     */
    _onmousemoveHeader : function(evt)
    {
      var table = this.getTable();

      if (! table.getEnabled()) {
        return;
      }

      var useResizeCursor = false;
      var mouseOverColumn = null;

      var pageX = evt.getPageX();
      var pageY = evt.getPageY();

      // Workaround: In onmousewheel the event has wrong coordinates for pageX
      //       and pageY. So we remember the last move event.
      this._lastMousePageX = pageX;
      this._lastMousePageY = pageY;

      if (this._resizeColumn != null) {
        // We are currently resizing -> Update the position
        this.__handleResizeColumn(pageX);
        useResizeCursor = true;
      } else if (this._moveColumn != null) {
        // We are moving a column
        this.__handleMoveColumn(pageX);
      } else {
        var resizeCol = this._getResizeColumnForPageX(pageX);
        if (resizeCol != -1) {
          // The mouse is over a resize region -> Show the right cursor
          useResizeCursor = true;
        } else {
          var tableModel = table.getTableModel();
          var col = this._getColumnForPageX(pageX);
          if (col != null && tableModel.isColumnSortable(col)) {
            mouseOverColumn = col;
          }
        }
      }

      // Workaround: Setting the cursor to the right widget doesn't work
      //this._header.setCursor(useResizeCursor ? "e-resize" : null);
      this.getTopLevelWidget().setGlobalCursor(useResizeCursor ? qx.ui.table.pane.Scroller.CURSOR_RESIZE_HORIZONTAL : null);

      this._header.setMouseOverColumn(mouseOverColumn);
    },


    /**
     * Event handler. Called when the user moved the mouse over the pane.
     *
     * @type member
     * @param evt {Map} the event.
     * @return {void}
     */
    _onmousemovePane : function(evt)
    {
      var table = this.getTable();

      if (! table.getEnabled()) {
        return;
      }

      var useResizeCursor = false;

      var pageX = evt.getPageX();
      var pageY = evt.getPageY();

      // Workaround: In onmousewheel the event has wrong coordinates for pageX
      //       and pageY. So we remember the last move event.
      this._lastMousePageX = pageX;
      this._lastMousePageY = pageY;

      if (this._resizeColumn != null) {
        // We are currently resizing -> Update the position
        this.__handleResizeColumn(pageX);
        useResizeCursor = true;
      } else if (this._moveColumn != null) {
        // We are moving a column
        this.__handleMoveColumn(pageX);
      } else {
        // This is a normal mouse move
        var row = this._getRowForPagePos(pageX, pageY);
        if (row != null && this._getColumnForPageX(pageX) != null) {
          // The mouse is over the data -> update the focus
          if (this.getFocusCellOnMouseMove()) {
            this._focusCellAtPagePos(pageX, pageY);
          }
        }
      }

      // Workaround: Setting the cursor to the right widget doesn't work
      //this._header.setCursor(useResizeCursor ? "e-resize" : null);
      this.getTopLevelWidget().setGlobalCursor(useResizeCursor ? qx.ui.table.pane.Scroller.CURSOR_RESIZE_HORIZONTAL : null);

      this._header.setMouseOverColumn(null);
    },


    /**
     * Event handler. Called when the user pressed a mouse button over the header.
     *
     * @type member
     * @param evt {Map} the event.
     * @return {void}
     */
    _onmousedownHeader : function(evt)
    {
      if (! this.getTable().getEnabled()) {
        return;
      }

      var pageX = evt.getPageX();

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
     * @type member
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
      this._headerClipper.setCapture(true);
    },


    /**
     * Start a move session of the header.
     *
     * @type member
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
      this._headerClipper.setCapture(true);
    },



    /**
     * Event handler. Called when the user pressed a mouse button over the pane.
     *
     * @type member
     * @param evt {Map} the event.
     * @return {void}
     */
    _onmousedownPane : function(evt)
    {
      var table = this.getTable();

      if (! table.getEnabled()) {
        return;
      }

      if (this.isEditing()) {
        this.stopEditing();
      }

      var pageX = evt.getPageX();
      var pageY = evt.getPageY();
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
          table._getSelectionManager().handleMouseDown(row, evt);
        }

        // The mouse is over the data -> update the focus
        if (! this.getFocusCellOnMouseMove())
        {
          this._focusIndicator.setAnonymous(false);
          this._focusCellAtPagePos(pageX, pageY);
        }

        if (! selectBeforeFocus) {
          table._getSelectionManager().handleMouseDown(row, evt);
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

        if (this.hasEventListeners("cellClick"))
        {
          this.dispatchEvent(new qx.ui.table.pane.CellEvent(this, "cellClick", e), true);
        }
      }
      this._focusIndicator.setAnonymous(true);
    },


    /**
     * Event handler. Called when the user released a mouse button over the header.
     *
     * @type member
     * @param evt {Map} the event.
     * @return {void}
     */
    _onmouseupHeader : function(evt)
    {
      var table = this.getTable();

      if (! table.getEnabled()) {
        return;
      }

      if (this._resizeColumn != null) {
        this._stopResizeHeader();
      } else if (this._moveColumn != null) {
        this._stopMoveHeader();
      }
    },


    /**
     * Event handler. Called when the event capturing of the header changed.
     * Stops/finishes an active header resize/move session if it lost capturing
     * during the session to stay in a stable state.
     */
    _onChangeCaptureHeader : function(e)
    {
      if (this._resizeColumn != null && e.getValue() == false) {
        this._stopResizeHeader();
      }

      if (this._moveColumn != null && e.getValue() == false) {
        this._stopMoveHeader();
      }
    },


    /**
     * Stop a resize session of the header.
     *
     * @type member
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
      this._headerClipper.setCapture(false);

      this.getTopLevelWidget().setGlobalCursor(null);
    },


    /**
     * Stop a move session of the header.
     *
     * @type member
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
      this._headerClipper.setCapture(false);
    },


    /**
     * Event handler. Called when the user released a mouse button over the pane.
     *
     * @type member
     * @param evt {Map} the event.
     * @return {void}
     */
    _onmouseupPane : function(evt)
    {
      var table = this.getTable();

      if (! table.getEnabled()) {
        return;
      }

      var row = this._getRowForPagePos(evt.getPageX(), evt.getPageY());
      if (row != -1 && row != null && this._getColumnForPageX(evt.getPageX()) != null) {
        table._getSelectionManager().handleMouseUp(row, evt);
      }
    },


    /**
     * Event handler. Called when the user clicked a mouse button over the header.
     *
     * @type member
     * @param evt {Map} the event.
     * @return {void}
     */
    _onclickHeader : function(evt)
    {
      var table = this.getTable();

      if (!table.getEnabled()) {
        return;
      }

      var tableModel = table.getTableModel();

      var pageX = evt.getPageX();

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
     * @type member
     * @param evt {Map} the event.
     * @return {void}
     */
    _onclickPane : function(evt)
    {
      var table = this.getTable();

      if (!table.getEnabled()) {
        return;
      }

      var pageX = evt.getPageX();
      var pageY = evt.getPageY();
      var row = this._getRowForPagePos(pageX, pageY);
      var col = this._getColumnForPageX(pageX);

      if (row != null && col != null)
      {
        table._getSelectionManager().handleClick(row, evt);

        if (
          this._lastMouseDownCell &&
          row == this._lastMouseDownCell.row &&
          col == this._lastMouseDownCell.col
        ) {
          this._lastMouseDownCell = {};

          if (this.hasEventListeners("cellClick")) {
            this.dispatchEvent(new qx.ui.table.pane.CellEvent(this, "cellClick", evt), true);
          }
        }
      }
    },


    /**
     * Event handler. Called when a context menu is invoked in a cell.
     *
     * @type member
     * @param evt {qx.event.type.MouseEvent} the event.
     * @return {void}
     */
    _onContextMenu : function(evt)
    {
      var pageX = evt.getPageX();
      var pageY = evt.getPageY();
      var row = this._getRowForPagePos(pageX, pageY);
      var col = this._getColumnForPageX(pageX);

      if (
        this._lastMouseDownCell &&
        row == this._lastMouseDownCell.row &&
        col == this._lastMouseDownCell.col
      ) {
        this._lastMouseDownCell = {};

        if (this.hasEventListeners("cellContextmenu"))
        {
          this.dispatchEvent(new qx.ui.table.pane.CellEvent(this, "cellContextmenu", evt), true);
        }
      }
    },

    /**
     * Event handler. Called when the user double clicked a mouse button over the pane.
     *
     * @type member
     * @param evt {Map} the event.
     * @return {void}
     */
    _ondblclickPane : function(evt)
    {
      var pageX = evt.getPageX();
      var pageY = evt.getPageY();


      this._focusCellAtPagePos(pageX, pageY);
      this.startEditing();
      if (this.hasEventListeners("cellDblclick"))
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
     * @type member
     * @param evt {Map} the event.
     * @return {void}
     */
    _onmouseout : function(evt)
    {
      var table = this.getTable();

      if (!table.getEnabled()) {
        return;
      }

      // Reset the resize cursor when the mouse leaves the header
      // If currently a column is resized then do nothing
      // (the cursor will be reset on mouseup)
      if (this._resizeColumn == null) {
        this.getTopLevelWidget().setGlobalCursor(null);
      }

      this._header.setMouseOverColumn(null);
    },


    /**
     * Shows the resize line.
     *
     * @type member
     * @param x {Integer} the position where to show the line (in pixels, relative to
     *      the left side of the pane).
     * @return {void}
     */
    _showResizeLine : function(x)
    {
      var resizeLine = this._resizeLine;

      if (resizeLine == null)
      {
        resizeLine = new qx.ui.basic.Terminator;
        resizeLine.setBackgroundColor("#D6D5D9");
        resizeLine.setWidth(3);
        this._paneClipper.add(resizeLine);
        qx.ui.core.Widget.flushGlobalQueues();

        this._resizeLine = resizeLine;
      }

      resizeLine._renderRuntimeLeft(x - 2); // -1 for the width
      resizeLine._renderRuntimeHeight(this._paneClipper.getBoxHeight() + this._paneClipper.getScrollTop());

      this._resizeLine.removeStyleProperty("visibility");
    },


    /**
     * Hides the resize line.
     *
     * @type member
     * @return {void}
     */
    _hideResizeLine : function() {
      if(this._resizeLine) {
        this._resizeLine.setStyleProperty("visibility", "hidden");
      }
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
      var paneLeftX = qx.bom.element.Location.getLeft(this._tablePane.getElement());
      var colCount = paneModel.getColumnCount();

      var targetXPos = 0;
      var targetX = 0;
      var currX = paneLeftX;

      for (var xPos=0; xPos<colCount; xPos++)
      {
        var col = paneModel.getColumnAtX(xPos);
        var colWidth = columnModel.getColumnWidth(col);

        if (pageX < currX + colWidth / 2) {
          break;
        }

        currX += colWidth;
        targetXPos = xPos + 1;
        targetX = currX - paneLeftX;
      }

      // Ensure targetX is visible
      var clipperLeftX = qx.bom.element.Location.getLeft(this._paneClipper.getElement());
      var clipperWidth = this._paneClipper.getBoxWidth();
      var scrollX = clipperLeftX - paneLeftX;

      // NOTE: +2/-1 because of feedback width
      targetX = qx.lang.Number.limit(targetX, scrollX + 2, scrollX + clipperWidth - 1);

      this._showResizeLine(targetX);

      // Return the overall target x position
      return paneModel.getFirstColumnX() + targetXPos;
    },


    /**
     * Hides the feedback shown while a column is moved by the user.
     *
     * @type member
     * @return {void}
     */
    hideColumnMoveFeedback : function() {
      this._hideResizeLine();
    },


    /**
     * Sets the focus to the cell that's located at the page position
     * <code>pageX</code>/<code>pageY</code>. If there is no cell at that position,
     * nothing happens.
     *
     * @type member
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
     * @type member
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
     * @type member
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
        var viewWidth = this._paneClipper.getBoxWidth();
        var viewHeight = this._paneClipper.getBoxHeight();

        // NOTE: We don't use qx.lang.Number.limit, because min should win if max < min
        var minScrollX = Math.min(colLeft, colLeft + colWidth - viewWidth);
        var maxScrollX = colLeft;
        this.setScrollX(Math.max(minScrollX, Math.min(maxScrollX, scrollX)));

        var minScrollY = rowTop + rowHeight - viewHeight;

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
          this._cellEditor.addEventListener(
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
          this._focusIndicator.addEventListener("mousedown", function(e) {
            e.stopPropagation();
          });

          this._focusIndicator.add(this._cellEditor);
          this._focusIndicator.addState("editing");

          // Workaround: Calling focus() directly has no effect
          qx.client.Timer.once(function()
          {
            if (this.getDisposed())
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
     *
     * @type member
     * @return {void}
     */
    stopEditing : function()
    {
      this.flushEditor();
      this.cancelEditing();
    },


    /**
     * Writes the editor's value to the model.
     *
     * @type member
     * @return {void}
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
     *
     * @type member
     * @return {void}
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
          qx.client.Timer.once(function()
          {
            var d = qx.ui.core.ClientDocument.getInstance();
            d.remove(this._cellEditor);

            this._cellEditor.removeEventListener(
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
     * @type member
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
      var headerLeftX = qx.bom.element.Location.getLeft(this._header.getElement());

      var columnModel = this.getTable().getTableColumnModel();
      var paneModel = this.getTablePaneModel();
      var colCount = paneModel.getColumnCount();
      var currX = headerLeftX;

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
      var headerLeftX = qx.bom.element.Location.getLeft(this._header.getElement());

      var columnModel = this.getTable().getTableColumnModel();
      var paneModel = this.getTablePaneModel();
      var colCount = paneModel.getColumnCount();
      var currX = headerLeftX;
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
     * @type member
     * @param pageX {Integer} the mouse x position in the page.
     * @param pageY {Integer} the mouse y position in the page.
     * @return {Integer} the model index of the row the mouse is currently over.
     */
    _getRowForPagePos : function(pageX, pageY)
    {
      var paneClipperElem = this._paneClipper.getElement();

      var paneClipperPos = qx.bom.element.Location.get(paneClipperElem);

      if (pageX < paneClipperPos.left || pageX > paneClipperPos.right)
      {
        // There was no cell or header cell hit
        return null;
      }

      if (pageY >= paneClipperPos.top && pageY <= paneClipperPos.bottom)
      {
        // This event is in the pane -> Get the row
        var rowHeight = this.getTable().getRowHeight();

        var scrollY = this._verScrollBar.getValue();

        if (this.getTable().getKeepFirstVisibleRowComplete()) {
          scrollY = Math.floor(scrollY / rowHeight) * rowHeight;
        }

        var tableY = scrollY + pageY - paneClipperPos.top;
        var row = Math.floor(tableY / rowHeight);

        var rowCount = this.getTable().getTableModel().getRowCount();
        return (row < rowCount) ? row : null;
      }

      var headerPos = qx.bom.element.Location.get(this._headerClipper.getElement());

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
     * @type member
     * @param widget {qx.ui.core.Widget} The widget to set. May be null.
     * @return {void}
     */
    setTopRightWidget : function(widget)
    {
      var oldWidget = this._topRightWidget;

      if (oldWidget != null) {
        this._top.remove(oldWidget);
      }

      if (widget != null)
      {
        this._top.remove(this._spacer);
        this._top.add(widget);
      }
      else if (oldWidget != null)
      {
        this._top.add(this._spacer);
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
     * @param preventVertical {Boolean ? false} Whether tp show the vertical scrollbar
     *      never.
     * @return {Integer} which scrollbars are needed. This may be any combination of
     *      {@link #HORIZONTAL_SCROLLBAR} or {@link #VERTICAL_SCROLLBAR}
     *      (combined by OR).
     */
    getNeededScrollBars : function(forceHorizontal, preventVertical)
    {
      var barWidth = this._verScrollBar.getPreferredBoxWidth();

      // Get the width and height of the view (without scroll bars)
      var viewWidth = this._paneClipper.getInnerWidth();

      if (this.getVerticalScrollBarVisible()) {
        viewWidth += barWidth;
      }

      var viewHeight = this._paneClipper.getInnerHeight();

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
      // Clear old timer if it's present
      if (this._updateInterval)
      {
        window.clearInterval(this._updateInterval);
        this._updateInterval = null;
      }
      // Set up wrapper if required
      if (!this._onintervalWrapper) {
        this._onintervalWrapper = qx.lang.Function.bind(this._oninterval, this);
      }
      // Set up new timer if interval is non-zero
      if (value) {
        this._updateInterval = window.setInterval(this._onintervalWrapper, value);
      }
    },


    /**
     * Does a postponed update of the content.
     *
     * @type member
     * @return {void}
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
     *
     * @type member
     * @return {void}
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
     *
     * @type member
     * @return {void}
     */
    _updateContent : function()
    {
      if (!this.isSeeable()) {
        return;
      }

      var paneHeight = this._paneClipper.getInnerHeight();
      var scrollX = this._horScrollBar.getValue();
      var scrollY = this._verScrollBar.getValue();
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
        //       adding and deleting of one row when scolling. Instead we add one row
        //       in every case.
        rowCount++;

        paneOffset = scrollY % rowHeight;
      }

      this._tablePane.setVisibleRowCount(rowCount);

      if (firstRow != oldFirstRow) {
        this._updateFocusIndicator();
      }

      // Workaround: We can't use scrollLeft for the header because IE
      //       automatically scrolls the header back, when a column is
      //       resized.
      this._header.setLeft(-scrollX);

      // Only scroll left if the scrollLeft value has
      // changed
      //
      if(this._paneClipper.__scrollLeft != scrollX) {
        this._paneClipper.__scrollLeft = scrollX;
        this._paneClipper.setScrollLeft(scrollX);
      }

      // Avoid expensive calls to setScrollTop if
      // scrolling is not needed
      //
      if (! firstVisibleRowComplete ) {
        this._paneClipper.setScrollTop(paneOffset);
      }

      // this.debug("paneHeight:"+paneHeight+",rowHeight:"+rowHeight+",firstRow:"+firstRow+",rowCount:"+rowCount+",paneOffset:"+paneOffset);
    },

    /**
     * Updates the location and the visibility of the focus indicator.
     *
     * @type member
     * @return {void}
     */
    _updateFocusIndicator : function()
    {
      if(!this._showCellFocusIndicator) {
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
    if (this.getElement() != null) {
      this.getElement().onselectstart = null;
    }

    if (this._updateInterval)
    {
      window.clearInterval(this._updateInterval);
      this._updateInterval = null;
    }

    // this object was created by the table on init so we have to clean it up.
    var tablePaneModel = this.getTablePaneModel();
    if (tablePaneModel)
    {
      tablePaneModel.dispose();
    }

    this._disposeObjects("_verScrollBar", "_horScrollBar", "_header", "_headerClipper",
      "_spacer", "_top", "_tablePane", "_paneClipper", "_resizeLine", "_table",
      "_focusIndicator", "_topRightWidget");
  }
});
