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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * All of the resizing information about a column.  This is the class which
 * {@link qx.ui.table.util.Widths} contains in its array of column data.
 */
qx.Class.define("qx.ui.table.columnmodel.resizebehavior.ColumnData",
{
  extend : qx.ui.core.LayoutItem,


  construct : function()
  {
    this.base(arguments);
    this.setColumnWidth("auto");
  },


  members :
  {
    // overridden
    renderLayout : function(left, top, width, height) {
      this._computedWidth = width;
    },


    /**
     * Get the computed width of the column.
     */
    getComputedWith : function() {
      return this._computedWidth;
    },


    /**
     * Set the column width. The column width can be one of the following values:
     *
     * * Autosized: <code>"auto"</code>
     * * Flex: e.g. <code>1*</code>
     * * Percent: e.g. <code>33%</code>
     *
     * @param width {Integer} The column with
     */
    setColumnWidth : function(width)
    {
      var flex = null;
      var percent = null;

      if (typeof width == "number")
      {
        this.setWidth(width);
      }
      else if (typeof width == "string")
      {
        if (width == "auto") {
          flex = 1;
        }
        else
        {
          var match = width.match(/^[0-9]+(?:\.[0-9]+)?([%\*])$/);
          if (match)
          {
            if (match[1] == "*") {
              flex = parseFloat(width);
            } else {
              percent = width;
            }
          }
        }
      }
      this.setLayoutProperties({
        flex: flex,
        width: percent
      });
    }
  }
})