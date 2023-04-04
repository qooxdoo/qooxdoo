/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * The focus indicator widget
 */
qx.Class.define("qx.ui.table.pane.FocusIndicator", {
  extend: qx.ui.container.Composite,

  /**
   * @param scroller {qx.ui.table.pane.Scroller} The scroller, which contains this focus indicator
   */
  construct(scroller) {
    // use the grow layout to make sure that the editing control
    // always fills the focus indicator box.
    super(new qx.ui.layout.Grow());
    this.__scroller = scroller;

    this.setKeepActive(true);
    this.addListener("keypress", this._onKeyPress, this);
  },

  properties: {
    // overridden
    visibility: {
      refine: true,
      init: "excluded"
    },

    /** Table row, where the indicator is placed. */
    row: {
      check: "Integer",
      nullable: true
    },

    /** Table column, where the indicator is placed. */
    column: {
      check: "Integer",
      nullable: true
    }
  },

  members: {
    __scroller: null,

    /**
     * Keypress handler. Suppress all key events but "Enter" and "Escape"
     *
     * @param e {qx.event.type.KeySequence} key event
     */
    _onKeyPress(e) {
      var iden = e.getKeyIdentifier();
      if (iden !== "Escape" && iden !== "Enter") {
        e.stopPropagation();
      }
    },

    /**
     * Move the focus indicator to the given table cell.
     *
     * @param col {Integer?null} The table column
     * @param row {Integer?null} The table row
     * @param editing {Boolean?null} Whether or not the cell is being edited
     */
    moveToCell(col, row, editing) {
      // check if the focus indicator is shown and if the new column is
      // editable. if not, just exclude the indicator because the pointer events
      // should go to the cell itself linked with HTML links [BUG #4250]
      if (
        !this.__scroller.getShowCellFocusIndicator() &&
        !this.__scroller.getTable().getTableModel().isColumnEditable(col)
      ) {
        this.exclude();
        return;
      } else {
        this.show();
      }

      if (col == null) {
        this.hide();
        this.setRow(null);
        this.setColumn(null);
      } else {
        var xPos = this.__scroller.getTablePaneModel().getX(col);

        if (xPos === -1) {
          this.hide();
          this.setRow(null);
          this.setColumn(null);
        } else {
          var table = this.__scroller.getTable();
          var columnModel = table.getTableColumnModel();
          var paneModel = this.__scroller.getTablePaneModel();

          var firstRow = this.__scroller.getTablePane().getFirstVisibleRow();
          var rowHeight = table.getRowHeight();
          var wt = 0;
          var wr = 0;
          var wb = 0;
          var wl = 0;
          var decoKey = this.getDecorator();
          if (decoKey) {
            var deco =
              qx.theme.manager.Decoration.getInstance().resolve(decoKey);
            if (deco) {
              wt = deco.getWidthTop();
              wr = deco.getWidthRight();
              wb = deco.getWidthBottom();
              wl = deco.getWidthLeft();
            }
          }
          var userHeight = rowHeight + (wt + wb - 2);
          var renderedRowHeight = this.__scroller.getTablePane().getRenderedRowHeight();
          var userTop = Math.floor((row - firstRow) * renderedRowHeight) - (wt - 1);
          if (
            editing &&
            this.__scroller.getMinCellEditHeight() &&
            this.__scroller.getMinCellEditHeight() > userHeight
          ) {
            userTop -= Math.floor(
              (this.__scroller.getMinCellEditHeight() - userHeight) / 2
            );

            userHeight = this.__scroller.getMinCellEditHeight();
          }

          this.setUserBounds(
            paneModel.getColumnLeft(col) - (wl - 1),
            userTop,
            columnModel.getColumnWidth(col) + (wl + wr - 3),
            userHeight
          );

          this.show();
          this.setRow(row);
          this.setColumn(col);
        }
      }
    }
  },

  destruct() {
    this.__scroller = null;
  }
});
