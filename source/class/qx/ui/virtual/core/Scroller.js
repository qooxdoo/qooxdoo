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
 * The Scroller wraps a {@link Pane} and provides scroll bars to interactively
 * scroll the pane's content.
 *
 * @childControl pane {qx.ui.virtual.core.Pane} Virtual pane.
 */
qx.Class.define("qx.ui.virtual.core.Scroller", {
  extend: qx.ui.core.scroll.AbstractScrollArea,

  /**
   * @param rowCount {Integer?0} The number of rows of the virtual grid.
   * @param columnCount {Integer?0} The number of columns of the virtual grid.
   * @param cellHeight {Integer?10} The default cell height.
   * @param cellWidth {Integer?10} The default cell width.
   */
  construct(rowCount, columnCount, cellHeight, cellWidth) {
    super();

    this.__pane = new qx.ui.virtual.core.Pane(
      rowCount,
      columnCount,
      cellHeight,
      cellWidth
    );

    this.__pane.addListener("update", this._computeScrollbars, this);
    this.__pane.addListener("scrollX", this._onScrollPaneX, this);
    this.__pane.addListener("scrollY", this._onScrollPaneY, this);

    if (qx.core.Environment.get("os.scrollBarOverlayed")) {
      this._add(this.__pane, { edge: 0 });
    } else {
      this._add(this.__pane, { row: 0, column: 0 });
    }
  },

  members: {
    /** @type {qx.ui.virtual.core.Pane} Virtual pane. */
    __pane: null,

    /*
    ---------------------------------------------------------------------------
      ACCESSOR METHODS
    ---------------------------------------------------------------------------
    */

    /**
     * Get the scroller's virtual pane.
     *
     * @return {qx.ui.virtual.core.Pane} The scroller's pane.
     */
    getPane() {
      return this.__pane;
    },

    /*
    ---------------------------------------------------------------------------
      CHILD CONTROL SUPPORT
    ---------------------------------------------------------------------------
    */

    // overridden
    _createChildControlImpl(id, hash) {
      if (id === "pane") {
        return this.__pane;
      } else {
        return super._createChildControlImpl(id);
      }
    },

    /*
    ---------------------------------------------------------------------------
      ITEM LOCATION SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * NOT IMPLEMENTED
     *
     * @param item {qx.ui.core.Widget} Item to query.
     * @return {Integer} Top offset.
     * @abstract
     */
    getItemTop(item) {
      throw new Error("The method 'getItemTop' is not implemented!");
    },

    /**
     * NOT IMPLEMENTED
     *
     * @param item {qx.ui.core.Widget} Item to query.
     * @return {Integer} Top offset.
     * @abstract
     */
    getItemBottom(item) {
      throw new Error("The method 'getItemBottom' is not implemented!");
    },

    /**
     * NOT IMPLEMENTED
     *
     * @param item {qx.ui.core.Widget} Item to query.
     * @return {Integer} Top offset.
     * @abstract
     */
    getItemLeft(item) {
      throw new Error("The method 'getItemLeft' is not implemented!");
    },

    /**
     * NOT IMPLEMENTED
     *
     * @param item {qx.ui.core.Widget} Item to query.
     * @return {Integer} Right offset.
     * @abstract
     */
    getItemRight(item) {
      throw new Error("The method 'getItemRight' is not implemented!");
    },

    /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */

    // overridden
    _onScrollBarX(e) {
      // Use Math.round to convert possible decimal values to 
      // integer values if a zoom level not equal to 100 is 
      // set in the browser
      this.__pane.setScrollX(Math.round(e.getData()));
    },

    // overridden
    _onScrollBarY(e) {
      // Use Math.round to convert possible decimal values to 
      // integer values if a zoom level not equal to 100 is 
      // set in the browser
      this.__pane.setScrollY(Math.round(e.getData()));
    }
  },

  destruct() {
    this.__pane.dispose();
    this.__pane = null;
  }
});
