/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/* ************************************************************************

#require(qx.ui.core.ColumnData)

************************************************************************ */

/**
 * The default resize behavior.  Until a resize model is loaded, the default
 * behavior is to:
 * <ol>
 *   <li>
 *     Upon the table initially appearing, and upon any window resize, divide
 *     the table space equally between the visible columns.
 *   </li>
 *   <li>
 *     When a column is increased in width, all columns to its right are
 *     pushed to the right with no change to their widths.  This may push some
 *     columns off the right edge of the table, causing a horizontal scroll
 *     bar to appear.
 *   </li>
 *   <li>
 *     When a column is decreased in width, if the total width of all columns
 *     is <i>greater than</i> the table width, no additional column width
 *     change is made.
 *   </li>
 *   <li>
 *     When a column is decreased in width, if the total width of all columns
 *     is <i>less than</i> the table width, the visible column
 *     immediately to the right of the column which decreased in width has its
 *     width increased to fill the remaining space.
 *   </li>
 * </ol>
 *
 * A resize model may be loaded to provide more guidance on how to adjust
 * column width upon each of the events: initial appear, window resize, and
 * column resize. *** TO BE FILLED IN ***
 */
qx.Class.define("qx.ui.table.columnmodel.resizebehavior.Default",
{
  extend : qx.ui.table.columnmodel.resizebehavior.Abstract,


  construct : function()
  {
    this.base(arguments);

    this.__resizeColumnData = [];

    // This layout is not connected to a widget but to this class. This class
    // must implement the method "getLayoutChildren", which must return all
    // columns (LayoutItems) which should be recalcutated. The call
    // "layout.renderLayout" will call the method "renderLayout" on each column
    // data object
    // The advantage of the use of the normal layout manager is that the
    // samantics of flex and percent are exectly the same as in the widget code.
    this.__layout = new qx.ui.layout.HBox();
    this.__layout.connectToWidget(this);

    this.__deferredComputeColumnsFlexWidth = new qx.util.DeferredCall(
      this._computeColumnsFlexWidth, this
    );
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * A function to instantiate a resize behavior column data object.
     */
    newResizeBehaviorColumnData :
    {
      check : "Function",
      init : function(obj)
      {
        return new qx.ui.core.ColumnData();
      }
    },

    /**
     * Whether to reinitialize default widths on each appear event.
     * Typically, one would want to initialize the default widths only upon
     * the first appearance of the table, but the original behavior was to
     * reinitialize it even if the table is hidden and then reshown
     * (e.g. it's in a pageview and the page is switched and then switched
     * back).
     */
    initializeWidthsOnEveryAppear :
    {
      check : "Boolean",
      init  : false
    },

    /**
     * The table column model in use.  Of particular interest is the method
     * <i>getTable</i> which is a reference to the table widget.  This allows
     * access to any other features of the table, for use in calculating widths
     * of columns.
     */
    tableColumnModel :
    {
      check : "qx.ui.table.columnmodel.Resize"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    __layout : null,
    __layoutChildren : null,
    __resizeColumnData : null,
    __deferredComputeColumnsFlexWidth : null,

    /**
     * Whether we have initialized widths on the first appear yet
     */
    __widthsInitialized : false,

    /**
     * Set the width of a column.
     *
     * @param col {Integer} The column whose width is to be set
     *
     * @param width {Integer, String}
     *   The width of the specified column.  The width may be specified as
     *   integer number of pixels (e.g. 100), a string representing percentage
     *   of the inner width of the Table (e.g. "25%"), or a string
     *   representing a flex width (e.g. "1*").
     *
     * @param flex {Integer?0} Optional flex value of the column
     *
     * @throws {Error}
     *   Error is thrown if the provided column number is out of the range.
     */
    setWidth : function(col, width, flex)
    {
      // Ensure the column is within range
      if (col >= this.__resizeColumnData.length) {
        throw new Error("Column number out of range");
      }

      // Set the new width
      this.__resizeColumnData[col].setColumnWidth(width, flex);
      this.__deferredComputeColumnsFlexWidth.schedule();
    },


    /**
     * Set the minimum width of a column.
     *
     * @param col {Integer}
     *   The column whose minimum width is to be set
     *
     * @param width {Integer}
     *   The minimum width of the specified column.
     *
     * @return {void}
     *
     * @throws {Error}
     *   Error is thrown if the provided column number is out of the range.
     */
    setMinWidth : function(col, width)
    {
      // Ensure the column is within range
      if (col >= this.__resizeColumnData.length)
      {
        throw new Error("Column number out of range");
      }

      // Set the new width
      this.__resizeColumnData[col].setMinWidth(width);
      this.__deferredComputeColumnsFlexWidth.schedule();
    },


    /**
     * Set the maximum width of a column.
     *
     * @param col {Integer}
     *   The column whose maximum width is to be set
     *
     * @param width {Integer}
     *   The maximum width of the specified column.
     *
     * @return {void}
     *
     * @throws {Error}
     *   Error is thrown if the provided column number is out of the range.
     */
    setMaxWidth : function(col, width)
    {
      // Ensure the column is within range
      if (col >= this.__resizeColumnData.length) {
        throw new Error("Column number out of range");
      }

      // Set the new width
      this.__resizeColumnData[col].setMaxWidth(width);
      this.__deferredComputeColumnsFlexWidth.schedule();
    },


    /**
     * Set any or all of the width, minimum width, and maximum width of a
     * column in a single call.
     *
     * @param col {Integer}
     *   The column whose attributes are to be changed
     *
     * @param map {Map}
     *   A map containing any or all of the property names "width", "minWidth",
     *   and "maxWidth".  The property values are as described for
     *   {@link #setWidth}, {@link #setMinWidth} and {@link #setMaxWidth}
     *   respectively.
     *
     * @return {void}
     *
     * @throws {Error}
     *   Error is thrown if the provided column number is out of the range.
     */
    set : function(col, map)
    {
      for (var prop in map)
      {
        switch(prop)
        {
          case "width":
            this.setWidth(col, map[prop]);
            break;

          case "minWidth":
            this.setMinWidth(col, map[prop]);
            break;

          case "maxWidth":
            this.setMaxWidth(col, map[prop]);
            break;

          default:
            throw new Error("Unknown property: " + prop);
        }
      }
    },

    // overloaded
    onAppear : function(event, forceRefresh)
    {
      // If we haven't initialized widths at least once, or
      // they want us to reinitialize widths on every appear event...
      if (forceRefresh === true || !this.__widthsInitialized || this.getInitializeWidthsOnEveryAppear())
      {
        // Calculate column widths
        this._computeColumnsFlexWidth();

        // Track that we've initialized widths at least once
        this.__widthsInitialized = true;
      }
    },

    // overloaded
    onTableWidthChanged : function(event) {
      this._computeColumnsFlexWidth();
    },

    // overloaded
    onVerticalScrollBarChanged : function(event) {
      this._computeColumnsFlexWidth();
    },

    // overloaded
    onColumnWidthChanged : function(event)
    {
      // Extend the next column to fill blank space
      this._extendNextColumn(event);
    },

    // overloaded
    onVisibilityChanged : function(event)
    {
      // Event data properties: col, visible
      var data = event.getData();

      // If a column just became visible, resize all columns.
      if (data.visible)
      {
        this._computeColumnsFlexWidth();
        return;
      }

      // Extend the last column to fill blank space
      this._extendLastColumn(event);
    },

    // overloaded
    _setNumColumns : function(numColumns)
    {
      var colData = this.__resizeColumnData;
      // Are there now fewer (or the same number of) columns than there were
      // previously?
      if (numColumns <= colData.length)
      {
        // Yup.  Delete the extras.
        colData.splice(numColumns, colData.length);
        return;
      }

      // There are more columns than there were previously.  Allocate more.
      for (var i=colData.length; i<numColumns; i++)
      {
        colData[i] = this.getNewResizeBehaviorColumnData()();
        colData[i].columnNumber = i;
      }
    },


    /**
     * This method is required by the box layout. If returns an array of items
     * to relayout.
     *
     * @return {qx.ui.core.ColumnData[]} The list of column data object to layout.
     */
    getLayoutChildren : function() {
      return this.__layoutChildren;
    },


    /**
     * Computes the width of all flexible children.
     *
     * @return {void}
     */
    _computeColumnsFlexWidth : function()
    {
      this.__deferredComputeColumnsFlexWidth.cancel();
      var width = this._getAvailableWidth();

      if (width === null) {
        return;
      }

      var tableColumnModel = this.getTableColumnModel();
      var visibleColumns = tableColumnModel.getVisibleColumns();
      var visibleColumnsLength = visibleColumns.length;
      var colData = this.__resizeColumnData;
      var i, l;

      if (visibleColumnsLength === 0) {
        return;
      }

      // Create an array of the visible columns
      var columns = [ ];
      for (i=0; i<visibleColumnsLength; i++)
      {
        columns.push(colData[visibleColumns[i]]);
      }
      this.__layoutChildren = columns;
      this.__clearLayoutCaches();

      // Use a horizontal box layout to determine the available width.
      this.__layout.renderLayout(width, 100);

      // Now that we've calculated the width, set it.
      for (i=0,l=columns.length; i<l; i++)
      {
        var colWidth = columns[i].getComputedWidth();
        tableColumnModel.setColumnWidth(visibleColumns[i], colWidth);
      }
    },


    /**
     * Clear all layout caches of the column datas.
     */
    __clearLayoutCaches : function()
    {
      this.__layout.invalidateChildrenCache();
      var children = this.__layoutChildren;
      for (var i=0,l=children.length; i<l; i++) {
        children[i].invalidateLayoutCache();
      }
    },


    /**
     * Extend the visible column to right of the column which just changed
     * width, to fill any available space within the inner width of the table.
     * This means that if the sum of the widths of all columns exceeds the
     * inner width of the table, no change is made.  If, on the other hand,
     * the sum of the widths of all columns is less than the inner width of
     * the table, the visible column to the right of the column which just
     * changed width is extended to take up the width available within the
     * inner width of the table.
     *
     *
     * @param event {qx.event.type.Data}
     *   The event object.
     *
     * @return {void}
     */
    _extendNextColumn : function(event)
    {
      var tableColumnModel = this.getTableColumnModel();

      // Event data properties: col, oldWidth, newWidth
      var data = event.getData();

      var visibleColumns = tableColumnModel.getVisibleColumns();

      // Determine the available width
      var width = this._getAvailableWidth();

      // Determine the number of visible columns
      var numColumns = visibleColumns.length;

      // Did this column become longer than it was?
      if (data.newWidth > data.oldWidth)
      {
        // Yup.  Don't resize anything else.  The other columns will just get
        // pushed off and require scrollbars be added (if not already there).
        return ;
      }

      // This column became shorter.  See if we no longer take up the full
      // space that's available to us.
      var i;
      var nextCol;
      var widthUsed = 0;

      for (i=0; i<numColumns; i++) {
        widthUsed += tableColumnModel.getColumnWidth(visibleColumns[i]);
      }

      // If the used width is less than the available width...
      if (widthUsed < width)
      {
        // ... then determine the next visible column
        for (i=0; i<visibleColumns.length; i++)
        {
          if (visibleColumns[i] == data.col)
          {
            nextCol = visibleColumns[i + 1];
            break;
          }
        }

        if (nextCol)
        {
          // Make the next column take up the available space.
          var newWidth =
            (width - (widthUsed - tableColumnModel.getColumnWidth(nextCol)));
          tableColumnModel.setColumnWidth(nextCol, newWidth);
        }
      }
    },


    /**
     * If a column was just made invisible, extend the last column to fill any
     * available space within the inner width of the table.  This means that
     * if the sum of the widths of all columns exceeds the inner width of the
     * table, no change is made.  If, on the other hand, the sum of the widths
     * of all columns is less than the inner width of the table, the last
     * column is extended to take up the width available within the inner
     * width of the table.
     *
     *
     * @param event {qx.event.type.Data}
     *   The event object.
     *
     * @return {void}
     */
    _extendLastColumn : function(event)
    {
      var tableColumnModel = this.getTableColumnModel();

      // Event data properties: col, visible
      var data = event.getData();

      // If the column just became visible, don't make any width changes
      if (data.visible)
      {
        return;
      }

      // Get the array of visible columns
      var visibleColumns = tableColumnModel.getVisibleColumns();

      // If no columns are visible...
      if (visibleColumns.length == 0)
      {
        return;
      }

      // Determine the available width
      var width = this._getAvailableWidth(tableColumnModel);

      // Determine the number of visible columns
      var numColumns = visibleColumns.length;

      // See if we no longer take up the full space that's available to us.
      var i;
      var lastCol;
      var widthUsed = 0;

      for (i=0; i<numColumns; i++) {
        widthUsed += tableColumnModel.getColumnWidth(visibleColumns[i]);
      }

      // If the used width is less than the available width...
      if (widthUsed < width)
      {
        // ... then get the last visible column
        lastCol = visibleColumns[visibleColumns.length - 1];

        // Make the last column take up the available space.
        var newWidth =
          (width - (widthUsed - tableColumnModel.getColumnWidth(lastCol)));
        tableColumnModel.setColumnWidth(lastCol, newWidth);
      }
    },


    /**
     * Returns an array of the resizing information of a column.
     *
     * @return {qx.ui.core.ColumnData[]} array of the resizing information of a column.
     */
    _getResizeColumnData : function()
    {
      return this.__resizeColumnData;
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this.__resizeColumnData = this.__layoutChildren = null;
    this._disposeObjects("__layout", "__deferredComputeColumnsFlexWidth");
  }
});
