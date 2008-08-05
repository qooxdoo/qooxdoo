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

#require(qx.legacy.ui.util.column.Data)

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
 *     is <i>greater than</i> the table width, no additional column wiidth
 *     changes are made.
 *   </li>
 *   <li>
 *     When a column is decreased in width, if the total width of all columns
 *     is <i>less than</i> the width of the table, the visible column
 *     immediately to the right of the column which decreased in width has its
 *     width increased to fill the remaining space.
 *   </li>
 * </ol>
 *
 * A resize model may be loaded to provide more guidance on how to adjust
 * column width upon each of the events: initial appear, window resize, and
 * column resize. *** TO BE FILLED IN ***
 */
qx.Class.define("qx.legacy.ui.table.columnmodel.resizebehavior.Default",
{
  extend : qx.legacy.ui.table.columnmodel.resizebehavior.Abstract,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    MIN_WIDTH : 10
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
        return new qx.legacy.ui.util.column.Data();
      }
    },

    /*
     * Whether to reinitialize default widths on each appear event.
     * Typically, one would want to initialize the default widths only upon
     * the first appearance of the table, but the original behavior was to
     * reinitialize it even if the table is hidden and then reshown
     * (e.g. it's in a pageview and the page is switched and then switched
     * back).
     *
     */
    initializeWidthsOnEveryAppear :
    {
      check : "Boolean",
      init  : false
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Whether we have initialized widths on the first appear yet
     */
    widthsInitialized : false,

    /**
     * Set the width of a column.
     *
     *
     * @param col {Integer} The column whose width is to be set
     *
     * @param width {Integer, String}
     *   The width of the specified column.  The width may be specified as
     *   integer number of pixels (e.g. 100), a string representing percentage
     *   of the inner width of the Table (e.g. "25%"), or a string
     *   representing a flex width (e.g. "1*").
     *
     * @return {void}
     *
     * @throws {Error}
     *   Error is thrown if the provided column number is out of the range.
     */
    setWidth : function(col, width)
    {
      // Ensure the column is within range
      if (col >= this._resizeColumnData.length) {
        throw new Error("Column number out of range");
      }

      // Set the new width
      this._resizeColumnData[col].setWidth(width);
    },


    /**
     * Set the minimum width of a column.
     *
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
      if (col >= this._resizeColumnData.length)
      {
        throw new Error("Column number out of range");
      }

      // Set the new width
      this._resizeColumnData[col].setMinWidth(width);
    },


    /**
     * Set the maximum width of a column.
     *
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
      if (col >= this._resizeColumnData.length) {
        throw new Error("Column number out of range");
      }

      // Set the new width
      this._resizeColumnData[col].setMaxWidth(width);
    },


    /**
     * Set any or all of the width, minimum width, and maximum width of a
     * column in a single call.
     *
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
    onAppear : function(tableColumnModel, event)
    {
      // If we haven't initialized widths at least once, or
      // they want us to reinitialize widths on every appear event...
      if (! this.widthsInitialized || this.getInitializeWidthsOnEveryAppear())
      {
        // Get the initial available width so we know whether a resize caused
        // an increase or decrease in the available space.
        this._width = this._getAvailableWidth(tableColumnModel);

        // Calculate column widths
        this._computeColumnsFlexWidth(tableColumnModel, event);

        // Track that we've initialized widths at least once
        this.widthsInitialized = true;
      }
    },

    // overloaded
    onTableWidthChanged : function(tableColumnModel, event)
    {
      // Calculate column widths
      this._computeColumnsFlexWidth(tableColumnModel, event);
    },

    // overloaded
    onVerticalScrollBarChanged : function(tableColumnModel, event)
    {
      // Calculate column widths
      this._computeColumnsFlexWidth(tableColumnModel, event);
    },

    // overloaded
    onColumnWidthChanged : function(tableColumnModel, event)
    {
      // Extend the next column to fill blank space
      this._extendNextColumn(tableColumnModel, event);
    },

    // overloaded
    onVisibilityChanged : function(tableColumnModel, event)
    {
      // Event data properties: col, visible
      var data = event.getData();

      // If a column just became visible, resize all columns.
      if (data.visible)
      {
        this._computeColumnsFlexWidth(tableColumnModel, event);
        return;
      }

      // Extend the last column to fill blank space
      this._extendLastColumn(tableColumnModel, event);
    },

    // overloaded
    _setNumColumns : function(numColumns)
    {
      // Are there now fewer (or the same number of) columns than there were
      // previously?
      if (numColumns <= this._resizeColumnData.length)
      {
        // Yup.  Delete the extras.
        this._resizeColumnData.splice(numColumns, this._resizeColumnData.length);
        return;
      }

      // There are more columns than there were previously.  Allocate more.
      for (var i=this._resizeColumnData.length; i<numColumns; i++)
      {
        this._resizeColumnData[i] = this.getNewResizeBehaviorColumnData()();
        this._resizeColumnData[i]._columnNumber = i;
      }
    },


    /**
     * Computes the width of all flexible children (based loosely on the
     * method of the same name in HorizontalBoxLayoutImpl).
     *
     *
     * @param tableColumnModel {qx.legacy.ui.table.columnmodel.Resize}
     *   The table column model in use.
     *
     * @param event {qx.event.type.Event}
     *   The event object.
     *
     * @return {void}
     */
    _computeColumnsFlexWidth : function(tableColumnModel, event)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.tableResizeDebug"))
        {
          this.debug("computeColumnsFlexWidth");
        }
      }

      var visibleColumns = tableColumnModel._visibleColumnArr;
      var visibleColumnsLength = visibleColumns.length;
      var columnData;
      var i;

      // Determine the available width
      var availableWidth = this._getAvailableWidth(tableColumnModel);
      var width = availableWidth.width;
      var extraWidth = availableWidth.extraWidth;

      // Create an array of the visible columns
      var columns = [ ];
      for (i=0; i<visibleColumnsLength; i++)
      {
        columns.push(this._resizeColumnData[visibleColumns[i]]);
      }

      // Compute the column widths
      qx.legacy.ui.util.column.FlexWidth.compute(columns, width);

      // ************************************************
      // Set the column widths to what we have calculated
      // ************************************************
      for (i=0; i<visibleColumnsLength; i++)
      {
        var colWidth;

        // Get the current column's column data
        columnData = this._resizeColumnData[visibleColumns[i]];

        // Is this column a flex width?
        if (columnData._computedWidthTypeFlex)
        {
          // Yup.  Set the width to the calculated width value based on flex
          colWidth = columnData._computedWidthFlexValue;
        }
        else if (columnData._computedWidthTypePercent)
        {
          // Set the width to the calculated width value based on percent
          colWidth = columnData._computedWidthPercentValue;
        }
        else
        {
          colWidth = columnData.getWidth();
        }

        // If this is the last column, add any available extra width (where
        // the vertical scollbar will go if it's not there already)
        if (i == visibleColumnsLength - 1) {
          colWidth += extraWidth;
        }

        // Now that we've calculated the width, set it.
        tableColumnModel.setColumnWidth(visibleColumns[i], colWidth);

        if (qx.core.Variant.isSet("qx.debug", "on"))
        {
          if (qx.core.Setting.get("qx.tableResizeDebug"))
          {
            this.debug("col " + columnData._columnNumber +
                       ": width=" + colWidth);
          }
        }
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
     * @param tableColumnModel {qx.legacy.ui.table.columnmodel.Resize}
     *   The table column model in use.
     *
     * @param event {qx.event.type.DataEvent}
     *   The event object.
     *
     * @return {void}
     */
    _extendNextColumn : function(tableColumnModel, event)
    {
      // Event data properties: col, oldWidth, newWidth
      var data = event.getData();

      var visibleColumns = tableColumnModel._visibleColumnArr;

      // Determine the available width
      var availableWidth = this._getAvailableWidth(tableColumnModel);
      var width = availableWidth.width;

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

      for (i=0; i<numColumns; i++)
      {
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
     * @param tableColumnModel {qx.legacy.ui.table.columnmodel.Resize}
     *   The table column model in use.
     *
     * @param event {qx.event.type.DataEvent}
     *   The event object.
     *
     * @return {void}
     */
    _extendLastColumn : function(tableColumnModel, event)
    {
      // Event data properties: col, visible
      var data = event.getData();

      // If the column just became visible, don't make any width changes
      if (data.visible)
      {
        return;
      }

      // Get the array of visible columns
      var visibleColumns = tableColumnModel._visibleColumnArr;

      // Determine the available width
      var availableWidth = this._getAvailableWidth(tableColumnModel);
      var width = availableWidth.width;

      // Determine the number of visible columns
      var numColumns = visibleColumns.length;

      // See if we no longer take up the full space that's available to us.
      var i;
      var lastCol;
      var widthUsed = 0;

      for (i=0; i<numColumns; i++)
      {
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
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeFields("_resizeColumnData", "_width");
  }
});
