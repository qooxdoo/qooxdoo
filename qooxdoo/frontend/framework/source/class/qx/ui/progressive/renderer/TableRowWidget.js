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
 * Table Row for Progressive renderer.  EXPERIMENTAL!  INTERFACE MAY CHANGE.
 */
qx.Class.define("qx.ui.progressive.renderer.TableRowWidget",
{
  extend     : qx.ui.progressive.renderer.Abstract,


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


  members :
  {
    /**
     */
    render : function(state, element)
    {
      var cell;
      var style;
      var data = element.data;

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
            height  : "100%"
          });

        columnStyle = this._columnStyle[i];
        if (columnStyle)
        {
            cell.set(columnStyle);
        }

        if (state.current % 2 == 0 && i == 1)
        {
          cell.setHeight(32);
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
      switch(element.location)
      {
      case "end":
        state.pane.add(row);
        break;

      case "start":
        state.pane.addAtBegin(row);
        break;

      default:
        throw new Error("Invalid location: " + element.location);
      }
    }
  },


  /**
   */
  destruct : function()
  {
  }
});
