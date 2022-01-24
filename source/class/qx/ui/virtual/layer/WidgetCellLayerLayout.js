qx.Class.define("qx.ui.virtual.layer.WidgetCellLayerLayout", {
  extend: qx.ui.layout.Abstract,

  members: {
    __lastSizeHints: null,

    /**
     * @Override
     */
    _computeSizeHint() {
      let computed = {
        height: 100,
        width: 100,
        minHeight: 0,
        minWidth: 0
      };

      return computed;
    },

    /**
     * @Override
     */
    renderLayout(availWidth, availHeight, padding) {
      let lastSizeHints = this.__lastSizeHints;
      this.__lastSizeHints = {};
      let layer = this._getWidget();
      let pane = layer.getPane();
      let firstRow = pane.getFirstRow();
      let firstColumn = pane.getFirstColumn();
      let rowSizes = pane.getRowSizes();
      let columnSizes = pane.getColumnSizes();

      this._getLayoutChildren().forEach(child => {
        let rowIndex = child.getUserData("cell.row");
        let columnIndex = child.getUserData("cell.column");
        if (typeof rowIndex != "number" || typeof columnIndex != "number") {
          this.error(
            `Cannot get row/column from child ${child}, rowIndex=${rowIndex}, columnIndex=${columnIndex}`
          );

          return;
        }

        if (
          !columnSizes[columnIndex - firstColumn] ||
          !rowSizes[rowIndex - firstRow]
        ) {
          //this.warn(`Cannot find sizes for ${rowIndex}-${firstRow} (${rowSizes[rowIndex-firstRow]}), ${columnIndex}-${firstColumn} (${columnSizes[columnIndex-firstColumn]})`);
          return;
        }
        let { left, width } = columnSizes[columnIndex - firstColumn];
        let { top, height } = rowSizes[rowIndex - firstRow];

        let hint = child.getSizeHint();
        let lastHint =
          (lastSizeHints && lastSizeHints[child.toHashCode()]) || null;
        if (height > hint.maxHeight) height = hint.maxHeight;
        if (width > hint.maxWidth) width = hint.maxWidth;
        if (lastHint) {
          var hintChanged =
            lastHint.minWidth !== hint.minWidth ||
            lastHint.width !== hint.width ||
            lastHint.maxWidth !== hint.maxWidth ||
            lastHint.minHeight !== hint.minHeight ||
            lastHint.height !== hint.height ||
            lastHint.maxHeight !== hint.maxHeight;
          if (hintChanged) qx.ui.core.queue.Layout.add(pane);
        }
        this.__lastSizeHints[child.toHashCode()] = hint;

        child.renderLayout(left, top, width, height);
      });
    }
  }
});
