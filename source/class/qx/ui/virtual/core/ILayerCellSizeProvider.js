/**
 * A cell size provider provides size hints about the cells
 */
qx.Interface.define("qx.ui.virtual.core.ILayerCellSizeProvider", {
  members: {
    /**
     * Returns the desired size for the cell; this only needs to be returned by the
     * layers which return widgets.  Can be null, or a map containing `width`, `height`,
     * `minWidth`, `minHeight`, `maxWidth`, `maxHeight`
     *
     * @return {Map?}
     */
    getCellSizeHint(rowIndex, columnIndex) {}
  }
});
