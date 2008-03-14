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
    /**
     */
    render : function(cellInfo)
    {  
      var html = [ ];
      var ret;

      // Render this cell
      html.push("<div class='" + cellInfo.stylesheet + "'>",
                qx.html.String.escape(this._formatValue(cellInfo.cellData)),
                "</div>");

      // We could explicitly override the cell's height but doing so prevents
      // global changes such as for increased font size.  We'll leave it at
      // the default in this cell renderer.

      // cellInfo.height = 16;

      // Give 'em what they came for!
      return html.join("");
    },


    /**
     * Formats a value.
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
