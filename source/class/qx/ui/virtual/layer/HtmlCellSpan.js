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

************************************************************************ */

/**
 * An extended HtmlCell layer, which adds the possibility to specify row and
 * column spans for specific cells.
 */
qx.Class.define("qx.ui.virtual.layer.HtmlCellSpan", {
  extend: qx.ui.virtual.layer.HtmlCell,

  /**
   * @param htmlCellProvider {qx.ui.virtual.core.IHtmlCellProvider} This class
   *    provides the HTML markup for each cell.
   * @param rowConfig {qx.ui.virtual.core.Axis} The row configuration of the pane
   *    in which the cells will be rendered
   * @param columnConfig {qx.ui.virtual.core.Axis} The column configuration of
   *    the pane in which the cells will be rendered
   */
  construct(htmlCellProvider, rowConfig, columnConfig) {
    super(htmlCellProvider);
    this._spanManager = new qx.ui.virtual.layer.CellSpanManager(
      rowConfig,
      columnConfig
    );
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {
    /**
     * Set the row and column span for a specific cell
     *
     * @param row {PositiveInteger} The cell's row
     * @param column {PositiveInteger} The cell's column
     * @param rowSpan {PositiveInteger} The number of rows the cells spans
     * @param columnSpan {PositiveInteger} The number of columns the cells spans
     */
    setCellSpan(row, column, rowSpan, columnSpan) {
      var id = row + "x" + column;
      this._spanManager.removeCell(id);
      if (rowSpan > 1 || columnSpan > 1) {
        this._spanManager.addCell(id, row, column, rowSpan, columnSpan);
      }
      qx.ui.core.queue.Widget.add(this);
    },

    /**
     * Renders a cell
     *
     * @param htmlArr {String[]} the output array
     * @param row {Integer} The cell's row index
     * @param column {Integer} The cell's column index
     * @param left {Integer} The cell's CSS left position (in pixel)
     * @param top {Integer} The cell's CSS top position (in pixel)
     * @param width {Integer} The cell's width
     * @param height {Integer} The cell's height
     */
    __renderCell(htmlArr, row, column, left, top, width, height) {
      var cellProperties = this._cellProvider.getCellProperties(row, column);
      var insets = cellProperties.insets || [0, 0];

      htmlArr.push(
        "<div ",
        "style='",
        "left:",
        left,
        "px;",
        "top:",
        top,
        "px;",
        this._getCellSizeStyle(width, height, insets[0], insets[1]),
        cellProperties.style || "",
        "' ",
        "class='",
        cellProperties.classes || "",
        "' ",
        cellProperties.attributes || "",
        ">",
        cellProperties.content || "",
        "</div>"
      );
    },

    // overridden
    _fullUpdate(firstRow, firstColumn) {
      let rowSizes = this.getPane().getRowSizes();
      let columnSizes = this.getPane().getColumnSizes();
      var html = [];

      var cells = this._spanManager.findCellsInWindow(
        firstRow,
        firstColumn,
        rowSizes.length,
        columnSizes.length
      );

      if (cells.length > 0) {
        var bounds = this._spanManager.getCellBounds(
          cells,
          firstRow,
          firstColumn
        );

        var spanMap = this._spanManager.computeCellSpanMap(
          cells,
          firstRow,
          firstColumn,
          rowSizes.length,
          columnSizes.length
        );

        // render spanning cells
        for (var i = 0, l = cells.length; i < l; i++) {
          var cell = cells[i];
          var cellBounds = bounds[i];
          this.__renderCell(
            html,
            cell.firstRow,
            cell.firstColumn,
            cellBounds.left,
            cellBounds.top,
            cellBounds.width,
            cellBounds.height
          );
        }
      } else {
        // create empty dummy map
        spanMap = [];
        for (var i = 0; i < rowSizes.length; i++) {
          spanMap[firstRow + i] = [];
        }
      }

      // render non spanning cells
      var row = firstRow;
      var column = firstColumn;
      for (
        var rowSizeIndex = 0;
        rowSizeIndex < rowSizes.length;
        rowSizeIndex++
      ) {
        var column = firstColumn;

        for (
          var columnSizeIndex = 0;
          columnSizeIndex < columnSizes.length;
          columnSizeIndex++
        ) {
          if (!spanMap[row][column]) {
            this.__renderCell(
              html,
              row,
              column,
              columnSizes[columnSizeIndex].left,
              rowSizes[rowSizeIndex].top,
              columnSizes[columnSizeIndex].width,
              rowSizes[rowSizeIndex].height
            );
          }

          column++;
        }
        row++;
      }

      this.getContentElement().setAttribute("html", html.join(""));
    }
  },

  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct() {
    this._disposeObjects("_spanManager");
  }
});
