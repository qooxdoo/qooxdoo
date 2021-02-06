/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 Derrell Lipman

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * All of the resizing information about a column.
 *
 *  This is used internally by qx.ui.table and qx.ui.progressive's table and
 *  may be used for other widgets as well.
 */
qx.Class.define("qx.ui.core.ColumnData",
{
  extend : qx.ui.core.LayoutItem,


  construct : function()
  {
    this.base(arguments);
    this.setColumnWidth("auto");
  },


  members :
  {
    __computedWidth : null,


    // overridden
    renderLayout : function(left, top, width, height) {
      this.__computedWidth = width;
    },


    /**
     * Get the computed width of the column.
     * @return {Integer} Computed column width
     */
    getComputedWidth : function() {
      return this.__computedWidth;
    },


    /**
     * Get the column's flex value
     *
     * @return {Integer} The column's flex value
     */
    getFlex : function()
    {
      return this.getLayoutProperties().flex || 0;
    },


    /**
     * Set the column width. The column width can be one of the following
     * values:
     *
     * * Pixels: e.g. <code>23</code>
     * * Autosized: <code>"auto"</code>
     * * Flex: e.g. <code>"1*"</code>
     * * Percent: e.g. <code>"33%"</code>
     *
     * @param width {Integer|String} The column width
     * @param flex {Integer?0} Optional flex value of the column
     */
    setColumnWidth : function(width, flex)
    {
      var flex = flex || 0;
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
  },

  environment :
  {
    "qx.tableResizeDebug" : false
  }
});
