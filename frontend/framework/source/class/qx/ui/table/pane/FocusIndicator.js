/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#module(ui_table)

************************************************************************ */

qx.Class.define("qx.ui.table.pane.FocusIndicator",
{
  extend : qx.ui.core.Widget,

  construct : function(scroller)
  {
    this.base(arguments);
    this._scroller = scroller;
  },

  properties :
  {
    // overridden
    anonymous :
    {
      refine : true,
      init : true
    },

    // overridden
    visibility :
    {
      refine : true,
      init : "excluded"
    },

    row : {
      check : "Integer"
    },

    column : {
      check : "Integer"
    }
  },

  members :
  {
    moveToCell : function(col, row)
    {
      if (col == null)
      {
        this.hide();
        this.setRow(-1);
        this.setColumn(-1);
      }
      else
      {
        var xPos = this._scroller.getTablePaneModel().getX(col);

        if (xPos == -1)
        {
          this.hide();
          this.setRow(-1);
          this.setColumn(-1);
        }
        else
        {
          var table = this._scroller.getTable();
          var columnModel = table.getTableColumnModel();
          var paneModel = this._scroller.getTablePaneModel();

          var firstRow = this._scroller.getTablePane().getFirstVisibleRow();
          var rowHeight = table.getRowHeight();

          this.setUserBounds(
              paneModel.getColumnLeft(col) - 2,
              (row - firstRow) * rowHeight - 2,
              columnModel.getColumnWidth(col) + 3,
              rowHeight + 3
          );
          this.show();

          this.setRow(row);
          this.setColumn(col);
        }
      }
    }
  },

  destruct : function ()
  {
     this._disposeFields(
       "_scroller"
     );
  }
});
