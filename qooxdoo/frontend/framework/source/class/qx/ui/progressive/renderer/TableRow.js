/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 Derrell LIpman

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
 * Table Row for Progressive renderer.  EXPERIMENTAL!  INTERFACE MAY CHANGE.
 */
qx.Class.define("qx.ui.progressive.renderer.TableRow",
{
  extend     : qx.core.Object,


  /**
   */
  construct : function(columnStyleArr, labelStyleArr)
  {
    this.base(arguments);

    // Save the column and label styles
    this._columnStyle = columnStyleArr;
    this._labelStyle = labelStyleArr;

    // Create a border for cell style
    var border = new qx.ui.core.Border();
    border.setRight(1, "solid", "#dddddd");
    border.setBottom(1, "solid", "#dddddd");
    this._border = border;
  },


  events :
  {
    /**
     */
  },


  statics :
  {
    /**
     */
  },


  properties :
  {
    /**
     */
  },


  members :
  {
    /**
     */
    render : function(state, data)
    {
      var cell;
      var style;

      // Instantiate a horizontal box for the row
      var row = new qx.ui.layout.HorizontalBoxLayout();
      row.set(
        {
          spacing : 4,
          height  : "auto"
        });
      
      // For each cell...
      for (var i = 0; i < data.length; i++)
      {
        // Render this cell
        cell = new qx.ui.basic.Atom(data[i].toString());
        cell.set(
          {
            border  : this._border,
            height  : 16
          });

        columnStyle = this._columnStyle[i];
        if (columnStyle)
        {
            cell.set(columnStyle);
        }

        labelStyle = this._labelStyle[i];
        if (labelStyle)
        {
          if (! labelStyle.width)
          {
            labelStyle.width = "100%";
          }
          cell.getLabelObject().set(labelStyle);
        }
        row.add(cell);
      }

      // Add this row to the table
      state._progressive.container.add(row);
    }
  },


  /**
   */
  destruct : function()
  {
  }
});
