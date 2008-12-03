/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/* ************************************************************************

#module(ui_progressive)

************************************************************************ */

/**
 * A header for a standard table.
 */
qx.Class.define("qx.ui.progressive.headfoot.TableHeading",
{
  extend     : qx.ui.progressive.headfoot.Abstract,

  /**
   * @param columnWidths {qx.ui.util.column.Widths}
   *   The set of widths, minimum widths, and maximum widths to be used for
   *   each of the columns in the table.
   *
   * @param labelArr {Array}
   *   Array of labels, one for each of the columns.
   *
   * @return {Void}
   */
  construct : function(columnWidths, labelArr)
  {
    this.base(arguments);

    this._columnWidths = columnWidths;

    this.setHeight(16);

    var border = new qx.ui.core.Border(1, "solid", "#eeeeee");
    border.setWidthTop(0);
    border.setWidthLeft(0);
    border.setWidthBottom(2);
    border.setColorBottom("#aaaaaa");

    // Create a place to put labels
    this._labels = [ ];

    // Get the column width data
    var data = columnWidths.getData();
    var label;

    // For each label...
    for (var i = 0; i < data.length; i++)
    {
      // ... create an atom to hold the label
      label = new qx.ui.basic.Atom(labelArr[i]);

      // Use the width of the corresponding column
      label.setWidth(data[i].getWidth());

      // Set borders for the headings
      label.setBorder(border);

      // Add the label to this heading.
      this.add(label);

      // Save this label so we can resize it later
      this._labels[i] = label;
    }
  },

  members :
  {
    // overridden
    join : function(progressive)
    {
      // Save the progressive handle
      this.base(arguments, progressive);

      // Arrange to be called when the window appears or is resized, so we
      // can set each style sheet's left and width field appropriately.
      progressive.addEventListener("widthChanged",
                                   this._resizeColumns,
                                   this);
    },

    /**
     * Event handler for the "widthChanged" event.  We recalculate and set the
     * new widths of each of our columns.
     *
     * @param e {qx.event.type.Event}
     *   Ignored.
     *
     * @return {Void}
     */
    _resizeColumns : function(e)
    {
      var width =
        (! this._progressive.getElement()
         ? 0
         : this._progressive.getInnerWidth()) -
        qx.ui.core.Widget.SCROLLBAR_SIZE

        // Compute the column widths
        qx.ui.util.column.FlexWidth.compute(this._columnWidths.getData(),
                                            width);


      // Get the column width data
      var data = this._columnWidths.getData();
      var columnData;

      // For each label...
      for (var i = 0; i < data.length; i++)
      {
        // ... reset the width of the corresponding column (label)
        columnData = data[i];

        // Is this column a flex width?
        if (columnData._computedWidthTypeFlex)
        {
          // Yup.  Set the width to the calculated width value based on flex
          width = columnData._computedWidthFlexValue;
        }
        else if (columnData._computedWidthTypePercent)
        {
          // Set the width to the calculated width value based on percent
          width = columnData._computedWidthPercentValue;
        }
        else
        {
          width = columnData.getWidth();
        }

        this._labels[i].setWidth(width);
      }
    }
  }
});
