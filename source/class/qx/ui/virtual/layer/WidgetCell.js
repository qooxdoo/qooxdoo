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
 * The WidgetCell layer renders each cell with a qooxdoo widget. The concrete
 * widget instance for each cell is provided by a cell provider.
 */
qx.Class.define("qx.ui.virtual.layer.WidgetCell", {
  extend: qx.ui.virtual.layer.Abstract,

  include: [qx.ui.core.MChildrenHandling],
  implement: [
    qx.ui.virtual.core.IWidgetCellProvider,
    qx.ui.virtual.core.ILayerCellSizeProvider
  ],

  /**
   * @param widgetCellProvider {qx.ui.virtual.core.IWidgetCellProvider} This
   *    class manages the life cycle of the cell widgets.
   * @param rowConfig {qx.ui.virtual.core.Axis} The row configuration of the pane
   *    in which the cells will be rendered
   * @param columnConfig {qx.ui.virtual.core.Axis} The column configuration of the pane
   *    in which the cells will be rendered
   */
  construct(widgetCellProvider) {
    super();
    this.setZIndex(12);
    this._setLayout(new qx.ui.virtual.layer.WidgetCellLayerLayout());

    if (qx.core.Environment.get("qx.debug")) {
      this.assertInterface(
        widgetCellProvider,
        qx.ui.virtual.core.IWidgetCellProvider
      );
    }

    this._cellProvider = widgetCellProvider;
    this.__spacerPool = [];
  },

  /*
   *****************************************************************************
      PROPERTIES
   *****************************************************************************
   */

  properties: {
    // overridden
    anonymous: {
      refine: true,
      init: false
    }
  },

  events: {
    /**
     * Is fired when the {@link #_fullUpdate} or the
     * {@link #_updateLayerWindow} is finished.
     */
    updated: "qx.event.type.Event"
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {
    __spacerPool: null,

    /**
     * @Override
     */
    getCellWidget(row, column) {
      return this._cellProvider.getCellWidget(row, column);
    },

    /**
     * @Override
     */
    poolCellWidget(widget) {
      return this._cellProvider.poolCellWidget(widget);
    },

    /**
     * @Override
     */
    getCellSizeHint(rowIndex, columnIndex) {
      if (
        qx.Interface.objectImplements(
          this._cellProvider,
          qx.ui.virtual.core.ILayerCellSizeProvider
        )
      )
        return this._cellProvider.getCellSizeHint(rowIndex, columnIndex);
      let item =
        this._cellProvider.getCellWidget(rowIndex, columnIndex) ||
        this._getSpacer();
      let hint = item.getSizeHint();
      return hint;
    },

    /**
     * Returns the widget used to render the given cell. May return null if the
     * cell isn’t rendered currently rendered.
     *
     * @param row {Integer} The cell's row index
     * @param column {Integer} The cell's column index
     * @return {qx.ui.core.LayoutItem|null} the widget used to render the given
     *    cell or <code>null</code>
     */
    getRenderedCellWidget(row, column) {
      if (this._getChildren().length === 0) {
        return null;
      }

      var columnCount = this.getPane().getColumnSizes().length;
      var rowCount = this.getPane().getRowSizes().length;

      var firstRow = this.getFirstRow();
      var firstColumn = this.getFirstColumn();

      if (
        row < firstRow ||
        row >= firstRow + rowCount ||
        column < firstColumn ||
        column >= firstColumn + columnCount
      ) {
        return null;
      }

      var childIndex = column - firstColumn + (row - firstRow) * columnCount;
      var widget = this._getChildren()[childIndex];

      if (!widget || widget.getUserData("cell.empty")) {
        return null;
      } else {
        return widget;
      }
    },

    /**
     * Get the spacer widget, for empty cells
     *
     * @return {qx.ui.core.Spacer} The spacer widget.
     */
    _getSpacer() {
      var spacer = this.__spacerPool.pop();
      if (!spacer) {
        spacer = new qx.ui.core.Spacer();
        spacer.setUserData("cell.empty", 1);
      }
      return spacer;
    },

    /**
     * Activates one of the still not empty items.
     * @param elementToPool {qx.ui.core.Widget} The widget which gets pooled.
     */
    _activateNotEmptyChild(elementToPool) {
      // get the current active element
      var active = qx.ui.core.FocusHandler.getInstance().getActiveWidget();
      // if the element to pool is active or one of its children
      if (
        active == elementToPool ||
        qx.ui.core.Widget.contains(elementToPool, active)
      ) {
        // search for a new child to activate
        var children = this._getChildren();
        for (var i = children.length - 1; i >= 0; i--) {
          if (!children[i].getUserData("cell.empty")) {
            children[i].activate();
            break;
          }
        }
      }
    },

    renderLayout(left, top, width, height) {
      let pane = this.getPane();
      let firstRow = pane.getFirstRow();
      let firstColumn = pane.getFirstColumn();

      var cellProvider = this._cellProvider;
      let rowSizes = this.getPane().getRowSizes();
      let columnSizes = this.getPane().getColumnSizes();

      let spacers = {};
      const addSpacer = spacer => {
        let itemRow = spacer.getUserData("cell.row");
        let itemColumn = spacer.getUserData("cell.column");
        let id = itemRow + "x" + itemColumn;
        spacers[id] = spacer;
      };
      const useSpacer = (itemRow, itemColumn) => {
        let id = itemRow + "x" + itemColumn;
        let spacer = spacers[id];
        if (spacer) {
          delete spacers[id];
          return spacer;
        }
        spacer = this._getSpacer();
        return spacer;
      };
      const clearSpacers = () => {
        Object.values(spacers).forEach(spacer => {
          this._remove(spacer);
          this.__spacerPool.push(spacer);
          spacer.setUserData("cell.row", null);
          spacer.setUserData("cell.column", null);
        });
      };

      var children = this._getChildren().concat();
      for (var i = 0; i < children.length; i++) {
        var child = children[i];

        if (child.getUserData("cell.empty")) {
          addSpacer(child);
        } else {
          let rowIndex = child.getUserData("cell.row");
          let columnIndex = child.getUserData("cell.column");
          if (
            rowIndex < firstRow ||
            rowIndex >= firstRow + rowSizes.length ||
            columnIndex < firstColumn ||
            columnIndex >= firstColumn + columnSizes.length
          ) {
            this._activateNotEmptyChild(child);
            this._remove(child);
            cellProvider.poolCellWidget(child);
            child.setUserData("cell.row", null);
            child.setUserData("cell.column", null);
          }
        }
      }

      for (var y = 0; y < rowSizes.length; y++) {
        var row = firstRow + y;

        for (var x = 0; x < columnSizes.length; x++) {
          var column = firstColumn + x;

          var item = cellProvider.getCellWidget(row, column);
          if (qx.core.Environment.get("qx.debug")) {
            if (item) {
              let itemRow = item.getUserData("cell.row");
              let itemColumn = item.getUserData("cell.column");
              if (
                (itemRow !== null && itemRow !== row) ||
                (itemColumn !== null && itemColumn !== column)
              ) {
                throw new Error("Changing the row and column of a widget");
              }
            }
          }
          if (!item) {
            item = useSpacer(row, column);
          }

          let invalidate = false;
          if (item.getLayoutParent() !== this) {
            this._add(item);
            invalidate = true;
          }
          if (
            item.getUserData("cell.row") === null ||
            item.getUserData("cell.column") === null
          ) {
            item.setUserData("cell.row", row);
            item.setUserData("cell.column", column);
            invalidate = true;
          }

          if (invalidate) {
            item.invalidateLayoutCache();
          }
        }
      }

      clearSpacers();
      super.renderLayout(left, top, width, height);
    },

    // overridden
    _fullUpdate(firstRow, firstColumn) {
      this._getChildren().forEach(child => {
        child.invalidateLayoutCache();
      });
      this.fireEvent("updated");
    }
  },

  destruct() {
    var children = this._getChildren();
    for (var i = 0; i < children.length; i++) {
      children[i].dispose();
    }

    this._cellProvider = this.__spacerPool = null;
  }
});
