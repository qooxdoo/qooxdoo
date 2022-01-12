/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 Derrell Lipman

   License:
     MIT: https://opensource.org/licenses/MIT
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/**
 * A data row renderer for a simple tree row
 */
qx.Class.define("qx.ui.treevirtual.SimpleTreeDataRowRenderer", {
  extend: qx.ui.table.rowrenderer.Default,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct() {
    super();
  },

  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members: {
    // overridden
    updateDataRowElement(rowInfo, rowElem) {
      // If the node is selected, select the row
      var tree = rowInfo.table;
      var rowData = rowInfo.rowData;
      var tableModel = tree.getTableModel();
      var treeCol = tableModel.getTreeColumn();
      var node = rowData[treeCol];

      // Set the row's selected state based on the data model
      rowInfo.selected = node.bSelected;

      if (node.bSelected) {
        // Ensure that the selection model knows it's selected
        var row = rowInfo.row;
        var selModel = tree.getSelectionModel();
        if (!selModel.isSelectedIndex(row)) {
          selModel._addSelectionInterval(row, row);
        }
      }

      // Now call our superclass
      super.updateDataRowElement(rowInfo, rowElem);
    }
  }
});
