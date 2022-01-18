/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Jonathan Weiß (jonathan_rass)
   * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.test.ui.virtual.layer.LayerTestCase", {
  extend: qx.test.ui.LayoutTestCase,
  type: "abstract",

  members: {
    setUp() {
      this.colWidth = 20;
      this.rowHeight = 10;

      this.layer = this._createLayer();

      var rowSizes = [];
      for (var i = 10; i <= 20; i++) {
        rowSizes.push(this.rowHeight);
      }

      var columnSizes = [];
      for (var i = 15; i <= 18; i++) {
        columnSizes.push(this.colWidth);
      }

      this.getRoot().add(this.layer);
      this.flush();

      this.layer.updateLayerWindow(10, 15, rowSizes, columnSizes);
      this.flush();
    },

    tearDown() {
      super.tearDown();
      this.layer.destroy();
    },

    _createLayer() {
      return new qx.test.ui.virtual.layer.LayerMock();
    },

    _assertCells(firstRow, lastRow, firstColumn, lastColumn, msg) {
      return;
    },

    _updateLayerWindow(
      firstRow,
      lastRow,
      firstColumn,
      lastColumn,
      doFullUpdate
    ) {
      var rowSizes = [];
      for (var i = firstRow; i <= lastRow; i++) {
        rowSizes.push(this.rowHeight);
      }

      var columnSizes = [];
      for (var i = firstColumn; i <= lastColumn; i++) {
        columnSizes.push(this.colWidth);
      }

      if (doFullUpdate) {
        this.layer.fullUpdate(firstRow, firstColumn, rowSizes, columnSizes);
      } else {
        this.layer.updateLayerWindow(
          firstRow,
          firstColumn,
          rowSizes,
          columnSizes
        );
      }

      this.flush();
      this._assertCells(
        firstRow,
        firstColumn,
        rowSizes.length,
        columnSizes.length
      );
    },

    testInit() {
      this._assertCells(10, 15, 11, 4);
    },

    testFullUpdate() {
      this._assertCells(10, 15, 11, 4, true);
    },

    testNoOverlap() {
      this._updateLayerWindow(20, 25, 19, 21);
    },

    testScrollDown() {
      this._updateLayerWindow(12, 22, 15, 18);
    },

    testScrollUp() {
      this._updateLayerWindow(8, 18, 15, 18);
    },

    testScrollLeft() {
      this._updateLayerWindow(10, 20, 12, 15);
    },

    testScrollRight() {
      this._updateLayerWindow(10, 20, 17, 20);
    },

    testOverlapLeftTop() {
      this._updateLayerWindow(7, 11, 12, 16);
    },

    testOverlapTop() {
      this._updateLayerWindow(8, 11, 14, 17);
    },

    testOverlapTopRight() {
      this._updateLayerWindow(8, 11, 17, 20);
    },

    testOverlapLeft() {
      this._updateLayerWindow(11, 18, 13, 16);
    },

    testOverlapInner() {
      this._updateLayerWindow(11, 18, 16, 17);
    },

    testOverlapOuter() {
      this._updateLayerWindow(8, 21, 14, 20);
    },

    testOverlapRight() {
      this._updateLayerWindow(11, 18, 17, 20);
    },

    testOverlapBottomLeft() {
      this._updateLayerWindow(18, 22, 14, 17);
    },

    testOverlapBottom() {
      this._updateLayerWindow(18, 22, 16, 17);
    },

    testOverlapBottomRight() {
      this._updateLayerWindow(18, 22, 17, 20);
    }
  },

  destruct() {
    this.layer = null;
  }
});
