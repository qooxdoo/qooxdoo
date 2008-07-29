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

/**
 * The focus indicator widget
 */
qx.Class.define("qx.ui.table.pane.FocusIndicator",
{
  extend : qx.ui.container.Composite,

  /**
   * @param scroller {Scroller} The scroller, which contains this focus indicator
   */
  construct : function(scroller)
  {
    this.base(arguments);
    this._scroller = scroller;
  },

  properties :
  {
    // overridden
    visibility :
    {
      refine : true,
      init : "excluded"
    },

    /** Table row, where the indicator is placed. */
    row : {
      check : "Integer"
    },

    /** Table column, where the indicator is placed. */
    column : {
      check : "Integer"
    }
  },

  members :
  {
    /**
     * Move the focus indicator to the given table cell.
     *
     * @param col {Integer} The table column
     * @param row {Integer} The table row
     */
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
