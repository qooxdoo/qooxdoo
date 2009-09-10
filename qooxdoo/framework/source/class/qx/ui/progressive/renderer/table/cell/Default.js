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
 * Table Cell Renderer for Progressive.  EXPERIMENTAL!  INTERFACE MAY CHANGE.
 */
qx.Class.define("qx.ui.progressive.renderer.table.cell.Default",
{
  extend     : qx.ui.progressive.renderer.table.cell.Abstract,


  /**
   */
  construct : function()
  {
    this.base(arguments);
  },


  members :
  {
    // overridden
    _getContentHtml : function(cellInfo)
    {
      return qx.bom.String.escape(this._formatValue(cellInfo.cellData));
    },


    /**
     * Formats a value in a reasonably predictable fashion.
     *
     *
     * @param value {var}
     *   The value to be formatted
     *
     * @return {String}
     * <ul>
     *   <li>
     *     Numbers are formatted with two fractional digits.
     *   </li>
     *   <li>
     *     Dates areformated in the default format of
     *     {@link qx.util.format.DateFormat.getDateInstance().format}.
     *   </li>
     *   <li>
     *     Any type not otherwise handled, including String values, are
     *     simply returned unaltered.
     *   </li>
     * </ul>
     */
    _formatValue : function(value)
    {
      var ret;

      if (value == null)
      {
        return "";
      }

      if (typeof value == "string")
      {
        return value;
      }
      else if (typeof value == "number")
      {
        if (! qx.ui.progressive.renderer.table.Row._numberFormat)
        {
          var numberFormat = new qx.util.format.NumberFormat();
          numberFormat.setMaximumFractionDigits(2);
          qx.ui.progressive.renderer.table.Row._numberFormat = numberFormat;
        }
        ret =
          qx.ui.progressive.renderer.table.Row._numberFormat.format(value);
      }
      else if (value instanceof Date)
      {
        ret = qx.util.format.DateFormat.getDateInstance().format(value);
      }
      else
      {
        ret = value;
      }

      return ret;
    }
  }
});
