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
 * A header for a standard table
 */
qx.Class.define("qx.ui.progressive.headfoot.Progress",
{
  extend     : qx.ui.progressive.headfoot.Abstract,

  construct : function(columnStyleArr, labelArr)
  {
    this.base(arguments);

    this.setHeight(16);

    this._border = new qx.ui.core.Border(1, "solid", "#eeeeee");
    this._border.setWidthTop(1);
    this._border.setWidthLeft(0);
    this._border.setWidthBottom(0);
    this.setBorder(this._border);
    
    // Use the same default column width as the standard table row renderer
    var defaultWidth = qx.ui.progressive.renderer.TableRowHtml.defaultWidth;
    var width = 0;

    // Determine the total width that we'll need
    for (var i = 0; i < columnStyleArr.length; i++)
    {
      // Cumulate the width
      width += (columnStyleArr[i].width || defaultWidth);
    }

    // Set the width of the progress bar
    this.setWidth(width);

    // We're initially invisible
    this.setDisplay(false);
  },

  members :
  {
    join : function(progressive)
    {
      // Save the progressive handle
      this.base(arguments, progressive);

      // Listen for the "renderStart" event, to save the number of elements on
      // the queue, and to set ourself visible
      progressive.addEventListener("renderStart",
                                   function(e)
                                   {
                                     this.__total = e.getData();
                                     this.setDisplay(true);
                                   },
                                   this);

      // Listen for the "progress" event, to update the progress bar
      progressive.addEventListener("progress",
                                   function(e)
                                   {
                                     var complete =
                                       e.getData().remaining / this.__total;
                                     var borderWidth =
                                       Math.floor(this.getWidth() * complete);
                                     this.debug("borderWidth",borderWidth);
                                     this._border.setWidthRight(borderWidth);
                                   },
                                   this);

      // Listen for the "renderEnd" event to make ourself invisible
      progressive.addEventListener("renderEnd",
                                   function(e)
                                   {
                                     this.setDisplay(false);
                                   },
                                   this);
    }
  }
});
