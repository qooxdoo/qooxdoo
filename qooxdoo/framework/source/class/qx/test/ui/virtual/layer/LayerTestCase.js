/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Jonathan Weiß (jonathan_rass)
   * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.test.ui.virtual.layer.LayerTestCase",
{
  extend : qx.test.ui.LayoutTestCase,
  type : "abstract",

  members :
  {
    setUp : function()
    {
      this.colWidth = 20;
      this.rowHeight = 10;

      this.layer = this._createLayer();

      var rowSizes = [];
      for (var i=10; i<=20; i++) {
        rowSizes.push(this.rowHeight);
      }

      var columnSizes = [];
      for(var i=15; i<=18; i++) {
        columnSizes.push(this.colWidth);
      }

      this.getRoot().add(this.layer);
      this.flush();

      this.layer.updateLayerWindow(10, 15, rowSizes, columnSizes);
      this.flush();
    },

    tearDown : function() {
      this.base(arguments);
      this.layer.destroy();
    },

    _createLayer : function() {
      return new qx.test.ui.virtual.layer.LayerMock();
    },

    _assertCells : function(firstRow, lastRow, firstColumn, lastColumn, msg) {
      return;
    },


    _updateLayerWindow : function(firstRow, lastRow, firstColumn, lastColumn, doFullUpdate)
    {
      var rowSizes = [];
      for (var i=firstRow; i<=lastRow; i++) {
        rowSizes.push(this.rowHeight);
      }

      var columnSizes = [];
      for(var i=firstColumn; i<=lastColumn; i++) {
        columnSizes.push(this.colWidth);
      }

      if (doFullUpdate)
      {
        this.layer.fullUpdate(
          firstRow, firstColumn,
          rowSizes, columnSizes
        );
      }
      else
      {
        this.layer.updateLayerWindow(
          firstRow, firstColumn,
          rowSizes, columnSizes
        );
      }

      this.flush();
      this._assertCells(firstRow, firstColumn, rowSizes.length, columnSizes.length);
    },

    testInit : function() {
      this._assertCells(10, 15, 11, 4);
    },

    testFullUpdate : function() {
      this._assertCells(10, 15, 11, 4, true);
    },

    testNoOverlap : function() {
      this._updateLayerWindow(20, 25, 19, 21);
    },

    testScrollDown : function() {
      this._updateLayerWindow(12, 22, 15, 18);
    },

    testScrollUp : function() {
      this._updateLayerWindow(8, 18, 15, 18);
    },

    testScrollLeft : function() {
      this._updateLayerWindow(10, 20, 12, 15);
    },

    testScrollRight : function() {
      this._updateLayerWindow(10, 20, 17, 20);
    },

    testOverlapLeftTop : function() {
      this._updateLayerWindow(7, 11, 12, 16);
    },

    testOverlapTop : function() {
      this._updateLayerWindow(8, 11, 14, 17);
    },

    testOverlapTopRight : function() {
      this._updateLayerWindow(8, 11, 17, 20);
    },

    testOverlapLeft : function() {
      this._updateLayerWindow(11, 18, 13, 16);
    },

    testOverlapInner : function() {
      this._updateLayerWindow(11, 18, 16, 17);
    },

    testOverlapOuter : function() {
      this._updateLayerWindow(8, 21, 14, 20);
    },

    testOverlapRight : function() {
      this._updateLayerWindow(11, 18, 17, 20);
    },

    testOverlapBottomLeft : function() {
      this._updateLayerWindow(18, 22, 14, 17);
    },

    testOverlapBottom : function() {
      this._updateLayerWindow(18, 22, 16, 17);
    },

    testOverlapBottomRight : function() {
      this._updateLayerWindow(18, 22, 17, 20);
    }
  },

  destruct : function() {
    this.layer = null;
  }
});
