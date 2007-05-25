/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/* ************************************************************************

#module(ui_tablevarrowheight)

************************************************************************ */

/**
 * The table pane that shows a certain section from a table. This class
 * handles the display of the data part of a table and is therefore the base
 * for virtual scrolling.
 */
qx.Class.define("qx.ui.tablevarrowheight.TablePane",
{
  extend : qx.ui.table.pane.Pane,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param paneScroller {TablePaneScroller}
    *   The TablePaneScroller the pane belongs to.
    */
  construct : function(paneScroller) {
    this.base(arguments, paneScroller);
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overloaded
    /**
     * TODOC
     *
     * @type member
     * @param completeUpdate {var} TODOC
     * @param onlyRow {var} TODOC
     * @param onlySelectionOrFocusChanged {var} TODOC
     * @return {void}
     */
    _updateContent_orig : function(completeUpdate, onlyRow, onlySelectionOrFocusChanged)
    {
      var TablePane = qx.ui.table.pane.Pane;

      var table = this.getTable();

      var alwaysUpdateCells = table.getAlwaysUpdateCells();

      var selectionModel = table.getSelectionModel();
      var tableModel = table.getTableModel();
      var columnModel = table.getTableColumnModel();
      var paneModel = this.getPaneScroller().getTablePaneModel();
      var rowRenderer = table.getDataRowRenderer();

      var colCount = paneModel.getColumnCount();
      var rowHeight;

      var firstRow = this.getFirstVisibleRow();
      var rowCount = this.getVisibleRowCount();
      var modelRowCount = tableModel.getRowCount();

      if (firstRow + rowCount > modelRowCount) {
        rowCount = Math.max(0, modelRowCount - firstRow);
      }

      // Remove the rows that are not needed any more
      if (completeUpdate || this._lastRowCount > rowCount)
      {
        var firstRowToRemove = completeUpdate ? 0 : rowCount;
        this._cleanUpRows(firstRowToRemove);
      }

      var paneMaxHeight = this._paneScroller._paneClipper.getInnerHeight();

      var elem = this.getElement();
      var childNodes = elem.childNodes;
      var cellInfo = { table : table };
      tableModel.prefetchRows(firstRow, firstRow + rowCount - 1);

      this.debug("pane height=" + qx.html.Dimension.getInnerHeight(elem));

      // For now, remove all of the child nodes.  Later, we'll optimize and try
      // to reuse and resize existing nodes.
      var numChildren = childNodes.length;

      for (var i=numChildren-1; i>=0; i--) {
        elem.removeChild(childNodes[i]);
      }

      for (var y=0, cumulativeHeight=0, row=firstRow+y; row<modelRowCount&&cumulativeHeight<paneMaxHeight; y++, row=firstRow+y)
      {
        if ((onlyRow != null) && (row != onlyRow)) {
          continue;
        }

        cellInfo.row = row;
        cellInfo.selected = selectionModel.isSelectedIndex(row);
        cellInfo.focusedRow = (this._focusedRow == row);
        cellInfo.rowData = tableModel.getRowData(row);

        // Update this row
        var rowElem;
        var recyleRowElem;

        if (y < childNodes.length)
        {
          rowElem = childNodes[y];
          recyleRowElem = true;
        }
        else
        {
          var rowElem = document.createElement("div");

          //      rowElem.style.position = "relative";
          rowElem.style.position = "absolute";
          rowElem.style.left = "0px";
          rowElem.style.top = cumulativeHeight + "px";

          recyleRowElem = false;
        }

        rowRenderer.updateDataRowElement(cellInfo, rowElem);

        if (alwaysUpdateCells || !recyleRowElem || !onlySelectionOrFocusChanged)
        {
          var html = "";
          var left = 0;

          for (var x=0; x<colCount; x++)
          {
            var col = paneModel.getColumnAtX(x);
            cellInfo.xPos = x;
            cellInfo.col = col;
            cellInfo.editable = tableModel.isColumnEditable(col);
            cellInfo.focusedCol = (this._focusedCol == col);
            cellInfo.value = tableModel.getValue(col, row);
            var width = columnModel.getColumnWidth(col);
            cellInfo.style = 'position:absolute;left:' + left + 'px;top:0px;width:' + width + 'px';

            var cellRenderer = columnModel.getDataCellRenderer(col);

            if (recyleRowElem)
            {
              var cellElem = rowElem.childNodes[x];
              cellRenderer.updateDataCellElement(cellInfo, cellElem);
            }
            else
            {
              html += cellRenderer.createDataCellHtml(cellInfo);
            }

            left += width;
          }

          if (!recyleRowElem)
          {
            rowElem.style.width = left + "px";
            rowElem.innerHTML = "<div style='position:absolute;'>" + html + "</div>";
            elem.appendChild(rowElem);
          }
        }

        var rowHeight = qx.html.Dimension.getOuterHeight(rowElem);
        this.debug("rowHeight=" + rowHeight);

        cumulativeHeight += rowHeight;
      }

      this.setHeight(cumulativeHeight);

      this._lastColCount = colCount;
      this._lastRowCount = rowCount;
    }
  }
});
