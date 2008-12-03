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
 * The standard footer used with Progressive's Table renderer, to show
 * progress of loading data into the table.
 */
qx.Class.define("qx.ui.progressive.headfoot.Progress",
{
  extend     : qx.ui.progressive.headfoot.Abstract,

  construct : function(columnWidths, labelArr)
  {
    this.base(arguments);

    // Save the column widths
    this._columnWidths = columnWidths;

    // Set a default height for the progress bar
    this.setHeight(16);

    // We show progress by continually increasing our border width.
    this._border = new qx.ui.core.Border(1, "solid", "#cccccc");
    this._border.set({
                       widthTop : 1,
                       widthRight : 0,
                       widthBottom : 0
                     });
    this.setBorder(this._border);

    this.setPadding(0);

    // We also like to show progress as a percentage done string.
    this._percentDone = new qx.ui.basic.Atom("");
    this.add(this._percentDone);

    // We're initially invisible
    this.setDisplay(false);
  },

  members :
  {
    // overridden
    join : function(progressive)
    {
      // Save the progressive handle
      this.base(arguments, progressive);

      // Listen for the "renderStart" event, to save the number of elements on
      // the queue, and to set ourself visible
      progressive.addEventListener("renderStart",
                                   function(e)
                                   {
                                     this.__total = e.getData().initial;
                                     this.setDisplay(true);
                                   },
                                   this);

      // Listen for the "progress" event, to update the progress bar
      progressive.addEventListener("progress",
                                   function(e)
                                   {
                                     var complete =
                                       1.0 -
                                       (e.getData().remaining / this.__total);
                                     var borderWidth =
                                       Math.floor(this.getWidth() * complete);
                                     if (! isNaN(borderWidth))
                                     {
                                       var percent =
                                         Math.floor(complete * 100) + "%";
                                       this._percentDone.setLabel(percent);
                                       this._border.setWidthLeft(borderWidth);
                                     }
                                   },
                                   this);

      // Listen for the "renderEnd" event to make ourself invisible
      progressive.addEventListener("renderEnd",
                                   function(e)
                                   {
                                     this.setDisplay(false);
                                   },
                                   this);

      // Arrange to be called when the window appears or is resized, so we
      // can set each style sheet's left and width field appropriately.
      progressive.addEventListener("widthChanged",
                                   this._resizeColumns,
                                   this);
    },

    /**
     * Event handler for the "widthChanged" event.  We compute and sum the new
     * widths of the columns of the table to determine our new width.
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

      // Use the same default column width as the standard table row renderer
      var width = 0;
      var colWidth;
      var columnData;

      // Determine the total width that we'll need
      for (var i = 0; i < this._columnWidths.getData().length; i++)
      {
        // Get this column data
        columnData = this._columnWidths.getData()[i];

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

        // Cumulate the width
        width += colWidth;
      }

      // Set the width of the progress bar
      this.setWidth(width);
    }
  }
});
