/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Jonathan Weiß (jonathan_rass)

************************************************************************ */

/**
 * Cell selection manager
 */
qx.Class.define("qx.ui.virtual.selection.CellRectangle",
{
  extend : qx.ui.virtual.selection.Abstract,


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Returns the number of all items in the pane. This number may contain
     * unselectable items as well.
     *
     * @return {Integer} number of items
     */
    _getItemCount : function() {
      return this._pane.getRowConfig().getItemCount() * this._pane.getColumnConfig().getItemCount();
    },


    /*
    ---------------------------------------------------------------------------
      IMPLEMENT ABSTRACT METHODS
    ---------------------------------------------------------------------------
    */

    // overridden
    _getSelectableFromPointerEvent : function(event)
    {
      var cell = this._pane.getCellAtPosition(
        event.getDocumentLeft(),
        event.getDocumentTop()
      );

      if (!cell) {
        return null;
      }

      return this._isSelectable(cell) ? cell : null;
    },


    // overridden
    getSelectables : function(all)
    {
      var selectables = [];

      var rowCount = this._pane.getRowConfig().getItemCount();
      var columnCount = this._pane.getColumnConfig().getItemCount();

      for (var row=0; row<rowCount; row++)
      {
        for (var column=0; column<columnCount; column++)
        {
          var cell = {
              row: row,
              column: column
          };
          if (this._isSelectable(cell)) {
            selectables.push(cell);
          }
        }
      }

      return selectables;
    },


    // overridden
    _getSelectableRange : function(item1, item2)
    {
      var selectables = [];

      var minRow = Math.min(item1.row, item2.row);
      var maxRow = Math.max(item1.row, item2.row);
      var minColumn = Math.min(item1.column, item2.column);
      var maxColumn = Math.max(item1.column, item2.column);

      for (var row=minRow; row<=maxRow; row++)
      {
        for (var column=minColumn; column<=maxColumn; column++)
        {
          var cell = {
              row: row,
              column: column
          };
          if (this._isSelectable(cell)) {
            selectables.push(cell);
          }
        }
      }
      return selectables;
    },


    // overridden
    _getFirstSelectable : function()
    {
      var rowCount = this._pane.getRowConfig().getItemCount();
      var columnCount = this._pane.getColumnConfig().getItemCount();

      for (var row=0; row<rowCount; row++)
      {
        for (var column=0; column<columnCount; column++)
        {
          var cell = {
              row: row,
              column: column
          };
          if (this._isSelectable(cell)) {
            return cell;
          }
        }
      }

      return null;
    },


    // overridden
    _getLastSelectable : function()
    {
      var rowCount = this._pane.getRowConfig().getItemCount();
      var columnCount = this._pane.getColumnConfig().getItemCount();

      for (var column=columnCount-1; column>=0; column--)
      {
        for (var row=rowCount-1; row>=0; row--)
        {
          var cell = {
              row: row,
              column: column
          };
          if (this._isSelectable(cell)) {
            return cell;
          }
        }
      }

      return null;
    },


    // overridden
    _getRelatedSelectable : function(item, relation)
    {
      var cell = {
        row: item.row,
        column: item.column
      };

      switch(relation)
      {
        case "above":
          for (var row=item.row-1; row>=0; row--)
          {
            cell.row = row;
            if (this._isSelectable(cell)) {
              return cell;
            }
          }
          break;

        case "under":
          var rowCount = this._pane.getRowConfig().getItemCount();
          for (var row=item.row+1; row<rowCount; row++)
          {
            cell.row = row;
            if (this._isSelectable(cell)) {
              return cell;
            }
          }
          break;

        case "left":
          for (var column=item.column-1; column>=0; column--)
          {
            cell.column = column;
            if (this._isSelectable(cell)) {
              return cell;
            }
          }
          break;

        case "right":
          var columnCount = this._pane.getColumnConfig().getItemCount();
          for (var column=item.column+1; column<columnCount; column++)
          {
            cell.column = column;
            if (this._isSelectable(cell)) {
              return cell;
            }
          }
          break;
      }
      return null;
    },


    // overridden
    _getPage : function(lead, up)
    {
      if (up) {
        return this._getFirstSelectable();
      } else {
        return this._getLastSelectable();
      }
    },


    // overridden
    _selectableToHashCode : function(item) {
      return item.column + "x" + item.row;
    },


    // overridden
    _scrollItemIntoView : function(item) {
      if (this._autoScrollIntoView) {
        this._pane.scrollCellIntoView(item.column, item.row);
      }
    },


    // overridden
    _getSelectableLocationX : function(item)
    {
      var columnConfig = this._pane.getColumnConfig();

      var itemLeft = columnConfig.getItemPosition(item.column);
      var itemRight = itemLeft + columnConfig.getItemSize(item.column) - 1;

      return {
        left: itemLeft,
        right: itemRight
      };
    },


    // overridden
    _getSelectableLocationY : function(item)
    {
      var rowConfig = this._pane.getRowConfig();

      var itemTop = rowConfig.getItemPosition(item.row);
      var itemBottom = itemTop + rowConfig.getItemSize(item.row) - 1;

      return {
        top: itemTop,
        bottom: itemBottom
      };
    }
  }
});
