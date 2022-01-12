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
 * A layer is responsible to render one aspect of a virtual pane. The pane tells
 * each layer to render/update a specific window of the virtual grid.
 */
qx.Interface.define("qx.ui.virtual.core.ILayer", {
  members: {
    /**
     * Called once to connect the layer to the pane that uses it
     *
     * @param pane {qx.ui.virtual.core.Pane} the pane
     */
    connectToPane(pane) {},

    /**
     * Returns the connected pane
     *
     * @return {qx.ui.virtual.core.Pane} the connected pane
     */
    getPane() {},

    /**
     * Do a complete update of the layer. All cached data should be discarded.
     * This method is called e.g. after changes to the grid geometry
     * (row/column sizes, row/column count, ...).
     *
     * Note: This method can only be called after the widgets initial appear
     * event has been fired because it may work with the widget's DOM elements.
     *
     * @param firstRow {Integer} Index of the first row to display.
     * @param firstColumn {Integer} Index of the first column to display.
     */
    fullUpdate(firstRow, firstColumn, columnSizes) {
      this.assertArgumentsCount(arguments, 6, 6);
      this.assertPositiveInteger(firstRow);
      this.assertPositiveInteger(firstColumn);
    },

    /**
     * Update the layer to display a different window of the virtual grid.
     * This method is called if the pane is scrolled, resized or cells
     * are prefetched. The implementation can assume that no other grid
     * data has been changed since the last "fullUpdate" of "updateLayerWindow"
     * call.
     *
     * Note: This method can only be called after the widgets initial appear
     * event has been fired because it may work with the widget's DOM elements.
     *
     * @param firstRow {Integer} Index of the first row to display.
     * @param firstColumn {Integer} Index of the first column to display.
     */
    updateLayerWindow(firstRow, firstColumn) {
      this.assertArgumentsCount(arguments, 6, 6);
      this.assertPositiveInteger(firstRow);
      this.assertPositiveInteger(firstColumn);
    },

    /**
     * Update the layer to reflect changes in the data the layer displays.
     */
    updateLayerData() {}
  }
});
