/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/* ************************************************************************

#module(column)

************************************************************************ */

/*
 * Utility functions for calculating column widths based on Flex Width
 * settings.
 */
qx.Class.define("qx.legacy.ui.util.column.FlexWidth",
{
  statics :
  {
    /**
     * Compute the width of each of a specified set of columns based on each
     * column's settings.  Upon return from this funciton, the width field of
     * each widget-derived object has been calculated, and may be retrieved
     * with the getWidth() method of the objects in the columns array.
     *
     * @param columns {Array}
     *   An array of objects derived from {@link qx.legacy.ui.core.Widget}, but most
     *   typically of class {@link qx.legacy.ui.util.column.Data}.  Each element of
     *   the columns array is an object derived from {@link qx.legacy.ui.core.Widget}
     *   and thus has properties width, minWidth, and maxWidth.  The width
     *   property may take a numeric value indicating a fixed number of pixels
     *   for that column, the string "auto", a string with a percentage,
     *   e.g. "33%", or a flex width in the form "1*".
     *
     * @param width {Integer}
     *   The available width on which the column widths should be based.
     *
     * @return {Void}
     */
    compute : function(columns, width)
    {
      var numColumns = columns.length;
      var columnData;
      var flexibleColumns = [];
      var widthUsed = 0;
      var i;

      // *************************************************************
      // 1. Compute the sum of all static sized columns and find
      //    all flexible columns.
      // *************************************************************
      for (i=0; i<numColumns; i++)
      {
        // Get the current column's column data
        columnData = columns[i];

        // Is this column width type "auto"?
        if (columnData._computedWidthTypeAuto)
        {
          // Yup.  Convert it to a Flex "1*"
          columnData._computedWidthTypeAuto = false;
          columnData._computedWidthTypeFlex = true;
          columnData._computedWidthParsed = 1;
        }

        // Is this column a flex width?
        if (columnData._computedWidthTypeFlex)
        {
          // Yup.  Save it for future processing.
          flexibleColumns.push(columnData);
        }
        else if (columnData._computedWidthTypePercent)
        {
          // We can calculate the width of a Percent type right now.  Convert
          // it to a Flex type that's already calculated (no further
          // calculation required).
          columnData._computedWidthPercentValue =
            Math.round(width * (columnData._computedWidthParsed / 100));
          widthUsed += columnData._computedWidthPercentValue;
        }
        else
        {
          // We have a fixed width.  Track width already allocated.
          widthUsed += columnData.getWidth();
        }
      }

      // *************************************************************
      // 2. Compute the sum of all flexible column widths
      // *************************************************************
      var widthRemaining = width - widthUsed;
      var flexibleColumnsLength = flexibleColumns.length;
      var prioritySum = 0;

      for (i=0; i<flexibleColumnsLength; i++)
      {
        prioritySum += flexibleColumns[i]._computedWidthParsed;
      }

      // *************************************************************
      // 3. Calculating the size of each 'part'.
      // *************************************************************
      var partWidth = widthRemaining / prioritySum;

      // *************************************************************
      // 4. Adjust flexible columns, taking min/max values into account
      // *************************************************************
      var bSomethingChanged = true;

      for (flexibleColumnsLength=flexibleColumns.length;
           bSomethingChanged&&flexibleColumnsLength>0;
           flexibleColumnsLength=flexibleColumns.length)
      {
        // Assume nothing will change
        bSomethingChanged = false;

        for (i=flexibleColumnsLength-1; i>=0; i--)
        {
          columnData = flexibleColumns[i];

          var computedFlexibleWidth =
            columnData._computedWidthFlexValue =
            columnData._computedWidthParsed * partWidth;

          // If the part is not within its specified min/max range, adjust it.
          var min = columnData.getMinWidthValue();
          var max = columnData.getMaxWidthValue();

          if (min && computedFlexibleWidth < min)
          {
            columnData._computedWidthFlexValue = Math.round(min);
            widthUsed += columnData._computedWidthFlexValue;
            qx.lang.Array.removeAt(flexibleColumns, i);
            bSomethingChanged = true;

            // Don't round fixed-width columns (in step 5)
            columnData = null;
          }
          else if (max && computedFlexibleWidth > max)
          {
            columnData._computedWidthFlexValue = Math.round(max);
            widthUsed += columnData._computedWidthFlexValue;
            qx.lang.Array.removeAt(flexibleColumns, i);
            bSomethingChanged = true;

            // Don't round fixed-width columns (in step 5)
            columnData = null;
          }
        }
      }

      // If any flexible columns remain, then allocate the remaining space to
      // them.
      if (flexibleColumns.length > 0)
      {
        // Recalculate the priority sum of the remaining flexible columns
        prioritySum = 0;

        for (i=0; i<flexibleColumnsLength; i++) {
          prioritySum += flexibleColumns[i]._computedWidthParsed;
        }

        // Recalculate the width remaining and part width
        widthRemaining = width - widthUsed;
        partWidth = widthRemaining / prioritySum;

        // If there's no width remaining...
        if (widthRemaining <= 0)
        {
          // ... then use minimum width * priority for all remaining columns
          for (i=0; i<flexibleColumnsLength; i++)
          {
            columnData = flexibleColumns[i];

            computedFlexibleWidth =
              columnData._computedWidthFlexValue =
              (qx.legacy.ui.table.columnmodel.resizebehavior.Default.MIN_WIDTH *
               flexibleColumns[i]._computedWidthParsed);

            columnData._computedWidthFlexValue =
              Math.round(computedFlexibleWidth);
            widthUsed += columnData._computedWidthFlexValue;
          }
        }
        else
        {
          // Assign widths of remaining flexible columns
          for (i=0; i<flexibleColumnsLength; i++)
          {
            columnData = flexibleColumns[i];

            computedFlexibleWidth =
              columnData._computedWidthFlexValue =
              columnData._computedWidthParsed * partWidth;

            // If the computed width is less than our hard-coded minimum...
            if (computedFlexibleWidth <
                qx.legacy.ui.table.columnmodel.resizebehavior.Default.MIN_WIDTH)
            {
              // ... then use the hard-coded minimum
              computedFlexibleWidth =
                qx.legacy.ui.table.columnmodel.resizebehavior.Default.MIN_WIDTH;
            }

            columnData._computedWidthFlexValue =
              Math.round(computedFlexibleWidth);
            widthUsed += columnData._computedWidthFlexValue;
          }
        }
      }

      // *************************************************************
      // 5. Fix rounding errors
      // *************************************************************
      if (columnData != null && widthRemaining > 0)
      {
        columnData._computedWidthFlexValue += width - widthUsed;
      }
    }
  }
});
