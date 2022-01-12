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
 * Abstract base class for layers of a virtual pane.
 *
 * This class queues calls to {@link #fullUpdate}, {@link #updateLayerWindow}
 * and {@link #updateLayerData} and only performs the absolute necessary
 * actions. Concrete implementation of this class must at least implement
 * the {@link #_fullUpdate} method. Additionally the two methods
 * {@link #_updateLayerWindow} and {@link #_updateLayerData} may be implemented
 * to increase the performance.
 */
qx.Class.define("qx.ui.virtual.layer.Abstract", {
  extend: qx.ui.core.Widget,
  type: "abstract",

  implement: [qx.ui.virtual.core.ILayer],

  /*
   *****************************************************************************
      CONSTRUCTOR
   *****************************************************************************
   */

  construct() {
    super();

    this.__jobs = {};
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
      init: true
    }
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {
    __jobs: null,
    __arguments: null,

    __firstRow: null,
    __firstColumn: null,
    __pane: null,

    /**
     * @Override
     */
    connectToPane(pane) {
      if (qx.core.Environment.get("qx.debug")) {
        this.assertTrue(!this.__pane);
      }
      this.__pane = pane;
    },

    /**
     * @Override
     */
    getPane() {
      return this.__pane;
    },

    /**
     * Get the first rendered row
     *
     * @return {Integer} The first rendered row
     */
    getFirstRow() {
      return this.__firstRow;
    },

    /**
     * Get the first rendered column
     *
     * @return {Integer} The first rendered column
     */
    getFirstColumn() {
      return this.__firstColumn;
    },

    // overridden
    syncWidget(jobs) {
      // return if the layer is not yet rendered
      // it will rendered in the appear event
      if (!this.getContentElement().getDomElement()) {
        return;
      }

      if (
        this.__jobs.fullUpdate ||
        (this.__jobs.updateLayerWindow && this.__jobs.updateLayerData)
      ) {
        this._fullUpdate.apply(this, this.__arguments);
      } else if (this.__jobs.updateLayerWindow) {
        this._updateLayerWindow.apply(this, this.__arguments);
      } else if (this.__jobs.updateLayerData && this.__rowSizes) {
        this._updateLayerData();
      }

      if (this.__jobs.fullUpdate || this.__jobs.updateLayerWindow) {
        var args = this.__arguments;
        this.__firstRow = args[0];
        this.__firstColumn = args[1];
      }

      this.__jobs = {};
    },

    /**
     * Update the layer to reflect changes in the data the layer displays.
     *
     * Note: It is guaranteed that this method is only called after the layer
     * has been rendered.
     */
    _updateLayerData() {
      this._fullUpdate(this.__firstRow, this.__firstColumn);
    },

    /**
     * Do a complete update of the layer. All cached data should be discarded.
     * This method is called e.g. after changes to the grid geometry
     * (row/column sizes, row/column count, ...).
     *
     * Note: It is guaranteed that this method is only called after the layer
     * has been rendered.
     *
     * @param firstRow {Integer} Index of the first row to display
     * @param firstColumn {Integer} Index of the first column to display
     * @param rowSizes {Map} Array of sizes for each row to display, each element has `top` & `width`
     * @param columnSizes {Map} Array of sizes for each column to display, each element has `left` & `height`
     */
    _fullUpdate(firstRow, firstColumn) {
      throw new Error("Abstract method '_fullUpdate' called!");
    },

    /**
     * Update the layer to display a different window of the virtual grid.
     * This method is called if the pane is scrolled, resized or cells
     * are prefetched. The implementation can assume that no other grid
     * data has been changed since the last "fullUpdate" of "updateLayerWindow"
     * call.
     *
     * Note: It is guaranteed that this method is only called after the layer
     * has been rendered.
     *
     * @param firstRow {Integer} Index of the first row to display
     * @param firstColumn {Integer} Index of the first column to display
     */
    _updateLayerWindow(firstRow, firstColumn) {
      this._fullUpdate(firstRow, firstColumn);
    },

    // interface implementation
    updateLayerData() {
      this.__jobs.updateLayerData = true;
      qx.ui.core.queue.Widget.add(this);
    },

    // interface implementation
    fullUpdate(firstRow, firstColumn) {
      this.__arguments = arguments;
      this.__jobs.fullUpdate = true;
      qx.ui.core.queue.Widget.add(this);
    },

    // interface implementation
    updateLayerWindow(firstRow, firstColumn) {
      this.__arguments = arguments;
      this.__jobs.updateLayerWindow = true;
      qx.ui.core.queue.Widget.add(this);
    }
  },

  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct() {
    this.__jobs = this.__arguments = null;
  }
});
