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
 * Shows the header of a table.
 */
qx.Class.define("qx.ui.table.pane.Header", {
  extend : qx.ui.core.Widget,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param paneScroller {qx.ui.table.pane.Scroller} the TablePaneScroller the header belongs to.
   */
  construct : function(paneScroller)
  {
    this.base(arguments);
    this._setLayout(new qx.ui.layout.HBox());

    // add blocker
    this.__blocker = new qx.ui.core.Blocker(this);

    this.__paneScroller = paneScroller;
  },






  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __paneScroller : null,
    __moveFeedback : null,
    __lastPointerOverColumn : null,
    __blocker : null,

    /**
     * Returns the TablePaneScroller this header belongs to.
     *
     * @return {qx.ui.table.pane.Scroller} the TablePaneScroller.
     */
    getPaneScroller : function() {
      return this.__paneScroller;
    },


    /**
     * Returns the table this header belongs to.
     *
     * @return {qx.ui.table.Table} the table.
     */
    getTable : function() {
      return this.__paneScroller.getTable();
    },

    /**
     * Returns the blocker of the header.
     *
     * @return {qx.ui.core.Blocker} the blocker.
     */
    getBlocker : function() {
      return this.__blocker;
    },

    /**
     * Event handler. Called the column order has changed.
     *
     */
    onColOrderChanged : function() {
      this._updateContent(true);
    },


    /**
     * Event handler. Called when the pane model has changed.
     */
    onPaneModelChanged : function() {
      this._updateContent(true);
    },


    /**
     * Event handler. Called when the table model meta data has changed.
     *
     */
    onTableModelMetaDataChanged : function() {
      this._updateContent();
    },


    /**
     * Sets the column width. This overrides the width from the column model.
     *
     * @param col {Integer}
     *   The column to change the width for.
     *
     * @param width {Integer}
     *   The new width.
     *
     * @param isPointerAction {Boolean}
     *   <i>true</i> if the column width is being changed as a result of a
     *   pointer drag in the header; false or undefined otherwise.
     *
     */
    setColumnWidth : function(col, width, isPointerAction)
    {
      var child = this.getHeaderWidgetAtColumn(col);

      if (child != null) {
        child.setWidth(width);
      }
    },


    /**
     * Sets the column the pointer is currently over.
     *
     * @param col {Integer} the model index of the column the pointer is currently over or
     *      null if the pointer is over no column.
     */
    setPointerOverColumn : function(col)
    {
      if (col != this.__lastPointerOverColumn)
      {
        if (this.__lastPointerOverColumn != null)
        {
          var widget = this.getHeaderWidgetAtColumn(this.__lastPointerOverColumn);

          if (widget != null) {
            widget.removeState("hovered");
          }
        }

        if (col != null) {
          this.getHeaderWidgetAtColumn(col).addState("hovered");
        }

        this.__lastPointerOverColumn = col;
      }
    },


    /**
     * Get the header widget for the given column
     *
     * @param col {Integer} The column number
     * @return {qx.ui.table.headerrenderer.HeaderCell} The header cell widget
     */
    getHeaderWidgetAtColumn : function(col)
    {
      var xPos = this.getPaneScroller().getTablePaneModel().getX(col);
      return this._getChildren()[xPos];
    },


    /**
     * Shows the feedback shown while a column is moved by the user.
     *
     * @param col {Integer} the model index of the column to show the move feedback for.
     * @param x {Integer} the x position the left side of the feedback should have
     *      (in pixels, relative to the left side of the header).
     */
    showColumnMoveFeedback : function(col, x)
    {
      var pos = this.getContentLocation();

      if (this.__moveFeedback == null)
      {
        var table = this.getTable();
        var xPos = this.getPaneScroller().getTablePaneModel().getX(col);
        var cellWidget = this._getChildren()[xPos];

        var tableModel = table.getTableModel();
        var columnModel = table.getTableColumnModel();

        var cellInfo =
        {
          xPos  : xPos,
          col   : col,
          name  : tableModel.getColumnName(col),
          table : table
        };

        var cellRenderer = columnModel.getHeaderCellRenderer(col);
        var feedback = cellRenderer.createHeaderCell(cellInfo);

        var size = cellWidget.getBounds();

        // Configure the feedback
        feedback.setWidth(size.width);
        feedback.setHeight(size.height);
        feedback.setZIndex(1000000);
        feedback.setOpacity(0.8);
        feedback.setLayoutProperties({top: pos.top});

        this.getApplicationRoot().add(feedback);
        this.__moveFeedback = feedback;
      }

      this.__moveFeedback.setLayoutProperties({left: pos.left + x});
      this.__moveFeedback.show();
    },


    /**
     * Hides the feedback shown while a column is moved by the user.
     */
    hideColumnMoveFeedback : function()
    {
      if (this.__moveFeedback != null)
      {
        this.__moveFeedback.destroy();
        this.__moveFeedback = null;
      }
    },


    /**
     * Returns whether the column move feedback is currently shown.
     *
     * @return {Boolean} <code>true</code> whether the column move feedback is
     *    currently shown, <code>false</code> otherwise.
     */
    isShowingColumnMoveFeedback : function() {
      return this.__moveFeedback != null;
    },


    /**
     * Updates the content of the header.
     *
     * @param completeUpdate {Boolean} if true a complete update is performed. On a
     *      complete update all header widgets are recreated.
     */
    _updateContent : function(completeUpdate)
    {
      var table = this.getTable();
      var tableModel = table.getTableModel();
      var columnModel = table.getTableColumnModel();
      var paneModel = this.getPaneScroller().getTablePaneModel();

      var children = this._getChildren();
      var colCount = paneModel.getColumnCount();

      var sortedColumn = tableModel.getSortColumnIndex();

      // Remove all widgets on the complete update
      if (completeUpdate) {
        this._cleanUpCells();
      }

      // Update the header
      var cellInfo = {};
      cellInfo.sortedAscending = tableModel.isSortAscending();

      for (var x=0; x<colCount; x++)
      {
        var col = paneModel.getColumnAtX(x);
        if (col === undefined) {
          continue;
        }

        var colWidth = columnModel.getColumnWidth(col);

        var cellRenderer = columnModel.getHeaderCellRenderer(col);

        cellInfo.xPos = x;
        cellInfo.col = col;
        cellInfo.name = tableModel.getColumnName(col);
        cellInfo.editable = tableModel.isColumnEditable(col);
        cellInfo.sorted = (col == sortedColumn);
        cellInfo.table = table;

        // Get the cached widget
        var cachedWidget = children[x];

        // Create or update the widget
        if (cachedWidget == null)
        {
          // We have no cached widget -> create it
          cachedWidget = cellRenderer.createHeaderCell(cellInfo);

          cachedWidget.set(
          {
            width  : colWidth
          });

          this._add(cachedWidget);
        }
        else
        {
          // This widget already created before -> recycle it
          cellRenderer.updateHeaderCell(cellInfo, cachedWidget);
        }

        // set the states
        if (x === 0) {
          cachedWidget.addState("first");
          cachedWidget.removeState("last");
        } else if (x === colCount - 1) {
          cachedWidget.removeState("first");
          cachedWidget.addState("last");
        } else {
          cachedWidget.removeState("first");
          cachedWidget.removeState("last");
        }
      }
    },


    /**
     * Cleans up all header cells.
     *
     */
    _cleanUpCells : function()
    {
      var children = this._getChildren();

      for (var x=children.length-1; x>=0; x--)
      {
        var cellWidget = children[x];
        cellWidget.destroy();
      }
    }
  },



  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this.__blocker.dispose();
    this._disposeObjects("__paneScroller");
  }
});
