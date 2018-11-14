/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2018 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Milan Damen (milandamen)

************************************************************************ */
qx.Class.define("qx.test.ui.table.selection.Model",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    testRemoveSelectionInterval : function () {
      var selectionModel = new qx.ui.table.selection.Model();
      selectionModel.setSelectionMode(4); // MULTIPLE_INTERVAL_SELECTION

      selectionModel.removeSelectionInterval(0, 0);
      this.assertIdentical(0, selectionModel._getSelectedRangeArr().length);
      selectionModel.removeSelectionInterval(0, 0, true);
      this.assertIdentical(0, selectionModel._getSelectedRangeArr().length);

      selectionModel.setSelectionInterval(0, 1);
      this.assertJsonEquals([{minIndex: 0, maxIndex: 1}], selectionModel._getSelectedRangeArr());
      selectionModel.removeSelectionInterval(0,1);
      this.assertIdentical(0, selectionModel._getSelectedRangeArr().length);

      selectionModel.setSelectionInterval(0, 1);
      selectionModel.removeSelectionInterval(0, 2);
      this.assertIdentical(0, selectionModel._getSelectedRangeArr().length);

      selectionModel.setSelectionInterval(0, 1);
      selectionModel.removeSelectionInterval(0, 2, true);
      this.assertIdentical(0, selectionModel._getSelectedRangeArr().length);

      selectionModel.setSelectionInterval(1, 1);
      selectionModel.removeSelectionInterval(0, 2);
      this.assertIdentical(0, selectionModel._getSelectedRangeArr().length);

      selectionModel.setSelectionInterval(1, 1);
      selectionModel.removeSelectionInterval(0, 2, true);
      this.assertIdentical(0, selectionModel._getSelectedRangeArr().length);

      selectionModel.setSelectionInterval(0, 1);
      selectionModel.removeSelectionInterval(0, 0);
      this.assertJsonEquals([{minIndex: 1, maxIndex: 1}], selectionModel._getSelectedRangeArr());

      selectionModel.setSelectionInterval(0, 1);
      selectionModel.removeSelectionInterval(0, 0, true);
      this.assertJsonEquals([{minIndex: 0, maxIndex: 0}], selectionModel._getSelectedRangeArr());

      selectionModel.setSelectionInterval(0, 1);
      selectionModel.removeSelectionInterval(1, 1);
      this.assertJsonEquals([{minIndex: 0, maxIndex: 0}], selectionModel._getSelectedRangeArr());

      selectionModel.setSelectionInterval(0, 1);
      selectionModel.removeSelectionInterval(1, 1, true);
      this.assertJsonEquals([{minIndex: 0, maxIndex: 0}], selectionModel._getSelectedRangeArr());

      selectionModel.setSelectionInterval(1, 2);
      selectionModel.removeSelectionInterval(0, 0);
      this.assertJsonEquals([{minIndex: 1, maxIndex: 2}], selectionModel._getSelectedRangeArr());

      selectionModel.setSelectionInterval(1, 2);
      selectionModel.removeSelectionInterval(0, 0, true);
      this.assertJsonEquals([{minIndex: 0, maxIndex: 1}], selectionModel._getSelectedRangeArr());

      selectionModel.setSelectionInterval(0, 1);
      selectionModel.removeSelectionInterval(2, 2);
      this.assertJsonEquals([{minIndex: 0, maxIndex: 1}], selectionModel._getSelectedRangeArr());

      selectionModel.setSelectionInterval(0, 1);
      selectionModel.removeSelectionInterval(2, 2, true);
      this.assertJsonEquals([{minIndex: 0, maxIndex: 1}], selectionModel._getSelectedRangeArr());

      selectionModel.setSelectionInterval(1, 3);
      selectionModel.removeSelectionInterval(1, 1);
      this.assertJsonEquals([{minIndex: 2, maxIndex: 3}], selectionModel._getSelectedRangeArr());

      selectionModel.setSelectionInterval(1, 3);
      selectionModel.removeSelectionInterval(1, 1, true);
      this.assertJsonEquals([{minIndex: 1, maxIndex: 2}], selectionModel._getSelectedRangeArr());

      selectionModel.setSelectionInterval(0, 2);
      selectionModel.removeSelectionInterval(2, 3);
      this.assertJsonEquals([{minIndex: 0, maxIndex: 1}], selectionModel._getSelectedRangeArr());

      selectionModel.setSelectionInterval(0, 2);
      selectionModel.removeSelectionInterval(2, 3, true);
      this.assertJsonEquals([{minIndex: 0, maxIndex: 1}], selectionModel._getSelectedRangeArr());

      selectionModel.setSelectionInterval(0, 5);
      selectionModel.removeSelectionInterval(2, 3);
      this.assertJsonEquals([{minIndex: 0, maxIndex: 1}, {minIndex: 4, maxIndex: 5}], selectionModel._getSelectedRangeArr());

      selectionModel.setSelectionInterval(0, 5);
      selectionModel.removeSelectionInterval(2, 3, true);
      this.assertJsonEquals([{minIndex: 0, maxIndex: 3}], selectionModel._getSelectedRangeArr());
    }
  }
});
