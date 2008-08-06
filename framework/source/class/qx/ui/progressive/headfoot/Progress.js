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
    this._decorator = new qx.ui.decoration.Single(1, "solid", "#cccccc");
    this._decorator.set({
                       widthTop : 1,
                       widthRight : 0,
                       widthBottom : 0
                     });
    this.setDecorator(this._decorator);
    
    this.setPadding(0);

    // We also like to show progress as a percentage done string.
    this._percentDone = new qx.ui.basic.Atom("");
    this.add(this._percentDone);

    // We're initially invisible
    this.exclude();

    // Arrange to be called when the window appears or is resized, so we
    // can set each style sheet's left and width field appropriately.
    this.addListener("resize", this._resizeColumns, this);

    // This layout is not connected to a widget but to this class. This class
    // must implement the method "getLayoutChildren", which must return all
    // columns (LayoutItems) which should be recalcutated. The call
    // "layout.renderLayout" will call the method "renderLayout" on each
    // column data object The advantage of the use of the normal layout
    // manager is that the samantics of flex and percent are exectly the same
    // as in the widget code.
    this._layout = new qx.ui.layout.HBox();
    this._layout.connectToWidget(this);
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
      progressive.addListener("renderStart",
                              function(e)
                              {
                                this.__total = e.getData().initial;
                                this.show();
                              },
                              this);

      // Listen for the "progress" event, to update the progress bar
      progressive.addListener("progress",
                              function(e)
                              {
                                var complete =
                                  1.0 -
                                  (e.getData().remaining / this.__total);
                                var decoratorWidth =
                                  Math.floor(this.getWidth() * complete);
                                if (! isNaN(decoratorWidth))
                                {
                                  var percent =
                                    Math.floor(complete * 100) + "%";
                                  this._percentDone.setLabel(percent);
                                  this._decorator.set(
                                    {
                                      widthLeft : decoratorWidth
                                    });
                                }
                              },
                              this);

      // Listen for the "renderEnd" event to make ourself invisible
      progressive.addListener("renderEnd",
                              function(e)
                              {
                                this.exclude();
                              },
                              this);
    },

    /**
     * This method is required by the box layout. If returns an array of items
     * to relayout.
     */
    getLayoutChildren : function()
    {
      return this._columnWidths.getData();
    },


    /**
     * Event handler for the "resize" event.  We compute and sum the new
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
        this.getBounds().width - qx.bom.element.Overflow.getScrollbarWidth();

      // Compute the column widths
      this._layout.renderLayout(width, 100);

      // Sum the column widths
      var width = 0;

      // Get the column data
      var columnData = this._columnWidths.getData();

      // Determine the total width that we'll need
      for (var i = 0; i < columnData.length; i++)
      {
        // Cumulate the width
        width += columnData[i].getComputedWidth();
      }

      // Set the width of the progress bar
      this.setWidth(width);
    }
  }
});
