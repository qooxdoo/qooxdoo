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
 * An extended WidgetCell layer, which adds the possibility to specify row and
 * column spans for specific cells.
 */
qx.Class.define("qx.ui.virtual.layer.WidgetCellSpan",
{
  extend : qx.ui.virtual.layer.Abstract,

  include : [
    qx.ui.core.MChildrenHandling
  ],


  /**
  * @param widgetCellProvider {qx.ui.virtual.core.IWidgetCellProvider} This
   *    class manages the life cycle of the cell widgets.
   * @param rowConfig {qx.ui.virtual.core.Axis} The row configuration of the pane
   *    in which the cells will be rendered
   * @param columnConfig {qx.ui.virtual.core.Axis} The column configuration of the pane
   *    in which the cells will be rendered
   */
  construct : function(widgetCellProvider, rowConfig, columnConfig)
  {
    this.base(arguments);
    this.setZIndex(12);

    this._spanManager = new qx.ui.virtual.layer.CellSpanManager(rowConfig, columnConfig);
    this._cellProvider = widgetCellProvider;
    this.__spacerPool = [];

    this._cellLayer = new qx.ui.virtual.layer.WidgetCell(
      this.__getCellProviderForNonSpanningCells()
    );
    this._cellLayer.setZIndex(0);

    this._setLayout(new qx.ui.layout.Grow());
    this._add(this._cellLayer);
  },


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    // overridden
    anonymous :
    {
      refine: true,
      init: false
    }
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Returns the widget used to render the given cell. May return null if the
     * cell isn’t rendered currently rendered.
     *
     * @param row {Integer} The cell's row index
     * @param column {Integer} The cell's column index
     * @return {qx.ui.core.LayoutItem|null} the widget used to render the given
     *    cell or <code>null</code>
     */
     getRenderedCellWidget : function(row, column)
     {
       var widget = this._cellLayer.getRenderedCellWidget(row, column);
       if (!widget || widget.getUserData("cell.spanning"))
       {
         var children = this._getChildren();
         for (var i=0, l=children.length; i<l; i++)
         {
           var child = children[i];
           if (child == this._cellLayer) {
             continue;
           }

           var cell = {
             row: child.getUserData("cell.row"),
             column : child.getUserData("cell.column"),
             rowSpan : child.getUserData("cell.rowspan"),
             colSpan : child.getUserData("cell.colspan")
           };

           if (
             cell.row <= row && row < cell.row + cell.rowSpan &&
             cell.column <= column && column < cell.column + cell.colSpan
           ) {
             return child;
           }
         }
         return null;
       }

       return widget;
     },


    __spacerPool : null,

    /**
     * Set the row and column span for a specific cell
     *
     * @param row {PositiveInteger} The cell's row
     * @param column {PositiveInteger} The cell's column
     * @param rowSpan {PositiveInteger} The number of rows the cells spans
     * @param columnSpan {PositiveInteger} The number of columns the cells spans
     */
    setCellSpan : function(row, column, rowSpan, columnSpan)
    {
      var id = row + "x" + column;
      this._spanManager.removeCell(id);
      if (rowSpan > 1 || columnSpan > 1) {
        this._spanManager.addCell(id, row, column, rowSpan, columnSpan);
      }
      qx.ui.core.queue.Widget.add(this);
    },


    /**
     * Get the spacer widget, for span cells
     *
     * @return {qx.ui.core.Spacer} The spacer widget.
     */
    _getSpacer : function()
    {
      var spacer = this.__spacerPool.pop();
      if (!spacer)
      {
        spacer = new qx.ui.core.Spacer();
        spacer.setUserData("cell.empty", 1);
        spacer.setUserData("cell.spanning", 1);
      }
      return spacer;
    },


    /**
     * Get the cell provider for the non spanning cells
     *
     * @return {qx.ui.virtual.core.IWidgetCellProvider} the cell provider
     */
    __getCellProviderForNonSpanningCells : function()
    {
      var self = this;
      var cellProvider = this._cellProvider;
      var spacerPool = this.__spacerPool;

      var nonSpanningCellProvider =
      {
        getCellWidget : function(row, column)
        {
          if (!self._spanMap[row][column])
          {
            var widget = cellProvider.getCellWidget(row, column);
          }
          else
          {
            var widget = self._getSpacer();
          }
          return widget;
        },

        poolCellWidget : function(widget)
        {
          if (widget.getUserData("cell.spanning")) {
            spacerPool.push(widget);
          } else {
            cellProvider.poolCellWidget(widget);
          }
        }
      };

      return nonSpanningCellProvider;
    },


    /**
     * Updates the fields <code>_cells</code>, <code>_bounds</code> and
     * <code>_spanMap</code> according to the given grid window.
     *
     * @param firstRow {PositiveInteger} first visible row
     * @param firstColumn {PositiveInteger} first visible column
     * @param rowCount {PositiveInteger} number of rows to update
     * @param columnCount {PositiveInteger} number columns to update
     */
    __updateCellSpanData : function(firstRow, firstColumn, rowCount, columnCount)
    {
      this._cells = this._spanManager.findCellsInWindow(
        firstRow, firstColumn,
        rowCount, columnCount
      );

      if (this._cells.length > 0)
      {
        this._bounds = this._spanManager.getCellBounds(
          this._cells,
          firstRow, firstColumn
        );
        this._spanMap = this._spanManager.computeCellSpanMap(
          this._cells,
          firstRow, firstColumn,
          rowCount, columnCount
        );
      }
      else
      {
        this._bounds = [];
        // create empty dummy map
        this._spanMap = [];
        for (var i=0; i<rowCount; i++) {
          this._spanMap[firstRow + i] = [];
        }
      }
    },


    /**
     * Updates the widget in spanned cells.
     *
     * Note: The method {@link #__updateCellSpanData} must be called before
     * this method is called:
     */
    __updateCellSpanWidgets : function()
    {
      // remove and pool existing cells
      var children = this.getChildren();
      for (var i=children.length-1; i>=0; i--)
      {
        var child = children[i];
        if (child !== this._cellLayer)
        {
          this._cellProvider.poolCellWidget(child);
          this._remove(child);
        }
      }

      for (var i=0, l=this._cells.length; i<l; i++)
      {
        var cell = this._cells[i];
        var cellBounds = this._bounds[i];
        var cellWidget = this._cellProvider.getCellWidget(cell.firstRow, cell.firstColumn);
        if (cellWidget)
        {
          cellWidget.setUserBounds(
            cellBounds.left, cellBounds.top,
            cellBounds.width, cellBounds.height
          );
          cellWidget.setUserData("cell.row", cell.firstRow);
          cellWidget.setUserData("cell.column", cell.firstColumn);
          cellWidget.setUserData("cell.rowspan", cell.lastRow - cell.firstRow + 1);
          cellWidget.setUserData("cell.colspan", cell.lastColumn - cell.firstColumn + 1);
          this._add(cellWidget);
        }
      }
    },


    // overridden
    _fullUpdate : function(firstRow, firstColumn, rowSizes, columnSizes)
    {
      this.__updateCellSpanData(
        firstRow, firstColumn,
        rowSizes.length, columnSizes.length
      );
      this.__updateCellSpanWidgets();
      this._cellLayer.fullUpdate(firstRow, firstColumn, rowSizes, columnSizes);
    },


    // overridden
    _updateLayerWindow : function(firstRow, firstColumn, rowSizes, columnSizes)
    {
      this.__updateCellSpanData(
        firstRow, firstColumn,
        rowSizes.length, columnSizes.length
      );
      this.__updateCellSpanWidgets();
      this._cellLayer.updateLayerWindow(firstRow, firstColumn, rowSizes, columnSizes);
    }
  },


  destruct : function()
  {
    var children = this._getChildren();
    for (var i=0; i<children.length; i++) {
      children[i].dispose();
    }

    this._disposeObjects("_spanManager", "_cellLayer");
    this._cellProvider = this.__spacerPool = this._cells =
      this._bounds = this._spanMap = null;
  }
});
