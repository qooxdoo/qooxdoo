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

#module(table)

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
qx.OO.defineClass("qx.ui.table.DefaultResizeBehavior",
                  qx.ui.table.AbstractResizeBehavior,
function()
{
  qx.ui.table.AbstractResizeBehavior.call(this);
});


// overloaded
qx.Proto.onAppear = function(tableColumnModel, event)
{
  this._equalizeColumns(tableColumnModel, event);
};


// overloaded
qx.Proto.onWindowResize = function(tableColumnModel, event)
{
  this._equalizeColumns(tableColumnModel, event);
};


// overloaded
qx.Proto.onColumnWidthChanged = function(tableColumnModel, event)
{
  this._extendNextColumn(tableColumnModel, event);
};


/**
 * Make all columns the same width.  The width of each column is determined by
 * dividing the inner width off the table by the number of visible columns.
 */
qx.Proto._equalizeColumns = function(tableColumnModel, event)
{
  // Get the available width
  var width =
    this._getAvailableWidth(tableColumnModel);

  // Determine the number of visible columns
  var numColumns = tableColumnModel._visibleColumnArr.length;

  // Determine the width of each column.  Make all columns equal width.
  var colWidth = Math.floor(width / numColumns);
  
  // For each column...
  for (var i = 0; i < numColumns; i++)
  {
    // ... set its width to the established value.
    tableColumnModel.setColumnWidth(tableColumnModel._visibleColumnArr[i],
                                    colWidth);
  }
};


/**
 * Extend the visible column to right of the column which just changed width,
 * to fill any available space within the inner width of the table.  This
 * means that if the sum of the widths of all columns exceeds the inner width
 * of the table, no change is made.  If, on the other hand, the sum of the
 * widths of all columns is less than the inner width of the table, the
 * visible column to the right of the column which just changed width is
 * extended to take up the width available within the inner width of the
 * table.
 */
qx.Proto._extendNextColumn = function(tableColumnModel, event)
{
  var data = event.getData();
  var visibleColumns = tableColumnModel._visibleColumnArr;

  // Determine the available width
  var width = this._getAvailableWidth(tableColumnModel);

  // Determine the number of visible columns
  var numColumns = visibleColumns.length;

  // Is the last visible column being resized?
  if (data.col == numColumns - 1)
  {
    // Yup.  Don't let them do that.
    tableColumnModel.setColumnWidth(data.col, data.oldWidth);
    return;
  }

  // Did this column become longer than it was?
  if (data.newWidth > data.oldWidth)
  {
    // Yup.  Don't resize anything else.  The other columns will just get
    // pushed off and require scrollbars be added (if not already there).
    return;
  }

  // This column became shorter.  See if we no longer take up the full space
  // that's available to us.
  var i;
  var nextCol;
  var widthUsed = 0;
  for (i = 0; i < numColumns; i++)
  {
    widthUsed +=
      tableColumnModel.getColumnWidth(visibleColumns[i]);
  }

  // If the used width is less than the available width...
  if (widthUsed < width)
  {
    // ... then determine the next visible column
    for (i = 0; i < visibleColumns.length; i++)
    {
      if (visibleColumns[i] == data.col)
      {
        nextCol = visibleColumns[i + 1];
        break;
      }
    }

    // Make the next column take up the available space.  (We have to have
    // found a "nextCol" because otherwise we wouldn't have gotten here due to
    // the check, above, for whether the last column was being made shorter.
    var oldWidth = tableColumnModel.getColumnWidth(nextCol);
    var newWidth = (width - (widthUsed -
                             tableColumnModel.getColumnWidth(nextCol)));
    tableColumnModel.setColumnWidth(nextCol, newWidth);
  }
};
