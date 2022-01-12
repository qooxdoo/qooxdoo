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
 * The Row layer renders row background colors.
 */
qx.Class.define("qx.ui.virtual.layer.Row", {
  extend: qx.ui.virtual.layer.AbstractBackground,

  properties: {
    // overridden
    appearance: {
      refine: true,
      init: "row-layer"
    }
  },

  members: {
    /*
     * @Override
     */
    _fullUpdate(firstRow, firstColumn) {
      let rowSizes = this.getPane().getRowSizes();
      let columnSizes = this.getPane().getColumnSizes();
      var width = qx.lang.Array.sum(columnSizes.map(s => s.outerWidth));

      let children = this._getChildren();
      while (children.length > rowSizes.length) {
        let child = children[0];
        this._remove(child);
        child.dispose();
      }

      for (
        var rowSizeIndex = 0;
        rowSizeIndex < rowSizes.length;
        rowSizeIndex++
      ) {
        let child;
        if (children.length <= rowSizeIndex) {
          child = new qx.ui.virtual.layer.BackgroundSpan();
          this._add(child);
        } else {
          child = children[rowSizeIndex];
        }

        let rowIndex = firstRow + rowSizeIndex;
        let rowAppearance =
          this.getSpanAppearanceFor(rowIndex) || child.$$init_appearance;
        child.set({
          appearance: rowAppearance,
          layoutProperties: {
            left: 0,
            top: rowSizes[rowSizeIndex].outerTop
          },

          width: width,
          height: rowSizes[rowSizeIndex].outerHeight
        });

        function setState(name, state) {
          if (state) child.addState(name);
          else child.removeState(name);
        }
        setState("selected", this.isSelected(rowIndex));
        setState("header", this.isHasHeader() && rowIndex == 0);
        let dataRowIndex = this.isHasHeader() ? rowIndex - 1 : rowIndex;
        setState("odd", dataRowIndex % 2 == 0);
      }

      this._width = width;
    },

    /*
     * @Override
     */
    _updateLayerWindow(firstRow, firstColumn) {
      if (
        firstRow !== this.getFirstRow() ||
        this._width <
          qx.lang.Array.sum(
            this.getPane()
              .getColumnSizes()
              .map(s => s.outerWidth)
          )
      ) {
        this._fullUpdate(firstRow, firstColumn);
      }
    },

    /*
     * @Override
     */
    setColor(index, color) {
      super.setColor(index, color);

      if (this.__isRowRendered(index)) {
        this.updateLayerData();
      }
    },

    /*
     * @Override
     */
    setIndividualRowAppearance(index, decorator) {
      super.setIndividualRowAppearance(index, decorator);
      if (this.__isRowRendered(index)) {
        this.updateLayerData();
      }
    },

    /**
     * Whether the row with the given index is currently rendered (i.e. in the
     * layer's view port).
     *
     * @param index {Integer} The row's index
     * @return {Boolean} Whether the row is rendered
     */
    __isRowRendered(index) {
      var firstRow = this.getFirstRow();
      var lastRow = firstRow + this.getPane().getRowSizes().length - 1;
      return index >= firstRow && index <= lastRow;
    }
  }
});
