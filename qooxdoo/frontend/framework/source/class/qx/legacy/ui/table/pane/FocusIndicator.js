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
  extend : qx.ui.layout.HorizontalBoxLayout,

  construct : function(scroller)
  {
    this.base(arguments);

    this._scroller = scroller;

    this.setStyleProperty("fontSize", "0px");
    this.setStyleProperty("lineHeight", "0px");
    this.setAnonymous(true);

    this.hide();
  },

  properties :
  {
    appearance :
    {
      refine : true,
      init : "table-focus-indicator"
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

          this.setHeight(rowHeight + 3);
          this.setWidth(columnModel.getColumnWidth(col) + 3);
          this.setTop((row - firstRow) * rowHeight - 2);
          this.setLeft(paneModel.getColumnLeft(col) - 2);

          this.show();

          this.setRow(row);
          this.setColumn(col);
        }
      }
    }
  }
});
